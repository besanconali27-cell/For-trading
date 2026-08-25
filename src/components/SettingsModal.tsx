import React, { useState, useEffect } from 'react';
import { TelegramConfig } from '../types';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sliders, 
  HelpCircle, 
  ExternalLink,
  Lock,
  Zap
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig;
  onSaveConfig: (newConfig: TelegramConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [botToken, setBotToken] = useState(config.botToken || '');
  const [chatId, setChatId] = useState(config.chatId || '');
  const [autoSendSignals, setAutoSendSignals] = useState(config.autoSendSignals ?? true);
  const [minTargetDollars, setMinTargetDollars] = useState(config.minTargetDollars || 5.0);
  const [enabled, setEnabled] = useState(config.enabled ?? true);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setBotToken(config.botToken || '');
    setChatId(config.chatId || '');
    setAutoSendSignals(config.autoSendSignals ?? true);
    setMinTargetDollars(config.minTargetDollars || 5.0);
    setEnabled(config.enabled ?? true);
    setTestResult(null);
    setSavedSuccess(false);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const newConfig: TelegramConfig = {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      autoSendSignals,
      minTargetDollars: Number(minTargetDollars) || 5.0,
      enabled: enabled && Boolean(botToken.trim() && chatId.trim()),
    };

    onSaveConfig(newConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestConnection = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestResult({
        success: false,
        message: 'يرجى إدخال Bot Token و Chat ID أولاً لإجراء الاختبار.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim(),
          chatId: chatId.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || '✅ تم الاتصال بنجاح وإرسال رسالة تجريبية إلى تليجرام!',
        });
      } else {
        setTestResult({
          success: false,
          message: `❌ فشل الاتصال: ${data.error || 'تأكد من صحة التوكن والـ Chat ID وأنك قمت بالضغط على Start في البوت.'}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `❌ تعذر الاتصال بالخادم: ${err?.message || 'خطأ في الشبكة'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden text-right font-sans">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-72 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                إعدادات وتنبيهات بوت Telegram
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  إشارات حية
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ربط النظام لإرسال إشارات الشراء والبيع والانفجار السعري لهاتفك مباشرة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 my-5 max-h-[65vh] overflow-y-auto pr-1 pl-1 relative z-10 custom-scrollbar">
          
          {/* Bot Token Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                Telegram Bot Token
              </label>
              <span className="text-[10px] text-slate-400">من @BotFather</span>
            </div>
            <input
              type="password"
              placeholder="مثال: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-sky-500 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition"
              dir="ltr"
            />
          </div>

          {/* Chat ID Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                Telegram Chat ID
              </label>
              <span className="text-[10px] text-slate-400">من @userinfobot</span>
            </div>
            <input
              type="text"
              placeholder="مثال: 123456789 أو -100123456789"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 focus:border-sky-500 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition"
              dir="ltr"
            />
          </div>

          {/* Auto Send & Minimum Target Settings */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            
            {/* Auto send toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  إرسال فوري تلقائي عند التحليل
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  إرسال التوصية إلى قناتك/محادثتك فور استخراج إشارة شراء أو بيع قوية
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSendSignals}
                onChange={(e) => setAutoSendSignals(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-slate-700"
              />
            </label>

            {/* Minimum target $ setting */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  أدنى ربح مستهدف للهدف الأول (TP1)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  الحد الأدنى لمدى الهدف الأول بالدولار (أكثر من 5$)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="5.0"
                  max="50.0"
                  value={minTargetDollars}
                  onChange={(e) => setMinTargetDollars(parseFloat(e.target.value) || 5.0)}
                  className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 text-center outline-none"
                  dir="ltr"
                />
                <span className="text-xs font-bold text-slate-400">$</span>
              </div>
            </div>

          </div>

          {/* Quick Guide / Help Box */}
          <div className="p-3 rounded-2xl bg-sky-500/5 border border-sky-500/20 text-xs text-sky-200/90 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-sky-300">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>طريقة الحصول على التوكن والـ Chat ID مجاناً في دقيقة:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pr-1 leading-relaxed">
              <li>افتح تليجرام وابحث عن <span className="font-mono text-sky-300">@BotFather</span> وأرسل <span className="font-mono text-amber-300">/newbot</span> وانسخ التوكن.</li>
              <li>افتح محادثة مع بوتك الجديد واضغط <span className="font-bold text-emerald-300">Start</span>.</li>
              <li>ابحث عن <span className="font-mono text-sky-300">@userinfobot</span> للحصول على رقم الـ <span className="font-bold text-amber-300">Id</span> الخاص بك.</li>
            </ol>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{testResult.message}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم حفظ الإعدادات وتفعيل بوت Telegram بنجاح!</span>
            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-800 relative z-10">
          
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !botToken || !chatId}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs text-slate-200 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {testing ? (
              <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>{testing ? 'جارٍ إرسال التجربة...' : '⚡ تجربة الاتصال وإرسال تنبيه'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 transition"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <span>حفظ الإعدادات</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
