import { Candle, MicroAccountConfig } from '../types';

export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  if (data.length === 0) return [];

  // Simple average for initial value
  let sum = 0;
  const initialPeriod = Math.min(period, data.length);
  for (let i = 0; i < initialPeriod; i++) {
    sum += data[i];
  }
  let currentEma = sum / initialPeriod;
  emaArray.push(currentEma);

  for (let i = 1; i < data.length; i++) {
    currentEma = data[i] * k + currentEma * (1 - k);
    emaArray.push(currentEma);
  }
  return emaArray;
}

export function calculateRSI(closes: number[], period = 14): number[] {
  if (closes.length < period + 1) return closes.map(() => 50);

  const rsis: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(Math.max(0, diff));
    losses.push(Math.max(0, -diff));
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // First RSI value
  for (let i = 0; i < period; i++) {
    rsis.push(50);
  }

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsis.push(100 - 100 / (1 + rs));

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsis.push(100 - 100 / (1 + rs));
  }

  return rsis;
}

export function calculateATR(candles: { high: number; low: number; close: number }[], period = 14): number[] {
  if (candles.length === 0) return [];
  const trs: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      trs.push(candles[i].high - candles[i].low);
    } else {
      const hl = candles[i].high - candles[i].low;
      const hc = Math.abs(candles[i].high - candles[i - 1].close);
      const lc = Math.abs(candles[i].low - candles[i - 1].close);
      trs.push(Math.max(hl, hc, lc));
    }
  }

  const atrs: number[] = [];
  let sum = 0;
  for (let i = 0; i < Math.min(period, trs.length); i++) {
    sum += trs[i];
  }
  let currentAtr = sum / Math.min(period, trs.length);

  for (let i = 0; i < trs.length; i++) {
    if (i < period) {
      atrs.push(currentAtr);
    } else {
      currentAtr = (currentAtr * (period - 1) + trs[i]) / period;
      atrs.push(currentAtr);
    }
  }

  return atrs;
}

export function enrichCandlesWithIndicators(rawCandles: Candle[]): Candle[] {
  if (!rawCandles || rawCandles.length === 0) return [];

  const closes = rawCandles.map((c) => c.close);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);
  const rsis = calculateRSI(closes, 14);
  const atrs = calculateATR(rawCandles, 14);

  // MACD: Fast 12 EMA - Slow 26 EMA
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12.map((val, idx) => val - ema26[idx]);
  const macdSignal = calculateEMA(macdLine, 9);

  return rawCandles.map((c, idx) => {
    // Bollinger bands on 20 period SMA
    const windowStart = Math.max(0, idx - 19);
    const windowCloses = closes.slice(windowStart, idx + 1);
    const sma = windowCloses.reduce((a, b) => a + b, 0) / windowCloses.length;
    const variance = windowCloses.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / windowCloses.length;
    const stdDev = Math.sqrt(variance);

    const bbUpper = sma + stdDev * 2;
    const bbLower = sma - stdDev * 2;
    const bbMiddle = sma;

    return {
      ...c,
      ema20: ema20[idx] || c.close,
      ema50: ema50[idx] || c.close,
      ema200: ema200[idx] || c.close,
      bbUpper,
      bbLower,
      bbMiddle,
      rsi: rsis[idx] || 50,
      macd: macdLine[idx] || 0,
      macdSignal: macdSignal[idx] || 0,
      macdHist: (macdLine[idx] || 0) - (macdSignal[idx] || 0),
      atr: atrs[idx] || 2.5,
    };
  });
}

