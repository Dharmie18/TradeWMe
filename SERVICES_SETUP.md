# External Services Setup Guide

## Overview
This document lists all external services needed for the trading platform, which ones you already have, and which ones you need to set up.

---

## ✅ Already Configured (Working Now)

### 1. Turso Database
- **Status:** ✅ Configured
- **Purpose:** Store user data, deposits, balances, profits
- **Location:** `.env` - `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN`
- **Action Required:** None - already working

### 2. WalletConnect
- **Status:** ✅ Configured
- **Purpose:** Connect wallets (MetaMask, Coinbase, etc.)
- **Location:** `.env` - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- **Action Required:** None - already working

### 3. CoinGecko API
- **Status:** ✅ Configured
- **Purpose:** Get real-time crypto prices
- **Location:** `.env` - `COINGECKO_API_KEY`
- **Action Required:** None - already working

### 4. Better Auth
- **Status:** ✅ Configured
- **Purpose:** User authentication
- **Location:** `.env` - `BETTER_AUTH_SECRET`
- **Action Required:** None - already working

---

## ⚠️ CRITICAL - Must Configure

### Platform Deposit Address
- **Status:** ⚠️ REQUIRED
- **Purpose:** Receive user deposits
- **Time to Setup:** 5 minutes
- **Cost:** FREE

**Steps:**
1. Create a new Ethereum wallet (use MetaMask or hardware wallet)
2. **IMPORTANT:** Securely backup the private key/seed phrase
3. Copy the public address (starts with 0x...)
4. Add to `.env`:
   ```bash
   NEXT_PUBLIC_PLATFORM_DEPOSIT_ADDRESS=0xYourAddressHere
   ```
5. **NEVER** share or commit the private key

**Security Notes:**
- This wallet will receive ALL user deposits
- Use a hardware wallet (Ledger, Trezor) for maximum security
- Consider using a multi-sig wallet for production
- Keep private keys offline and encrypted

---

## 🆓 Free Services (No Registration Needed)

### 1. Ethereum RPC
- **Status:** ✅ Working
- **Purpose:** Verify transactions on Ethereum
- **Provider:** eth.llamarpc.com (free public RPC)
- **Action Required:** None

### 2. Polygon RPC
- **Status:** ✅ Working
- **Purpose:** Verify transactions on Polygon
- **Provider:** polygon-rpc.com (free public RPC)
- **Action Required:** None

### 3. BSC RPC
- **Status:** ✅ Working
- **Purpose:** Verify transactions on Binance Smart Chain
- **Provider:** bsc-dataseed.binance.org (free public RPC)
- **Action Required:** None

---

## 📊 Optional Upgrades (Recommended for Production)

### 1. Alchemy
- **Status:** 🔵 Optional
- **Purpose:** Better RPC reliability and speed
- **Time to Setup:** 5 minutes
- **Cost:** FREE tier (300M compute units/month)

**Why Upgrade:**
- More reliable than public RPCs
- Faster transaction verification
- Better uptime
- Advanced features (webhooks, notifications)

**Setup:**
1. Visit: https://www.alchemy.com/
2. Create free account
3. Create new app (select Ethereum, Polygon, etc.)
4. Copy API key
5. Update `tradewme/src/lib/blockchain.ts`:
   ```typescript
   const NETWORK_CONFIGS = {
     ethereum: {
       rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
     },
   };
   ```

### 2. Infura
- **Status:** 🔵 Optional (Alternative to Alchemy)
- **Purpose:** RPC provider
- **Time to Setup:** 5 minutes
- **Cost:** FREE tier (100K requests/day)

**Setup:**
1. Visit: https://infura.io/
2. Create free account
3. Create new project
4. Copy API key
5. Update blockchain.ts with Infura URLs

### 3. Etherscan API
- **Status:** 🔵 Optional
- **Purpose:** Additional transaction data and verification
- **Time to Setup:** 3 minutes
- **Cost:** FREE tier (5 calls/second)

**Setup:**
1. Visit: https://etherscan.io/apis
2. Create free account
3. Generate API key
4. Add to `.env`:
   ```bash
   ETHERSCAN_API_KEY=your_key_here
   ```

### 4. Sentry (Error Tracking)
- **Status:** 🔵 Optional
- **Purpose:** Monitor errors and performance
- **Time to Setup:** 10 minutes
- **Cost:** FREE tier (5K errors/month)

**Setup:**
1. Visit: https://sentry.io/
2. Create free account
3. Create new Next.js project
4. Follow integration guide
5. Add DSN to `.env`

---

## 🔄 Services for Future Features

### 1. Stripe (Withdrawals)
- **Purpose:** Process fiat withdrawals
- **Time to Setup:** 30 minutes
- **Cost:** 2.9% + $0.30 per transaction

**When to Setup:** When you want to add withdrawal features

### 2. 1inch API (DEX Aggregation)
- **Purpose:** Best swap rates across DEXes
- **Time to Setup:** 5 minutes
- **Cost:** FREE tier (1 request/second)

**When to Setup:** When you want to add token swapp