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
import StaleWrite from '../exceptions/StaleWrite.js';

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
                            data: {
                                request: validInputMessageValueData,
                                payload: dbObject,
                            },
                        }),
                    });
                } catch (e) {
                    console.error({ e });
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'RejectedAccountList',
                            data: {
                                request: validInputMessageValueData,
                                reason: 'Unknown error',
                            },
                        }),
                    });
                }
                break;
            }
            case 'RequestedAccountAddIntent': {
                try {
                    let lockObject: Lock | undefined;
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            lockObject = await findLockByName(
                                trx,
                                'RequestedAccountAdd'
                            );
                        });
                    if (undefined === lockObject) {
                        throw new Error(`lockObject is undefined`);
                    }
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'AcknowledgedAccountAddIntent',
                            data: {
                                request: validInputMessageValueData,
                                lock: {
                                    versionId: lockObject.versionId,
                                    proofOfInclusionBTreeSerialized:
                                        lockObject.proofOfInclusionBTreeSerialized,
                                },
                            },
                        }),
                    });
                } catch (e) {
                    console.error({ e });
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'RejectedAccountAddIntent',
                            data: {
                                lock: {
                                    versionId: null,
                                    proofOfInclusionBTreeSerialized: null,
                                },
                                request: validInputMessageValueData,
                                reason: 'Unknown error',
                            },
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
                            const lockExistingVersionId =
                                lockObject?.versionId ?? null;
                            const lockExistingProofOfInclusionBTree =
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
                                lockExistingVersionId !==
                                validInputMessageValueData.lastReadVersionId
                            ) {
                                throw new StaleWrite(
                                    `Existing Lock versionId ${lockObject?.versionId} > message lastReadVersionId ${validInputMessageValueData.lastReadVersionId}`,
                                    {
                                        name: 'RequestedAccountAdd',
                                        versionId: lockExistingVersionId,
                                        proofOfInclusionBTreeSerialized:
                                            lockExistingProofOfInclusionBTree
                                                ? JSON.stringify(
                                                      lockExistingProofOfInclusionBTree
                                                  )
                                                : null,
                                    }
                                );
                            }
                            const lockVersionId =
                                null === lockExistingVersionId
                                    ? 0
                                    : lockExistingVersionId + 1;
                            const lockProofOfInclusionBTree =
                                lockExistingProofOfInclusionBTree ??
                                new BTree(3);
                            lockProofOfInclusionBTree.insert(
                                validInputMessageValueData.messageId
                            );
                            const lockProofOfInclusionBTreeSerialized =
                                JSON.stringify(lockProofOfInclusionBTree);
                            const dbObjectBTree = new BTree(3);
                            dbObjectBTree.insert(
                                validInputMessageValueData.messageId
                            );
                            const objectToInsert = {
                                platformAccountId:
                                    validInputMessageValueData.data
                                        .platformAccountId,
                                platformAPIKey:
                                    validInputMessageValueData.data
                                        .platformAPIKey,
                                versionId: 0,
                                proofOfInclusionBTreeSerialized:
                                    JSON.stringify(dbObjectBTree),
                            };
                            dbObject = await createAccountAlpaca(
                                trx,
                                objectToInsert
                            );
                            lockObject = await upsertLock(trx, {
                                name: 'RequestedAccountAdd',
                                versionId: lockVersionId,
                                proofOfInclusionBTreeSerialized:
                                    lockProofOfInclusionBTreeSerialized,
                            });
                        });
                    1;
                    if (undefined === dbObject || undefined === lockObject) {
                        throw new Error(`dbObject or lockObject are undefined`);
                    }
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'AcknowledgedAccountAdd',
                            data: {
                                request: validInputMessageValueData,
                                lock: {
                                    versionId: lockObject.versionId,
                                    proofOfInclusionBTreeSerialized:
                                        lockObject.proofOfInclusionBTreeSerialized,
                                },
                                payload: dbObject,
                            },
                        }),
                    });
                } catch (e) {
                    if (e instanceof StaleWrite) {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountAdd',
                                data: {
                                    request: validInputMessageValueData,
                                    lock: {
                                        versionId: e.lock.versionId,
                                        proofOfInclusionBTreeSerialized:
                                            e.lock
                                                .proofOfInclusionBTreeSerialized,
                                    },
                                    reason: e.message,
                                },
                            }),
                        });
                    } else {
                        console.error({ e });
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountAdd',
                                data: {
                                    lock: {
                                        versionId: null,
                                        proofOfInclusionBTreeSerialized: null,
                                    },
                                    request: validInputMessageValueData,
                                    reason: 'Unknown error',
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
