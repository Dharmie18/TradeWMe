'use client';

import { DollarSign, Eye, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';

/**
 * FinancialStats component displays user's financial summary cards
 * Shows Available Balance, Total Deposit, and Total Profit with modern design
 */
export function FinancialStats() {
    const { data: session } = useSession();

    // Mock data - in production, fetch from API
    const stats = {
        availableBalance: 92000.00,
        totalDeposit: 6000.00,
        totalProfit: 86000.00,
    };

    return (
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Available Balance Card */}
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-sm hover:scale-105 transition-all duration-300 animate-slide-in-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl" />
                <div className="relative p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                            <p className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                ${stats.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <Button
                                size="sm"
                                className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </Button>
                        </div>
                        <div className="p-3 bg-cyan-500/20 rounded-lg">
                            <Wallet className="h-6 w-6 text-cyan-400" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Total Deposit Card */}
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-violet-500/10 to-purple-600/10 backdrop-blur-sm hover:scale-105 transition-all duration-300 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rounded-full blur-3xl" />
                <div className="relative p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">Total Deposit</p>
                            <p className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                ${stats.totalDeposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <Button
                                size="sm"
                                className="bg-violet-500 hover:bg-violet-600 text-white gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </Button>
                        </div>
                        <div className="p-3 bg-violet-500/20 rounded-lg">
                            <DollarSign className="h-6 w-6 text-violet-400" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Total Profit Card */}
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-sm hover:scale-105 transition-all duration-300 animate-slide-in-left md:col-span-2 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-3xl" />
                <div className="relative p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">Total Profit</p>
                            <p className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                ${stats.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <Button
                                size="sm"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </Button>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-emerald-400" />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
