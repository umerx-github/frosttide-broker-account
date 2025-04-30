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
				"id": 1,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321",
				"versionId": 0,
				"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[0],\"children\":[]}}"
			},
			{
				"id": 2,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321",
				"versionId": 0,
				"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[1],\"children\":[]}}"
			},
			{
				"id": 3,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321",
				"versionId": 0,
				"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2],\"children\":[]}}"
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
			"versionId": 8,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":false,\"keys\":[0,1],\"children\":[{\"isLeaf\":true,\"keys\":[0,0],\"children\":[]},{\"isLeaf\":true,\"keys\":[0,0],\"children\":[]},{\"isLeaf\":true,\"keys\":[2,5,7],\"children\":[]}]}}"
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
			"lastReadVersionId": 1,
			"data": {
				"platform": "Alpaca",
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			}
		},
		"lock": {
			"versionId": 2,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[0,1,2],\"children\":[]}}"
		},
		"payload": {
			"id": 3,
			"platformAccountId": "abc123",
			"platformAPIKey": "xyz321",
			"versionId": 0,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[2],\"children\":[]}}"
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
			"lastReadVersionId": 1,
			"data": {
				"platform": "Alpaca",
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			}
		},
		"lock": {
			"versionId": 2,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":true,\"keys\":[0,1,2],\"children\":[]}}"
		},
		"reason": "Existing Lock versionId 2 > message lastReadVersionId 1"
	}
}
```

### RequestedAccountUpdate

#### Request

#### Response

##### AcknowledgedAccountUpdate

##### RejectedAccountUpdate

### RequestedAccountDelete

#### Request

#### Response

##### AcknowledgedAccountDelete

##### RejectedAccountDelete
