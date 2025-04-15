export default interface EventProcessorClientLike {
    updateSubscribedSymbols(newSubscribedSymbols: Set<string>): void;
    subscribeToSymbol(symbol: string): void;
    unsubscribeFromSymbol(symbol: string): void;
    addOnMessageListener(
        callback: (message: { type: string; data?: any }) => void
    ): void;
}
