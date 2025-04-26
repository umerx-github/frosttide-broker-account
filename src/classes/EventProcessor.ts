import EventProcessorProducerLike from '../interfaces/EventProcessorProducerLike.js';
import EventProcessorConsumerLike from '../interfaces/EventProcessorConsumerLike.js';
import { inputMessageValueSchema } from '../schemas/inputMessageValueSchema.js';
import { inputSchema } from '../schemas/inputSchema.js';
import { Kysely } from 'kysely';
import {
    createAccountAlpaca,
    findAccountAlpacaById,
    listAccountAlpaca,
} from '../models/alpacaAccountTable.js';
import { AccountAlpaca, Database, Lock } from '../interfaces/Database.js';
import { findLockByName, upsertLock } from '../models/lockTable.js';
import { BTree } from '@umerx/btreejs';
import { btreeSchema } from '../schemas/btree.js';

interface EventProcessorProps<DatabaseType> {
    db: Kysely<DatabaseType>;
    producer: EventProcessorProducerLike;
    consumer: EventProcessorConsumerLike;
}

export default class EventProcessor {
    private db: Kysely<Database>;
    private producer: EventProcessorProducerLike;
    private consumer: EventProcessorConsumerLike;

    constructor({ db, producer, consumer }: EventProcessorProps<Database>) {
        this.db = db;
        this.producer = producer;
        this.consumer = consumer;
        this.consumer.addOnMessageHandler(async (messagePayload) =>
            this.processEvent(messagePayload)
        );
    }

    public async processEvent(message: any) {
        const validInput = inputSchema.safeParse(message);
        if (!validInput.success) {
            console.error('Invalid input:', validInput.error);
            return;
        }

        const validInputMessageValue = inputMessageValueSchema.safeParse(
            JSON.parse(message.value?.toString() || '')
        );

        if (!validInputMessageValue.success) {
            console.error('Invalid message:', validInputMessageValue.error);
            return;
        }

        const validInputMessageValueData = validInputMessageValue.data;

        switch (validInputMessageValueData.eventType) {
            case 'RequestedAccountList': {
                let dbObject: AccountAlpaca[] | undefined;
                try {
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            dbObject = await listAccountAlpaca(trx);
                        });
                } finally {
                    if (dbObject) {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'AcknowledgedAccountList',
                                data: dbObject,
                            }),
                        });
                    } else {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountList',
                                data: {
                                    message,
                                },
                            }),
                        });
                    }
                }
                break;
            }
            case 'RequestedAccountAdd': {
                let lockObject: Lock | undefined;
                let dbObject: AccountAlpaca | undefined;
                try {
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            lockObject = await findLockByName(
                                trx,
                                'RequestedAccountAdd'
                            );
                            if (
                                !(
                                    (undefined === lockObject?.versionId &&
                                        null ===
                                            validInputMessageValueData.lastReadVersionId) ||
                                    (lockObject?.versionId !== undefined &&
                                        lockObject.versionId ===
                                            validInputMessageValueData.lastReadVersionId)
                                )
                            ) {
                                throw new Error(
                                    `Existing Lock versionId ${lockObject?.versionId} > message lastReadVersionId ${validInputMessageValueData.lastReadVersionId}`
                                );
                            }
                            const versionId =
                                undefined === lockObject?.versionId
                                    ? 0
                                    : lockObject.versionId + 1;
                            const proofOfInclusionBTreeSerialized =
                                undefined ===
                                lockObject?.proofOfInclusionBTreeSerialized
                                    ? new BTree(3)
                                    : BTree.fromJSON(
                                          btreeSchema.parse(
                                              JSON.parse(
                                                  lockObject.proofOfInclusionBTreeSerialized
                                              )
                                          )
                                      );
                            proofOfInclusionBTreeSerialized.insert(
                                validInputMessageValueData.messageId
                            );
                            dbObject = await createAccountAlpaca(trx, {
                                platformAccountId:
                                    validInputMessageValueData.data
                                        .platformAccountId,
                                platformAPIKey:
                                    validInputMessageValueData.data
                                        .platformAPIKey,
                            });
                            lockObject = await upsertLock(trx, {
                                name: 'RequestedAccountAdd',
                                versionId,
                                proofOfInclusionBTreeSerialized: JSON.stringify(
                                    proofOfInclusionBTreeSerialized
                                ),
                            });
                        });
                } finally {
                    if (dbObject && lockObject) {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'AcknowledgedAccountAdd',
                                versionId: lockObject.versionId,
                                proofOfInclusionBTreeSerialized:
                                    lockObject.proofOfInclusionBTreeSerialized,
                                data: dbObject,
                            }),
                        });
                    } else if (lockObject) {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountAdd',
                                versionId: lockObject.versionId,
                                proofOfInclusionBTreeSerialized:
                                    lockObject.proofOfInclusionBTreeSerialized,
                                data: {
                                    message,
                                },
                            }),
                        });
                    } else {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountAdd',
                                versionId: null,
                                proofOfInclusionBTreeSerialized: null,
                                data: {
                                    message,
                                },
                            }),
                        });
                    }
                }
                break;
            }
            default: {
                console.error(
                    'Unhandled event type:',
                    validInputMessageValueData
                );
            }
        }
    }
}
