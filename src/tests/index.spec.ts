import sinon from 'sinon';
import { expect, use } from 'chai';
import sinonChai from 'sinon-chai';
import FinnhubWebSocketClient from '../classes/FinnhubWebSocketClient.js';
import MockWebSocket from '../classes/MockWebSocket.js';
import EventProcessor from '../classes/EventProcessor.js';
import EventProcessorClientLike from '../interfaces/EventProcessorClientLike.js';

use(sinonChai);

describe('FinnhubWebSocketClient', () => {
    const subscribedSymbols = new Set<string>();
    const ws = new MockWebSocket();
    const wsSendSpy = sinon.spy(ws, 'send');
    const client = new FinnhubWebSocketClient({
        ws: ws,
        finnhubToken: 'test-token',
    });
    client.start().catch(console.error);

    it('shouldAddSymbolIntended', () => {
        const addSymbolEvent = {
            eventType: 'AddSymbol',
            data: {
                symbol: 'AAPL',
            },
        };
        subscribedSymbols.add(addSymbolEvent.data.symbol);
        const response = client.subscribeToSymbol(addSymbolEvent.data.symbol);
        expect(response.action).to.equal('subscribed');
        expect(response.symbol).to.equal(addSymbolEvent.data.symbol);
        expect(response.updatedSymbols).to.deep.equal([
            addSymbolEvent.data.symbol,
        ]);
        expect(wsSendSpy).to.have.been.called;
        expect(wsSendSpy).to.have.been.calledWith(
            JSON.stringify({
                type: 'subscribe',
                symbol: addSymbolEvent.data.symbol,
            })
        );
    });
    it('shouldRemoveSymbolIntended', () => {
        const removeSymbolEvent = {
            eventType: 'RemoveSymbol',
            data: {
                symbol: 'AAPL',
            },
        };
        subscribedSymbols.delete(removeSymbolEvent.data.symbol);
        const response = client.unsubscribeFromSymbol(
            removeSymbolEvent.data.symbol
        );
        expect(response.action).to.equal('unsubscribed');
        expect(response.symbol).to.equal(removeSymbolEvent.data.symbol);
        expect(response.updatedSymbols).to.deep.equal([]);
    });
});
describe('EventProcessor', () => {
    it('shouldProcessSubscribeEvent', async () => {
        const client: EventProcessorClientLike = {
            subscribeToSymbol: sinon.spy(),
            unsubscribeFromSymbol: sinon.spy(),
            addOnMessageListener: (callback) => { },
            updateSubscribedSymbols: sinon.spy(),
        };
        const producer = {
            sendMessage: sinon.spy(),
        };
        const consumer = {
            addOnMessageHandler: sinon.spy(),
        }
        const eventProcessor = new EventProcessor({
            client,
            producer,
            consumer
        });
        expect(producer.sendMessage).to.have.callCount(1);
        expect(producer.sendMessage).to.have.been.calledWith({
            key: 'myKey',
            value: JSON.stringify({
                eventType: 'RequestedSubscribedSymbols',
            }),
        });
        await eventProcessor.processEvent({
            value: Buffer.from(JSON.stringify({
                eventType: 'SubscribedToSymbol',
                data: {
                    symbol: 'AAPL',
                },
            })),
        });
        expect(client.updateSubscribedSymbols).not.to.have.been.called;
        expect(producer.sendMessage).to.have.callCount(2);
        expect(producer.sendMessage).to.have.been.calledWith({
            key: 'myKey',
            value: JSON.stringify({
                eventType: 'RequestedSubscribedSymbols',
            }),
        });
        await eventProcessor.processEvent({
            key: 'myKey',
            value: Buffer.from(JSON.stringify({
                eventType: 'ReportedSubscribedSymbols',
                data: {
                    symbols: ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'],
                },
            })),
        });
        expect(client.updateSubscribedSymbols).to.have.been.called;
        expect(client.updateSubscribedSymbols).to.have.been.calledWith(
            new Set(['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'])
        );
        expect(producer.sendMessage).to.have.callCount(3);
        expect(producer.sendMessage).to.have.been.calledWith({
            key: 'myKey',
            value: JSON.stringify({
                eventType: 'ReportedSubscribedSymbols',
                data: {
                    symbols: ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'],
                },
            }),
        });
        await eventProcessor.processEvent({
            value: Buffer.from(JSON.stringify({
                eventType: 'SubscribedToSymbol',
                data: {
                    symbol: 'AAPL',
                },
            })),
        });
        expect(client.updateSubscribedSymbols).to.have.been.called;
        expect(client.updateSubscribedSymbols).to.have.been.calledWith(
            new Set(['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'AAPL'])
        );
        expect(producer.sendMessage).to.have.callCount(4);
        expect(producer.sendMessage).to.have.been.calledWith({
            key: 'myKey',
            value: JSON.stringify({
                eventType: 'SubscribedToSymbol',
                data: {
                    symbol: 'AAPL',
                },
            }),
        });
    });
});
