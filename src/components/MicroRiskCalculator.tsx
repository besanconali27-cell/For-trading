import React, { useState } from 'react';
import { Shield, DollarSign, Target, AlertOctagon, RefreshCcw, Lock, CheckCircle2, Info } from 'lucide-react';
import { MicroAccountConfig } from '../types';
import { calculateMicroRisk } from '../utils/technicalCalculators';

interface MicroRiskCalculatorProps {
  currentPrice: number;
}

export const MicroRiskCalculator: React.FC<MicroRiskCalculatorProps> = ({ currentPrice }) => {
  const [config, setConfig] = useState<MicroAccountConfig>({
    accountBalance: 100,
    lotSize: 0.01,
    entryPrice: currentPrice || 2895.0,
    stopLossPrice: (currentPrice || 2895.0) - 0.40,
    tp1Price: (currentPrice || 2895.0) + 6.50,
    tp2Price: (currentPrice || 2895.0) + 14.00,
    tp3Price: (currentPrice || 2895.0) + 25.00,
    leverage: 100,
  });

  const [hedgeMode, setHedgeMode] = useState<'escape' | 'lock'>('escape');
  const [stuckTradeType, setStuckTradeType] = useState<'BUY' | 'SELL'>('SELL');
  const [stuckPrice, setStuckPrice] = useState<number>((currentPrice || 2895.0) - 10);

  const riskResult = calculateMicroRisk(config);

  const handlePriceUpdate = (field: keyof MicroAccountConfig, val: number) => {
    setConfig((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">إدارة مخاطر حسابات المايكرو والأزمات (Micro Risk & Crisis Control)</h3>
            <p className="text-[11px] text-slate-400">
              حسابات المايكرو (0.01 Lot) مع وقف خسارة صارم (-0.20€ إلى -0.60€) وقاعدة الـ Breakeven
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-amber-300">
          حجم العقد: 0.01 Micro Lot
        </span>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 mb-1">رصيد الحساب ($)</label>
          <select
            value={config.accountBalance}
            onChange={(e) => handlePriceUpdate('accountBalance', parseFloat(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
          >
            <option value="50">$50 (Micro Saver)</option>
            <option value="100">$100 (Standard Micro)</option>
            <option value="250">$250 (Mid Micro)</option>
            <option value="500">$500 (Pro Micro)</option>
            <option value="1000">$1,000 (Mini Classic)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 mb-1">سعر الدخول ($)</label>
          <input
            type="number"
            step="0.01"
            value={config.entryPrice}
            onChange={(e) => handlePriceUpdate('entryPrice', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">وقف الخسارة SL ($)</label>
          <input
            type="number"
            step="0.01"
            value={config.stopLossPrice}
            onChange={(e) => handlePriceUpdate('stopLossPrice', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-rose-900/50 rounded-xl px-3 py-2 text-rose-300 font-mono focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-400 mb-1">الهدف الأول TP1 ($)</label>
          <input
            type="number"
            step="0.01"
            value={config.tp1Price}
            onChange={(e) => handlePriceUpdate('tp1Price', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-emerald-900/50 rounded-xl px-3 py-2 text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Calculation Results Card */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px]">مبلغ المخاطرة بالدولار:</div>
            <div className={`text-base font-bold mt-1 ${riskResult.isStrictRiskValid ? 'text-emerald-400' : 'text-rose-400'}`}>
              -${riskResult.slTotalRiskUSD.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ({riskResult.riskPercentOfBalance}% من الحساب)
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <div className="text-emerald-400 text-[10px]">ربح TP1 (التأمين الفوري):</div>
            <div className="text-base font-bold text-emerald-300 mt-1">
              +${riskResult.tp1ProfitUSD.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              نسبة العائد: 1:{riskResult.tp1RiskReward}
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px]">ربح TP2 (السيولة):</div>
            <div className="text-base font-bold text-slate-200 mt-1">
              +${riskResult.tp2ProfitUSD.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">نصف الكمية متبقية</div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <div className="text-slate-400 text-[10px]">ربح TP3 (الهدف الأقصى):</div>
            <div className="text-base font-bold text-amber-300 mt-1">
              +${riskResult.tp3ProfitUSD.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">تغطية الفجوة الكاملة</div>
          </div>
        </div>

        {/* Breakeven Rule Notification */}
        <div className="flex items-start gap-2 text-xs bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-amber-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">قاعدة الـ Breakeven المؤسسية الصارمة:</strong> الهدف الأول (TP1) يوضع قريباً جداً (3-5$). فور ضربه، يُنقل الستوب (SL) لنقطة الدخول فوراً لتأمين الصفقة بنسبة 100%، وتترك باقي العقود لحصد الأهداف دون أدنى مخاطرة.
          </div>
        </div>
      </div>

      {/* Hedging & Crisis Damage Control Box */}
      <div className="bg-slate-950/90 border border-rose-900/40 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-rose-300 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            بروتوكول التهديج وإدارة الأزمات (Hedging & Damage Control)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHedgeMode('escape')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                hedgeMode === 'escape' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              خطة الهروب الآمن (Escape)
            </button>
            <button
              onClick={() => setHedgeMode('lock')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                hedgeMode === 'lock' ? 'bg-rose-500 text-white font-bold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              القفل بالهيدج (Lock)
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
          {hedgeMode === 'escape' ? (
            <div>
              <p className="font-semibold text-amber-300">طريقة الهروب الذكي من صفقة بيع (SELL) عالقة في ترند صاعد:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 mt-1 text-[11px]">
                <li>راقب مؤشر <strong>RSI (14)</strong> وانتظر تفريغ التشبع الشرائي وعودته تحت مستوى 70.</li>
                <li>انتظر تصحيح السعر نحو <strong>EMA 50</strong> الحركي على فريم 5 دقائق أو 15 دقيقة.</li>
                <li>أغلق الصفقة الخاسرة عند ملامسة EMA 50 بأقل خسارة ممكنة بدلاً من الانتظار وتدمير الحساب.</li>
              </ul>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-rose-300">طريقة قفل الحساب بالهيدج الطارئ (Hedge Lock):</p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 mt-1 text-[11px]">
                <li>إذا اخترق السعر قمة أو قاعاً تاريخياً أو مستوى مقاومة رئيسي بفوليوم انفجاري.</li>
                <li>افتح صفقة معاكسة فوراً بنفس حجم العقد (0.01 لوت) لتجميد الخسارة الحالية 100%.</li>
                <li>انتظر إشارة انعكاس واضحة على فريم الساعة (كتلة طلب أو ذيل رفض Climax) لفك الهيدج تدريجياً.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
