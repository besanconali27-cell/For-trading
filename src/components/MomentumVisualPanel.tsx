import React, { useState } from 'react';
import { TimeframeMomentumSignal, TradingViewMomentumGauge, DecisionType } from '../types';
import { ArrowUp, ArrowDown, ArrowRight, RefreshCw, Activity, ExternalLink, Zap, Copy, Check } from 'lucide-react';

interface MomentumVisualPanelProps {
  signals?: TimeframeMomentumSignal[];
  tvGauge?: TradingViewMomentumGauge;
  quickNote?: string | null;
  decision?: DecisionType;
  currentPrice?: number;
}

export const MomentumVisualPanel: React.FC<MomentumVisualPanelProps> = ({
  signals,
  tvGauge,
  quickNote,
  decision = 'BUY',
}) => {
  const [copiedNote, setCopiedNote] = useState(false);

  const isSell = decision === 'SELL' || decision === 'CLOSE';

  // Default fallback signals if not provided
  const defaultSignals: TimeframeMomentumSignal[] = isSell
    ? [
        { timeframe: '1D', label: 'اليومي (1D)', direction: 'BEARISH', arrow: '🔴 ⬇️', bias: 'ضغط تصريفي (CTA Algos)', details: 'كسر قاع وضغط بيعي مستمر' },
        { timeframe: '4H', label: '4 ساعات (4H)', direction: 'BEARISH', arrow: '🔴 ⬇️', bias: 'كتل عرض قوية (Supply Blocks)', details: 'تمركز بائعي أسفل المقاومة' },
        { timeframe: '1H', label: '1 ساعة (1H)', direction: 'BEARISH', arrow: '🔴 ⬇️', bias: 'فجوات هابطة (Bearish FVG)', details: 'تفريغ زخم وسيولة بيعية' },
        { timeframe: '15M', label: '15 دقيقة (15M)', direction: 'BEARISH', arrow: '🔴 ⬇️', bias: 'كسر دعوم واستمرار هبوط', details: 'توسع هابط (Expansion)' },
        { timeframe: '5M', label: '5 دقائق (5M)', direction: 'BEARISH', arrow: '🔴 ⬇️', bias: 'تسارع ضغط الفوليوم البيعي', details: 'تزايد أحجام البيع المؤسسي' },
        { timeframe: '1M', label: '1 دقيقة (1M)', direction: 'BEARISH', arrow: '🔴 ⬇️', bias: 'تداول أسفل EMA 50', details: 'زاوية هبوط حادة ورفض للصعود' },
      ]
    : [
        { timeframe: '1D', label: 'اليومي (1D)', direction: 'BULLISH', arrow: '🟢 ⬆️', bias: 'شراء الزخم (CTA Algos)', details: 'ثبات هيكلي فوق الدعوم' },
        { timeframe: '4H', label: '4 ساعات (4H)', direction: 'BULLISH', arrow: '🟢 ⬆️', bias: 'كتل طلب (Order Blocks)', details: 'تمركز شرائي مؤسسي' },
        { timeframe: '1H', label: '1 ساعة (1H)', direction: 'BULLISH', arrow: '🟢 ⬆️', bias: 'تغطية فجوات (FVG)', details: 'سحب سيولة وصعود متماسك' },
        { timeframe: '15M', label: '15 دقيقة (15M)', direction: 'NEUTRAL', arrow: '🟡 ↔️', bias: 'انضغاط (Squeeze)', details: 'تجميع طاقة قبل التمدد' },
        { timeframe: '5M', label: '5 دقائق (5M)', direction: 'BULLISH', arrow: '🟢 ⬆️', bias: 'تسارع فوليوم', details: 'تزايد أحجام الشراء المؤسسي' },
        { timeframe: '1M', label: '1 دقيقة (1M)', direction: 'BULLISH', arrow: '🟢 ⬆️', bias: 'اختبار EMA 50 (HFT)', details: 'ارتداد صاعد فوق المتوسط' },
      ];

  const activeSignals = signals && signals.length > 0 ? signals : defaultSignals;

  const getDirectionBadge = (dir: string, arrowStr: string) => {
    const isBull = dir === 'BULLISH' || dir === 'UP' || arrowStr.includes('⬆️');
    const isBear = dir === 'BEARISH' || dir === 'DOWN' || arrowStr.includes('⬇️');
    const isRev = dir === 'REVERSAL' || arrowStr.includes('🔄');

    if (isBull) {
      return {
        bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300',
        arrowColor: 'text-emerald-400',
        icon: <ArrowUp className="w-4 h-4 text-emerald-400 stroke-[3]" />,
        text: 'صاعد ⬆️',
      };
    }
    if (isBear) {
      return {
        bg: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
        arrowColor: 'text-rose-400',
        icon: <ArrowDown className="w-4 h-4 text-rose-400 stroke-[3]" />,
        text: 'هابط ⬇️',
      };
    }
    if (isRev) {
      return {
        bg: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
        arrowColor: 'text-purple-400',
        icon: <RefreshCw className="w-4 h-4 text-purple-400 stroke-[2.5]" />,
        text: 'انعكاس مرتقب 🔄',
      };
    }
    return {
      bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
      arrowColor: 'text-amber-400',
      icon: <ArrowRight className="w-4 h-4 text-amber-400 stroke-[2.5]" />,
      text: 'تذبذب / انضغاط ↔️',
    };
  };

  const handleCopyNote = () => {
    if (!quickNote) return;
    navigator.clipboard.writeText(quickNote);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  // Helper to choose color classes for gauge cards
  const getPillarColors = (arrow?: string, label?: string) => {
    const text = `${arrow || ''} ${label || ''}`;
    if (text.includes('⬇️') || text.includes('بيع') || text.includes('SELL') || text.includes('هابط')) {
      return {
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        bg: 'bg-rose-950/40',
        badgeBg: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
      };
    }
    if (text.includes('↔️') || text.includes('حياد') || text.includes('تذبذب') || text.includes('انضغاط')) {
      return {
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        bg: 'bg-amber-950/40',
        badgeBg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
      };
    }
    return {
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/40',
      badgeBg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
    };
  };

  const summaryTheme = getPillarColors(tvGauge?.summary?.arrow, tvGauge?.summary?.label || (isSell ? 'بيع قوي' : 'شراء قوي'));
  const maTheme = getPillarColors(tvGauge?.movingAverages?.arrow, tvGauge?.movingAverages?.label || (isSell ? 'بيع' : 'شراء'));
  const oscTheme = getPillarColors(tvGauge?.oscillators?.arrow, tvGauge?.oscillators?.label || (isSell ? 'بيع' : 'شراء'));
  const volTheme = getPillarColors(tvGauge?.volumeFlow?.arrow, tvGauge?.volumeFlow?.label || (isSell ? 'بيع' : 'شراء'));

  return (
    <div className="my-4 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 p-4 shadow-2xl space-y-4 text-right" dir="rtl">
      
      {/* 1. Quick Executive Action Note (الملاحظة التنفيذية السريعة) */}
      {quickNote && (
        <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-bold text-white">ملاحظة تنفيذية سريعة:</span>
            <span className="text-amber-200 font-mono text-[13px]">{quickNote}</span>
          </div>
          <button
            onClick={handleCopyNote}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-mono transition border border-amber-500/30"
            title="نسخ الملاحظة"
          >
            {copiedNote ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedNote ? 'تم النسخ' : 'نسخ'}</span>
          </button>
        </div>
      )}

      {/* 2. Multi-Timeframe Momentum Direction Arrows (أسهم اتجاه الزخم عبر الفريمات) */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-100">
              🧭 بوصلة اتجاه الزخم عبر الأطر الزمنية (Multi-Timeframe Momentum Direction)
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">1D ➔ 4H ➔ 1H ➔ 15M ➔ 5M ➔ 1M</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {activeSignals.map((sig) => {
            const badge = getDirectionBadge(sig.direction, sig.arrow);
            // Deduplicate text so it doesn't render identical lines
            const line1 = sig.bias || sig.label || '';
            const line2 = sig.details && sig.details !== line1 ? sig.details : (sig.explanation && sig.explanation !== line1 ? sig.explanation : null);

            return (
              <div
                key={sig.timeframe}
                className={`rounded-xl p-2.5 border flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm ${badge.bg}`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="font-bold text-slate-200 font-mono">{sig.timeframe}</span>
                  <span className="flex items-center gap-0.5 text-xs font-bold">
                    {badge.icon}
                  </span>
                </div>

                <div className="mt-1.5">
                  <div className="text-xs font-bold font-mono tracking-tight">{sig.arrow}</div>
                  <div className="text-[10px] text-slate-200 font-medium mt-0.5 line-clamp-1" title={line1}>
                    {line1}
                  </div>
                </div>

                {line2 && (
                  <div className="text-[9px] text-slate-400 mt-1 line-clamp-1 border-t border-slate-800/60 pt-1" title={line2}>
                    {line2}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TradingView Deep Momentum Analysis (التحليل العميق لزخم البيع والشراء من TradingView) */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/70 pb-2">
          <div className="flex items-center gap-2">
            <a
              href="https://www.tradingview.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono hover:bg-blue-500/20 transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-bold">TradingView Indicator Suite</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-70" />
            </a>
            <span className="text-xs font-bold text-slate-200">
              📊 تحليل زخم البيع والشراء العميق
            </span>
          </div>

          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${summaryTheme.badgeBg}`}>
            {tvGauge?.summary?.arrow || (isSell ? '🔴 ⬇️' : '🟢 ⬆️')} {tvGauge?.summary?.label || (isSell ? 'بيع قوي [Strong Sell]' : 'شراء قوي [Strong Buy]')}
          </span>
        </div>

        {/* 4 Pillars of TradingView Momentum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* 1. Overall Summary */}
          <div className={`bg-slate-900/90 border rounded-lg p-2.5 space-y-1 ${summaryTheme.border}`}>
            <div className="text-[10px] text-slate-400 font-medium">التقييم الفني العام (Summary)</div>
            <div className={`flex items-center gap-1.5 font-bold text-sm ${summaryTheme.text}`}>
              <span>{tvGauge?.summary?.arrow || (isSell ? '🔴 ⬇️' : '🟢 ⬆️')}</span>
              <span>{tvGauge?.summary?.label || (isSell ? 'بيع قوي (Strong Sell)' : 'شراء قوي (Strong Buy)')}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              توافق غالبية مؤشرات الزخم والاتجاه
            </div>
          </div>

          {/* 2. Moving Averages Stack */}
          <div className={`bg-slate-900/90 border rounded-lg p-2.5 space-y-1 ${maTheme.border}`}>
            <div className="text-[10px] text-slate-400 font-medium">المتوسطات المتحركة (MAs)</div>
            <div className={`flex items-center gap-1.5 font-bold text-sm ${maTheme.text}`}>
              <span>{tvGauge?.movingAverages?.arrow || (isSell ? '🔴 ⬇️' : '🟢 ⬆️')}</span>
              <span>{tvGauge?.movingAverages?.label || (isSell ? 'بيع (EMA Stack سلبي)' : 'شراء (EMA Stack صاعد)')}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1" title={tvGauge?.movingAverages?.details}>
              {tvGauge?.movingAverages?.details || (isSell ? 'السعر أسفل EMA 50 وميلان هابط' : 'ترتيب صاعد: السعر > EMA20 > EMA50')}
            </div>
          </div>

          {/* 3. Oscillators (RSI / MACD) */}
          <div className={`bg-slate-900/90 border rounded-lg p-2.5 space-y-1 ${oscTheme.border}`}>
            <div className="text-[10px] text-slate-400 font-medium">مؤشرات التذبذب (Oscillators)</div>
            <div className={`flex items-center gap-1.5 font-bold text-sm ${oscTheme.text}`}>
              <span>{tvGauge?.oscillators?.arrow || (isSell ? '🔴 ⬇️' : '🟢 ⬆️')}</span>
              <span>{tvGauge?.oscillators?.label || (isSell ? 'زخم سلبي (RSI < 50 و MACD هابط)' : 'زخم إيجابي (RSI > 50 و MACD صاعد)')}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1" title={tvGauge?.oscillators?.details}>
              {tvGauge?.oscillators?.details || (isSell ? 'RSI أسفل 50 و MACD أسفل خط الصفر' : 'RSI فوق 50 و MACD فوق خط الصفر')}
            </div>
          </div>

          {/* 4. Institutional Volume Flow */}
          <div className={`bg-slate-900/90 border rounded-lg p-2.5 space-y-1 ${volTheme.border}`}>
            <div className="text-[10px] text-slate-400 font-medium">تدفق سيولة وفوليوم البنوك</div>
            <div className={`flex items-center gap-1.5 font-bold text-sm ${volTheme.text}`}>
              <span>{tvGauge?.volumeFlow?.arrow || (isSell ? '🔴 ⬇️' : '🟢 ⬆️')}</span>
              <span>{tvGauge?.volumeFlow?.label || (isSell ? 'ضغط بيعي وتصريف فوليوم' : 'سيولة شرائية مستمرة')}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono line-clamp-1" title={tvGauge?.volumeFlow?.details}>
              {tvGauge?.volumeFlow?.details || (isSell ? 'تزايد أحجام التداول مع الشموع الهابطة' : 'تزايد أحجام التداول مع الشموع الدافعة')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

