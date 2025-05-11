# Finnhub Websocket Trades Event Processor

## Events

### RequestedAccountList

#### Request

```
{
	"eventType": "RequestedAccountList"
}
```

#### Response

##### AcknowledgedAccountList

```
{
	"eventType": "AcknowledgedAccountList",
	"data": {
		"request": {
			"eventType": "RequestedAccountList"
		},
		"payload": [
			{
				"lock": {
					"versionId": 3,
					"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2,2,2,2],\"children\":[]}}"
				},
				"object": {
					"id": 1,
					"recordStatus": "DELETED",
					"platformAccountId": "uyt321",
					"platformAPIKey": "bnm123"
				}
			},
			{
				"lock": {
					"versionId": 0,
					"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2],\"children\":[]}}"
				},
				"object": {
					"id": 2,
					"recordStatus": "ACTIVE",
					"platformAccountId": "qwe456",
					"platformAPIKey": "645rty"
				}
			}
		]
	}
}

```

##### RejectedAccountList

### RequestedAccountCreateIntent

#### Request

```
{
	"eventType": "RequestedAccountCreateIntent"
}
```

#### Response

##### AcknowledgedAccountCreateIntent

```
{
	"eventType": "AcknowledgedAccountCreateIntent",
	"data": {
		"request": {
			"eventType": "RequestedAccountCreateIntent"
		},
		"lock": {
			"versionId": 1,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2,2],\"children\":[]}}"
		}
	}
}
```

### RequestedAccountCreate

#### Request

```
{
	"eventType": "RequestedAccountCreate",
	"messageId": 2,
	"lastReadVersionId": 1,
	"data": {
		"platform": "Alpaca",
		"platformAccountId": "abc123",
		"platformAPIKey": "xyz321"
	}
}
```

#### Response

##### AcknowledgedAccountCreate

```
{
	"eventType": "AcknowledgedAccountCreate",
	"data": {
		"request": {
			"eventType": "RequestedAccountCreate",
			"messageId": 2,
			"lastReadVersionId": null,
			"data": {
				"platform": "Alpaca",
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			}
		},
		"lock": {
			"versionId": 0,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2],\"children\":[]}}"
		},
		"payload": {
			"lock": {
				"versionId": 0,
				"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2],\"children\":[]}}"
			},
			"object": {
				"id": 1,
				"recordStatus": "ACTIVE",
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			}
		}
	}
}
```

##### RejectedAccountCreate

```
{
	"eventType": "RejectedAccountCreate",
	"data": {
		"request": {
			"eventType": "RequestedAccountCreate",
			"messageId": 2,
			"lastReadVersionId": 0,
			"data": {
				"platform": "Alpaca",
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			}
		},
		"lock": {
			"versionId": 1,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2,2],\"children\":[]}}"
		},
		"reason": "Existing Lock versionId 1 !== message lastReadVersionId 0"
	}
}
```

### RequestedAccountUpdate

#### Request

```
{
	"eventType": "RequestedAccountUpdate",
	"messageId": 2,
	"lastReadVersionId": 1,
	"data": {
		"id": 1,
		"platform": "Alpaca",
		"platformAccountId": "cba321",
		"platformAPIKey": "zyx123"
	}
}
```

#### Response

##### AcknowledgedAccountUpdate

```
{
	"eventType": "AcknowledgedAccountUpdate",
	"data": {
		"request": {
			"eventType": "RequestedAccountUpdate",
			"messageId": 2,
			"lastReadVersionId": 1,
			"data": {
				"platform": "Alpaca",
				"platformAccountId": "uyt321",
				"platformAPIKey": "bnm123",
				"id": 1
			}
		},
		"payload": {
			"lock": {
				"versionId": 2,
				"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2,2,2],\"children\":[]}}"
			},
			"object": {
				"id": 1,
				"recordStatus": "ACTIVE",
				"platformAccountId": "uyt321",
				"platformAPIKey": "bnm123"
			}
		}
	}
}
```

##### RejectedAccountUpdate

```
{
	"eventType": "RejectedAccountUpdate",
	"data": {
		"request": {
			"eventType": "RequestedAccountUpdate",
			"messageId": 2,
			"lastReadVersionId": 1,
			"data": {
				"platform": "Alpaca",
				"platformAccountId": "cba321",
				"platformAPIKey": "zyx123",
				"id": 1
			}
		},
		"payload": {
			"lock": {
				"versionId": 2,
				"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2,2,2],\"children\":[]}}"
			}
		},
		"reason": "Existing Lock versionId 2 !== message lastReadVersionId 1"
	}
}
```

