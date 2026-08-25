import React from 'react';
import { Candle } from '../types';
import { analyzeVolatilityRegime } from '../utils/technicalCalculators';
import { Activity, Gauge, Zap, BarChart2, ShieldAlert, CheckCircle2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ContractionExpansionDashboardProps {
  candles: Candle[];
}

export const ContractionExpansionDashboard: React.FC<ContractionExpansionDashboardProps> = ({ candles }) => {
  const metrics = analyzeVolatilityRegime(candles);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Title Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">مصفوفة الانضغاط والتمدد المؤسسية</h3>
            <p className="text-[11px] text-slate-400">
              قياس دورات التقلب ونظرية Volatility Mean Reversion لتحديد توقيت الانفجار
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${
            metrics.isSqueeze
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 animate-pulse'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {metrics.isSqueeze ? '⚡ انضغاط طاقة شديد (Squeeze)' : '🌊 حركة تمدد طبيعية'}
        </span>
      </div>

      {/* 3 Analysis Stages Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Stage 1: Current Volatility */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">المرحلة 1: مستوى التقلب</span>
            <span className="text-[10px] text-slate-400 font-mono">ATR & BB Width</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>ATR الحالي:</span>
              <strong className="text-slate-200">${metrics.currentAtr?.toFixed(2) || '2.40'}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>نسبة هبوط الـ ATR:</span>
              <strong className={metrics.atrRatio < 35 ? 'text-amber-300' : 'text-slate-200'}>
                {metrics.atrRatio}% من قمته
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>عرض نطاق بولينجر:</span>
              <strong className={metrics.bbWidthPercent < 0.25 ? 'text-amber-300' : 'text-slate-200'}>
                {metrics.bbWidthPercent}%
              </strong>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>مؤشر الانضغاط (Squeeze Score):</span>
              <span className="font-mono text-amber-400">{metrics.squeezeIntensity}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                style={{ width: `${metrics.squeezeIntensity}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stage 2: Accumulated Energy */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">المرحلة 2: الطاقة المتجمعة</span>
            <span className="text-[10px] text-slate-400 font-mono">Volume & Duration</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>تناقص فوليوم الهدوء:</span>
              <strong className="text-emerald-400">{metrics.volumeDecay}% تناقص تدريجي</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>حالة السيولة:</span>
              <strong className="text-slate-200">السوق ينتظر محفز إخباري</strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>حجم الانفجار المتوقع:</span>
              <strong className={metrics.isSqueeze ? 'text-amber-300' : 'text-slate-300'}>
                {metrics.isSqueeze ? 'انفجار حاد 15$ - 30$' : 'حركة قياسية 4$ - 8$'}
              </strong>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            كلما طالت فترة الهدوء وتناقص الفوليوم، كانت الحركة اللاحقة أشد عنفاً.
          </div>
        </div>

        {/* Stage 3: Directional Probability */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">المرحلة 3: الاتجاه المرجح</span>
            <span className="text-[10px] text-slate-400 font-mono">Directional Bias</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>موقع السعر من EMA 200:</span>
              <strong className={metrics.aboveEma200 ? 'text-emerald-400' : 'text-rose-400'}>
                {metrics.aboveEma200 ? 'فوق الخط (ترند صاعد)' : 'تحت الخط (ترند هابط)'}
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>موقع السعر من EMA 50:</span>
              <strong className={metrics.aboveEma50 ? 'text-emerald-400' : 'text-rose-400'}>
                {metrics.aboveEma50 ? 'فوق EMA50 (شراء)' : 'تحت EMA50 (بيع)'}
              </strong>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>احتمال الاستمرارية:</span>
              <strong className="text-amber-300">
                {metrics.continuationBias === 'BULLISH_CONTINUATION'
                  ? 'صعود أرجح من الانعكاس ↗'
                  : metrics.continuationBias === 'BEARISH_CONTINUATION'
                  ? 'هبوط أرجح من الانعكاس ↘'
                  : 'تذبذب وتريث ↔'}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            {metrics.continuationBias === 'BULLISH_CONTINUATION' ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : metrics.continuationBias === 'BEARISH_CONTINUATION' ? (
              <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Activity className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>مبدأ: «الاستمرارية أرجح إحصائياً من الانعكاس»</span>
          </div>
        </div>
      </div>
    </div>
  );
};
