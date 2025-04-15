import Message from './Message.js';

export default interface EventProcessorConsumerLike {
    addOnMessageHandler(
        handler: (message: Message) => Promise<void>
    ): Promise<void>;
}
