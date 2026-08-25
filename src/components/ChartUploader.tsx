import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Clipboard, CheckCircle2, AlertCircle, FileText, Crosshair, ArrowRight } from 'lucide-react';
import { PresetScenario, Timeframe } from '../types';
import { PRESET_SCENARIOS } from '../data/mockMarketData';

interface ChartUploaderProps {
  onAnalyze: (payload: {
    imageBase64?: string;
    mimeType?: string;
    currentPrice?: number;
    timeframe?: Timeframe;
    extraContext?: string;
    textPrompt?: string;
  }) => void;
  isAnalyzing: boolean;
  onSelectPresetScenario: (scenario: PresetScenario) => void;
  selectedPreset: PresetScenario | null;
  currentPrice: number;
}

export const ChartUploader: React.FC<ChartUploaderProps> = ({
  onAnalyze,
  isAnalyzing,
  onSelectPresetScenario,
  selectedPreset,
  currentPrice,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [timeframe, setTimeframe] = useState<Timeframe>('15M');
  const [customPrice, setCustomPrice] = useState<string>(currentPrice.toString());
  const [extraContext, setExtraContext] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [clipboardSuccess, setClipboardSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize customPrice when spot price updates if not dirty
  useEffect(() => {
    if (!customPrice || customPrice === '0') {
      setCustomPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice]);

  // Handle global paste event for screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            setClipboardSuccess(true);
            setTimeout(() => setClipboardSuccess(false), 3000);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى رفع ملف صورة فقط (PNG, JPG, WebP)');
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze({
      imageBase64: imageBase64 || undefined,
      mimeType,
      currentPrice: parseFloat(customPrice) || currentPrice,
      timeframe,
      extraContext: extraContext.trim() || undefined,
      textPrompt: 'يرجى تقديم قرار تنفيذي فوري وخطة أهداف ووقف خسارة وإدارة أزمة وفقاً لبروتوكول القناص المؤسسي.',
    });
  };

  const handleChoosePreset = (scenario: PresetScenario) => {
    onSelectPresetScenario(scenario);
    setTimeframe(scenario.timeframe);
    setCustomPrice(scenario.price.toString());
    setExtraContext(`النموذج المختار: ${scenario.title} (${scenario.subtitle}). ${scenario.description}`);
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">محلل شارتات القناص المؤسسي</h2>
            <p className="text-xs text-slate-400">
              ارفع شارت MT5 أو TradingView أو الصق من الحافظة (Ctrl+V) للتحليل الفوري
            </p>
          </div>
        </div>

        {clipboardSuccess && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم لصق الصورة من الحافظة!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload Drop Zone / Preview */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 transition text-center cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${
            dragOver
              ? 'border-amber-400 bg-amber-500/5'
              : previewUrl
              ? 'border-slate-700 bg-slate-950/80 cursor-default'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {previewUrl ? (
            <div className="relative w-full flex flex-col items-center">
              <div className="max-h-52 overflow-hidden rounded-lg border border-slate-800 shadow-md">
                <img
                  src={previewUrl}
                  alt="Chart Preview"
                  className="max-h-52 object-contain rounded"
                />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تم تحميل الشارت بنجاح
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage();
                  }}
                  className="text-xs text-rose-400 hover:underline px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800/40"
                >
                  حذف وتغيير الصورة
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-amber-400 shadow-inner">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  اسحب وأفلت لقطة الشاشة هنا أو <span className="text-amber-400 hover:underline">تصفح الملفات</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  يدعم صور MT5 و TradingView، أو اضغط <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[11px] font-mono text-slate-300">Ctrl+V</kbd> للصق لقطة الشاشة مباشرة
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Preset Scenarios Quick Selectors */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>أو اختر نموذجاً مؤسسياً جاهزاً للمحاكاة والتدريب:</span>
            {selectedPreset && (
              <span className="text-amber-300 font-mono font-medium">
                النموذج النشط: {selectedPreset.title}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleChoosePreset(preset)}
                className={`p-2.5 rounded-xl text-right text-xs transition border flex flex-col justify-between ${
                  selectedPreset?.id === preset.id
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-sm'
                    : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-100 flex items-center justify-between">
                  <span>{preset.title}</span>
                  <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">
                    {preset.timeframe}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {preset.subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trade Parameters & Context Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1">
              الإطار الزمني للشارت (Timeframe)
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
            >
              <option value="1M">1M (القناص والسكالبينغ اللحظي)</option>
              <option value="5M">5M (التوازن والزخم)</option>
              <option value="15M">15M (النماذج والانضغاط)</option>
              <option value="1H">1H (الهيكل وكتل الطلب FVG)</option>
              <option value="4H">4H (الاتجاه الماكرو الحاكم)</option>
              <option value="1D">1D (خوارزميات الـ CTA الكبرى)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1">
              سعر الذهب عند اللقطة ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder={currentPrice.toString()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1">
              حالة المتداول / الاستفسار السريع
            </label>
            <input
              type="text"
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="مثال: عالق بصفقة بيع عند 2885$، هل أهدج؟"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isAnalyzing
              ? 'جاري تشغيل محرك القناص وفحص الشارت مؤسسياً...'
              : 'تشغيل التحليل المؤسسي وإصدار القرار التنفيذي (Execute Analysis)'}
          </span>
        </button>
      </form>
    </div>
  );
};
