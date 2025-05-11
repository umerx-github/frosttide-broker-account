import sinon from 'sinon';
import { expect, use } from 'chai';
import sinonChai from 'sinon-chai';
import EventProcessor from './EventProcessor.js';
import { db } from '../connections/database.js';
import { seed } from '../seeds/test.js';

use(sinonChai);

function getDependencies() {
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
    return { producer, consumer, eventProcessor }
}

describe('EventProcessor', () => {
    describe('Test group', () => {
        before(async () => {
            await seed();
        });
        it('handles RequestedAccountList before RequestedAccountCreate', async () => {
            const { producer, eventProcessor } = getDependencies();
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
                                        '{"t":3,"root":{"isLeaf":false,"keys":[4],"children":[{"isLeaf":true,"keys":[2,3],"children":[]},{"isLeaf":true,"keys":[5,6,7],"children":[]}]}}',
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
                                        '{"t":3,"root":{"isLeaf":true,"keys":[4],"children":[]}}',
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
        it('handles RequestedAccountCreateIntent', async () => {
            const { producer, eventProcessor } = getDependencies();
            await eventProcessor.processEvent({
                value: Buffer.from(JSON.stringify({
                    "eventType": "RequestedAccountCreateIntent"
                }))
            })
            expect(producer.sendMessage).to.have.been.calledWith({
                key: 'myKey',
                value: JSON.stringify({
                    eventType: 'AcknowledgedAccountCreateIntent',
                    data: {
                        request: { eventType: 'RequestedAccountCreateIntent' },
                        lock: {
                            versionId: 1,
                            proofOfInclusionBTreeSerialized: '{"t":3,"root":{"isLeaf":true,"keys":[1],"children":[]}}'
                        }
                    }
                }),
            })
        })
        it('handles RequestedAccountCreate', async () => {
            const { producer, eventProcessor } = getDependencies();
            await eventProcessor.processEvent({
                value: Buffer.from(JSON.stringify({
                    eventType: "RequestedAccountCreate",
                    messageId: 3,
                    lastReadVersionId: 1,
                    data: {
                        platform: "Alpaca",
                        platformAccountId: "abc123",
                        platformAPIKey: "xyz321"
                    }
                }))
            });
            expect(producer.sendMessage).to.have.been.calledWith({
                key: 'myKey',
                value: JSON.stringify({
                    "eventType": "AcknowledgedAccountCreate",
                    "data": {
                        "request": {
                            "eventType": "RequestedAccountCreate",
                            "messageId": 3,
                            "lastReadVersionId": 1,
                            "data": {
                                "platform": "Alpaca",
                                "platformAccountId": "abc123",
                                "platformAPIKey": "xyz321"
                            }
                        },
                        "lock": {
                            "versionId": 2,
                            "proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[1,3],\"children\":[]}}"
                        },
                        "payload": {
                            "lock": {
                                "versionId": 0,
                                "proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[3],\"children\":[]}}"
                            },
                            "object": {
                                "id": 3,
                                "recordStatus": "ACTIVE",
                                "platformAccountId": "abc123",
                                "platformAPIKey": "xyz321"
                            }
                        }
                    }
                })
            });
        });
        it('handles RequestedAccountList after RequestedAccountCreate', async () => {
            const { producer, eventProcessor } = getDependencies();
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
                    "eventType": "AcknowledgedAccountList",
                    "data": {
                        "request": {
                            "eventType": "RequestedAccountList"
                        },
                        "payload": [
                            {
                                "lock": {
                                    "versionId": 0,
                                    "proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":false,\"keys\":[4],\"children\":[{\"isLeaf\":true,\"keys\":[2,3],\"children\":[]},{\"isLeaf\":true,\"keys\":[5,6,7],\"children\":[]}]}}"
                                },
                                "object": {
                                    "id": 1,
                                    "recordStatus": "ACTIVE",
                                    "platformAccountId": "qwe456",
                                    "platformAPIKey": "645rty"
                                }
                            },
                            {
                                "lock": {
                                    "versionId": 0,
                                    "proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[4],\"children\":[]}}"
                                },
                                "object": {
                                    "id": 2,
                                    "recordStatus": "DELETED",
                                    "platformAccountId": "uyt321",
                                    "platformAPIKey": "bnm123"
                                }
                            },
                            {
                                "lock": {
                                    "versionId": 0,
                                    "proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[3],\"children\":[]}}"
                                },
                                "object": {
                                    "id": 3,
                                    "recordStatus": "ACTIVE",
                                    "platformAccountId": "abc123",
                                    "platformAPIKey": "xyz321"
                                }
                            }
                        ]
                    }
                }),
            });
        });
    })
});
