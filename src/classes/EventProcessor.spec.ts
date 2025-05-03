import sinon from 'sinon';
import { expect, use } from 'chai';
import sinonChai from 'sinon-chai';
import EventProcessor from './EventProcessor.js';
import { db } from '../connections/database.js';

use(sinonChai);

describe('EventProcessor', () => {
    it('processes events with a connection 1x', async () => {
        const producer = {
            sendMessage: sinon.spy(),
        };
        const consumer = {
            addOnMessageHandler: sinon.spy(),
        };
        const eventProcessor = new EventProcessor({
            db,
            producer,
            consumer,
        });
        await eventProcessor.processEvent({
            value: Buffer.from(
                JSON.stringify({
                    eventType: 'RequestedAccountList',
                })
            ),
        });
        expect(producer.sendMessage).to.have.been.calledWith({
            key: 'myKey',
            value: JSON.stringify({
                eventType: 'AcknowledgedAccountList',
                data: {
                    request: {
                        eventType: 'RequestedAccountList',
                    },
                    payload: [
                        {
                            lock: {
                                versionId: 0,
                                proofOfInclusionBTreeSerialized:
                                    '{"t":3,"root":{"isLeaf":true,"keys":[2],"children":[]}}',
                            },
                            object: {
                                id: 1,
                                recordStatus: 'ACTIVE',
                                platformAccountId: 'qwe456',
                                platformAPIKey: '645rty',
                            },
                        },
                        {
                            lock: {
                                versionId: 0,
                                proofOfInclusionBTreeSerialized:
                                    '{"t":3,"root":{"isLeaf":true,"keys":[2],"children":[]}}',
                            },
                            object: {
                                id: 2,
                                recordStatus: 'DELETED',
                                platformAccountId: 'uyt321',
                                platformAPIKey: 'bnm123',
                            },
                        },
                    ],
                },
            }),
        });
    });
    it('processes events with a connection 2x', async () => {
        const producer = {
            sendMessage: sinon.spy(),
        };
        const consumer = {
            addOnMessageHandler: sinon.spy(),
        };
        const eventProcessor = new EventProcessor({
            db,
            producer,
            consumer,
        });
        await eventProcessor.processEvent({
            value: Buffer.from(
                JSON.stringify({
                    eventType: 'RequestedAccountList',
                })
            ),
        });
        expect(producer.sendMessage).to.have.been.calledWith({
            key: 'myKey',
            value: JSON.stringify({
                eventType: 'AcknowledgedAccountList',
                data: {
                    request: {
                        eventType: 'RequestedAccountList',
                    },
                    payload: [
                        {
                            lock: {
                                versionId: 0,
                                proofOfInclusionBTreeSerialized:
                                    '{"t":3,"root":{"isLeaf":true,"keys":[2],"children":[]}}',
                            },
                            object: {
                                id: 1,
                                recordStatus: 'ACTIVE',
                                platformAccountId: 'qwe456',
                                platformAPIKey: '645rty',
                            },
                        },
                        {
                            lock: {
                                versionId: 0,
                                proofOfInclusionBTreeSerialized:
                                    '{"t":3,"root":{"isLeaf":true,"keys":[2],"children":[]}}',
                            },
                            object: {
                                id: 2,
                                recordStatus: 'DELETED',
                                platformAccountId: 'uyt321',
                                platformAPIKey: 'bnm123',
                            },
                        },
                    ],
                },
            }),
        });
    });
});
