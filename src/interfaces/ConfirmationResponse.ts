export default interface ConfirmationResponse {
    action: 'subscribed' | 'unsubscribed';
    symbol: string;
    updatedSymbols: string[];
}
