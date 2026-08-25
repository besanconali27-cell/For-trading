import React, { useState, useMemo, useRef } from 'react';
import { Candle, Timeframe } from '../types';
import { Layers, Eye, Zap, Camera, Sliders, ChevronDown, Check, TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';

interface InteractiveGoldChartProps {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  onAnalyzeChartSnapshot: (chartImageBase64?: string, textPrompt?: string) => void;
  isAnalyzing: boolean;
}

export const InteractiveGoldChart: React.FC<InteractiveGoldChartProps> = ({
  candles,
  timeframe,
  onTimeframeChange,
  onAnalyzeChartSnapshot,
  isAnalyzing,
}) => {
  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showEma200, setShowEma200] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [activeSubchart, setActiveSubchart] = useState<'volume' | 'rsi' | 'macd' | 'atr'>('rsi');
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Calculate scales for rendering
  const minPrice = useMemo(() => {
    if (!candles.length) return 0;
    const lows = candles.map((c) => Math.min(c.low, showBollinger && c.bbLower ? c.bbLower : c.low));
    return Math.min(...lows) * 0.9995;
  }, [candles, showBollinger]);

  const maxPrice = useMemo(() => {
    if (!candles.length) return 0;
    const highs = candles.map((c) => Math.max(c.high, showBollinger && c.bbUpper ? c.bbUpper : c.high));
    return Math.max(...highs) * 1.0005;
  }, [candles, showBollinger]);

  const priceRange = maxPrice - minPrice || 1;

  // Chart dimensions
  const svgWidth = 800;
  const mainChartHeight = 320;
  const subchartHeight = 90;
  const totalSvgHeight = mainChartHeight + subchartHeight + 25;

  const candleCount = candles.length;
  const candleWidth = Math.max(4, Math.min(18, (svgWidth - 60) / Math.max(1, candleCount)));
  const spacing = candleWidth * 1.35;

  const getY = (price: number) => {
    return mainChartHeight - ((price - minPrice) / priceRange) * (mainChartHeight - 20) - 10;
  };

  // EMA 50 Angle / Slope analysis
  const lastCandle = candles[candles.length - 1];
  const prev5Candle = candles[Math.max(0, candles.length - 6)];
  const ema50Diff = lastCandle && prev5Candle && lastCandle.ema50 && prev5Candle.ema50
    ? lastCandle.ema50 - prev5Candle.ema50
    : 0;
  const ema50Angle = ema50Diff > 0.4 ? 'صاعد قوي ↗' : ema50Diff < -0.4 ? 'هابط قوي ↘' : 'مسطح / تذبذب ↔';

  // Function to take SVG snapshot for Gemini
  const handleCaptureAndAnalyze = () => {
    if (!chartContainerRef.current) {
      onAnalyzeChartSnapshot();
      return;
    }

    try {
      const svgElement = chartContainerRef.current.querySelector('svg');
      if (svgElement) {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const URLObj = window.URL || (window as any).webkitURL;
        const blobURL = URLObj.createObjectURL(svgBlob);
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = svgWidth * 1.5;
          canvas.height = totalSvgHeight * 1.5;
          const context = canvas.getContext('2d');
          if (context) {
            context.fillStyle = '#0f172a';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const pngBase64 = canvas.toDataURL('image/png');
            onAnalyzeChartSnapshot(
              pngBase64,
              `تحليل فني لحظي لشارت الذهب التفاعلي على فريم ${timeframe}. السعر الحالي ${lastCandle?.close || ''}$.`
            );
          } else {
            onAnalyzeChartSnapshot();
          }
        };
        image.src = blobURL;
      } else {
        onAnalyzeChartSnapshot();
      }
    } catch {
      onAnalyzeChartSnapshot();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col">
      {/* Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          {(['1M', '5M', '15M', '1H', '4H', '1D'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition ${
                timeframe === tf
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicators Overlay Toggle */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <button
            onClick={() => setShowEma20(!showEma20)}
            className={`px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 transition border ${
              showEma20
                ? 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-950/40 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            EMA 20
          </button>

          <button
            onClick={() => setShowEma50(!showEma50)}
            className={`px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 transition border ${
              showEma50
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                : 'bg-slate-950/40 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            EMA 50 ({ema50Angle})
          </button>

          <button
            onClick={() => setShowEma200(!showEma200)}
            className={`px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 transition border ${
              showEma200
                ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                : 'bg-slate-950/40 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            EMA 200
          </button>

          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 transition border ${
              showBollinger
                ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                : 'bg-slate-950/40 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            BBands (20,2)
          </button>
        </div>

        {/* Action: Send to Institutional AI */}
        <button
          onClick={handleCaptureAndAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 disabled:opacity-50"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isAnalyzing ? 'جاري فحص القناص...' : 'تحليل الشارت مؤسسياً (AI)'}</span>
        </button>
      </div>

      {/* Candle Hover Info Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono py-2 text-slate-400 px-1 border-b border-slate-800/40 overflow-x-auto scrollbar-none">
        {hoveredCandle ? (
          <div className="flex items-center gap-4 text-slate-300">
            <span>الوقت: <strong className="text-white">{hoveredCandle.time}</strong></span>
            <span>O: <strong className="text-white">{hoveredCandle.open.toFixed(2)}</strong></span>
            <span>H: <strong className="text-emerald-400">{hoveredCandle.high.toFixed(2)}</strong></span>
            <span>L: <strong className="text-rose-400">{hoveredCandle.low.toFixed(2)}</strong></span>
            <span>C: <strong className={hoveredCandle.close >= hoveredCandle.open ? 'text-emerald-400' : 'text-rose-400'}>{hoveredCandle.close.toFixed(2)}</strong></span>
            <span>Vol: <strong className="text-amber-300">{hoveredCandle.volume}</strong></span>
            <span>RSI: <strong className="text-cyan-300">{hoveredCandle.rsi?.toFixed(1) || '--'}</strong></span>
          </div>
        ) : lastCandle ? (
          <div className="flex items-center gap-4 text-slate-300">
            <span>آخر إغلاق: <strong className={lastCandle.close >= lastCandle.open ? 'text-emerald-400' : 'text-rose-400'}>${lastCandle.close.toFixed(2)}</strong></span>
            <span>EMA50: <strong className="text-amber-300">${lastCandle.ema50?.toFixed(2) || '--'}</strong></span>
            <span>EMA200: <strong className="text-purple-300">${lastCandle.ema200?.toFixed(2) || '--'}</strong></span>
            <span>RSI(14): <strong className={Number(lastCandle.rsi) > 50 ? 'text-emerald-400' : 'text-rose-400'}>{lastCandle.rsi?.toFixed(1) || '--'}</strong></span>
            <span>ATR(14): <strong className="text-blue-300">${lastCandle.atr?.toFixed(2) || '--'}</strong></span>
          </div>
        ) : (
          <div>مرر المؤشر فوق الشموع لعرض التفاصيل الرقمية الدقيقة</div>
        )}
      </div>

      {/* SVG Canvas Rendering Area */}
      <div ref={chartContainerRef} className="relative w-full overflow-hidden bg-slate-950/60 rounded-xl my-2 border border-slate-800/80">
        <svg
          viewBox={`0 0 ${svgWidth} ${totalSvgHeight}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            {/* Background Gradient */}
            <linearGradient id="chartBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
            </linearGradient>

            {/* Bollinger Band Shading */}
            <linearGradient id="bbShading" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Grid lines & Price Levels */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = mainChartHeight * ratio;
            const priceVal = maxPrice - ratio * priceRange;
            return (
              <g key={ratio}>
                <line x1="0" y1={y} x2={svgWidth - 60} y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                <text x={svgWidth - 55} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace">
                  ${priceVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Bollinger Band Area */}
          {showBollinger && candles.length > 1 && (
            <path
              d={
                candles.map((c, i) => {
                  const x = 30 + i * spacing;
                  const y = getY(c.bbUpper || c.high);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ') +
                ' ' +
                candles.slice().reverse().map((c, i) => {
                  const origIdx = candles.length - 1 - i;
                  const x = 30 + origIdx * spacing;
                  const y = getY(c.bbLower || c.low);
                  return `L ${x} ${y}`;
                }).join(' ') +
                ' Z'
              }
              fill="url(#bbShading)"
              stroke="#3b82f6"
              strokeWidth="0.75"
              strokeDasharray="2 2"
              opacity="0.7"
            />
          )}

          {/* EMA 200 Line */}
          {showEma200 && (
            <path
              d={candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${30 + i * spacing} ${getY(c.ema200 || c.close)}`).join(' ')}
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.5"
              opacity="0.8"
            />
          )}

          {/* EMA 50 Line */}
          {showEma50 && (
            <path
              d={candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${30 + i * spacing} ${getY(c.ema50 || c.close)}`).join(' ')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
          )}

          {/* EMA 20 Line */}
          {showEma20 && (
            <path
              d={candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${30 + i * spacing} ${getY(c.ema20 || c.close)}`).join(' ')}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.25"
            />
          )}

          {/* Candlesticks Rendering */}
          {candles.map((c, i) => {
            const x = 30 + i * spacing;
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const isBullish = c.close >= c.open;
            const color = isBullish ? '#10b981' : '#f43f5e';
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));

            return (
              <g
                key={c.timestamp || i}
                onMouseEnter={() => setHoveredCandle(c)}
                className="transition-opacity hover:opacity-80"
              >
                {/* Wick */}
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />

                {/* Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBullish ? '#10b981' : '#f43f5e'}
                  rx="1"
                />
              </g>
            );
          })}

          {/* Divider between Main Chart & Subchart */}
          <line
            x1="0"
            y1={mainChartHeight}
            x2={svgWidth}
            y2={mainChartHeight}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Subchart Area (RSI / MACD / Volume / ATR) */}
          {activeSubchart === 'rsi' && (
            <g transform={`translate(0, ${mainChartHeight + 10})`}>
              {/* RSI 70 / 50 / 30 guide lines */}
              <line x1="0" y1={subchartHeight * 0.3} x2={svgWidth - 60} y2={subchartHeight * 0.3} stroke="#ef4444" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.6" />
              <text x={svgWidth - 55} y={subchartHeight * 0.3 + 3} fill="#ef4444" fontSize="8" fontFamily="monospace">70 (تشبع)</text>

              <line x1="0" y1={subchartHeight * 0.5} x2={svgWidth - 60} y2={subchartHeight * 0.5} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.7" />
              <text x={svgWidth - 55} y={subchartHeight * 0.5 + 3} fill="#f59e0b" fontSize="8" fontFamily="monospace">50 (الوسط)</text>

              <line x1="0" y1={subchartHeight * 0.7} x2={svgWidth - 60} y2={subchartHeight * 0.7} stroke="#10b981" strokeDasharray="2 2" strokeWidth="0.8" opacity="0.6" />
              <text x={svgWidth - 55} y={subchartHeight * 0.7 + 3} fill="#10b981" fontSize="8" fontFamily="monospace">30 (تشبع)</text>

              {/* RSI Curve */}
              <path
                d={candles.map((c, i) => {
                  const rsiVal = c.rsi || 50;
                  const y = subchartHeight - (rsiVal / 100) * subchartHeight;
                  return `${i === 0 ? 'M' : 'L'} ${30 + i * spacing} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
            </g>
          )}

          {activeSubchart === 'macd' && (
            <g transform={`translate(0, ${mainChartHeight + 10})`}>
              {/* Zero line */}
              <line x1="0" y1={subchartHeight * 0.5} x2={svgWidth - 60} y2={subchartHeight * 0.5} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
              <text x={svgWidth - 55} y={subchartHeight * 0.5 + 3} fill="#64748b" fontSize="8" fontFamily="monospace">0.0 (Zero)</text>

              {/* Histogram bars */}
              {candles.map((c, i) => {
                const hist = c.macdHist || 0;
                const zeroY = subchartHeight * 0.5;
                const barHeight = Math.min(subchartHeight * 0.45, Math.abs(hist) * 20);
                const isPositive = hist >= 0;
                return (
                  <rect
                    key={i}
                    x={30 + i * spacing - candleWidth / 2}
                    y={isPositive ? zeroY - barHeight : zeroY}
                    width={candleWidth}
                    height={Math.max(1, barHeight)}
                    fill={isPositive ? '#10b981' : '#f43f5e'}
                    opacity="0.85"
                  />
                );
              })}

              {/* MACD Line */}
              <path
                d={candles.map((c, i) => {
                  const y = subchartHeight * 0.5 - (c.macd || 0) * 15;
                  return `${i === 0 ? 'M' : 'L'} ${30 + i * spacing} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.2"
              />
            </g>
          )}

          {activeSubchart === 'volume' && (
            <g transform={`translate(0, ${mainChartHeight + 10})`}>
              {candles.map((c, i) => {
                const maxVol = Math.max(...candles.map((cd) => cd.volume || 1000));
                const barHeight = ((c.volume || 500) / maxVol) * (subchartHeight - 10);
                const isBullish = c.close >= c.open;
                const isClimax = c.volume > maxVol * 0.85;
                return (
                  <g key={i}>
                    <rect
                      x={30 + i * spacing - candleWidth / 2}
                      y={subchartHeight - barHeight}
                      width={candleWidth}
                      height={barHeight}
                      fill={isClimax ? '#fbbf24' : isBullish ? '#10b981' : '#f43f5e'}
                      opacity={isClimax ? 1 : 0.65}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {activeSubchart === 'atr' && (
            <g transform={`translate(0, ${mainChartHeight + 10})`}>
              {/* ATR Curve */}
              <path
                d={candles.map((c, i) => {
                  const maxAtr = Math.max(...candles.map((cd) => cd.atr || 3));
                  const atrVal = c.atr || 2;
                  const y = subchartHeight - (atrVal / (maxAtr || 1)) * (subchartHeight - 15);
                  return `${i === 0 ? 'M' : 'L'} ${30 + i * spacing} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Subchart Selector Tabs */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-1">
          <span className="text-slate-400 text-[11px] ml-2">المؤشر المساعد:</span>
          {(['rsi', 'macd', 'volume', 'atr'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubchart(tab)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                activeSubchart === tab
                  ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'rsi' ? 'RSI (14)' : tab === 'macd' ? 'MACD (12,26,9)' : tab === 'volume' ? 'Volumes (البنوك)' : 'ATR (التقلب)'}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-amber-400"></span>
            EMA50: الميزان الديناميكي
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-purple-400"></span>
            EMA200: الترند الاستراتيجي
          </span>
        </div>
      </div>
    </div>
  );
};
