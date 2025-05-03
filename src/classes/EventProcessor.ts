import EventProcessorProducerLike from '../interfaces/EventProcessorProducerLike.js';
import EventProcessorConsumerLike from '../interfaces/EventProcessorConsumerLike.js';
import { inputMessageValueSchema } from '../schemas/inputMessageValueSchema.js';
import { inputSchema } from '../schemas/inputSchema.js';
import { Kysely } from 'kysely';
import {
    createAccountAlpaca,
    findAccountAlpacaById,
    listAccountAlpaca,
    updateAccountAlpacaById,
} from '../models/alpacaAccountTable.js';
import { AccountAlpaca, Database, Lock } from '../interfaces/Database.js';
import { findLockByName, upsertLock } from '../models/lockTable.js';
import { BTree } from '@umerx/btreejs';
import { btreeSchema } from '../schemas/btree.js';
import StaleWrite from '../exceptions/StaleWrite.js';
import ImmutableRecord from '../exceptions/ImmutableRecord.js';

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
                    let dbObjects: AccountAlpaca[] | undefined;
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            dbObjects = await listAccountAlpaca(trx);
                        });
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'AcknowledgedAccountList',
                            data: {
                                request: validInputMessageValueData,
                                payload: dbObjects?.map((dbObject) => {
                                    return {
                                        lock: {
                                            versionId: dbObject.versionId,
                                            proofOfInclusionBTreeSerialized:
                                                dbObject.proofOfInclusionBTreeSerialized,
                                        },
                                        object: {
                                            id: dbObject.id,
                                            recordStatus: dbObject.recordStatus,
                                            platformAccountId:
                                                dbObject.platformAccountId,
                                            platformAPIKey:
                                                dbObject.platformAPIKey,
                                        },
                                    };
                                }),
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
            case 'RequestedAccountCreateIntent': {
                try {
                    let lockObject: Lock | undefined;
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            lockObject = await findLockByName(
                                trx,
                                'RequestedAccountCreate'
                            );
                        });
                    const lockExistingVersionId = lockObject?.versionId ?? null;
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
                    const lockExistingProofOfInclusionBTreeSerialized =
                        JSON.stringify(lockExistingProofOfInclusionBTree);
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'AcknowledgedAccountCreateIntent',
                            data: {
                                request: validInputMessageValueData,
                                lock: {
                                    versionId: lockExistingVersionId,
                                    proofOfInclusionBTreeSerialized:
                                        lockExistingProofOfInclusionBTreeSerialized,
                                },
                            },
                        }),
                    });
                } catch (e) {
                    console.error({ e });
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'RejectedAccountCreateIntent',
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
            case 'RequestedAccountCreate': {
                try {
                    let lockObject: Lock | undefined;
                    let dbObject: AccountAlpaca | undefined;
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            lockObject = await findLockByName(
                                trx,
                                'RequestedAccountCreate'
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
                                    `Existing lock versionId ${lockObject?.versionId} !== message lastReadVersionId ${validInputMessageValueData.lastReadVersionId}`,
                                    {
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
                            const dbObjectBTreeSerialized =
                                JSON.stringify(dbObjectBTree);
                            dbObject = await createAccountAlpaca(trx, {
                                recordStatus: 'ACTIVE',
                                platformAccountId:
                                    validInputMessageValueData.data
                                        .platformAccountId,
                                platformAPIKey:
                                    validInputMessageValueData.data
                                        .platformAPIKey,
                                versionId: 0,
                                proofOfInclusionBTreeSerialized:
                                    dbObjectBTreeSerialized,
                            });
                            lockObject = await upsertLock(trx, {
                                name: 'RequestedAccountCreate',
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
                            eventType: 'AcknowledgedAccountCreate',
                            data: {
                                request: validInputMessageValueData,
                                lock: {
                                    versionId: lockObject.versionId,
                                    proofOfInclusionBTreeSerialized:
                                        lockObject.proofOfInclusionBTreeSerialized,
                                },
                                payload: {
                                    lock: {
                                        versionId: dbObject.versionId,
                                        proofOfInclusionBTreeSerialized:
                                            dbObject.proofOfInclusionBTreeSerialized,
                                    },
                                    object: {
                                        id: dbObject.id,
                                        recordStatus: dbObject.recordStatus,
                                        platformAccountId:
                                            dbObject.platformAccountId,
                                        platformAPIKey: dbObject.platformAPIKey,
                                    },
                                },
                            },
                        }),
                    });
                } catch (e) {
                    if (e instanceof StaleWrite) {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountCreate',
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
                                eventType: 'RejectedAccountCreate',
                                data: {
                                    request: validInputMessageValueData,
                                    lock: {
                                        versionId: null,
                                        proofOfInclusionBTreeSerialized: null,
                                    },
                                    reason: 'Unknown error',
                                },
                            }),
                        });
                    }
                }
                break;
            }
            case 'RequestedAccountUpdate': {
                try {
                    let dbObject: AccountAlpaca | undefined;
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            dbObject = await findAccountAlpacaById(
                                trx,
                                validInputMessageValueData.data.id
                            );
                            if (dbObject?.recordStatus === 'DELETED') {
                                throw new ImmutableRecord(
                                    `Record is immutable with recordStatus: ${dbObject.recordStatus}`,
                                    {
                                        versionId: dbObject.versionId,
                                        proofOfInclusionBTreeSerialized:
                                            dbObject.proofOfInclusionBTreeSerialized,
                                    }
                                );
                            }
                            const lockExistingVersionId =
                                dbObject?.versionId ?? null;
                            const lockExistingProofOfInclusionBTree =
                                undefined ===
                                dbObject?.proofOfInclusionBTreeSerialized
                                    ? null
                                    : BTree.fromJSON(
                                          btreeSchema.parse(
                                              JSON.parse(
                                                  dbObject.proofOfInclusionBTreeSerialized
                                              )
                                          )
                                      );
                            if (
                                lockExistingVersionId !==
                                validInputMessageValueData.lastReadVersionId
                            ) {
                                throw new StaleWrite(
                                    `Existing lock versionId ${dbObject?.versionId} !== message lastReadVersionId ${validInputMessageValueData.lastReadVersionId}`,
                                    {
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
                            const objectToInsert = {
                                platformAccountId:
                                    validInputMessageValueData.data
                                        .platformAccountId,
                                platformAPIKey:
                                    validInputMessageValueData.data
                                        .platformAPIKey,
                                versionId: lockVersionId,
                                proofOfInclusionBTreeSerialized:
                                    lockProofOfInclusionBTreeSerialized,
                            };
                            dbObject = await updateAccountAlpacaById(
                                trx,
                                validInputMessageValueData.data.id,
                                objectToInsert
                            );
                        });
                    1;
                    if (undefined === dbObject) {
                        throw new Error(`dbObject is undefined`);
                    }
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'AcknowledgedAccountUpdate',
                            data: {
                                request: validInputMessageValueData,
                                payload: {
                                    lock: {
                                        versionId: dbObject.versionId,
                                        proofOfInclusionBTreeSerialized:
                                            dbObject.proofOfInclusionBTreeSerialized,
                                    },
                                    object: {
                                        id: dbObject.id,
                                        recordStatus: dbObject.recordStatus,
                                        platformAccountId:
                                            dbObject.platformAccountId,
                                        platformAPIKey: dbObject.platformAPIKey,
                                    },
                                },
                            },
                        }),
                    });
                } catch (e) {
                    if (
                        e instanceof StaleWrite ||
                        e instanceof ImmutableRecord
                    ) {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountUpdate',
                                data: {
                                    request: validInputMessageValueData,
                                    payload: {
                                        lock: {
                                            versionId: e.lock.versionId,
                                            proofOfInclusionBTreeSerialized:
                                                e.lock
                                                    .proofOfInclusionBTreeSerialized,
                                        },
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
                                eventType: 'RejectedAccountUpdate',
                                data: {
                                    request: validInputMessageValueData,
                                    payload: {
                                        lock: {
                                            versionId: null,
                                            proofOfInclusionBTreeSerialized:
                                                null,
                                        },
                                    },
                                    reason: 'Unknown error',
                                },
                            }),
                        });
                    }
                }
                break;
            }
            case 'RequestedAccountDelete': {
                try {
                    let dbObject: AccountAlpaca | undefined;
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            dbObject = await findAccountAlpacaById(
                                trx,
                                validInputMessageValueData.data.id
                            );
                            if (dbObject?.recordStatus === 'DELETED') {
                                throw new ImmutableRecord(
                                    `Record is immutable with recordStatus: ${dbObject.recordStatus}`,
                                    {
                                        versionId: dbObject.versionId,
                                        proofOfInclusionBTreeSerialized:
                                            dbObject.proofOfInclusionBTreeSerialized,
                                    }
                                );
                            }
                            const lockExistingVersionId =
                                dbObject?.versionId ?? null;
                            const lockExistingProofOfInclusionBTree =
                                undefined ===
                                dbObject?.proofOfInclusionBTreeSerialized
                                    ? null
                                    : BTree.fromJSON(
                                          btreeSchema.parse(
                                              JSON.parse(
                                                  dbObject.proofOfInclusionBTreeSerialized
                                              )
                                          )
                                      );
                            if (
                                lockExistingVersionId !==
                                validInputMessageValueData.lastReadVersionId
                            ) {
                                throw new StaleWrite(
                                    `Existing lock versionId ${dbObject?.versionId} !== message lastReadVersionId ${validInputMessageValueData.lastReadVersionId}`,
                                    {
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
                            dbObject = await updateAccountAlpacaById(
                                trx,
                                validInputMessageValueData.data.id,
                                {
                                    ...dbObject,
                                    recordStatus: 'DELETED',
                                    versionId: lockVersionId,
                                    proofOfInclusionBTreeSerialized:
                                        lockProofOfInclusionBTreeSerialized,
                                }
                            );
                        });
                    1;
                    if (undefined === dbObject) {
                        throw new Error(`dbObject is undefined`);
                    }
                    await this.producer.sendMessage({
                        key: 'myKey',
                        value: JSON.stringify({
                            eventType: 'AcknowledgedAccountDelete',
                            data: {
                                request: validInputMessageValueData,
                                payload: {
                                    lock: {
                                        versionId: dbObject.versionId,
                                        proofOfInclusionBTreeSerialized:
                                            dbObject.proofOfInclusionBTreeSerialized,
                                    },
                                    object: {
                                        id: dbObject.id,
                                        recordStatus: dbObject.recordStatus,
                                        platformAccountId:
                                            dbObject.platformAccountId,
                                        platformAPIKey: dbObject.platformAPIKey,
                                    },
                                },
                            },
                        }),
                    });
                } catch (e) {
                    if (
                        e instanceof StaleWrite ||
                        e instanceof ImmutableRecord
                    ) {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'RejectedAccountDelete',
                                data: {
                                    request: validInputMessageValueData,
                                    payload: {
                                        lock: {
                                            versionId: e.lock.versionId,
                                            proofOfInclusionBTreeSerialized:
                                                e.lock
                                                    .proofOfInclusionBTreeSerialized,
                                        },
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
                                eventType: 'RejectedAccountDelete',
                                data: {
                                    request: validInputMessageValueData,
                                    payload: {
                                        lock: {
                                            versionId: null,
                                            proofOfInclusionBTreeSerialized:
                                                null,
                                        },
                                    },
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
