import EventProcessorProducerLike from '../interfaces/EventProcessorProducerLike.js';
import EventProcessorConsumerLike from '../interfaces/EventProcessorConsumerLike.js';
import { inputMessageValueSchema } from '../schemas/inputMessageValueSchema.js';
import { inputSchema } from '../schemas/inputSchema.js';
import { Kysely } from 'kysely';
import {
    createAccountAlpaca,
    listAccountAlpaca,
} from '../models/alpacaAccountTable.js';
import { AccountAlpaca, Database, Lock } from '../interfaces/Database.js';
import { findLockByName, upsertLock } from '../models/lockTable.js';
import { BTree } from '@umerx/btreejs';
import { btreeSchema } from '../schemas/btree.js';
import StaleWrite from '../exceptions/staleWrite.js';

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
                try {
                    let dbObject: AccountAlpaca[] | undefined;
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            dbObject = await listAccountAlpaca(trx);
                        });
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'AcknowledgedAccountList',
                            data: dbObject,
                        }),
                    });
                } catch (e) {
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'RejectedAccountList',
                            data: validInputMessageValueData,
                        }),
                    });
                }
                break;
            }
            case 'RequestedAccountAdd': {
                try {
                    let lockObject: Lock | undefined;
                    let dbObject: AccountAlpaca | undefined;
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            lockObject = await findLockByName(
                                trx,
                                'RequestedAccountAdd'
                            );
                            const existingVersionId =
                                lockObject?.versionId ?? null;
                            const existingProofOfInclusionBTree =
                                undefined ===
                                lockObject?.proofOfInclusionBTreeSerialized
                                    ? null
                                    : BTree.fromJSON(
                                          btreeSchema.parse(
                                              JSON.parse(
                                                  lockObject.proofOfInclusionBTreeSerialized
                                              )
                                          )
                                      );
                            if (
                                existingVersionId !==
                                validInputMessageValueData.lastReadVersionId
                            ) {
                                throw new StaleWrite(
                                    `Existing Lock versionId ${lockObject?.versionId} > message lastReadVersionId ${validInputMessageValueData.lastReadVersionId}`,
                                    {
                                        name: 'RequestedAccountAdd',
                                        versionId: existingVersionId,
                                        proofOfInclusionBTreeSerialized:
                                            existingProofOfInclusionBTree
                                                ? JSON.stringify(
                                                      existingProofOfInclusionBTree
                                                  )
                                                : null,
                                    }
                                );
                            }
                            const versionId =
                                null === existingVersionId
                                    ? 0
                                    : existingVersionId + 1;
                            const proofOfInclusionBTreeSerialized =
                                existingProofOfInclusionBTree ?? new BTree(3);
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
                    if (undefined === dbObject || undefined === lockObject) {
                        throw new Error(`dbObject or lockObject are undefined`);
                    }
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
                } catch (e) {
                    if (e instanceof StaleWrite) {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountAdd',
                                versionId: e.lock.versionId,
                                proofOfInclusionBTreeSerialized:
                                    e.lock.proofOfInclusionBTreeSerialized,
                                data: validInputMessageValueData,
                            }),
                        });
                    } else {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountAdd',
                                versionId: null,
                                proofOfInclusionBTreeSerialized: null,
                                data: validInputMessageValueData,
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
