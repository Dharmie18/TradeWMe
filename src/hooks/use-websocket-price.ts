'use client';

import { useEffect, useState } from 'react';

interface PriceUpdate {
    symbol: string;
    price: number;
    timestamp: number;
}

/**
 * Hook for Binance WebSocket real-time prices (free, public, no registration required)
 * Provides real-time price updates for cryptocurrencies
 */
export function useBinanceWebSocket(symbols: string[]) {
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!symbols.length) return;

        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;

        const connect = () => {
            try {
                ws = new WebSocket('wss://stream.binance.com:9443/ws');

                ws.onopen = () => {
                    setConnected(true);
                    setError(null);
                    reconnectAttempts = 0;

                    // Subscribe to all symbols
                    const subscriptions = symbols.map(
                        (sym) => `${sym.toLowerCase()}usdt@ticker`
                    );

                    ws?.send(
                        JSON.stringify({
                            method: 'SUBSCRIBE',
                            params: subscriptions,
                            id: 1,
                        })
                    );
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.c) {
                            // Ticker update
                            const symbol = data.s.replace('USDT', '');
                            setPrices((prev) => ({
                                ...prev,
                                [symbol]: parseFloat(data.c), // Current price
                            }));
                        }
                    } catch (err) {
                        setError('Failed to parse WebSocket data');
                    }
                };

                ws.onerror = () => {
                    setError('WebSocket connection error');
                    setConnected(false);
                };

                ws.onclose = () => {
                    setConnected(false);

                    // Attempt to reconnect with exponential backoff
                    if (reconnectAttempts < maxReconnectAttempts) {
                        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                        reconnectTimeout = setTimeout(() => {
                            reconnectAttempts++;
                            connect();
                        }, delay);
                    }
                };
            } catch (err) {
                setError('Failed to connect to WebSocket');
                setConnected(false);
            }
        };

        connect();

        return () => {
            clearTimeout(reconnectTimeout);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [symbols]);

    return { prices, connected, error };
}

/**
 * Hook for Coinbase Exchange WebSocket (free, public, no registration required)
 * Alternative to Binance for real-time price updates
 */
export function useCoinbaseWebSocket(productIds: string[]) {
    const [prices, setPrices] = useState<Record<string, PriceUpdate>>({});
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!productIds.length) return;

        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;

        const connect = () => {
            try {
                ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');

                ws.onopen = () => {
                    setConnected(true);
                    setError(null);
                    reconnectAttempts = 0;

                    ws?.send(
                        JSON.stringify({
                            type: 'subscribe',
                            product_ids: productIds,
                            channels: ['ticker'],
                        })
                    );
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.type === 'ticker' && data.price) {
                            setPrices((prev) => ({
                                ...prev,
                                [data.product_id]: {
                                    symbol: data.product_id,
                                    price: parseFloat(data.price),
                                    timestamp: new Date(data.time).getTime(),
                                },
                            }));
                        }
                    } catch (err) {
                        setError('Failed to parse WebSocket data');
                    }
                };

                ws.onerror = () => {
                    setError('WebSocket connection error');
                    setConnected(false);
                };

                ws.onclose = () => {
                    setConnected(false);

                    // Attempt to reconnect with exponential backoff
                    if (reconnectAttempts < maxReconnectAttempts) {
                        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                        reconnectTimeout = setTimeout(() => {
                            reconnectAttempts++;
                            connect();
                        }, delay);
                    }
                };
            } catch (err) {
                setError('Failed to connect to WebSocket');
                setConnected(false);
            }
        };

        connect();

        return () => {
            clearTimeout(reconnectTimeout);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [productIds]);

    return { prices, connected, error };
}
