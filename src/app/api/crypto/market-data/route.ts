import { getMarketData, getGlobalMarketData } from '@/lib/crypto-api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const perPage = parseInt(searchParams.get('perPage') || '100');
        const page = parseInt(searchParams.get('page') || '1');

        const apiKey = process.env.COINGECKO_API_KEY;

        const [marketData, globalData] = await Promise.all([
            getMarketData(perPage, page, apiKey),
            getGlobalMarketData(apiKey).catch(() => null),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: {
                    coins: marketData,
                    global: globalData?.data || null,
                },
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
