import sinon from 'sinon';
import { expect, use } from 'chai';
import sinonChai from 'sinon-chai';
import EventProcessor from './EventProcessor.js';
import EventProcessorProducerLike from '../interfaces/EventProcessorProducerLike.js';
import EventProcessorConsumerLike from '../interfaces/EventProcessorConsumerLike.js';
import { Kysely } from 'kysely';
import { Database } from '../interfaces/Database.js';
import { any } from 'zod';

use(sinonChai);

describe('EventProcessor', () => {
    const producer: EventProcessorProducerLike = {
        async sendMessage(message: { key: string; value: string }) {},
    };
    const consumer: EventProcessorConsumerLike = {
        async addOnMessageHandler(handler: (message) => Promise<void>) {},
    };
    // const db: DatabaseLike<Database> = {
    //     transaction() => TransactionBuilder<Database>
    // }
    // const subscribedSymbols = new Set<string>();
    // const ws = new MockWebSocket();
    // const wsSendSpy = sinon.spy(ws, 'send');
    // const client = new FinnhubWebSocketClient({
    //     ws: ws,
    //     finnhubToken: 'test-token',
    // });
    // client.start().catch(console.error);

    // it('shouldAddSymbolIntended', () => {
    //     const addSymbolEvent = {
    //         eventType: 'AddSymbol',
    //         data: {
    //             symbol: 'AAPL',
    //         },
    //     };
    //     subscribedSymbols.add(addSymbolEvent.data.symbol);
    //     const response = client.subscribeToSymbol(addSymbolEvent.data.symbol);
    //     expect(response.action).to.equal('subscribed');
    //     expect(response.symbol).to.equal(addSymbolEvent.data.symbol);
    //     expect(response.updatedSymbols).to.deep.equal([
    //         addSymbolEvent.data.symbol,
    //     ]);
    //     expect(wsSendSpy).to.have.been.called;
    //     expect(wsSendSpy).to.have.been.calledWith(
    //         JSON.stringify({
    //             type: 'subscribe',
    //             symbol: addSymbolEvent.data.symbol,
    //         })
    //     );
    // });
    // it('shouldRemoveSymbolIntended', () => {
    //     const removeSymbolEvent = {
    //         eventType: 'RemoveSymbol',
    //         data: {
    //             symbol: 'AAPL',
    //         },
    //     };
    //     subscribedSymbols.delete(removeSymbolEvent.data.symbol);
    //     const response = client.unsubscribeFromSymbol(
    //         removeSymbolEvent.data.symbol
    //     );
    //     expect(response.action).to.equal('unsubscribed');
    //     expect(response.symbol).to.equal(removeSymbolEvent.data.symbol);
    //     expect(response.updatedSymbols).to.deep.equal([]);
    // });
});
