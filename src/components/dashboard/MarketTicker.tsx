'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

/**
 * MarketTicker component displays scrolling market updates
 * Shows live cryptocurrency prices and percentage changes
 */
export function MarketTicker() {
    const [marketData] = useState<MarketData[]>([
        { symbol: 'BTC', name: 'Bitcoin', price: 65432.10, change: 1234.56, changePercent: 2.15 },
        { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: -45.32, changePercent: -1.29 },
        { symbol: 'BNB', name: 'Binance Coin', price: 412.50, change: 8.75, changePercent: 2.17 },
        { symbol: 'SOL', name: 'Solana', price: 123.45, change: 5.67, changePercent: 4.81 },
        { symbol: 'ADA', name: 'Cardano', price: 0.5678, change: -0.0123, changePercent: -2.12 },
        { symbol: 'XRP', name: 'Ripple', price: 0.6234, change: 0.0456, changePercent: 7.89 },
    ]);

    return (
        <div className="w-full bg-gradient-to-r from-blue-950/40 via-cyan-950/40 to-blue-950/40 backdrop-blur-sm border-y border-blue-500/20 py-4 overflow-hidden animate-fade-in">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">Live Investment Market Updates</h3>
                </div>
                <div className="relative">
                    <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
                        {marketData.map((item, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 flex items-center gap-3 bg-card/50 px-4 py-2 rounded-lg border border-border/50 min-w-[200px] hover:bg-card/80 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{item.symbol}</span>
                                        <span className="text-xs text-muted-foreground">{item.name}</span>
                                    </div>
                                    <p className="text-lg font-bold">
                                        ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className={`flex items-center gap-1 ${item.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {item.change >= 0 ? (
                                        <TrendingUp className="h-4 w-4" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4" />
                                    )}
                                    <span className="text-sm font-semibold">
                                        {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
