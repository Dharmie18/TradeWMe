'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

interface ChartData {
  time: string;
  price: number;
}

type TimeRange = '1H' | '24H' | '7D' | '30D';
type Token = 'bitcoin' | 'ethereum' | 'solana';

const TOKEN_CONFIG = {
  bitcoin: { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  ethereum: { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  solana: { symbol: 'SOL', name: 'Solana', color: '#14F195' },
};

export function TradingChart() {
  const [selectedToken, setSelectedToken] = useState<Token>('bitcoin');
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    fetchChartData();
  }, [selectedToken, timeRange]);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      // Get days based on time range
      const days = timeRange === '1H' ? 1 : timeRange === '24H' ? 1 : timeRange === '7D' ? 7 : 30;
      
      const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
      const url = apiKey
        ? `https://api.coingecko.com/api/v3/coins/${selectedToken}/market_chart?vs_currency=usd&days=${days}&x_cg_demo_api_key=${apiKey}`
        : `https://api.coingecko.com/api/v3/coins/${selectedToken}/market_chart?vs_currency=usd&days=${days}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.prices) {
        // Format data for chart
        let formattedData = data.prices.map(([timestamp, price]: [number, number]) => ({
          time: new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            ...(days > 1 && { month: 'short', day: 'numeric' })
          }),
          price: price,
        }));

        // Reduce data points for mobile
        if (window.innerWidth < 768) {
          const step = Math.ceil(formattedData.length / 50); // Max 50 points on mobile
          formattedData = formattedData.filter((_, index) => index % step === 0);
        }

        setChartData(formattedData);
        setCurrentPrice(data.prices[data.prices.length - 1][1]);
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const config = TOKEN_CONFIG[selectedToken];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">{payload[0].payload.time}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {config.name} Chart
            </CardTitle>
            <CardDescription>
              {currentPrice > 0 && (
                <span className="text-lg font-semibold text-foreground">
                  ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {/* Token Selection */}
            <Select value={selectedToken} onValueChange={(value) => setSelectedToken(value as Token)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TOKEN_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    {cfg.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Time Range Selection */}
            <div className="flex gap-1 border rounded-lg p-1">
              {(['1H', '24H', '7D', '30D'] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="h-8 px-3"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] sm:h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 300 : 400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={10}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={config.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
