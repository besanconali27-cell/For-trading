import React, { useState } from 'react';
import { ChatMessage, TelegramConfig } from '../types';
import { TradePlanCard } from './TradePlanCard';
import { MomentumVisualPanel } from './MomentumVisualPanel';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User, Copy, Check, ZoomIn, X, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  telegramConfig?: TelegramConfig;
  onOpenSettings?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, telegramConfig, onOpenSettings }) => {
  const [copied, setCopied] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.text.replace(/[#*`_\[\]]/g, ''));
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={`flex flex-col w-full my-3 transition-all animate-fade-in ${
        isUser ? 'items-end' : 'items-start'
      }`}
      dir="rtl"
    >
      <div
        className={`flex gap-3 max-w-3xl w-full ${
          isUser ? 'flex-row-reverse justify-start' : 'flex-row justify-start'
        }`}
      >
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-sm">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Bubble Container */}
        <div
          className={`flex flex-col flex-1 rounded-2xl p-4 text-sm transition shadow-lg ${
            isUser
              ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-sm'
              : 'bg-slate-900/95 text-slate-200 border border-slate-800 rounded-tr-sm'
          }`}
        >
          {/* Header row in message */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-700/40 text-xs">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isUser ? 'text-amber-300' : 'text-amber-400'}`}>
                {isUser ? 'أنت (المتداول)' : 'Khamis for trading'}
              </span>
              {!isUser && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                  Gold & Momentum Specialist
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>

              {!isUser && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSpeak}
                    className={`p-1 rounded hover:bg-slate-800 transition ${
                      isSpeaking ? 'text-amber-400 animate-pulse' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={isSpeaking ? 'إيقاف القراءة الصوتية' : 'قراءة التحليل صوتياً'}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                    title="نسخ النص"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Attached Image (if present) */}
          {message.imageBase64 && (
            <div className="mb-3">
              <div className="relative group inline-block rounded-xl overflow-hidden border border-slate-700 bg-slate-950/80 cursor-pointer max-w-md">
                <img
                  src={
                    message.imageBase64.startsWith('data:')
                      ? message.imageBase64
                      : `data:${message.mimeType || 'image/png'};base64,${message.imageBase64}`
                  }
                  alt="مخطط الشارت المرفق"
                  referrerPolicy="no-referrer"
                  className="max-h-56 w-auto object-contain rounded-xl transition duration-200 group-hover:scale-105"
                  onClick={() => setIsImageOpen(true)}
                />
                <div
                  onClick={() => setIsImageOpen(true)}
                  className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-xs font-semibold text-white transition backdrop-blur-xs"
                >
                  <ZoomIn className="w-4 h-4 text-amber-400" />
                  <span>تكبير الشارت</span>
                </div>
              </div>
              {message.imageFileName && (
                <div className="text-[11px] text-slate-400 mt-1 font-mono">{message.imageFileName}</div>
              )}
            </div>
          )}

          {/* Structured Trade Plan Card */}
          {message.structured && (
            <TradePlanCard
              plan={message.structured}
              telegramConfig={telegramConfig}
              onOpenSettings={onOpenSettings}
            />
          )}

          {/* Text Message Content */}
          <div className="text-right leading-relaxed space-y-2 text-[13.5px] text-slate-200">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:text-amber-300 prose-headings:my-2 prose-strong:text-white prose-ul:my-1.5 prose-li:my-0.5">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Timeframe Momentum Direction Arrows & TradingView Gauge Panel (for AI analyses) */}
          {!isUser && message.structured && (
            <MomentumVisualPanel
              signals={message.structured.timeframeSignals}
              tvGauge={message.structured.tvMomentumGauge}
              quickNote={message.structured.quickNote}
              decision={message.structured.decision}
            />
          )}
        </div>
      </div>

      {/* Lightbox Modal for Image Zoom */}
      {isImageOpen && message.imageBase64 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in"
          onClick={() => setIsImageOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-2xl">
            <button
              onClick={() => setIsImageOpen(false)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={
                message.imageBase64.startsWith('data:')
                  ? message.imageBase64
                  : `data:${message.mimeType || 'image/png'};base64,${message.imageBase64}`
              }
              alt="مخطط الشارت المكبر"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