```
{
	"eventType": "RejectedAccountUpdate",
	"data": {
		"request": {
			"eventType": "RequestedAccountUpdate",
			"messageId": 2,
			"lastReadVersionId": 1,
			"data": {
				"platform": "Alpaca",
				"platformAccountId": "cba321",
				"platformAPIKey": "zyx123",
				"id": 2
			}
		},
		"payload": {
			"lock": {
				"versionId": 1,
				"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2,2],\"children\":[]}}"
			}
		},
		"reason": "Record is immutable with recordStatus: DELETED"
	}
}
```

### RequestedAccountDelete

#### Request

```
{
	"eventType": "RequestedAccountDelete",
	"messageId": 2,
	"lastReadVersionId": 1,
	"data": {
		"id": 1
	}
}
```

#### Response

##### AcknowledgedAccountDelete

```
{
  "eventType": "AcknowledgedAccountDelete",
  "data": {
    "request": {
      "eventType": "RequestedAccountDelete",
      "messageId": 2,
      "lastReadVersionId": 2,
      "data": {
        "id": 1
      }
    },
    "payload": {
      "lock": {
        "versionId": 3,
        "proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2,2,2,2],\"children\":[]}}"
      },
      "object": {
        "id": 1,
		"recordStatus": "DELETED",
        "platformAccountId": "uyt321",
        "platformAPIKey": "bnm123"
      }
    }
  }
}
```

##### RejectedAccountDelete

```
{
	"eventType": "RejectedAccountDelete",
	"data": {
		"request": {
			"eventType": "RequestedAccountDelete",
			"messageId": 2,
			"lastReadVersionId": 1,
			"data": {
				"id": 1
			}
		},
		"payload": {
			"lock": {
				"versionId": 2,
				"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2,2,2],\"children\":[]}}"
			}
		},
		"reason": "Existing Lock versionId 2 !== message lastReadVersionId 1"
	}
}
```

```
{
	"eventType": "RejectedAccountDelete",
	"data": {
		"request": {
			"eventType": "RequestedAccountDelete",
			"messageId": 2,
			"lastReadVersionId": 2,
			"data": {
				"id": 2
			}
		},
		"payload": {
			"lock": {
				"versionId": 1,
				"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2,2],\"children\":[]}}"
			}
		},
		"reason": "Record is immutable with recordStatus: DELETED"
	}
}
```

## Tests

### Debugging the Tests

#### Serialization

> [!TIP]
> This method can be helpful if you are having trouble formatting the JSON in the tests.

```
AssertionError: expected sendMessage to have been called with arguments {}
{ key: 'myKey',
  value: '{"eventType":"AcknowledgedAccountCreate","data":{"request":{"eventType":"RequestedAccountCreate","messageId":3,"lastReadVersionId":1,"data":{"platform":"Alpaca","platformAccountId":"abc123","platformAPIKey":"xyz321"}},"lock":{"versionId":2,"proofOfInclusionBTreeSerialized":"{\\"t\\":3,\\"root\\":{\\"isLeaf\\":true,\\"keys\\":[1,3],\\"children\\":[]}}"},"payload":{"lock":{"versionId":0,"proofOfInclusionBTreeSerialized":"{\\"t\\":3,\\"root\\":{\\"isLeaf\\":true,\\"keys\\":[3],\\"children\\":[]}}"},"object":{"id":3,"recordStatus":"ACTIVE","platformAccountId":"abc123","platformAPIKey":"xyz321"}}}}' } {}
```

To add the output to your test, you can copy the JSON string from `value` and format it like so:

```
const myJSONString = '{"eventType":"AcknowledgedAccountCreate","data":{"request":{"eventType":"RequestedAccountCreate","messageId":3,"lastReadVersionId":1,"data":{"platform":"Alpaca","platformAccountId":"abc123","platformAPIKey":"xyz321"}},"lock":{"versionId":2,"proofOfInclusionBTreeSerialized":"{\\"t\\":3,\\"root\\":{\\"isLeaf\\":true,\\"keys\\":[1,3],\\"children\\":[]}}"},"payload":{"lock":{"versionId":0,"proofOfInclusionBTreeSerialized":"{\\"t\\":3,\\"root\\":{\\"isLeaf\\":true,\\"keys\\":[3],\\"children\\":[]}}"},"object":{"id":3,"recordStatus":"ACTIVE","platformAccountId":"abc123","platformAPIKey":"xyz321"}}}}';

console.log(JSON.stringify(JSON.parse(myJSONString),null, 2));
```

This will print something like:

```
{
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
}
```
