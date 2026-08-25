import React, { useEffect, useRef, memo } from 'react';
import { ExternalLink, Maximize2 } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol?: string; // e.g. 'OANDA:XAUUSD' or 'OANDA:XAUEUR'
  theme?: 'dark' | 'light';
  height?: number | string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({
  symbol = 'OANDA:XAUUSD',
  theme = 'dark',
  height = 420,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      locale: 'ar_AE',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      hide_side_toolbar: false,
      studies: [
        'STD;EMA',
        'STD;RSI',
        'STD;MACD'
      ],
      container_id: 'tradingview_chart_container',
    });

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'tradingview_chart_container';
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.height = 'calc(100% - 32px)';
    widgetContainer.style.width = '100%';

    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);
  }, [symbol, theme]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 shadow-2xl" dir="ltr">
      <div className="flex items-center justify-between px-2 pb-2 text-xs text-slate-400 border-b border-slate-800/80" dir="rtl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px]">
            شارت TradingView المباشر
          </span>
          <span className="font-mono text-slate-300 text-[11px]">{symbol}</span>
        </div>
        <a
          href={`https://www.tradingview.com/symbols/${symbol.replace(':', '-')}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition"
        >
          <span>فتح في TradingView.com</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div
        ref={containerRef}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="w-full mt-2 rounded-xl overflow-hidden bg-slate-900"
      />
    </div>
  );
});
