import { PresetScenario, Candle, MacroIndicator, AlgoFootprintStatus } from '../types';
import { enrichCandlesWithIndicators } from '../utils/technicalCalculators';

function generateBaseCandles(startPrice: number, count: number, trend: 'up' | 'down' | 'squeeze' | 'sweep' | 'climax', timeframeMinutes: number): Candle[] {
  const candles: Candle[] = [];
  let currentPrice = startPrice;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const timestamp = now - i * timeframeMinutes * 60 * 1000;
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let delta = 0;
    let volatility = 1.2;
    let volume = 1200 + Math.floor(Math.random() * 800);

    if (trend === 'up') {
      delta = (Math.random() - 0.35) * 2.0;
      volatility = 1.8;
    } else if (trend === 'down') {
      delta = (Math.random() - 0.65) * 2.0;
      volatility = 1.8;
    } else if (trend === 'squeeze') {
      // Very tight contraction, volume steadily decreases
      delta = (Math.random() - 0.5) * 0.35;
      volatility = 0.45;
      volume = Math.max(300, 1500 - (count - i) * 18);
    } else if (trend === 'sweep') {
      if (i === 1) {
        // High wick sweep
        delta = 6.5;
        volatility = 8.0;
        volume = 4800;
      } else {
        delta = (Math.random() - 0.45) * 1.5;
      }
    } else if (trend === 'climax') {
      if (i <= 3) {
        delta = (Math.random() - 0.7) * 4.0;
        volatility = 5.0;
        volume = 5500;
      } else {
        delta = (Math.random() - 0.3) * 2.5;
      }
    }

    const open = currentPrice;
    const close = open + delta;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;

    currentPrice = close;

    candles.push({
      time: timeStr,
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });
  }

  return enrichCandlesWithIndicators(candles);
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'squeeze_breakout',
    title: 'انضغاط بولينجر شديد مع تناقص الفوليوم',
    subtitle: 'Bollinger Band Squeeze & Volatility Mean Reversion',
    timeframe: '15M',
    price: 2894.50,
    patternType: 'squeeze',
    description: 'انضغاط سعري حاد على فريم 15 دقيقة مع هبوط ATR إلى ما دون 30% من قمته، وتناقص مستمر في الفوليوم فوق EMA 200 مما يرجح انفجاراً صاعداً.',
    candles: generateBaseCandles(2891.0, 50, 'squeeze', 15),
  },
  {
    id: 'liquidity_sweep_pinbar',
    title: 'صيد سيولة قمة سابقة مع ذيل رفض طويل (Pin Bar)',
    subtitle: 'Institutional Stop Hunt & Liquidity Sweep',
    timeframe: '1M',
    price: 2908.20,
    patternType: 'liquidity_sweep',
    description: 'ضرب قمة سابقة عند 2914$ لضرب أوامر الستوبات، ثم تشكل شمعة رفض هابطة بفوليوم عملاق واستقرار فوري تحت EMA 50.',
    candles: generateBaseCandles(2902.0, 45, 'sweep', 1),
  },
  {
    id: 'ema50_dynamic_bounce',
    title: 'ارتداد دقيق واختبار ديناميكي على EMA 50',
    subtitle: 'Dynamic Equilibrium Bounce in Healthy Uptrend',
    timeframe: '5M',
    price: 2886.40,
    patternType: 'ema_bounce',
    description: 'ترند صاعد مؤسسي (EMA 20 > 50 > 200)، السعر يعود لاختبار EMA 50 بزاوية صاعدة مع تناقص فوليوم التصحيح وظهور شمعة ابتلاعية.',
    candles: generateBaseCandles(2875.0, 50, 'up', 5),
  },
  {
    id: 'wyckoff_spring',
    title: 'تجميع وايكوف ومرحلة السبرينغ (Spring Test)',
    subtitle: 'Wyckoff Accumulation Phase C & Order Block',
    timeframe: '1H',
    price: 2872.80,
    patternType: 'wyckoff_spring',
    description: 'نطاق تجميعي مؤسسي مع كسر كاذب للقاع ثم استعادة سريعة للرينج وفجوة FVG غير مغطاة بالأعلى تمهد لمرحلة الـ Markup.',
    candles: generateBaseCandles(2865.0, 60, 'up', 60),
  },
  {
    id: 'climax_reversal',
    title: 'ذروة شراء متطرفة مع شمعة انعكاس وفوليوم قياسي',
    subtitle: 'Buying Climax Reversal & Heavy Divergence',
    timeframe: '15M',
    price: 2924.60,
    patternType: 'climax_reversal',
    description: 'صعود حاد مدفوع بهلع الشراء مع تباعد سلبي صارخ على RSI وMACD، وظهور شمعة بيعية ضخمة تستنزف المشترين.',
    candles: generateBaseCandles(2910.0, 50, 'climax', 15),
  },
];

export const MOCK_MACRO_INDICATORS: MacroIndicator[] = [
  {
    name: 'مؤشر الدولار الأمريكي',
    code: 'DXY',
    value: '104.18',
    change: '-0.32%',
    isPositive: false,
    correlationWithGold: 'inverse',
    impactNote: 'ضعف الدولار يمنح الذهب دفعة سيولة شرائية مباشرة فوق مستويات الدعم.',
  },
  {
    name: 'عوائد السندات الأمريكية 10 سنوات',
    code: 'US10Y',
    value: '4.21%',
    change: '-1.45%',
    isPositive: false,
    correlationWithGold: 'inverse',
    impactNote: 'انخفاض العوائد يقلل تكلفة الفرصة البديلة لحيازة المعدن النفيس.',
  },
  {
    name: 'مؤشر الخوف والتقلب المالي',
    code: 'VIX',
    value: '16.40',
    change: '+3.10%',
    isPositive: true,
    correlationWithGold: 'direct',
    impactNote: 'ارتفاع طفيف في تحوط الملاذات الآمنة والطلب المؤسسي.',
  },
];

export const MOCK_ALGO_FOOTPRINT: AlgoFootprintStatus = {
  timeframe1D: {
    status: 'شراء الزخم المؤسسي (CTA Momentum Ignition)',
    type: 'momentum',
  },
  timeframe4H: {
    status: 'كتلة طلب مؤسسية نشطة (Bullish Order Block @ 2880-2884)',
    orderBlockLevel: 2882.5,
    type: 'bullish_ob',
  },
  timeframe1H: {
    status: 'فجوة سعرية غير مغطاة (FVG Target @ 2904-2908)',
    fvgLevel: '2905.50',
    type: 'imbalance_filling',
  },
  timeframe1M: {
    status: 'مراقبة صيد الستوبات اللحظي فوق القمة 2898.00',
    hftAction: 'stop_hunt',
  },
};
