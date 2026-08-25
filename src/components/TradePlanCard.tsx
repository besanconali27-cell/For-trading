import React, { useState } from 'react';
import { StructuredTradePlan, DecisionType, TelegramConfig } from '../types';
import { ShieldCheck, Target, AlertTriangle, Copy, Check, TrendingUp, TrendingDown, Clock, ShieldAlert, Lock, Send } from 'lucide-react';

interface TradePlanCardProps {
  plan: StructuredTradePlan;
  telegramConfig?: TelegramConfig;
  onOpenSettings?: () => void;
}

export const TradePlanCard: React.FC<TradePlanCardProps> = ({ plan, telegramConfig, onOpenSettings }) => {
  const [copied, setCopied] = useState(false);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const getDecisionBadge = (decision: DecisionType) => {
    switch (decision) {
      case 'BUY':
        return {
          label: 'اشتري BUY',
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10',
          icon: <TrendingUp className="w-4 h-4 ml-1 text-emerald-400" />,
        };
      case 'SELL':
        return {
          label: 'بع SELL',
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-rose-500/10',
          icon: <TrendingDown className="w-4 h-4 ml-1 text-rose-400" />,
        };
      case 'HEDGE':
        return {
          label: 'تهديج طارئ HEDGE',
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/40 shadow-purple-500/10',
          icon: <Lock className="w-4 h-4 ml-1 text-purple-400" />,
        };
      case 'CLOSE':
        return {
          label: 'أغلق فوراً CLOSE',
          bg: 'bg-red-500/15 text-red-400 border-red-500/40 shadow-red-500/10',
          icon: <AlertTriangle className="w-4 h-4 ml-1 text-red-400" />,
        };
      case 'WAIT':
      default:
        return {
          label: 'انتظر WAIT',
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-amber-500/10',
          icon: <Clock className="w-4 h-4 ml-1 text-amber-400" />,
        };
    }
  };

  const badge = getDecisionBadge(plan.decision);

  const handleCopyPlan = () => {
    const textToCopy = `📌 قرار القناص المؤسسي (XAUUSD):
القرار: ${badge.label}
نطاق الدخول: ${plan.entry || 'حسب حركة السعر اللحظية'}
وقف الخسارة (SL): ${plan.sl || 'خلف EMA 50 / ذيل الشمعة'}
الهدف 1 (TP1 - Breakeven): ${plan.tp1 || '+6.00$'}
الهدف 2 (TP2): ${plan.tp2 || '-'}
الهدف 3 (TP3): ${plan.tp3 || '-'}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToTelegram = async () => {
    if (!telegramConfig?.botToken || !telegramConfig?.chatId) {
      if (onOpenSettings) onOpenSettings();
      return;
    }

    setSendingTelegram(true);
    setTelegramStatus(null);

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: telegramConfig.botToken,
          chatId: telegramConfig.chatId,
          plan,
          note: plan.quickNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTelegramStatus({ success: true, msg: 'تم الإرسال لتليجرام!' });
      } else {
        setTelegramStatus({ success: false, msg: data.error || 'فشل الإرسال' });
      }
    } catch (err: any) {
      setTelegramStatus({ success: false, msg: 'خطأ في الشبكة' });
    } finally {
      setSendingTelegram(false);
      setTimeout(() => setTelegramStatus(null), 3000);
    }
  };

  return (
    <div className="my-3 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border border-amber-500/30 p-4 shadow-xl shadow-amber-500/5 font-sans text-right" dir="rtl">
      {/* Card Header & Decision Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-300">القرار التنفيذي المباشر:</span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border shadow-sm ${badge.bg}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Send to Telegram Button */}
          <button
            onClick={handleSendToTelegram}
            disabled={sendingTelegram}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-sky-200 text-xs font-semibold transition border border-sky-500/40 shadow-sm shadow-sky-500/5"
            title={telegramConfig?.botToken ? "إرسال التوصية فوراً إلى قناة/محادثة Telegram" : "اضغط لربط بوت Telegram"}
          >
            {sendingTelegram ? (
              <div className="w-3 h-3 border-2 border-sky-300 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>
              {telegramStatus
                ? telegramStatus.msg
                : telegramConfig?.botToken
                ? 'إرسال لـ Telegram 📱'
                : 'ربط Telegram 📱'}
            </span>
          </button>

          <button
            onClick={handleCopyPlan}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs transition border border-slate-700/50"
            title="نسخ ملخص الصفقة"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[11px]">{copied ? 'تم النسخ' : 'نسخ التوصية'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Execution Levels */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
        {/* Entry */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-medium">نطاق الدخول (Entry)</span>
          <span className="font-mono text-sm font-bold text-amber-300 mt-1">
            {plan.entry ? `${plan.entry}$` : 'مستوى السعر الحالي'}
          </span>
        </div>

        {/* Stop Loss */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-rose-900/30 flex flex-col justify-between">
          <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            وقف الخسارة (SL)
          </span>
          <span className="font-mono text-sm font-bold text-rose-300 mt-1">
            {plan.sl ? `${plan.sl}$` : 'خلف EMA 50'}
          </span>
        </div>

        {/* TP1 + Breakeven Alert */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-emerald-900/30 flex flex-col justify-between relative overflow-hidden">
          <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              الهدف 1 (TP1)
            </span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">تأمين Breakeven</span>
          </span>
          <span className="font-mono text-sm font-bold text-emerald-300 mt-1">
            {plan.tp1 ? `${plan.tp1}$` : '3.00$ - 5.00$'}
          </span>
        </div>

        {/* TP2 & TP3 */}
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[10px] text-cyan-400 font-medium">الأهداف الإضافية (TP2/TP3)</span>
          <span className="font-mono text-xs font-semibold text-slate-200 mt-1">
            {plan.tp2 ? `TP2: ${plan.tp2}$` : 'TP2: سيولة القمة'}
            {plan.tp3 ? ` | TP3: ${plan.tp3}$` : ''}
          </span>
        </div>
      </div>

      {/* Safety & Protocol Banner */}
      <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-200">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>قاعدة المايكرو باليورو (€): فور ضرب TP1 انقل الستوب فوراً لسعر الدخول (Breakeven)، ووقف الخسارة أقصاه (-0.20€ إلى -0.60€).</span>
        </span>
      </div>
    </div>
  );
};

