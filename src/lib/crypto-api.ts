interface CryptoPriceData {
    [key: string]: {
        usd: number;
        usd_market_cap: number;
        usd_24h_vol: number;
        usd_24h_change: number;
        last_updated_at: number;
    };
}

type CoinId = 'bitcoin' | 'ethereum' | 'solana' | 'binancecoin' | 'ripple' | 'cardano' | string;

export async function getCryptoPrices(
    coinIds: CoinId[],
    apiKey?: string
): Promise<CryptoPriceData> {
    const baseUrl = apiKey
        ? 'https://pro-api.coingecko.com/api/v3'
        : 'https://api.coingecko.com/api/v3';

    const params = new URLSearchParams({
        ids: coinIds.join(','),
        vs_currencies: 'usd',
        include_market_cap: 'true',
        include_24hr_vol: 'true',
        include_24hr_change: 'true',
        include_last_updated_at: 'true',
    });

    const headers = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

    const response = await fetch(
        `${baseUrl}/simple/price?${params}`,
        {
            headers,
            next: { revalidate: 30 } // Cache for 30 seconds
        }
    );

    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.json();
}

export async function getTrendingCoins(apiKey?: string) {
    const baseUrl = apiKey
        ? 'https://pro-api.coingecko.com/api/v3'
        : 'https://api.coingecko.com/api/v3';

    const headers = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

    const response = await fetch(
        `${baseUrl}/search/trending`,
        {
            headers,
            next: { revalidate: 60 }
        }
    );

    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.json();
}

export async function getMarketData(
    perPage: number = 250,
    page: number = 1,
    apiKey?: string
) {
    const baseUrl = apiKey
        ? 'https://pro-api.coingecko.com/api/v3'
        : 'https://api.coingecko.com/api/v3';

    const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage.toString(),
        page: page.toString(),
        sparkline: 'false',
        price_change_percentage: '1h,24h,7d',
    });

    const headers = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

    const response = await fetch(
        `${baseUrl}/coins/markets?${params}`,
        {
            headers,
            next: { revalidate: 30 }
        }
    );

    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.json();
}

export async function getGlobalMarketData(apiKey?: string) {
    const baseUrl = apiKey
        ? 'https://pro-api.coingecko.com/api/v3'
        : 'https://api.coingecko.com/api/v3';

    const headers = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

    const response = await fetch(
        `${baseUrl}/global`,
        {
            headers,
            next: { revalidate: 60 }
        }
    );

    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return response.json();
}
