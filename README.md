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
				"platformAPIKey": "xyz321"
			},
			{
				"id": 2,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			},
			{
				"id": 3,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			},
			{
				"id": 4,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			},
			{
				"id": 5,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			},
			{
				"id": 6,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			},
			{
				"id": 7,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			},
			{
				"id": 8,
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			}
		]
	}
}
```

##### RejectedAccountList

### RequestedAccountAddIntent

#### Request

```
{
	"eventType": "RequestedAccountAddIntent"
}
```

#### Response

##### AcknowledgedAccountAddIntent

```
{
	"eventType": "AcknowledgedAccountAddIntent",
	"data": {
		"request": {
			"eventType": "RequestedAccountAddIntent"
		},
		"lock": {
			"versionId": 8,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":false,\"keys\":[0,1],\"children\":[{\"isLeaf\":true,\"keys\":[0,0],\"children\":[]},{\"isLeaf\":true,\"keys\":[0,0],\"children\":[]},{\"isLeaf\":true,\"keys\":[2,5,7],\"children\":[]}]}}"
		}
	}
}
```

### RequestedAccountAdd

#### Request

```
{
	"eventType": "RequestedAccountAdd",
	"messageId": 0,
	"lastReadVersionId": null,
	"data": {
		"platform": "Alpaca",
		"platformAccountId": "abc123",
		"platformAPIKey": "xyz321"
	}
}
```

#### Response

##### AcknowledgedAccountAdd

```
{
	"eventType": "AcknowledgedAccountAdd",
	"data": {
		"request": {
			"eventType": "RequestedAccountAdd",
			"messageId": 7,
			"lastReadVersionId": 7,
			"data": {
				"platform": "Alpaca",
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			}
		},
		"lock": {
			"versionId": 8,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":false,\"keys\":[0,1],\"children\":[{\"isLeaf\":true,\"keys\":[0,0],\"children\":[]},{\"isLeaf\":true,\"keys\":[0,0],\"children\":[]},{\"isLeaf\":true,\"keys\":[2,5,7],\"children\":[]}]}}"
		},
		"payload": {
			"id": 9,
			"platformAccountId": "abc123",
			"platformAPIKey": "xyz321"
		}
	}
}
```

##### RejectedAccountAdd

```
{
	"eventType": "RejectedAccountAdd",
	"data": {
		"request": {
			"eventType": "RequestedAccountAdd",
			"messageId": 0,
			"lastReadVersionId": null,
			"data": {
				"platform": "Alpaca",
				"platformAccountId": "abc123",
				"platformAPIKey": "xyz321"
			}
		},
		"lock": {
			"versionId": 7,
			"proofOfInclusionBTreeSerialized": "{\"t\":3,\"root\":{\"isLeaf\":false,\"keys\":[0],\"children\":[{\"isLeaf\":true,\"keys\":[0,0],\"children\":[]},{\"isLeaf\":true,\"keys\":[0,0,1,2,5],\"children\":[]}]}}"
		},
		"reason": "Existing Lock versionId 7 > message lastReadVersionId null"
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
