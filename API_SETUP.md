# PocketBroker - API Setup & Configuration Guide

**Last Updated:** November 29, 2025

---

## 📋 Summary of Changes

### ✅ Completed Today (November 29, 2025)

1. **Footer Centralization** - Footer content now fully centered with max-width container
2. **Real-Time API Integration** - Added CoinGecko, DexScreener, Binance/Coinbase WebSocket support
3. **Environment Variables** - Configured `.env` with comprehensive API documentation
4. **API Routes** - Created server-side endpoints for crypto data fetching

---

## 📂 All Files Changed/Created Today

### **Created Files (New)**
1. ✅ `src/app/dashboard/page.tsx` - User dashboard page
2. ✅ `src/components/dashboard/ProfileCard.tsx` - Profile card component
3. ✅ `src/components/dashboard/RecentActivity.tsx` - Recent activity component
4. ✅ `src/components/dashboard/SavedItems.tsx` - Saved items component
5. ✅ `src/components/dashboard/PersonalStats.tsx` - Personal stats component
6. ✅ `src/app/admin/users/[id]/page.tsx` - Admin user details page
7. ✅ `src/components/HomeReturn.tsx` - Fixed home icon component
8. ✅ `src/lib/crypto-api.ts` - CoinGecko API integration library
9. ✅ `src/lib/dexscreener-api.ts` - DexScreener API integration library
10. ✅ `src/hooks/use-websocket-price.ts` - WebSocket hooks for real-time prices
11. ✅ `src/app/api/crypto/prices/route.ts` - Price API endpoint
12. ✅ `src/app/api/crypto/trending/route.ts` - Trending tokens API endpoint
13. ✅ `src/app/api/crypto/market-data/route.ts` - Market data API endpoint
14. ✅ `API_SETUP.md` - This setup guide

### **Modified Files (Updated)**
15. ✅ `src/components/Header.tsx` - Enhanced hover effects on logo/buttons
16. ✅ `src/app/globals.css` - Added bounce-subtle animation
17. ✅ `src/components/Footer.tsx` - **Centralized content with max-width container**
18. ✅ `src/app/layout.tsx` - Added HomeReturn component
19. ✅ `.env` - **Added comprehensive API configuration with documentation**
20. ✅ `package.json` - Added date-fns dependency

---

## 🔐 API Registration Requirements

### **🟢 NO REGISTRATION REQUIRED (Works Immediately)**

#### 1. **DexScreener API** 
- **Status:** ✅ Free, unlimited, no key needed
- **Features:** DEX tokens, trending pairs, search functionality
- **Implementation:** Already integrated in `src/lib/dexscreener-api.ts`
- **Usage:** Works automatically, no configuration needed

#### 2. **Binance WebSocket**
- **Status:** ✅ Free, public, real-time updates
- **Features:** Live price ticks (50-200ms updates)
- **Implementation:** `src/hooks/use-websocket-price.ts` → `useBinanceWebSocket()`
- **URL:** `wss://stream.binance.com:9443/ws`
- **Usage:** Works automatically, no API key

#### 3. **Coinbase Exchange WebSocket**
- **Status:** ✅ Free, public, real-time updates
- **Features:** Live trading data, order books
- **Implementation:** `src/hooks/use-websocket-price.ts` → `useCoinbaseWebSocket()`
- **URL:** `wss://ws-feed.exchange.coinbase.com`
- **Usage:** Works automatically, no API key

#### 4. **CoinGecko Public API (Free Tier)**
- **Status:** ⚠️ Works without key, but limited to 5-15 calls/min
- **Features:** Price data, market stats, trending tokens
- **Implementation:** `src/lib/crypto-api.ts`
- **Limitation:** Low rate limit, suitable for testing only
- **Recommendation:** Upgrade to Demo tier (see below)

---

### **🟡 OPTIONAL REGISTRATION (Recommended for Production)**

#### 5. **CoinGecko Demo API** (Recommended)
- **Status:** 🔑 Requires free registration
- **Tier:** FREE Demo Beta
- **Rate Limit:** 30 calls/min, 10,000 calls/month
- **Cost:** $0/month
- **Best For:** Production apps, real-time market data

**How to Get API Key:**
1. Visit: https://www.coingecko.com/en/api/pricing
2. Scroll to **"Demo (Beta)"** section
3. Click **"Get Started"** button
4. Register with email (no credit card required)
5. Verify email → Instant activation
6. Copy API key from dashboard
7. Add to `.env`:
   ```bash
   COINGECKO_API_KEY=your_demo_key_here
   ```

**What You Get:**
- ✅ 30 API calls per minute (vs 5-15 public)
- ✅ 10,000 calls per month
- ✅ Same endpoints as public API
- ✅ More reliable rate limits
- ✅ No credit card needed

