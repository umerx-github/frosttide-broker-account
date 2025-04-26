import {
    Producer,
    Consumer,
    ReconnectingProducerAdapter,
    ReconnectingConsumerAdapter,
    IdempotentConsumerAdapter,
} from '@umerx/kafkajs-client';
import EventProcessor from './classes/EventProcessor.js';
import { DatabaseAdapter } from './classes/DatabaseAdapter.js';
import { open } from 'lmdb';
import { db } from './connections/database.js';

const producer = new ReconnectingProducerAdapter({
    producer: new Producer({
        kafkaConfig: {
            brokers: ['broker:9092'],
            clientId: 'frosttide-broker-account',
            connectionTimeout: 30,
            requestTimeout: 30,
            enforceRequestTimeout: true,
            retry: {
                retries: 0,
            },
            // logLevel: logLevel.DEBUG,
        },
        producerConfig: {
            allowAutoTopicCreation: false,
            idempotent: true,
            retry: {
                retries: Number.MAX_SAFE_INTEGER,
            },
        },
        topics: ['frosttide-broker-account-output'],
    }),
});

const keyValueDb = open<number, string>({
    path: 'db',
});

const consumer = new IdempotentConsumerAdapter(
    new ReconnectingConsumerAdapter({
        consumer: new Consumer({
            kafkaConfig: {
                brokers: ['broker:9092'],
                clientId: 'frosttide-broker-account',
                connectionTimeout: 30,
                requestTimeout: 30,
                enforceRequestTimeout: true,
                retry: {
                    maxRetryTime: 30,
                    retries: 0,
                },
                // logLevel: logLevel.DEBUG,
            },
            consumerConfig: {
                groupId: 'frosttide-broker-account',
                retry: {
                    maxRetryTime: 30,
                    initialRetryTime: 30,
                    restartOnFailure: () => Promise.resolve(true),
                },
            },
            consumerSubscribeTopics: {
                topics: ['frosttide-broker-account-input'],
                fromBeginning: true,
            },
        }),
    }),
    new DatabaseAdapter(keyValueDb)
);

const eventProcessor = new EventProcessor({
    db,
    producer,
    consumer,
});
