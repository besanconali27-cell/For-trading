import React from 'react';
import { TrendingUp, TrendingDown, ShieldAlert, Sparkles, BookOpen, Activity, Zap, RefreshCw, LineChart, ExternalLink, Settings, Send } from 'lucide-react';
import { MacroIndicator, LiveMarketSummary, TelegramConfig } from '../types';

interface HeaderProps {
  currentPrice: number;
  priceChange: number;
  high24h: number;
  low24h: number;
  spreadPips: number;
  macroIndicators: MacroIndicator[];
  isSqueeze: boolean;
  onOpenRulebook: () => void;
  onRefreshPrice: () => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  onClearChat?: () => void;
  selectedCurrency: 'EUR' | 'USD';
  onToggleCurrency: (currency: 'EUR' | 'USD') => void;
  liveMarketSummary?: LiveMarketSummary | null;
  isShowChart: boolean;
  onToggleChart: () => void;
  onOpenSettings?: () => void;
  telegramConfig?: TelegramConfig;
}

export const Header: React.FC<HeaderProps> = ({
  currentPrice,
  priceChange,
  high24h,
  low24h,
  spreadPips,
  macroIndicators,
  isSqueeze,
  onOpenRulebook,
  onRefreshPrice,
  isSimulating,
  setIsSimulating,
  onClearChat,
  selectedCurrency,
  onToggleCurrency,
  liveMarketSummary,
  isShowChart,
  onToggleChart,
  onOpenSettings,
  telegramConfig,
}) => {
  const isUp = priceChange >= 0;
  const eurPrice = liveMarketSummary?.goldEUR?.price || (currentPrice / (liveMarketSummary?.eurUSD?.price || 1.0845));
  const displayedPrice = selectedCurrency === 'EUR' ? eurPrice : currentPrice;
  const currencySymbol = selectedCurrency === 'EUR' ? '€' : '$';

  return (
    <header className="bg-slate-900/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Gold & Macro Ticker Tape with TradingView Live Feeds */}
      <div className="bg-slate-950/90 border-b border-slate-800/50 px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://www.tradingview.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 transition text-[11px] font-mono"
              title="البيانات الحية مأخوذة مباشرة من منصة TradingView الرسمية"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold">TradingView Live</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>

            {/* XAU/EUR (Euro Accounts) */}
            <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400">XAUEUR:</span>
              <span className="font-bold">€{eurPrice.toFixed(2)}</span>
            </span>

            {/* XAU/USD */}
            <span className="text-[11px] font-mono text-slate-200 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              <span className="text-slate-400">XAUUSD:</span>
              <span className="font-bold">${currentPrice.toFixed(2)}</span>
            </span>

            {/* EUR/USD */}
            <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
              <span className="text-slate-500">EUR/USD:</span>
              <span className="font-semibold text-slate-200">
                {liveMarketSummary?.eurUSD?.price?.toFixed(4) || '1.0845'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono">
            {macroIndicators.map((m) => (
              <div key={m.code} className="flex items-center gap-1.5 text-[11px]" title={m.impactNote}>
                <span className="text-slate-400">{m.code}:</span>
                <span className="font-semibold text-slate-100">{m.value}</span>
                <span className={m.isPositive ? 'text-emerald-400' : 'text-rose-400'}>{m.change}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                isSqueeze
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isSqueeze ? '⚡ مرحلة انضغاط وطاقة متجمعة (Squeeze)' : '🌊 مرحلة تمدد وسيولة نشطة (Expansion)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation & Spot Price Display */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Specialty Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
            <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Khamis for trading
              </h1>
              <span className="hidden sm:inline-block text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20 font-mono">
                Senior Institutional Gold Specialist (XAUUSD / GOLDm#)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              خبير تداول الذهب وحسابات المايكرو باليورو (€) وبوصلة الزخم متعدد الأطر وتحليلات TradingView ودورات الانضغاط
            </p>
          </div>
        </div>

        {/* Live Spot Price Widget & Currency Switcher */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800/90 shadow-lg">
          {/* Currency Toggle (EUR vs USD) */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => onToggleCurrency('EUR')}
              className={`px-2 py-1 rounded-lg transition font-bold ${
                selectedCurrency === 'EUR'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="حسابات المايكرو باليورو (EUR €)"
            >
              EUR (€)
            </button>
            <button
              onClick={() => onToggleCurrency('USD')}
              className={`px-2 py-1 rounded-lg transition font-bold ${
                selectedCurrency === 'USD'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="التسعير بالدولار (USD $)"
            >
              USD ($)
            </button>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-medium">
              {selectedCurrency === 'EUR' ? 'سعر الذهب باليورو (XAUEUR)' : 'سعر الذهب بالدولار (XAUUSD)'}
            </div>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-xl sm:text-2xl font-bold text-amber-300">
                {currencySymbol}{displayedPrice.toFixed(2)}
              </span>
              <span
                className={`flex items-center text-xs font-semibold ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? <TrendingUp className="w-3 h-3 ml-0.5" /> : <TrendingDown className="w-3 h-3 ml-0.5" />}
                {isUp ? '+' : ''}
                {priceChange.toFixed(2)}{currencySymbol}
              </span>
            </div>
          </div>

          <button
            onClick={onRefreshPrice}
            title="تحديث السعر الفوري من TradingView"
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Telegram Bot Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-sm ${
                telegramConfig?.enabled && telegramConfig?.botToken
                  ? 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/40 shadow-sky-500/10'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/60'
              }`}
              title="إعدادات بوت Telegram لإرسال الإشارات والتنبيهات"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>إعدادات Telegram</span>
              {telegramConfig?.enabled && telegramConfig?.botToken ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="البوت نشط ومفعل" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-500 ml-0.5" title="البوت غير متصل" />
              )}
            </button>
          )}

          {/* Toggle TradingView Chart Widget */}
          <button
            onClick={onToggleChart}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-sm ${
              isShowChart
                ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-blue-400 hover:text-blue-300 border-slate-700/60'
            }`}
            title="إظهار / إخفاء شارت TradingView المباشر"
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>{isShowChart ? 'إخفاء الشارت' : 'شارت TradingView'}</span>
          </button>

          {onClearChat && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-xs text-slate-300 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/30 transition shadow-sm"
              title="بدء تحليل جديد ومسح التحليلات السابقة"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحليل جديد (مسح السابق)</span>
            </button>
          )}

          <button
            onClick={onOpenRulebook}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-200 border border-slate-700/60 transition shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>كتيب القواعد المؤسسية</span>
          </button>
        </div>
      </div>
    </header>
  );
};