---

#### 6. **CoinMarketCap API** (Alternative to CoinGecko)
- **Status:** 🔑 Requires free registration
- **Tier:** FREE Basic Plan
- **Rate Limit:** 333 calls/day (~10,000 calls/month)
- **Cost:** $0/month
- **Best For:** Enterprise data quality, CMC-specific metrics

**How to Get API Key:**
1. Visit: https://pro.coinmarketcap.com/signup/
2. Create account (email/password or OAuth)
3. Verify email
4. Go to **Dashboard** → **"API"** tab
5. Click **"Copy"** on API Key
6. Add to `.env`:
   ```bash
   COINMARKETCAP_API_KEY=your_cmc_key_here
   ```

**What You Get:**
- ✅ 333 API calls per day
- ✅ ~10,000 calls per month
- ✅ Professional-grade data
- ✅ Historical data access
- ✅ No credit card needed

---

## 🚀 Quick Start Guide

### **Step 1: Review Current Setup**
Your `.env` file already contains:
- ✅ Database configuration (Turso)
- ✅ Authentication secrets (Better Auth)
- ✅ WalletConnect project ID placeholder
- ✅ API key placeholders with documentation

### **Step 2: Choose Your API Strategy**

**Option A: Start Immediately (No Registration)**
- Uses CoinGecko public API (5-15 calls/min)
- DexScreener API (unlimited)
- Binance/Coinbase WebSocket (real-time)
- **Good for:** Testing, development, hobby projects
- **Action Required:** None! Already works

**Option B: Production Ready (Recommended)**
- Get CoinGecko Demo API key (30 calls/min)
- Keep DexScreener + WebSocket for real-time
- **Good for:** Production apps, 50K+ users
- **Action Required:** 5 minutes to register for CoinGecko Demo

**Option C: Maximum Coverage**
- Get both CoinGecko Demo + CoinMarketCap Basic
- Use CoinGecko as primary, CMC as fallback
- **Good for:** Enterprise apps, data redundancy
- **Action Required:** 10 minutes to register for both

### **Step 3: Add API Keys (Optional)**

**If using CoinGecko Demo:**
```bash
# Edit .env file
COINGECKO_API_KEY=CG-xxxxxxxxxxxxxxxxxxxxxxxx
```

**If using CoinMarketCap:**
```bash
# Edit .env file
COINMARKETCAP_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**No API keys needed for:**
- DexScreener ✅
- Binance WebSocket ✅
- Coinbase WebSocket ✅

### **Step 4: Test Your APIs**

**Test Price Endpoint:**
```bash
curl http://localhost:3000/api/crypto/prices?coins=bitcoin,ethereum,solana
```

**Test Trending Endpoint:**
```bash
curl http://localhost:3000/api/crypto/trending
```

**Test Market Data Endpoint:**
```bash
curl http://localhost:3000/api/crypto/market-data?perPage=10
```

---

## 📊 API Usage Examples

### **1. Fetch Crypto Prices (Server-Side)**
```typescript
import { getCryptoPrices } from '@/lib/crypto-api';

// In Server Component or API Route
const prices = await getCryptoPrices(
  ['bitcoin', 'ethereum', 'solana'],
  process.env.COINGECKO_API_KEY
);

console.log(prices.bitcoin.usd); // Current BTC price
console.log(prices.bitcoin.usd_24h_change); // 24h change %
```

### **2. Real-Time WebSocket (Client-Side)**
```typescript
'use client';
import { useBinanceWebSocket } from '@/hooks/use-websocket-price';

export function PriceDisplay() {
  const { prices, connected } = useBinanceWebSocket(['BTC', 'ETH', 'SOL']);
  
  return (
    <div>
      <span>{connected ? '🟢 Live' : '🔴 Offline'}</span>
      <p>BTC: ${prices.BTC?.toFixed(2)}</p>
      <p>ETH: ${prices.ETH?.toFixed(2)}</p>
    </div>
  );
}
```

### **3. Trending Tokens (DexScreener)**
```typescript
import { getTrendingTokens } from '@/lib/dexscreener-api';

// No API key needed!
const trending = await getTrendingTokens();

trending.forEach(token => {
  console.log(`${token.baseToken.symbol}: $${token.priceUsd}`);
  console.log(`24h Change: ${token.priceChange.h24}%`);
});
```

### **4. Use API Routes from Frontend**
```typescript
'use client';

