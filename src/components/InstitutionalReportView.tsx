import React, { useState } from 'react';
import { AnalysisResponse, DecisionType } from '../types';
import { ShieldCheck, Target, AlertTriangle, Copy, Check, MessageSquare, Sparkles, Send, RefreshCw, Zap, Award } from 'lucide-react';
import { MomentumVisualPanel } from './MomentumVisualPanel';
import ReactMarkdown from 'react-markdown';

interface InstitutionalReportViewProps {
  report: AnalysisResponse | null;
  isAnalyzing: boolean;
  onAskFollowUp: (question: string) => Promise<string | null>;
}

export const InstitutionalReportView: React.FC<InstitutionalReportViewProps> = ({
  report,
  isAnalyzing,
  onAskFollowUp,
}) => {
  const [copied, setCopied] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [isBreakevenActive, setIsBreakevenActive] = useState(false);

  if (isAnalyzing) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-ping"></div>
          <div className="relative w-16 h-16 rounded-full border-4 border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent animate-spin flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">فحص الشارت بمجهر القناص المؤسسي...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            جاري قراءة سلوك الشموع، تقاطعات EMA 50، مستويات انضغاط بولينجر و ATR، الفجوات السعرية FVG، وبصمة خوارزميات البنوك.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400/60">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">بانتظار مسح الشارت</h3>
          <p className="text-xs text-slate-400 mt-1">
            ارفع صورة الشارت بالأعلى أو اضغط على «تحليل الشارت مؤسسياً» لإصدار التقرير التنفيذي المباشر.
          </p>
        </div>
      </div>
    );
  }

  const { decision, entry, sl, tp1, tp2, tp3 } = report.structured;

  const getDecisionBadge = (d: DecisionType) => {
    switch (d) {
      case 'BUY':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'اشتري الآن (BUY)',
        };
      case 'SELL':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-400',
          label: 'بع الآن (SELL)',
        };
      case 'HEDGE':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          label: 'تهديج طارئ (HEDGE LOCK)',
        };
      case 'CLOSE':
        return {
          bg: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
          dot: 'bg-purple-400',
          label: 'أغلق فوراً (CLOSE POSITION)',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          dot: 'bg-slate-400',
          label: 'انتظر وتريث (WAIT & WATCH)',
        };
    }
  };

  const badge = getDecisionBadge(decision);

  const handleCopy = () => {
    const textToCopy = `📊 توصية القناص المؤسسي (XAUUSD):\nالقرار: ${badge.label}\nالدخول: ${entry || 'ماركت'}\nالوقف SL: ${sl || '--'}\nالهدف الأول TP1: ${tp1 || '--'} (Breakeven)\nالهدف الثاني TP2: ${tp2 || '--'}\nالهدف الثالث TP3: ${tp3 || '--'}\n⏰ التوقيت: ${new Date(report.timestamp).toLocaleTimeString()}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim()) return;
    setIsAsking(true);
    try {
      const answer = await onAskFollowUp(followUpQuestion);
      setFollowUpAnswer(answer);
    } catch {
      setFollowUpAnswer('حدث خطأ في الاتصال بالمستشار المؤسسي.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Execution Summary Header Banner */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border text-sm font-bold flex items-center gap-2 ${badge.bg}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${badge.dot} animate-pulse`}></span>
            <span>{badge.label}</span>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBreakevenActive(!isBreakevenActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1.5 border ${
              isBreakevenActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isBreakevenActive ? 'تم نقل الستوب للدخول (Breakeven Active)' : 'تفعيل تأمين الدخول (Breakeven)'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            title="نسخ بيانات الصفقة لمنصة MT5 أو التليغرام"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الخطة'}</span>
          </button>
        </div>
      </div>

      {/* Quick Execution Parameters Card */}
      {(entry || sl || tp1) && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-center">
            <div className="text-slate-400 text-[10px]">نطاق الدخول Entry</div>
            <div className="font-bold text-amber-300 mt-0.5 text-sm">{entry || '--'}</div>
          </div>

          <div className="bg-slate-950/70 border border-rose-900/40 rounded-xl p-2.5 text-center">
            <div className="text-rose-400 text-[10px]">وقف الخسارة SL</div>
            <div className="font-bold text-rose-300 mt-0.5 text-sm">
              {isBreakevenActive && entry ? `${entry} (BE)` : sl || '--'}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-2.5 text-center">
            <div className="text-emerald-400 text-[10px]">الهدف الأول TP1 (تأمين)</div>
            <div className="font-bold text-emerald-300 mt-0.5 text-sm">{tp1 || '--'}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-center">
            <div className="text-slate-400 text-[10px]">الهدف الثاني TP2 (سيولة)</div>
            <div className="font-bold text-slate-200 mt-0.5 text-sm">{tp2 || '--'}</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 text-center col-span-2 sm:col-span-1">
            <div className="text-slate-400 text-[10px]">الهدف الثالث TP3 (أقصى)</div>
            <div className="font-bold text-slate-200 mt-0.5 text-sm">{tp3 || '--'}</div>
          </div>
        </div>
      )}

      {/* Main Formatted Institutional Markdown Report */}
      <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed bg-slate-950/50 p-5 rounded-xl border border-slate-800/60 overflow-x-auto">
        <ReactMarkdown>{report.analysis}</ReactMarkdown>
      </div>

      {/* Timeframe Momentum Direction Arrows & TradingView Gauge Panel */}
      <MomentumVisualPanel
        signals={report.structured.timeframeSignals}
        tvGauge={report.structured.tvMomentumGauge}
        quickNote={report.structured.quickNote}
        decision={report.structured.decision}
      />

      {/* Follow-up Interactive Specialist Chat */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <MessageSquare className="w-4 h-4" />
          <span>استفسار فوري للمستشار المؤسسي حول هذه الصفقة أو إدارة الأزمة:</span>
        </div>

        <form onSubmit={handleSendFollowUp} className="flex gap-2">
          <input
            type="text"
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            placeholder="مثال: لو السعر كسر EMA 50 هل أغلق على خسارة أم أنتظر الارتداد؟"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAsking || !followUpQuestion.trim()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAsking ? 'جاري الرد...' : 'إرسال'}</span>
          </button>
        </form>

        {followUpAnswer && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs text-slate-200 space-y-1 animate-fade-in">
            <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>توجيه القناص:</span>
            </div>
            <div className="leading-relaxed whitespace-pre-line text-slate-300">
              {followUpAnswer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
