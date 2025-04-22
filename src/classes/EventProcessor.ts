import EventProcessorProducerLike from '../interfaces/EventProcessorProducerLike.js';
import EventProcessorConsumerLike from '../interfaces/EventProcessorConsumerLike.js';
import { inputMessageValueSchema } from '../schemas/inputMessageValueSchema.js';
import { inputSchema } from '../schemas/inputSchema.js';

export enum TransactionFlags {
    /* Indicates that the transaction needs to be abortable */
    ABORTABLE = 1,
    /* Indicates that the transaction needs to be committed before returning */
    SYNCHRONOUS_COMMIT = 2,
    /* Indicates that the function can return before the transaction has been flushed to disk */
    NO_SYNC_FLUSH = 0x10000,
}

interface Storable<V = any, K extends Key = Key> {
    transaction<T>(action: () => T): Promise<T>;
    get(id: K): V | undefined;
    put(id: K, value: V): Promise<boolean>;
    transactionSync<T>(action: () => T, flags?: TransactionFlags): T;
}
type Key = Key[] | string | symbol | number | boolean | Uint8Array;

interface EventProcessorProps {
    db: Storable;
    producer: EventProcessorProducerLike;
    consumer: EventProcessorConsumerLike;
}

export default class EventProcessor {
    private db: Storable;
    private producer: EventProcessorProducerLike;
    private consumer: EventProcessorConsumerLike;

    constructor({ db, producer, consumer }: EventProcessorProps) {
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

        const value = inputMessageValueSchema.safeParse(
            JSON.parse(message.value?.toString() || '')
        );

        if (!value.success) {
            console.error('Invalid message:', value.error);
            return;
        }

        const validMessage = value.data;

        switch (validMessage.eventType) {
            default:
                console.error('Invalid message:', validMessage);
        }
    }
}