async function fetchPrices() {
  const response = await fetch('/api/crypto/prices?coins=bitcoin,ethereum');
  const data = await response.json();
  
  if (data.success) {
    console.log(data.data); // Price data
  }
}
```

---

## 🔄 Real-Time Data Strategy

### **Current Implementation:**

1. **REST API with Caching** (30-60s cache)
   - `src/app/api/crypto/prices/route.ts`
   - `src/app/api/crypto/trending/route.ts`
   - `src/app/api/crypto/market-data/route.ts`
   - **Best for:** Dashboard overviews, market stats

2. **WebSocket Streaming** (real-time)
   - `src/hooks/use-websocket-price.ts`
   - Binance WebSocket (50-200ms updates)
   - Coinbase WebSocket (real-time ticks)
   - **Best for:** Live trading, active positions

3. **Hybrid Approach** (Recommended)
   - Use REST API for initial page load
   - Connect WebSocket for active trading
   - Disconnect WebSocket when user inactive
   - Falls back to REST polling if WebSocket fails

---

## 📈 Rate Limit Management

### **Current Setup:**
- ✅ Server-side caching (30-60s)
- ✅ Next.js revalidation strategy
- ✅ WebSocket with auto-reconnect
- ✅ Exponential backoff on errors

### **Rate Limit Summary:**

| Service | Rate Limit | Cost | Registration |
|---------|-----------|------|--------------|
| CoinGecko Public | 5-15/min | Free | None |
| CoinGecko Demo | 30/min | Free | Email only |
| CoinMarketCap Basic | 333/day | Free | Email only |
| DexScreener | 60/min | Free | None |
| Binance WebSocket | Unlimited | Free | None |
| Coinbase WebSocket | Unlimited | Free | None |

### **Optimization Tips:**
- ✅ Cache responses on server (already implemented)
- ✅ Use WebSocket for frequently updated data
- ✅ Batch multiple coin requests in one API call
- ✅ Implement request deduplication
- ✅ Use fallback APIs (CoinGecko → CMC → DexScreener)

---

## 🛠️ Troubleshooting

### **Issue: "CoinGecko API error: 429"**
**Solution:** Rate limit exceeded
- Option 1: Add `COINGECKO_API_KEY` to upgrade to Demo tier
- Option 2: Increase cache duration in API routes
- Option 3: Use DexScreener as fallback

### **Issue: WebSocket disconnects frequently**
**Solution:** Check network stability
- WebSocket auto-reconnects with exponential backoff
- Falls back to REST API if WebSocket unavailable
- Check browser console for connection errors

### **Issue: "Failed to fetch prices: 403"**
**Solution:** Invalid API key
- Verify `COINGECKO_API_KEY` is correct
- Check for extra spaces in `.env` file
- Restart dev server after changing `.env`

### **Issue: Prices not updating in real-time**
**Solution:** WebSocket not connected
- Check `connected` state in component
- Verify symbols are correct (e.g., 'BTC' not 'BITCOIN')
- Check browser console for WebSocket errors

---

## 🎯 Next Steps

### **Immediate Actions:**
1. ✅ Footer is now centralized
2. ✅ Real-time APIs are integrated
3. ✅ Environment variables are documented
4. ⚠️ **Optional:** Register for CoinGecko Demo API (5 min)
5. ⚠️ **Optional:** Register for WalletConnect Project ID

### **For Production:**
1. 🔑 Get CoinGecko Demo API key (free)
2. 🔑 Get WalletConnect Project ID (free)
3. 🔑 Consider CoinMarketCap as backup (free)
4. ✅ Test all API endpoints
5. ✅ Monitor rate limits in production
6. ✅ Set up error tracking (Sentry, etc.)

---

## 📞 API Support & Resources

### **Documentation Links:**
- CoinGecko API: https://docs.coingecko.com
- CoinMarketCap API: https://coinmarketcap.com/api/documentation/v1/
- DexScreener API: https://docs.dexscreener.com/api/reference
- Binance WebSocket: https://developers.binance.com/docs/binance-spot-api
- Coinbase WebSocket: https://docs.cdp.coinbase.com/exchange/websocket-feed

### **Get API Keys:**
- CoinGecko Demo: https://www.coingecko.com/en/api/pricing
- CoinMarketCap Basic: https://pro.coinmarketcap.com/signup/
- WalletConnect: https://cloud.walletconnect.com/

---

## ✅ Registration Summary

### **Required Registrations:**
- **None!** App works immediately with free public APIs

### **Recommended Registrations (Free, 5 min each):**
1. **CoinGecko Demo API** - Better rate limits (30/min vs 5-15/min)
2. **WalletConnect Project ID** - For wallet connection features

### **Optional Registrations (Free, nice-to-have):**
3. **CoinMarketCap Basic API** - Backup data source for redundancy

---

**🎉 Your PocketBroker app is now fully configured with real-time crypto APIs!**

All APIs are integrated and ready to use. The app works immediately with free public APIs, and you can optionally upgrade to free Demo tiers for better performance.
