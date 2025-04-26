import EventProcessorProducerLike from '../interfaces/EventProcessorProducerLike.js';
import EventProcessorConsumerLike from '../interfaces/EventProcessorConsumerLike.js';
import { inputMessageValueSchema } from '../schemas/inputMessageValueSchema.js';
import { inputSchema } from '../schemas/inputSchema.js';
import { Kysely } from 'kysely';
import { createAccountAlpaca } from '../models/alpacaAccountTable.js';
import { AccountAlpaca, Database } from '../interfaces/Database.js';
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
            case 'RequestedAccountAdd':
                let dbLockEntityResponse: AccountAlpaca | undefined;
                try {
                    await this.db
                        .transaction()
                        .setIsolationLevel('serializable')
                        .execute(async (trx) => {
                            const dbLockResponse = await findLockByName(
                                trx,
                                'AlpacaAccount'
                            );
                            if (
                                undefined !== dbLockResponse?.versionId &&
                                dbLockResponse.versionId >
                                    validInputMessageValueData.lastReadVersionId
                            ) {
                                throw new Error(
                                    `Existing Lock versionId ${dbLockResponse?.versionId} > message lastReadVersionId ${validInputMessageValueData.lastReadVersionId}`
                                );
                            }
                            const versionId =
                                undefined === dbLockResponse?.versionId
                                    ? 0
                                    : dbLockResponse.versionId + 1;
                            const proofOfInclusionBTreeSerialized =
                                undefined ===
                                dbLockResponse?.proofOfInclusionBTreeSerialized
                                    ? new BTree(3)
                                    : BTree.fromJSON(
                                          btreeSchema.parse(
                                              JSON.parse(
                                                  dbLockResponse.proofOfInclusionBTreeSerialized
                                              )
                                          )
                                      );
                            proofOfInclusionBTreeSerialized.insert(
                                validInputMessageValueData.messageId
                            );
                            dbLockEntityResponse = await createAccountAlpaca(
                                trx,
                                {
                                    platformAccountId:
                                        validInputMessageValueData.data
                                            .platformAccountId,
                                    platformAPIKey:
                                        validInputMessageValueData.data
                                            .platformAPIKey,
                                }
                            );
                            await upsertLock(trx, {
                                name: 'AlpacaAccount',
                                versionId,
                                proofOfInclusionBTreeSerialized: JSON.stringify(
                                    proofOfInclusionBTreeSerialized
                                ),
                            });
                        });
                } finally {
                    if (dbLockEntityResponse) {
                        await this.producer.sendMessage({
                            key: 'myKey',
                            value: JSON.stringify({
                                eventType: 'AcknowledgedAccountList',
                                data: dbLockEntityResponse,
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
            default:
                console.error('Invalid message:', validInputMessageValueData);
        }
    }
}
