'use client';

import { useEffect, useState, useRef } from 'react';
import { Users, TrendingUp, DollarSign, Globe } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
}

interface StatsData {
  totalUsers: number;
  totalTrades: number;
  totalVolume: number;
  countries: number;
}

export function StatsCounter() {
  const [counts, setCounts] = useState({ users: 0, trades: 0, volume: 0, countries: 0 });
  const [realStats, setRealStats] = useState<StatsData | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fetch real stats from API
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setRealStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback to minimal realistic numbers if API fails
        setRealStats({
          totalUsers: 0,
          totalTrades: 0,
          totalVolume: 0,
          countries: 1
        });
      }
    }
    fetchStats();
  }, []);

  const stats: Stat[] = [
    {
      label: 'Active Users',
      value: counts.users,
      suffix: realStats && realStats.totalUsers >= 1000 ? 'K+' : '+',
      icon: <Users className="h-6 w-6" />,
    },
    {
      label: 'Trades Executed',
      value: counts.trades,
      suffix: realStats && realStats.totalTrades >= 1000000 ? 'M+' : realStats && realStats.totalTrades >= 1000 ? 'K+' : '+',
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      label: 'Trading Volume',
      value: counts.volume,
      suffix: realStats && realStats.totalVolume >= 1000000000 ? 'B+' : realStats && realStats.totalVolume >= 1000000 ? 'M+' : realStats && realStats.totalVolume >= 1000 ? 'K+' : '+',
      icon: <DollarSign className="h-6 w-6" />,
    },
    {
      label: 'Countries',
      value: counts.countries,
      suffix: '+',
      icon: <Globe className="h-6 w-6" />,
    },
  ];

  useEffect(() => {
    if (!realStats) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Calculate display values (divide by 1000 for K, 1000000 for M, etc.)
          const userTarget = realStats.totalUsers >= 1000
            ? Math.floor(realStats.totalUsers / 1000)
            : realStats.totalUsers;

          const tradeTarget = realStats.totalTrades >= 1000000
            ? Math.floor(realStats.totalTrades / 1000000)
            : realStats.totalTrades >= 1000
              ? Math.floor(realStats.totalTrades / 1000)
              : realStats.totalTrades;

          const volumeTarget = realStats.totalVolume >= 1000000000
            ? Math.floor(realStats.totalVolume / 1000000000)
            : realStats.totalVolume >= 1000000
              ? Math.floor(realStats.totalVolume / 1000000)
              : realStats.totalVolume >= 1000
                ? Math.floor(realStats.totalVolume / 1000)
                : realStats.totalVolume;

          // Animate users counter
          let userCount = 0;
          const userStep = Math.max(1, Math.floor(userTarget / 50));
          const userInterval = setInterval(() => {
            userCount += userStep;
            if (userCount >= userTarget) {
              userCount = userTarget;
              clearInterval(userInterval);
            }
            setCounts(prev => ({ ...prev, users: userCount }));
          }, 20);

          // Animate trades counter
          let tradeCount = 0;
          const tradeStep = Math.max(1, Math.floor(tradeTarget / 50));
          const tradeInterval = setInterval(() => {
            tradeCount += tradeStep;
            if (tradeCount >= tradeTarget) {
              tradeCount = tradeTarget;
              clearInterval(tradeInterval);
            }
            setCounts(prev => ({ ...prev, trades: tradeCount }));
          }, 20);

          // Animate volume counter
          let volumeCount = 0;
          const volumeStep = Math.max(1, Math.floor(volumeTarget / 50));
          const volumeInterval = setInterval(() => {
            volumeCount += volumeStep;
            if (volumeCount >= volumeTarget) {
              volumeCount = volumeTarget;
              clearInterval(volumeInterval);
            }
            setCounts(prev => ({ ...prev, volume: volumeCount }));
          }, 30);

          // Animate countries counter
          let countryCount = 0;
          const countryStep = Math.max(1, Math.floor(realStats.countries / 50));
          const countryInterval = setInterval(() => {
            countryCount += countryStep;
            if (countryCount >= realStats.countries) {
              countryCount = realStats.countries;
              clearInterval(countryInterval);
            }
            setCounts(prev => ({ ...prev, countries: countryCount }));
          }, 15);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, realStats]);

  // Don't render until we have real stats
  if (!realStats) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center p-4 sm:p-5 md:p-6 rounded-xl bg-card animate-pulse"
          >
            <div className="h-12 w-12 bg-muted rounded-full mb-4" />
            <div className="h-8 w-20 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="flex flex-col items-center text-center p-4 sm:p-5 md:p-6 rounded-xl bg-card hover:bg-muted/50 transition-all duration-300 hover:scale-105"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
            <div className="scale-75 sm:scale-100">
              {stat.icon}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
            {stat.value}{stat.suffix}
          </div>
          <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
