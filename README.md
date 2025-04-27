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

##### RejectedAccountList

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

##### RejectedAccountAdd

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
