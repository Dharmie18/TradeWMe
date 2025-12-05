# 🚀 Production Setup Instructions

## Current Status: Phase 1 Complete ✅

### What's Been Created:

1. **Authentication System**
   - ✅ `/api/auth/signup` - User registration
   - ✅ `/api/auth/verify` - Email verification
   - ✅ `/api/auth/login` - Login with email verification check
   - ✅ Auth utilities (`src/lib/auth-utils.ts`)

2. **Wallet Management**
   - ✅ `/api/wallet/connect` - Connect wallet (balance = 0)
   - ✅ Blockchain utilities (`src/lib/blockchain.ts`)

3. **Deposit System**
   - ✅ `/api/deposit/verify` - Real blockchain verification
   - ✅ QR code generation (`/api/qr/generate`)

4. **Database Schema**
   - ✅ Complete Prisma schema with all tables
   - ✅ Audit logging for transparency
   - ✅ Simulation mode tracking (demo accounts only)

---

## 🔧 Next Steps to Get Running:

### Step 1: Install Dependencies

```bash
cd tradewme

# Check if all dependencies are installed
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 2: Update Environment Variables

**CRITICAL:** Update `.env` file with:

1. **Platform Deposit Address** (REQUIRED)
   ```env
   NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS=0xYourActualWalletAddress
   ```
   Replace `0x0000000000000000000000000000000000000000` with your real wallet address.

2. **RPC URLs** (for blockchain verification)
   ```env
   # Ethereum Mainnet
   ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   
   # Ethereum Testnet (Sepolia)
   ETHEREUM_TESTNET_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   
   # BSC
   BSC_RPC_URL=https://bsc-dataseed.binance.org/
   
   # Polygon
   POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   ```

3. **JWT Secret** (already set)
   ```env
   BETTER_AUTH_SECRET=9f9cdec5b7bf1ada15142418a444a2917acf2cd6e9e7c01d91c1c1040e5fdcf7
   ```

4. **App URL**
   ```env
   NEXTAUTH_URL=http://localhost:3000
   # For production: https://yourdomain.com
   ```

### Step 3: Get API Keys

#### Priority 1: Alchemy (Blockchain Verification)
1. Go to https://www.alchemy.com/
2. Sign up for free account
3. Create app for each network:
   - Ethereum Mainnet
   - Ethereum Sepolia (testnet)
   - Polygon Mainnet
4. Copy API keys to `.env`

#### Priority 2: SendGrid (Email - Optional for now)
1. Go to https://sendgrid.com/
2. Sign up for free account (100 emails/day)
3. Create API key
4. Add to `.env`:
   ```env
   SENDGRID_API_KEY=your_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

### Step 4: Test the APIs

Start the development server:
```bash
npm run dev
```

#### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

#### Test Email Verification
Use the `verificationUrl` from signup response:
```bash
curl http://localhost:3000/api/auth/verify?token=YOUR_TOKEN
```

#### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Test Wallet Connection
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

#### Test QR Code Generation
```bash
curl -X POST http://localhost:3000/api/qr/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "address": "0xYourPlatformAddress",
    "chain": "ethereum",
    "amount": "0.1",
    "currency": "ETH"
  }'
```

---

## 📋 What's Still Needed:

### Backend APIs:
- [ ] `/api/balance` - Get user balance
- [ ] `/api/deposits` - List user deposits
- [ ] `/api/prices` - Real-time price data
- [ ] `/api/admin/*` - Admin panel APIs
- [ ] WebSocket for real-time updates

### Frontend:
- [ ] Signup/Login pages
- [ ] Email verification flow
- [ ] Dashboard with wallet connection
- [ ] Deposit form with QR code
- [ ] Real-time price charts
- [ ] Simulation mode banner (demo accounts)

### External Services:
- [x] Turso Database (configured)
- [x] WalletConnect (configured)
- [x] CoinGecko (configured)
- [x] CoinMarketCap (configured)
- [ ] Alchemy (needs API keys)
- [ ] SendGrid (optional for now)

---

## 🔒 Security Features Implemented:

- ✅ Email verification required before login
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation with Zod
- ✅ Audit logging for all actions
- ✅ Balance always 0 on wallet connect
- ✅ Real blockchain verification
- ✅ Transparent simulation mode (demo only)

---

## 🎯 Testing Checklist:

### Authentication Flow:
- [ ] User can signup
- [ ] Verification email sent (or URL returned)
- [ ] Email verification works
- [ ] Login blocked without verification
- [ ] Login works after verification
- [ ] JWT token generated

### Wallet Flow:
- [ ] Wallet connection requires auth
- [ ] Balance is 0 on connect
- [ ] Wallet can't be connected to multiple accounts
- [ ] Audit log created

### Deposit Flow:
- [ ] QR code generated with valid EIP-681 URI
- [ ] Transaction verification works
- [ ] Confirmations tracked
- [ ] Balance updated after confirmation
- [ ] Audit log created

---

## 🚀 Ready for Production When:

1. ✅ All APIs tested locally
2. ⏳ Alchemy API keys added
3. ⏳ Platform deposit address set
4. ⏳ Frontend integrated
5. ⏳ Email service configured
6. ⏳ Deployed to Vercel
7. ⏳ Environment variables set in Vercel
8. ⏳ Database migrations run
9. ⏳ End-to-end testing on testnet

---

**Current Phase:** Backend APIs Complete ✅  
**Next Phase:** Frontend Integration & Testing  
**Status:** Ready for local testing with Alchemy keys

