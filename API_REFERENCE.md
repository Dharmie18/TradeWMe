# Trading Platform API Reference

## Base URL
```
http://localhost:3000/api  (development)
https://trade-w-me.vercel.app/api  (production)
```

## Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer <userId>
```

---

## Wallet Endpoints

### Connect Wallet
```http
POST /api/wallet/connect
```

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "walletType": "metamask"
}
```

**Response:**
```json
{
  "success": true,
  "wallet": {
    "id": 1,
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "walletType": "metamask",
    "isActive": true,
    "createdAt": "2024-12-04T10:00:00Z"
  },
  "message": "Wallet connected successfully"
}
```

### Get Connected Wallets
```http
GET /api/wallet/connect
```

**Response:**
```json
{
  "success": true,
  "wallets": [
    {
      "id": 1,
      "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
      "walletType": "metamask",
      "isActive": true,
      "createdAt": "2024-12-04T10:00:00Z"
    }
  ]
}
```

### Disconnect Wallet
```http
DELETE /api/wallet/connect
```

**Request Body:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

---

## Deposit Endpoints

### Submit Deposit
```http
POST /api/deposits
```

**Request Body:**
```json
{
  "txHash": "0xabc123...",
  "fromAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.5",
  "currency": "ETH",
  "network": "ethereum"
}
```

**Response:**
```json
{
  "success": true,
  "deposit": {
    "id": 1,
    "txHash": "0xabc123...",
    "amount": "0.5",
    "currency": "ETH",
    "amountUsd": 1850.50,
    "status": "pending",
    "confirmations": 3,
    "depositedAt": "2024-12-04T10:00:00Z"
  },
  "message": "Deposit submitted, waiting for confirmations"
}
```

### Get Deposit History
```http
GET /api/deposits?limit=50&offset=0&status=confirmed&currency=ETH
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (pending, confirmed, failed)
- `currency` (optional): Filter by currency (ETH, USDT, etc.)

**Response:**
```json
{
  "success": true,
  "deposits": [
    {
      "id": 1,
      "txHash": "0xabc123...",
      "amount": "0.5",
      "currency": "ETH",
      "amountUsd": 1850.50,
      "status": "confirmed",
      "confirmations": 12,
      "network": "ethereum",
      "depositedAt": "2024-12-04T10:00:00Z",
      "confirmedAt": "2024-12-04T10:05:00Z"
    }
  ],
  "total": 1,
  "message": "Deposit history retrieved successfully"
}
```

### Check Deposit Status
```http
GET /api/deposits/status?txHash=0xabc123...
```

**Response:**
```json
{
  "success": true,
  "deposit": {
    "id": 1,
    "txHash": "0xabc123...",
    "amount": "0.5",
    "currency": "ETH",
    "amountUsd": 1850.50,
    "status": "confirmed",
    "confirmations": 12,
    "blockNumber": 18500000,
    "depositedAt": "2024-12-04T10:00:00Z",
    "confirmedAt": "2024-12-04T10:05:00Z"
  },
  "message": "Deposit confirmed and credited to your account!"
}
```

---

## Balance Endpoints

### Get Balances
```http
GET /api/balance
```

**Response:**
```json
{
  "success": true,
  "balances": [
    {
      "currency": "ETH",
      "balance": "0.5",
      "lockedBalance": "0.0",
      "availableBalance": "0.5",
      "totalDeposited": "0.5",
      "totalWithdrawn": "0.0",
      "totalProfits": "0.01",
      "balanceUsd": 1850.50,
      "lastUpdated": "2024-12-04T10:00:00Z"
    }
  ],
  "totalBalanceUsd": 1850.50,
  "message": "Balances retrieved successfully"
}
```

---

## Profit Endpoints

### Calculate Profits
```http
POST /api/profits/calculate
```

**Request Body:**
```json
{
  "profitType": "daily",
  "currency": "ETH",
  "customRate": 0.02
}
```

**Response:**
```json
{
  "success": true,
  "profits": [
    {
      "id": 1,
      "currency": "ETH",
      "amount": "0.01",
      "amountUsd": 37.01,
      "rate": 0.02,
      "baseAmount": "0.5",
      "profitType": "daily",
      "calculatedAt": "2024-12-04T10:00:00Z",
      "status": "applied"
    }
  ],
  "totalProfitUsd": 37.01,
  "message": "Profits calculated and applied to your account"
}
```

### Get Profit History
```http
GET /api/profits/history?limit=50&profitType=daily&status=applied
```

**Query Parameters:**
- `limit` (optional): Number of results
- `offset` (optional): Pagination offset
- `profitType` (optional): Filter by type (daily, trading, staking, referral)
- `status` (optional): Filter by status (pending, applied, cancelled)
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "profits": [
    {
      "id": 1,
      "currency": "ETH",
      "amount": "0.01",
      "amountUsd": 37.01,
      "rate": 0.02,
      "profitType": "daily",
      "calculatedAt": "2024-12-04T10:00:00Z",
      "appliedAt": "2024-12-04T10:00:01Z",
      "status": "applied"
    }
  ],
  "total": 1,
  "totalProfitUsd": 37.01,
  "message": "Profit history retrieved successfully"
}
```

