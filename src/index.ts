import { ReconnectingWebSocket } from '@umerx/reconnecting-websocket';
import {
    Producer,
    Consumer,
    ReconnectingProducerAdapter,
    ReconnectingConsumerAdapter,
    IdempotentConsumerAdapter,
} from '@umerx/kafkajs-client';
import EventProcessor from './classes/EventProcessor.js';
import { open } from 'lmdb';
import { DatabaseAdapter } from './classes/DatabaseAdapter.js';

const producer = new ReconnectingProducerAdapter({
    producer: new Producer({
        kafkaConfig: {
            brokers: ['broker:9092'],
            clientId: 'finnhub-websocket-trades-event-processor',
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
        topics: ['finnhub-websocket-trades-event-processor-output'],
    }),
});

// Loop to keep sending messages every second
// let count = 0;
// setInterval(async () => {
//     count++;
//     console.log('Sending message:', count);
//     producer.sendMessage({
//         key: count.toString(),
//         value: JSON.stringify({
//             eventType: 'Test',
//             data: {
//                 message: 'Hello, World!',
//             },
//         }),
//     });
// }, 1000);

const finnhubToken = process.env.FINNHUB_TOKEN;
if (!finnhubToken) {
    throw new Error('FINNHUB_TOKEN is not defined');
}
const finnhubUrl = 'wss://ws.finnhub.io?token=' + finnhubToken;

client.start().catch(console.error);

// ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:BNBUSDT'].forEach((symbol) => {
//     client.subscribeToSymbol(symbol);
// });

const db = open<number, string>({
    path: 'db',
});

const consumer = new IdempotentConsumerAdapter(
    new ReconnectingConsumerAdapter({
        consumer: new Consumer({
            kafkaConfig: {
                brokers: ['broker:9092'],
                clientId: 'finnhub-websocket-trades-event-processor',
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
                groupId: 'finnhub-websocket-trades-event-processor',
                retry: {
                    maxRetryTime: 30,
                    initialRetryTime: 30,
                    restartOnFailure: () => Promise.resolve(true),
                },
            },
            consumerSubscribeTopics: {
                topics: ['finnhub-websocket-trades-event-processor-input'],
                fromBeginning: true,
            },
        }),
    }),
    new DatabaseAdapter(db)
);

const eventProcessor = new EventProcessor({
    client: client,
    producer: producer,
    consumer: consumer,
});
