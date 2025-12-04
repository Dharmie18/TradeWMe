# Quick Start Guide - Trading Platform Backend

## 🚀 Get Started in 5 Minutes

### Step 1: Set Platform Deposit Address (2 minutes)

1. Open `tradewme/.env`
2. Find this line:
   ```bash
   NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS=0x0000000000000000000000000000000000000000
   ```
3. Replace with your Ethereum wallet address:
   ```bash
   NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS=0xYourRealAddressHere
   ```

**How to get an address:**
- Use MetaMask: Create new wallet → Copy address
- Use hardware wallet (Ledger/Trezor) for production
- **IMPORTANT:** Keep the private key secure and NEVER commit it to code

---

### Step 2: Run Database Migration (1 minute)

```bash
cd tradewme
npx drizzle-kit push
```

This creates the new tables in your Turso database.

---

### Step 3: Start Development Server (1 minute)

```bash
npm run dev
```

Server starts at `http://localhost:3000`

---

### Step 4: Test API (1 minute)

Open a new terminal and test:

```bash
# Test wallet connection
curl -X POST http://localhost:3000/api/wallet/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user-id" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb","walletType":"metamask"}'

# Test balance
curl http://localhost:3000/api/balance \
  -H "Authorization: Bearer test-user-id"
```

If you see JSON responses, it's working! ✅

---

## 📱 Frontend Integration

### Add to your dashboard page:

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function TradingDashboard() {
  const [balance, setBalance] = useState<any>(null);

  useEffect(() => {
    fetch('/api/balance', {
      headers: {
        'Authorization': `Bearer ${userId}`, // Get from your auth
      },
    })
      .then(res => res.json())
      .then(data => setBalance(data));
  }, []);

  return (
    <div>
      <h1>Trading Dashboard</h1>
      {balance && (
        <div>
          <h2>Total Balance: ${balance.totalBalanceUsd.toFixed(2)}</h2>
          {balance.balances.map((b: any) => (
            <div key={b.currency}>
              <p>{b.currency}: {b.balance}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 What You Can Do Now

### 1. Connect Wallet
```typescript
POST /api/wallet/connect
{
  "walletAddress": "0x...",
  "walletType": "metamask"
}
```

### 2. Submit Deposit (after sending crypto)
```typescript
POST /api/deposits
{
  "txHash": "0x...",
  "fromAddress": "0x...",
  "amount": "0.5",
  "currency": "ETH",
  "network": "ethereum"
}
```

### 3. Check Balance
```typescript
GET /api/balance
```

### 4. Calculate Profits
```typescript
POST /api/profits/calculate
{
  "profitType": "daily"
}
```

### 5. View Dashboard
```typescript
GET /api/dashboard/summary
```

---

## 📚 Full Documentation

- **Complete Guide:** `TRADING_BACKEND_GUIDE.md`
- **API Reference:** `API_REFERENCE.md`
- **Frontend Examples:** `FRONTEND_INTEGRATION.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`

---

## ✅ Checklist

- [ ] Platform deposit address set in `.env`
- [ ] Database migration run (`npx drizzle-kit push`)
- [ ] Dev server running (`npm run dev`)
- [ ] API tested with curl
- [ ] Frontend components added
- [ ] Wallet connection tested
- [ ] Deposit flow tested
- [ ] Balance display working
- [ ] Dashboard showing data

---

## 🔒 Security Reminder

Before deploying to production:
1. Set real platform deposit address
2. Secure the private key (use hardware wallet)
3. Add rate limiting
4. Integrate proper authentication
5. Set up error monitoring
6. Test thoroughly

---

## 🎉 You're Ready!

Your trading platform backend is fully functional with:
- ✅ Real wallet integration
- ✅ Real blockchain verification
- ✅ Real-time price data
- ✅ Automated profit calculations
- ✅ Complete API

Start building your frontend and test with real transactions!

---

## 💡 Pro Tips

1. **Test with small amounts first** - Use testnet or small mainnet amounts
2. **Monitor confirmations** - Poll `/api/deposits/status` every 10 seconds
3. **Update prices regularly** - Balance endpoint recalculates USD values
4. **Set profit rates carefully** - Default is 2% daily, 5% trading
5. **Use TypeScript** - All types are defined in `src/types/trading.ts`

---

## 🆘 Troubleshooting

### "Transaction not found"
- Wait a few seconds after sending transaction
- Check transaction on Etherscan
- Verify network is correct

### "Invalid deposit address"
- Check `NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS` is set
- Verify transaction was sent to platform address

### "Unauthorized"
- Check `Authorization` header is set
- Replace `test-user-id` with real user ID from session

### Database errors
- Run migration: `npx drizzle-kit push`
- Check Turso connection in `.env`

---

## 📞 Next Steps

1. ✅ Complete this quick start
2. 📖 Read `TRADING_BACKEND_GUIDE.md` for details
3. 🎨 Add frontend components from `FRONTEND_INTEGRATION.md`
4. 🧪 Test with real transactions
5. 🚀 Deploy to production

**Happy building! 🚀**
