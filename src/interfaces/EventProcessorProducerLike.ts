export default interface EventProcessorProducerLike {
    sendMessage(message: { key: string; value: string }): Promise<void>;
}
