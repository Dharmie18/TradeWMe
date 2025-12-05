# 🚀 Quick Reference Guide

## What's Been Done

### ✅ Phase 1: Backend APIs - COMPLETE

All core backend APIs are implemented and ready for testing:

1. **Authentication** - Signup, email verification, login
2. **Wallet Connection** - Connect wallet with balance = 0
3. **Deposit Verification** - Real blockchain transaction verification
4. **QR Code Generation** - Valid EIP-681 URIs
5. **Audit Logging** - Full transparency for all actions

---

## 🔑 Critical Actions Needed

### 1. Get Alchemy API Keys (REQUIRED)

**Why:** For blockchain transaction verification

**Steps:**
1. Go to https://www.alchemy.com/
2. Sign up (free)
3. Create 3 apps:
   - Ethereum Mainnet
   - Ethereum Sepolia (testnet)
   - Polygon Mainnet
4. Copy API keys

**Add to `.env`:**
```env
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE
ETHEREUM_TESTNET_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY_HERE
```

### 2. Set Platform Deposit Address (REQUIRED)

**Why:** This is where users will send deposits

**Update in `.env`:**
```env
NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS=0xYourActualWalletAddress
```

Replace `0x0000000000000000000000000000000000000000` with your real wallet address.

---

## 🧪 Quick Test

### 1. Setup Database
```bash
cd tradewme
npx prisma generate
npx prisma db push
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created! Please check your email...",
  "userId": "...",
  "verificationUrl": "http://localhost:3000/api/auth/verify?token=..."
}
```

### 4. Verify Email
Copy the `verificationUrl` from response and visit it in browser, or:
```bash
curl "http://localhost:3000/api/auth/verify?token=YOUR_TOKEN"
```

### 5. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### 6. Connect Wallet
```bash
curl -X POST http://localhost:3000/api/wallet/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chain": "ethereum",
    "walletType": "metamask"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Wallet connected successfully. Balance is 0 until you make a deposit.",
  "wallet": {
    "id": "...",
    "address": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "chain": "ethereum",
    "initialBalance": 0
  }
}
```

---

## 📁 File Structure

```
tradewme/
├── src/
│   ├── lib/
│   │   ├── auth-utils.ts          ✅ JWT verification
│   │   └── blockchain.ts          ✅ Blockchain utilities
│   │
│   └── app/
│       └── api/
│           ├── auth/
│           │   ├── signup/route.ts    ✅ User registration
│           │   ├── verify/route.ts    ✅ Email verification
│           │   └── login/route.ts     ✅ Login
│           │
│           ├── wallet/
│           │   └── connect/route.ts   ✅ Wallet connection
│           │
│           ├── deposit/
│           │   └── verify/route.ts    ✅ Deposit verification
│           │
│           └── qr/
│               └── generate/route.ts  ✅ QR generation
│
├── prisma/
│   └── schema.prisma              ✅ Complete database schema
│
├── .env                           ⚠️ NEEDS UPDATES
├── SETUP_INSTRUCTIONS.md          📖 Detailed setup guide
├── PHASE_1_COMPLETE.md            📖 Phase 1 summary
└── QUICK_REFERENCE.md             📖 This file
```

---

## 🔒 Security Features

### Implemented ✅
- Email verification required before login
- JWT token authentication
- Password hashing (bcrypt, 12 rounds)
- Input validation (Zod schemas)
- Audit logging (all actions tracked)
- Balance = 0 on wallet connect
- Real blockchain verification
- Address validation
- Transaction verification

### Ready for Implementation
- Rate limiting (schema supports)
- IP blocking (audit logs track IPs)
- Session management (sessions table ready)

---

## 📊 Database Tables

All tables created in Prisma schema:

### Core Tables
- `User` - User accounts with email verification
- `EmailVerificationToken` - Email verification tokens
- `Session` - User sessions
- `Wallet` - Connected wallets
- `Deposit` - Deposit records
- `Transaction` - Transaction history
- `Balance` - User balances
- `ProfitRecord` - Profit history
- `ProfitSettings` - Profit configuration

### Transparency Tables
- `SimulationAdjustment` - Demo account simulation tracking
- `AuditLog` - Full audit trail

### Utility Tables
- `PriceCache` - Price data cache
- `QRCode` - QR code records

---

## 🎯 What's Next

### Immediate
1. Get Alchemy keys
2. Set platform deposit address
3. Test all APIs locally
4. Verify blockchain integration works

### Short Term (Phase 2)
1. Balance & transaction APIs
2. Real-time price system
3. Admin panel APIs
4. Profit calculation system

### Medium Term (Phase 3)
1. Frontend pages (signup, login, dashboard)
2. Wallet connection UI
3. Deposit form with QR code
4. Real-time price charts

### Long Term (Phase 4-6)
1. Complete testing
2. Security audit
3. Deploy to production
4. Monitoring & maintenance

---

## 🆘 Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "Database connection error"
Check `.env` file:
- `TURSO_CONNECTION_URL` is set
- `TURSO_AUTH_TOKEN` is set

### "Transaction verification failed"
Check `.env` file:
- Alchemy RPC URLs are set
- API keys are valid
- Network is correct (ethereum, bsc, polygon)

### "Email verification not working"
For now, use the `verificationUrl` returned in signup response.
SendGrid integration is optional for local testing.

---

## 📞 Support

### Documentation
- `SETUP_INSTRUCTIONS.md` - Detailed setup
- `PHASE_1_COMPLETE.md` - What's been done
- `PRODUCTION_IMPLEMENTATION_GUIDE.md` - Full implementation guide

### Key Files
- `.env` - Environment variables
- `prisma/schema.prisma` - Database schema
- `src/lib/auth-utils.ts` - Auth utilities
- `src/lib/blockchain.ts` - Blockchain utilities

---

**Status:** Phase 1 Complete ✅  
**Ready for:** Local testing with Alchemy keys  
**Blocked by:** Alchemy API keys (free signup)

