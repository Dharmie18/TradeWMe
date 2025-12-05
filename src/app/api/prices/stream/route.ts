// =============================================================================
// PRICES STREAM API - Server-Sent Events (SSE) for Real-time Price Updates
// =============================================================================

import { NextRequest } from 'next/server';

// Popular tokens to stream
const STREAM_TOKENS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'matic-network'];

const TOKEN_SYMBOLS: Record<string, string> = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'solana': 'SOL',
  'binancecoin': 'BNB',
  'matic-network': 'MATIC',
};

/**
 * Fetch prices from CoinGecko
 */
async function fetchPrices() {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const ids = STREAM_TOKENS.join(',');
    
    const url = apiKey
      ? `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&x_cg_demo_api_key=${apiKey}`
      : `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format data
    const prices = Object.entries(data).map(([id, priceData]: [string, any]) => ({
      symbol: TOKEN_SYMBOLS[id] || id.toUpperCase(),
      name: id,
      priceUsd: priceData.usd || 0,
      change24h: priceData.usd_24h_change || 0,
      volume24h: priceData.usd_24h_vol || 0,
      timestamp: new Date().toISOString(),
    }));

    return prices;
  } catch (error) {
    console.error('Price fetch error:', error);
    return null;
  }
}

/**
 * GET /api/prices/stream
 * Server-Sent Events endpoint for real-time price updates
 */
export async function GET(request: NextRequest) {
  // Create a readable stream
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial prices
      const initialPrices = await fetchPrices();
      if (initialPrices) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initialPrices)}\n\n`)
        );
      }

      // Update prices every 10 seconds
      const interval = setInterval(async () => {
        try {
          const prices = await fetchPrices();
          if (prices) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(prices)}\n\n`)
            );
          }
        } catch (error) {
          console.error('Stream error:', error);
        }
      }, 10000); // 10 seconds

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
