import { getCryptoPrices } from '@/lib/crypto-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const coinsParam = searchParams.get('coins');
        const coins = coinsParam ? coinsParam.split(',') : ['bitcoin', 'ethereum', 'solana'];

        const apiKey = process.env.COINGECKO_API_KEY;
        const prices = await getCryptoPrices(coins, apiKey);

        return NextResponse.json(
            {
                success: true,
                data: prices,
                timestamp: new Date().toISOString(),
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
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
