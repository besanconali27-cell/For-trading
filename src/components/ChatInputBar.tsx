import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Sparkles, Clock, FileText, ChevronUp, RefreshCw, UploadCloud, Layers } from 'lucide-react';
import { Timeframe, PresetScenario } from '../types';
import { PRESET_SCENARIOS } from '../data/mockMarketData';

interface ChatInputBarProps {
  onSendMessage: (payload: { text: string; imageBase64?: string; mimeType?: string; imageFileName?: string }) => void;
  isLoading: boolean;
  selectedTimeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  currentPrice: number;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  isLoading,
  selectedTimeframe,
  onSelectTimeframe,
  currentPrice,
}) => {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{
    base64: string;
    mimeType: string;
    fileName: string;
  } | null>(null);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  // Handle Clipboard Paste for instant screenshots
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          break;
        }
      }
    }
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAttachedImage({
          base64: result,
          mimeType: file.type || 'image/png',
          fileName: file.name || 'chart-screenshot.png',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !attachedImage) || isLoading) return;

    onSendMessage({
      text: text.trim() || (attachedImage ? 'يرجى تحليل شارت الذهب المرفق وتقديم قرار تنفيذي مؤسسي وخطة أهداف ووقف خسارة.' : ''),
      imageBase64: attachedImage?.base64,
      mimeType: attachedImage?.mimeType,
      imageFileName: attachedImage?.fileName,
    });

    setText('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPresetScenario = (scenario: PresetScenario) => {
    onSelectTimeframe(scenario.timeframe);
    setText(`يرجى تحليل هذا النموذج السعري على الذهب: "${scenario.title}" (${scenario.subtitle}) - ${scenario.description} - السعر المرجعي: $${scenario.price}. ما هو القرار التنفيذي وخطة إدارة المخاطر؟`);
    setIsPresetOpen(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const timeframes: Timeframe[] = ['1M', '5M', '15M', '1H', '4H', '1D'];

  return (
    <div className="relative font-sans text-right" dir="rtl" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {/* Drag Over Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 rounded-2xl bg-amber-500/20 border-2 border-dashed border-amber-400 backdrop-blur-xs flex items-center justify-center gap-2 text-amber-300 font-bold text-sm">
          <UploadCloud className="w-6 h-6 animate-bounce" />
          <span>أفلت صورة شارت الذهب هنا للإرفاق والتحليل الفوري...</span>
        </div>
      )}

      {/* Preset Scenarios Menu Popover */}
      {isPresetOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-full sm:w-[480px] bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl z-40 animate-fade-in text-right">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Layers className="w-4 h-4" />
              نماذج وحالات شارت الذهب المؤسسية الجاهزة للفحص
            </span>
            <button
              onClick={() => setIsPresetOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {PRESET_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => handleSelectPresetScenario(sc)}
                className="w-full p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-right transition flex flex-col gap-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white group-hover:text-amber-300 transition">
                    {sc.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                    {sc.timeframe} • ${sc.price}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{sc.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Card Container */}
      <div className="bg-slate-900/95 border border-slate-800/90 rounded-2xl p-3 shadow-2xl backdrop-blur-md transition focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20">
        {/* Attached Image Preview */}
        {attachedImage && (
          <div className="flex items-center justify-between gap-3 p-2 mb-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={attachedImage.base64}
                alt="شارت مرفق"
                referrerPolicy="no-referrer"
                className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
              />
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">{attachedImage.fileName}</div>
                <div className="text-[10px] text-emerald-400 font-mono">جاهز للإرسال والتحليل المؤسسي</div>
              </div>
            </div>

            <button
              onClick={() => setAttachedImage(null)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
              title="إزالة الصورة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="اكتب استفسارك للمستشار المؤسسي أو أرفق صورة شارت (يمكنك الضغط على Ctrl+V للصق صورة الشاشة مباشرة)..."
          rows={1}
          disabled={isLoading}
          className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none resize-none min-h-[44px] max-h-40 leading-relaxed font-sans"
        />

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-1 border-t border-slate-800/60">
          {/* Controls on Left/Right */}
          <div className="flex items-center gap-2">
            {/* Image Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-300 text-xs font-semibold border border-slate-700/60 transition"
              title="إرفاق صورة شارت من جهازك"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>إرفاق شارت</span>
            </button>

            {/* Presets Scenario Trigger */}
            <button
              type="button"
              onClick={() => setIsPresetOpen(!isPresetOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                isPresetOpen
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-300 border-slate-700/60'
              }`}
              title="نماذج شارتات جاهزة للفحص السريع"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>شارتات جاهزة</span>
            </button>

            {/* Timeframe Selector Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800 text-[11px] font-mono">
              <Clock className="w-3 h-3 text-slate-400 ml-1" />
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => onSelectTimeframe(tf)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    selectedTimeframe === tf
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={(!text.trim() && !attachedImage) || isLoading}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              (!text.trim() && !attachedImage) || isLoading
                ? 'bg-slate-800 text-slate-500 border border-slate-700/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-500/20 hover:scale-[1.02]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري التحليل...</span>
              </>
            ) : (
              <>
                <span>إرسال التحليل</span>
                <Send className="w-3.5 h-3.5 transform -scale-x-100" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
