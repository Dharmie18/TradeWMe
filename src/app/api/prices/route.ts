// =============================================================================
// PRICES API - Real-time Cryptocurrency Prices
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Popular tokens to fetch
const DEFAULT_TOKENS = [
  'bitcoin',
  'ethereum',
  'binancecoin',
  'matic-network',
  'solana',
  'cardano',
  'ripple',
  'polkadot',
  'dogecoin',
  'tether',
  'usd-coin',
];

const TOKEN_SYMBOLS: Record<string, string> = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'binancecoin': 'BNB',
  'matic-network': 'MATIC',
  'solana': 'SOL',
  'cardano': 'ADA',
  'ripple': 'XRP',
  'polkadot': 'DOT',
  'dogecoin': 'DOGE',
  'tether': 'USDT',
  'usd-coin': 'USDC',
};

/**
 * Fetch prices from CoinGecko
 */
async function fetchPricesFromCoinGecko(tokenIds: string[]) {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const ids = tokenIds.join(',');
    
    const url = apiKey
      ? `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&x_cg_demo_api_key=${apiKey}`
      : `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    return null;
  }
}

/**
 * Fetch prices from CoinMarketCap (backup)
 */
async function fetchPricesFromCoinMarketCap(symbols: string[]) {
  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY;
    if (!apiKey) return null;

    const symbolsStr = symbols.join(',');
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbolsStr}`;

    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('CoinMarketCap fetch error:', error);
    return null;
  }
}

/**
 * Update price cache in database
 */
async function updatePriceCache(symbol: string, priceUsd: number, change24h: number, volume24h: number) {
  try {
    await prisma.priceCache.upsert({
      where: { symbol },
      update: {
        priceUsd,
        change24h,
        volume24h,
        updatedAt: new Date(),
      },
      create: {
        symbol,
        priceUsd,
        change24h,
        volume24h,
        source: 'coingecko',
      },
    });
  } catch (error) {
    console.error('Price cache update error:', error);
  }
}

/**
 * GET /api/prices
 * Get current cryptocurrency prices
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokensParam = searchParams.get('tokens');
    const useCache = searchParams.get('cache') !== 'false';

    // Determine which tokens to fetch
    const tokenIds = tokensParam 
      ? tokensParam.split(',').map(t => t.toLowerCase())
      : DEFAULT_TOKENS;

    // Try to get from cache first if enabled
    if (useCache) {
      const symbols = tokenIds.map(id => TOKEN_SYMBOLS[id] || id.toUpperCase());
      const cachedPrices = await prisma.priceCache.findMany({
        where: {
          symbol: { in: symbols },
          updatedAt: {
            gte: new Date(Date.now() - 60 * 1000), // Cache valid for 1 minute
          },
        },
      });

      if (cachedPrices.length === symbols.length) {
        // All prices found in cache
        const prices = cachedPrices.map(cache => ({
          symbol: cache.symbol,
          name: Object.keys(TOKEN_SYMBOLS).find(k => TOKEN_SYMBOLS[k] === cache.symbol) || cache.symbol,
          priceUsd: cache.priceUsd.toNumber(),
          change24h: cache.change24h.toNumber(),
          volume24h: cache.volume24h.toNumber(),
          lastUpdated: cache.updatedAt,
          source: 'cache',
        }));

        return NextResponse.json({
          success: true,
          prices,
          source: 'cache',
          timestamp: new Date(),
        });
      }
    }

    // Fetch fresh data from CoinGecko
    const coinGeckoData = await fetchPricesFromCoinGecko(tokenIds);

    if (!coinGeckoData) {
      // Try CoinMarketCap as backup
      const symbols = tokenIds.map(id => TOKEN_SYMBOLS[id] || id.toUpperCase());
      const cmcData = await fetchPricesFromCoinMarketCap(symbols);

      if (!cmcData) {
        return NextResponse.json({
          success: false,
          message: 'Failed to fetch prices from all sources',
          error: 'API_ERROR',
        }, { status: 503 });
      }

      // Format CoinMarketCap data
      const prices = Object.entries(cmcData.data).map(([symbol, data]: [string, any]) => {
        const priceUsd = data.quote.USD.price;
        const change24h = data.quote.USD.percent_change_24h;
        const volume24h = data.quote.USD.volume_24h;

        // Update cache
        updatePriceCache(symbol, priceUsd, change24h, volume24h);

        return {
          symbol,
          name: data.name,
          priceUsd,
          change24h,
          volume24h,
          lastUpdated: data.quote.USD.last_updated,
          source: 'coinmarketcap',
        };
      });

      return NextResponse.json({
        success: true,
        prices,
        source: 'coinmarketcap',
        timestamp: new Date(),
      });
    }

    // Format CoinGecko data
    const prices = Object.entries(coinGeckoData).map(([id, data]: [string, any]) => {
      const symbol = TOKEN_SYMBOLS[id] || id.toUpperCase();
      const priceUsd = data.usd || 0;
      const change24h = data.usd_24h_change || 0;
      const volume24h = data.usd_24h_vol || 0;

      // Update cache
      updatePriceCache(symbol, priceUsd, change24h, volume24h);

      return {
        symbol,
        name: id,
        priceUsd,
        change24h,
        volume24h,
        lastUpdated: new Date(),
        source: 'coingecko',
      };
    });

    return NextResponse.json({
      success: true,
      prices,
      source: 'coingecko',
      timestamp: new Date(),
    });

  } catch (error) {
    console.error('Prices fetch error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch prices',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    }, { status: 500 });
  }
}