// Contraction / Expansion Metrics
export function analyzeVolatilityRegime(candles: Candle[]) {
  if (candles.length < 20) {
    return {
      regime: 'NORMAL',
      squeezeIntensity: 45,
      isSqueeze: false,
      atrDropPercent: 30,
      volumeDecayPercent: 25,
      continuationBias: 'NEUTRAL',
      summary: 'بيانات غير كافية لتقييم دورة الانضغاط بدقة عالية.',
    };
  }

  const lastCandle = candles[candles.length - 1];
  const last20Candles = candles.slice(-20);
  const maxAtrInPeriod = Math.max(...candles.map((c) => c.atr || 2.5));
  const currentAtr = lastCandle.atr || 2.5;

  const atrRatio = maxAtrInPeriod > 0 ? (currentAtr / maxAtrInPeriod) * 100 : 50;
  const isAtrCompressed = atrRatio < 35; // ATR compressed compared to recent peak

  const bbWidth = ((lastCandle.bbUpper || lastCandle.close * 1.01) - (lastCandle.bbLower || lastCandle.close * 0.99)) / (lastCandle.close || 1);
  const bbWidthPercent = bbWidth * 100;
  const isBBSqueeze = bbWidthPercent < 0.25;

  // Volume decay in recent 10 candles vs earlier
  const recentVolume = last20Candles.slice(-7).reduce((acc, c) => acc + c.volume, 0) / 7;
  const prevVolume = last20Candles.slice(0, 13).reduce((acc, c) => acc + c.volume, 0) / 13;
  const volumeDecay = prevVolume > 0 ? Math.max(0, ((prevVolume - recentVolume) / prevVolume) * 100) : 0;

  let squeezeScore = 0;
  if (isAtrCompressed) squeezeScore += 40;
  if (isBBSqueeze) squeezeScore += 40;
  if (volumeDecay > 20) squeezeScore += 20;

  // Directional bias check
  const aboveEma50 = lastCandle.close > (lastCandle.ema50 || lastCandle.close);
  const aboveEma200 = lastCandle.close > (lastCandle.ema200 || lastCandle.close);
  const emaSlopeUp = (lastCandle.ema50 || 0) > (candles[candles.length - 5]?.ema50 || 0);

  let continuationBias = 'NEUTRAL';
  if (aboveEma50 && aboveEma200 && emaSlopeUp) {
    continuationBias = 'BULLISH_CONTINUATION';
  } else if (!aboveEma50 && !aboveEma200 && !emaSlopeUp) {
    continuationBias = 'BEARISH_CONTINUATION';
  } else {
    continuationBias = 'RANGE_UNCERTAIN';
  }

  return {
    regime: squeezeScore >= 60 ? 'CONTRACTION_SQUEEZE' : squeezeScore <= 20 ? 'EXPANSION_VOLATILE' : 'EQUILIBRIUM',
    squeezeIntensity: Math.min(100, squeezeScore),
    isSqueeze: squeezeScore >= 60,
    currentAtr,
    maxAtrInPeriod,
    atrRatio: Math.round(atrRatio),
    bbWidthPercent: Number(bbWidthPercent.toFixed(3)),
    volumeDecay: Math.round(volumeDecay),
    continuationBias,
    aboveEma50,
    aboveEma200,
  };
}

// Micro-Account Calculations
// For Gold (XAUUSD): 1 Standard Lot = 100 oz. 1 Micro Lot (0.01) = 1 oz.
// Therefore, a $1.00 move in Gold price = $1.00 P&L per 0.01 lot.
export function calculateMicroRisk(config: MicroAccountConfig) {
  const { accountBalance, lotSize, entryPrice, stopLossPrice, tp1Price, tp2Price, tp3Price } = config;

  const slPriceDiff = Math.abs(entryPrice - stopLossPrice);
  const slTotalRiskUSD = slPriceDiff * lotSize * 100; // 0.01 lot * 100 = 1 oz multiplier
  const riskPercentOfBalance = accountBalance > 0 ? (slTotalRiskUSD / accountBalance) * 100 : 0;

  const tp1Diff = Math.abs(tp1Price - entryPrice);
  const tp1ProfitUSD = tp1Diff * lotSize * 100;
  const tp1RiskReward = slPriceDiff > 0 ? (tp1Diff / slPriceDiff).toFixed(2) : '1.0';

  const tp2Diff = Math.abs(tp2Price - entryPrice);
  const tp2ProfitUSD = tp2Diff * lotSize * 100;

  const tp3Diff = Math.abs(tp3Price - entryPrice);
  const tp3ProfitUSD = tp3Diff * lotSize * 100;

  // Strict micro rules check
  const isStrictRiskValid = slTotalRiskUSD <= 0.60; // strictly within -0.20 to -0.60 EUR/USD for tight sniper micro trading

  return {
    slPriceDiff: Number(slPriceDiff.toFixed(2)),
    slTotalRiskUSD: Number(slTotalRiskUSD.toFixed(2)),
    riskPercentOfBalance: Number(riskPercentOfBalance.toFixed(2)),
    tp1ProfitUSD: Number(tp1ProfitUSD.toFixed(2)),
    tp1RiskReward,
    tp2ProfitUSD: Number(tp2ProfitUSD.toFixed(2)),
    tp3ProfitUSD: Number(tp3ProfitUSD.toFixed(2)),
    isStrictRiskValid,
    breakevenRule: 'عند وصول السعر للهدف الأول TP1، يتم نقل الستوب فوراً لسعر الدخول لتأمين الحساب 100%.',
  };
}
