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
					"versionId": 0,
					"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2],\"children\":[]}}"
				},
				"object": {
					"id": 1,
					"platformAccountId": "abc123",
					"platformAPIKey": "xyz321"
				}
			},
			{
				"lock": {
					"versionId": 0,
					"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2],\"children\":[]}}"
				},
				"object": {
					"id": 2,
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
