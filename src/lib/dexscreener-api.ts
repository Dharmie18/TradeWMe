interface DexToken {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    labels?: string[];
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    priceNative: string;
    priceUsd?: string;
    txns: {
        m5: { buys: number; sells: number };
        h1: { buys: number; sells: number };
        h24: { buys: number; sells: number };
    };
    volume: {
        m5: number;
        h1: number;
        h24: number;
    };
    priceChange: {
        m5: number;
        h1: number;
        h24: number;
    };
    liquidity?: {
        usd: number;
        base: number;
        quote: number;
    };
    fdv?: number;
    marketCap?: number;
    pairCreatedAt?: number;
}

export async function getTrendingTokens(): Promise<DexToken[]> {
    try {
        const response = await fetch(
            'https://api.dexscreener.com/latest/dex/tokens/trending',
            { next: { revalidate: 30 } }
        );

        if (!response.ok) {
            throw new Error(`DexScreener API error: ${response.status}`);
        }

        const data = await response.json();
        return data.pairs || [];
    } catch (error) {
        console.error('DexScreener trending error:', error);
        return [];
    }
}

export async function searchTokens(query: string): Promise<DexToken[]> {
    try {
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`,
            { next: { revalidate: 30 } }
        );

        if (!response.ok) {
            throw new Error(`DexScreener API error: ${response.status}`);
        }

        const data = await response.json();
        return data.pairs || [];
    } catch (error) {
        console.error('DexScreener search error:', error);
        return [];
    }
}

export async function getPairData(
    chainId: string,
    pairAddress: string
): Promise<DexToken | null> {
    try {
        const response = await fetch(
            `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairAddress}`,
            { next: { revalidate: 10 } }
        );

        if (!response.ok) {
            throw new Error(`DexScreener API error: ${response.status}`);
        }

        const data = await response.json();
        return data.pairs?.[0] || null;
    } catch (error) {
        console.error('DexScreener pair data error:', error);
        return null;
    }
}
