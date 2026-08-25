import React from 'react';
import { Sparkles, Crosshair, Zap, ShieldAlert, LineChart, Target, Compass } from 'lucide-react';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      icon: <Crosshair className="w-3.5 h-3.5 text-amber-400" />,
      text: 'حلل الشارت المرفق واستخرج إشارة قناص مع نقاط الدخول والوقف والأهداف',
    },
    {
      icon: <Zap className="w-3.5 h-3.5 text-amber-300" />,
      text: 'هل نحن الآن في مرحلة انضغاط (Contraction) أم تمدد (Expansion) للذهب؟',
    },
    {
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
      text: 'أنا عالق بصفقة بيع خاسرة - أحتاج خطة إنقاذ وتفريغ RSI أو تهديج طارئ',
    },
    {
      icon: <LineChart className="w-3.5 h-3.5 text-cyan-400" />,
      text: 'ما هو موقع السعر من EMA 50 وزاويته وهل توجد مصيدة فوليوم أو دايفرجنس؟',
    },
    {
      icon: <Target className="w-3.5 h-3.5 text-emerald-400" />,
      text: 'أريد خطة أهداف وتأمين Breakeven فوري لصفقة مايكرو على فريم 5 دقائق',
    },
    {
      icon: <Compass className="w-3.5 h-3.5 text-amber-400" />,
      text: 'استخرج بوصلة أسهم الزخم لجميع الفريمات (1D إلى 1M) وتحليل TradingView العميق لزخم البيع والشراء',
    },
  ];

  return (
    <div className="flex flex-col gap-2 py-2" dir="rtl">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium px-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>أسئلة ومحاور مقترحة للبدء السريع مع المستشار المؤسسي:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.text)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition shadow-sm text-right"
          >
            {item.icon}
            <span>{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
