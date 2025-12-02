import { getTrendingCoins } from '@/lib/crypto-api';
import { getTrendingTokens } from '@/lib/dexscreener-api';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const apiKey = process.env.COINGECKO_API_KEY;

        // Fetch from both sources
        const [coinGeckoTrending, dexScreenerTrending] = await Promise.all([
            getTrendingCoins(apiKey).catch(() => ({ coins: [] })),
            getTrendingTokens().catch(() => []),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: {
                    coingecko: coinGeckoTrending.coins || [],
                    dexscreener: dexScreenerTrending.slice(0, 10),
                },
                timestamp: new Date().toISOString(),
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
                },
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
