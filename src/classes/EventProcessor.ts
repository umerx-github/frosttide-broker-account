import EventProcessorClientLike from '../interfaces/EventProcessorClientLike.js';
import EventProcessorProducerLike from '../interfaces/EventProcessorProducerLike.js';
import EventProcessorConsumerLike from '../interfaces/EventProcessorConsumerLike.js';
import { inputMessageValueSchema } from '../schemas/inputMessageValueSchema.js';
import { inputSchema } from '../schemas/inputSchema.js';

interface EventProcessorProps {
    client: EventProcessorClientLike;
    producer: EventProcessorProducerLike;
    consumer: EventProcessorConsumerLike;
}

export default class EventProcessor {
    private client: EventProcessorClientLike;
    private producer: EventProcessorProducerLike;
    private consumer: EventProcessorConsumerLike;
    private hasReceivedFullReport: boolean = false;
    private subscribedSymbols: Set<string> = new Set<string>();

    constructor({ client, producer, consumer }: EventProcessorProps) {
        this.client = client;
        this.producer = producer;
        this.consumer = consumer;
        this.consumer.addOnMessageHandler(async (messagePayload) =>
            this.processEvent(messagePayload)
        );
        this.client.addOnMessageListener((message) =>
            this.processClientMessage(message)
        );
        this.requestSubscribedSymbols();
    }

    public processClientMessage(message: any) {
        this.producer.sendMessage({
            key: 'myKey',
            value: JSON.stringify(message),
        });
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
            case 'ReportedSubscribedSymbols':
                this.hasReceivedFullReport = true;
                this.subscribedSymbols = new Set(validMessage.data.symbols);
                this.client.updateSubscribedSymbols(this.subscribedSymbols);
                this.producer.sendMessage({
                    key: 'myKey',
                    value: JSON.stringify({
                        eventType: 'ReportedSubscribedSymbols',
                        data: {
                            symbols: validMessage.data.symbols,
                        },
                    }),
                });
                break;
            case 'SubscribedToSymbol':
                if (!this.hasReceivedFullReport) {
                    this.requestSubscribedSymbols();
                    break;
                }
                this.subscribedSymbols.add(validMessage.data.symbol);
                this.client.updateSubscribedSymbols(this.subscribedSymbols);
                this.producer.sendMessage({
                    key: 'myKey',
                    value: JSON.stringify({
                        eventType: 'SubscribedToSymbol',
                        data: {
                            symbol: validMessage.data.symbol,
                        },
                    }),
                });
                break;
            case 'UnsubscribedToSymbol':
                if (!this.hasReceivedFullReport) {
                    this.requestSubscribedSymbols();
                    break;
                }
                this.subscribedSymbols.delete(validMessage.data.symbol);
                this.client.updateSubscribedSymbols(this.subscribedSymbols);
                this.producer.sendMessage({
                    key: 'myKey',
                    value: JSON.stringify({
                        eventType: 'UnsubscribedToSymbol',
                        data: {
                            symbol: validMessage.data.symbol,
                        },
                    }),
                });
                break;
            default:
                console.error('Invalid message:', validMessage);
        }
    }

    public requestSubscribedSymbols() {
        this.producer.sendMessage({
            key: 'myKey',
            value: JSON.stringify({
                eventType: 'RequestedSubscribedSymbols',
            }),
        });
    }
}