### Get Profit Settings
```http
GET /api/profits/settings
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "dailyProfitRate": 0.02,
    "tradingProfitRate": 0.05,
    "compoundingEnabled": false,
    "autoApplyProfits": true,
    "minBalanceForProfits": "0.01",
    "lastProfitCalculation": "2024-12-04T10:00:00Z"
  },
  "message": "Settings retrieved successfully"
}
```

### Update Profit Settings
```http
PUT /api/profits/settings
```

**Request Body:**
```json
{
  "dailyProfitRate": 0.03,
  "tradingProfitRate": 0.06,
  "compoundingEnabled": true,
  "autoApplyProfits": true,
  "minBalanceForProfits": "0.05"
}
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "dailyProfitRate": 0.03,
    "tradingProfitRate": 0.06,
    "compoundingEnabled": true,
    "autoApplyProfits": true,
    "minBalanceForProfits": "0.05",
    "lastProfitCalculation": "2024-12-04T10:00:00Z"
  },
  "message": "Settings updated successfully"
}
```

---

## Dashboard Endpoints

### Get Dashboard Summary
```http
GET /api/dashboard/summary
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalBalanceUsd": 1887.51,
    "totalDepositsUsd": 1850.50,
    "totalProfitsUsd": 37.01,
    "profitPercentage": 2.0,
    "balances": [
      {
        "currency": "ETH",
        "balance": "0.51",
        "balanceUsd": 1887.51
      }
    ],
    "recentDeposits": [
      {
        "txHash": "0xabc123...",
        "amount": "0.5",
        "currency": "ETH",
        "amountUsd": 1850.50,
        "depositedAt": "2024-12-04T10:00:00Z"
      }
    ],
    "recentProfits": [
      {
        "amount": "0.01",
        "currency": "ETH",
        "amountUsd": 37.01,
        "profitType": "daily",
        "calculatedAt": "2024-12-04T10:00:00Z"
      }
    ],
    "connectedWallet": {
      "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
      "type": "metamask"
    }
  },
  "message": "Dashboard summary retrieved successfully"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Common Error Codes

- `NO_AUTH` - Missing or invalid authentication
- `USER_NOT_FOUND` - User does not exist
- `INVALID_ADDRESS` - Invalid wallet address format
- `INVALID_TX_HASH` - Invalid transaction hash format
- `DUPLICATE_DEPOSIT` - Transaction already submitted
- `TX_NOT_FOUND` - Transaction not found on blockchain
- `INVALID_DEPOSIT_ADDRESS` - Transaction not sent to platform address
- `ADDRESS_MISMATCH` - From address doesn't match transaction
- `AMOUNT_MISMATCH` - Amount doesn't match transaction
- `WALLET_ALREADY_CONNECTED` - Wallet connected to another account
- `DEPOSIT_NOT_FOUND` - Deposit record not found
- `MISSING_FIELDS` - Required fields missing from request

---

## Rate Limits

Currently no rate limits enforced. Recommended to implement:
- 10 requests per 10 seconds per user
- 100 requests per hour per user

---

## Testing with cURL

### Connect Wallet
```bash
curl -X POST http://localhost:3000/api/wallet/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user-id" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","walletType":"metamask"}'
```

### Get Balance
```bash
curl http://localhost:3000/api/balance \
  -H "Authorization: Bearer test-user-id"
```

### Calculate Profits
```bash
curl -X POST http://localhost:3000/api/profits/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user-id" \
  -d '{"profitType":"daily"}'
```
