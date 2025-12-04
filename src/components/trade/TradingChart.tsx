'use client';

import { useEffect, useRef, memo } from 'react';
import { Card } from '@/components/ui/card';

declare global {
  interface Window {
    TradingView: any;
  }
}

function TradingChart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (container.current && window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: 'COINBASE:ETHUSD',
          interval: '15', // 15-minute intervals for real-time feel
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: 'tradingview_chart',
          // Real-time data settings
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies'
          ],
          disabled_features: [],
          enabled_features: [
            'study_templates',
            'use_localstorage_for_settings',
            'save_chart_properties_to_local_storage'
          ],
          // Auto-refresh for real-time updates
          datafeed: undefined, // Uses TradingView's real-time datafeed
          library_path: 'https://s3.tradingview.com/tv.js',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <Card className="p-0 overflow-hidden">
      <div
        ref={container}
        id="tradingview_chart"
        style={{ height: '600px' }}
      />
    </Card>
  );
}

export default memo(TradingChart);
