export type Timeframe = '1M' | '5M' | '15M' | '1H' | '4H' | '1D';

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  bbUpper?: number;
  bbLower?: number;
  bbMiddle?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  atr?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageBase64?: string;
  mimeType?: string;
  imageFileName?: string;
  structured?: StructuredTradePlan | null;
  timestamp: string;
  isError?: boolean;
}

export type DecisionType = 'BUY' | 'SELL' | 'WAIT' | 'CLOSE' | 'HEDGE';

export interface TimeframeMomentumSignal {
  timeframe: string; // '1D' | '4H' | '1H' | '15M' | '5M' | '1M'
  label: string;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'REVERSAL' | 'UP' | 'DOWN';
  arrow: string; // '🟢 ⬆️' | '🔴 ⬇️' | '🟡 ↔️' | '⚠️ 🔄'
  bias?: string;
  details?: string;
  timeframeName?: string;
  explanation?: string;
}

export interface TradingViewMomentumGauge {
  summary?: {
    recommendation?: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' | string;
    arrow?: string;
    label?: string;
    score?: number;
    direction?: string;
  };
  movingAverages?: {
    signal?: 'BUY' | 'SELL' | 'NEUTRAL' | string;
    arrow?: string;
    details?: string;
    buyCount?: number;
    sellCount?: number;
    neutralCount?: number;
    label?: string;
    direction?: string;
  };
  oscillators?: {
    signal?: 'BUY' | 'SELL' | 'NEUTRAL' | string;
    arrow?: string;
    details?: string;
    buyCount?: number;
    sellCount?: number;
    neutralCount?: number;
    label?: string;
    direction?: string;
  };
  volumeFlow?: {
    signal?: 'BUY' | 'SELL' | 'NEUTRAL' | string;
    arrow?: string;
    details?: string;
    direction?: string;
    label?: string;
    isInstitutionalClimax?: boolean;
  };
}

export interface StructuredTradePlan {
  decision: DecisionType;
  entry: string | null;
  sl: string | null;
  tp1: string | null;
  tp2: string | null;
  tp3: string | null;
  quickNote?: string | null;
  timeframeSignals?: TimeframeMomentumSignal[];
  tvMomentumGauge?: TradingViewMomentumGauge;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: string;
  structured: StructuredTradePlan;
  timestamp: string;
  error?: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  subtitle: string;
  timeframe: Timeframe;
  price: number;
  patternType: 'squeeze' | 'liquidity_sweep' | 'ema_bounce' | 'death_cross' | 'climax_reversal' | 'wyckoff_spring';
  description: string;
  imageUrl?: string;
  mockAnalysis?: string;
  candles: Candle[];
}

export interface MicroAccountConfig {
  accountBalance: number; // e.g. 50, 100, 500, 1000 USD
  lotSize: number; // e.g. 0.01, 0.02
  entryPrice: number;
  stopLossPrice: number;
  tp1Price: number;
  tp2Price: number;
  tp3Price: number;
  leverage: number;
}

export interface MacroIndicator {
  name: string;
  code: string;
  value: string;
  change: string;
  isPositive: boolean;
  correlationWithGold: 'inverse' | 'direct' | 'neutral';
  impactNote: string;
}

export interface TradingViewQuote {
  symbol: string;
  name: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  recommendation?: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  rsi?: number;
  macd?: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  atr?: number;
  updatedAt: string;
}

export interface LiveMarketSummary {
  goldUSD: TradingViewQuote;
  goldEUR: TradingViewQuote;
  eurUSD: TradingViewQuote;
  dxy: TradingViewQuote;
  us10y: TradingViewQuote;
  timestamp: string;
  source: string;
}

export interface AlgoFootprintStatus {
  timeframe1D: {
    status: string;
    type: string;
  };
  timeframe4H: {
    status: string;
    orderBlockLevel?: number;
    type: string;
  };
  timeframe1H: {
    status: string;
    fvgLevel?: string;
    type: string;
  };
  timeframe1M: {
    status: string;
    hftAction?: string;
  };
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  autoSendSignals: boolean;
  minTargetDollars: number;
  enabled: boolean;
}

