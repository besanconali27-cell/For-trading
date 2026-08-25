import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInputBar } from './components/ChatInputBar';
import { PromptSuggestions } from './components/PromptSuggestions';
import { StrategyRulebookModal } from './components/StrategyRulebookModal';
import { SettingsModal } from './components/SettingsModal';
import { TradingViewWidget } from './components/TradingViewWidget';
import { ChatMessage, Timeframe, StructuredTradePlan, LiveMarketSummary, MacroIndicator, TelegramConfig } from './types';
import { MOCK_MACRO_INDICATORS } from './data/mockMarketData';
import { Sparkles, Bot, ShieldCheck, Crosshair, RefreshCw, Layers, ArrowDown, ExternalLink, LineChart } from 'lucide-react';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg-1',
  role: 'model',
  text: `### مرحباً بك في منصة Khamis for trading
مستشارك المالي المؤسسي المتخصص حصراً في تداول الذهب (**XAUUSD / XAUEUR / GOLDm#** على MetaTrader 5 و TradingView).

📊 **نظام التحليل الفني الشامل والمطابق لقراءة الشارتات ومنصة [TradingView](https://www.tradingview.com/)**:
1. **قراءة الشارت البصرية الدقيقة:** فحص موقع السعر من خط EMA 50، ومؤشرات RSI و MACD بدقة لمنع التداول عكس الترند اللحظي.
2. **🧭 بوصلة اتجاه الزخم عبر الفريمات (Multi-Timeframe Momentum Direction):** أسهم اتجاهية دقيقة (🟢 ⬆️ صاعد / 🔴 ⬇️ هابط / 🟡 ↔️ تذبذب وانضغاط).
3. **📈 تحليل TradingView العميق لزخم البيع والشراء:** قراءة موازين المؤشرات (الملخص العام، المتوسطات المتحركة MAs، مؤشرات التذبذب Oscillators، وتدفق الفوليوم).
4. **حماية وإدارة حسابات المايكرو باليورو (€):** وقف خسارة صارم، خطط تأمين Breakeven فوري، والتهديج (Hedge) لحماية الهامش (Margin Level) من المارجن كول.

📸 **يمكنك سحب وإفلات صورة الشارت مباشرة في أي مكان على الشاشة (Drag & Drop)، أو لصقها (Ctrl+V)، أو استخدام زر إرفاق شارت**، وسيقوم النظام بتشخيص الوضع فوراً وإعطاء التوجيه التنفيذي السريع (مثل: *👉 أغلق/اشتري/بع عند كذا مستهدفاً كذا*).`,
  timestamp: new Date().toISOString(),
  structured: {
    decision: 'CLOSE',
    entry: '4634.21 - 4634.50',
    sl: '4632.50',
    tp1: '4638.19',
    tp2: '4642.50',
    tp3: '4648.00',
    quickNote: 'أغلق صفقة الشراء المفتوحة عند 4634.21 فوراً بالربح 0.00€ لإنقاذ الهامش ورفع المارجن ليفل فوق 200%، ولا تفتح أي شراء جديد طالما أن السعر يتداول أسفل EMA 50.',
    timeframeSignals: [
      { timeframe: '1D', timeframeName: 'اليومي', direction: 'UP', arrow: '🟢 ⬆️', label: 'صاعد بالمتوسطات', explanation: 'صاعد بالمتوسطات مع تحذير تشبع 70 RSI' },
      { timeframe: '4H', timeframeName: '4 ساعات', direction: 'DOWN', arrow: '🔴 ⬇️', label: 'تصحيح هابط', explanation: 'تصحيح هابط لتفريغ المتذبذبات' },
      { timeframe: '1H', timeframeName: '1 ساعة', direction: 'DOWN', arrow: '🔴 ⬇️', label: 'ضغط بيعي', explanation: 'ضغط بيعي وتغطية فجوات هابطة' },
      { timeframe: '15M', timeframeName: '15 دقيقة', direction: 'DOWN', arrow: '🔴 ⬇️', label: 'كسر دعوم', explanation: 'كسر دعوم واستمرار التمدد الهابط' },
      { timeframe: '5M', timeframeName: '5 دقائق', direction: 'DOWN', arrow: '🔴 ⬇️', label: 'ضغط فوليوم بيعي', explanation: 'ضغط فوليوم بيعي مستمر' },
      { timeframe: '1M', timeframeName: '1 دقيقة (القناص)', direction: 'DOWN', arrow: '🔴 ⬇️', label: 'هابط صريح', explanation: 'هابط صريح أسفل EMA 50 ومؤشر RSI=42' },
    ],
    tvMomentumGauge: {
      summary: { recommendation: 'BUY', score: 65, direction: 'UP', arrow: '🟢 ⬆️', label: 'شراء (14 شراء / 6 بيع)' },
      movingAverages: { buyCount: 12, sellCount: 1, neutralCount: 1, direction: 'UP', arrow: '🟢 ⬆️', label: 'شراء قوي (12 شراء من أصل 14)' },
      oscillators: { buyCount: 2, sellCount: 5, neutralCount: 4, direction: 'DOWN', arrow: '🔴 ⬇️', label: 'بيع صريح (RSI=70.46 و Stoch=92.38 في ذروة الشراء)' },
      volumeFlow: { direction: 'DOWN', arrow: '🔴 ⬇️', label: 'جني أرباح مؤسسي وهبوط تصحيحي لحظي', isInstitutionalClimax: true },
    },
  },
};

export default function App() {
  const [currentPrice, setCurrentPrice] = useState<number>(2894.50);
  const [priceChange, setPriceChange] = useState<number>(14.20);
  const [high24h, setHigh24h] = useState<number>(2912.80);
  const [low24h, setLow24h] = useState<number>(2878.40);
  const [spreadPips, setSpreadPips] = useState<number>(1.2);
  const [timeframe, setTimeframe] = useState<Timeframe>('15M');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [liveMarketSummary, setLiveMarketSummary] = useState<LiveMarketSummary | null>(null);
  const [isShowChart, setIsShowChart] = useState<boolean>(false);
  const [isGlobalDragOver, setIsGlobalDragOver] = useState<boolean>(false);

  const [macroIndicators, setMacroIndicators] = useState<MacroIndicator[]>(MOCK_MACRO_INDICATORS);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRulebookOpen, setIsRulebookOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Telegram Bot Configuration
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    try {
      const saved = localStorage.getItem('telegram_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse telegram_config from localStorage:', e);
    }
    return {
      botToken: '',
      chatId: '',
      autoSendSignals: true,
      minTargetDollars: 6.0,
      enabled: false,
    };
  });

  const handleSaveTelegramConfig = (newConfig: TelegramConfig) => {
    setTelegramConfig(newConfig);
    try {
      localStorage.setItem('telegram_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to save telegram_config to localStorage:', e);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch real-time market data from TradingView backend
  const fetchLiveMarket = async () => {
    try {
      const res = await fetch('/api/market-data');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        const data: LiveMarketSummary = json.data;
        setLiveMarketSummary(data);
        if (data.goldUSD && data.goldUSD.price > 0) {
          setCurrentPrice(data.goldUSD.price);
          setPriceChange(data.goldUSD.change);
          if (data.goldUSD.high) setHigh24h(data.goldUSD.high);
          if (data.goldUSD.low) setLow24h(data.goldUSD.low);
        }

        // Update Macro Indicators
        if (data.dxy || data.us10y || data.eurUSD) {
          setMacroIndicators([
            {
              name: 'مؤشر الدولار',
              code: 'DXY',
              value: data.dxy.price ? data.dxy.price.toFixed(2) : '106.40',
              change: data.dxy.change ? `${data.dxy.change > 0 ? '+' : ''}${data.dxy.change.toFixed(2)}` : '+0.15',
              isPositive: (data.dxy.change || 0) >= 0,
              correlationWithGold: 'inverse',
              impactNote: 'علاقة عكسية قوية مع الذهب - صعود الدولار يضغط على الذهب هبوطاً',
            },
            {
              name: 'عوائد السندات الأمريكية 10 سنوات',
              code: 'US10Y',
              value: data.us10y.price ? `${data.us10y.price.toFixed(2)}%` : '4.42%',
              change: data.us10y.change ? `${data.us10y.change > 0 ? '+' : ''}${data.us10y.change.toFixed(2)}%` : '-0.03%',
              isPositive: (data.us10y.change || 0) >= 0,
              correlationWithGold: 'inverse',
              impactNote: 'ارتفاع العوائد يزيد تكلفة الفرصة البديلة لحيازة الذهب',
            },
            {
              name: 'سعر صرف اليورو/دولار',
              code: 'EUR/USD',
              value: data.eurUSD.price ? data.eurUSD.price.toFixed(4) : '1.0845',
              change: data.eurUSD.change ? `${data.eurUSD.change > 0 ? '+' : ''}${data.eurUSD.change.toFixed(4)}` : '-0.0012',
              isPositive: (data.eurUSD.change || 0) >= 0,
              correlationWithGold: 'direct',
              impactNote: 'يحدد سعر الذهب باليورو (XAUEUR) لحسابات المايكرو',
            },
            {
              name: 'الذهب باليورو',
              code: 'XAUEUR',
              value: data.goldEUR.price ? `€${data.goldEUR.price.toFixed(2)}` : '€2668.50',
              change: data.goldEUR.change ? `${data.goldEUR.change > 0 ? '+' : ''}${data.goldEUR.change.toFixed(2)}€` : '+12.40€',
              isPositive: (data.goldEUR.change || 0) >= 0,
              correlationWithGold: 'direct',
              impactNote: 'التسعير الفعلي باليورو لحساب المايكرو الخاص بك',
            },
          ]);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch live market data:', e);
    }
  };

  // Initial fetch and continuous interval polling for real TradingView quotes
  useEffect(() => {
    fetchLiveMarket();
    const interval = setInterval(() => {
      fetchLiveMarket();
    } , 6000);
    return () => clearInterval(interval);
  }, []);

  // Clear / Reset Chat
  const handleClearChat = () => {
    setMessages([{
      ...INITIAL_WELCOME_MESSAGE,
      id: `welcome-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }]);
  };

  // Send Message Handler
  const handleSendMessage = async (payload: {
    text: string;
    imageBase64?: string;
    mimeType?: string;
    imageFileName?: string;
  }) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: payload.text,
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType,
      imageFileName: payload.imageFileName,
      timestamp: new Date().toISOString(),
    };

    // If this is a new chart analysis (image attached), clear past analyses to prevent mixing old and new context
    const baseMessages = payload.imageBase64 ? [] : messages.filter((m) => !m.isError);
    const updatedMessages = [...baseMessages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build conversation payload for backend (if new chart, send only the fresh request)
      const apiMessages = (payload.imageBase64 ? [userMessage] : updatedMessages).map((m) => ({
        role: m.role,
        text: m.text,
        imageBase64: m.imageBase64,
        mimeType: m.mimeType,
      }));

      const eurPrice = liveMarketSummary?.goldEUR?.price || (currentPrice / 1.0845);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          currentPrice,
          timeframe,
          extraContext: `بيانات السوق الحية من TradingView: الذهب بالدولار $${currentPrice}، الذهب باليورو €${eurPrice.toFixed(2)}، العملة المختارة لحساب المايكرو: ${selectedCurrency} (€). فريم التداول: ${timeframe}`,
        }),
      });

      const data = await res.json();

      if (data.success && data.text) {
        if (data.liveMarket) {
          setLiveMarketSummary(data.liveMarket);
        }
        const botMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.text,
          structured: data.structured,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);

        // Auto-send signal to Telegram if configured and signal is actionable (BUY / SELL / HEDGE)
        if (
          telegramConfig.enabled &&
          telegramConfig.autoSendSignals &&
          telegramConfig.botToken &&
          telegramConfig.chatId &&
          data.structured &&
          (data.structured.decision === 'BUY' ||
            data.structured.decision === 'SELL' ||
            data.structured.decision === 'HEDGE')
        ) {
          fetch('/api/telegram/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              botToken: telegramConfig.botToken,
              chatId: telegramConfig.chatId,
              plan: data.structured,
              note: data.structured.quickNote,
              livePrice: currentPrice,
              symbol: selectedCurrency === 'EUR' ? 'XAUEUR (Gold EUR)' : 'XAUUSD (Gold USD)',
            }),
          }).catch((err) => console.warn('Auto Telegram signal dispatch failed:', err));
        }
      } else {
        let cleanError = data.error || 'الخدمة مشغولة مؤقتاً، يرجى المحاولة مرة أخرى.';
        if (cleanError.includes('503') || cleanError.includes('high demand') || cleanError.includes('UNAVAILABLE')) {
          cleanError = 'الخادم يواجه ضغطاً لحظياً مرتفعاً على النموذج. يمكنك إعادة إرسال الرسالة الآن وسيتم معالجتها فوراً.';
        }
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'model',
          text: `⚠️ **تنبيه مؤقت**: ${cleanError}`,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: `⚠️ **خطأ في الاتصال**: تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPromptSuggestion = (promptText: string) => {
    handleSendMessage({ text: promptText });
  };

  const displayedPrice = selectedCurrency === 'EUR'
    ? (liveMarketSummary?.goldEUR?.price || (currentPrice / 1.0845))
    : currentPrice;

  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isGlobalDragOver) setIsGlobalDragOver(true);
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only turn off if leaving window bounds
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsGlobalDragOver(false);
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        if (base64) {
          handleSendMessage({
            text: 'يرجى تحليل شارت الذهب المرفق بدقة استناداً لقراءة الشارت الحالية ومؤشرات TradingView، وتقديم بوصلة الزخم وخطة الأهداف والوقف.',
            imageBase64: base64,
            mimeType: file.type || 'image/png',
            imageFileName: file.name || 'chart-screenshot.png',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 flex flex-col relative"
      dir="rtl"
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {/* Full-Screen Drag & Drop Overlay */}
      {isGlobalDragOver && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md border-4 border-dashed border-amber-400 flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-none">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-2xl mb-4 animate-bounce">
            <Crosshair className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">أفلت صورة شارت الذهب هنا لتحليلها فوراً</h2>
          <p className="text-sm text-slate-300 max-w-md">
            سيقوم النظام المؤسسي بقراءة الشارت ومطابقة بيانات TradingView اللحظية واستخراج بوصلة الفريمات والقرار التنفيذي المباشر.
          </p>
        </div>
      )}

      {/* Institutional Header & Live Ticker */}
      <Header
        currentPrice={currentPrice}
        priceChange={priceChange}
        high24h={high24h}
        low24h={low24h}
        spreadPips={spreadPips}
        macroIndicators={macroIndicators}
        isSqueeze={spreadPips < 1.1}
        onOpenRulebook={() => setIsRulebookOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        telegramConfig={telegramConfig}
        onRefreshPrice={fetchLiveMarket}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        onClearChat={handleClearChat}
        selectedCurrency={selectedCurrency}
        onToggleCurrency={setSelectedCurrency}
        liveMarketSummary={liveMarketSummary}
        isShowChart={isShowChart}
        onToggleChart={() => setIsShowChart(!isShowChart)}
      />

      {/* Embedded Live TradingView Chart (Toggled on demand) */}
      {isShowChart && (
        <div className="max-w-5xl w-full mx-auto px-4 pt-3">
          <TradingViewWidget
            symbol={selectedCurrency === 'EUR' ? 'OANDA:XAUEUR' : 'OANDA:XAUUSD'}
            theme="dark"
            height={400}
          />
        </div>
      )}

      {/* Main Chatbot Viewport */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 flex flex-col min-h-0">
        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1 pb-4">
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              telegramConfig={telegramConfig}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          ))}

          {/* Loading Indicator when model is thinking */}
          {isLoading && (
            <div className="flex items-start gap-3 my-3 animate-pulse" dir="rtl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-bold shadow-md ring-1 ring-amber-400/40 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tr-sm p-4 text-xs text-slate-300 flex items-center gap-3">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>جاري مطابقة بيانات TradingView اللحظية، فحص كتل الأوامر ودورات الانضغاط/التمدد وتوليد القرار التنفيذي...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills (Shown especially when chat has few messages) */}
        {messages.length <= 3 && !isLoading && (
          <div className="mt-2 mb-1">
            <PromptSuggestions onSelectPrompt={handleSelectPromptSuggestion} />
          </div>
        )}

        {/* Sticky Input Bar at Bottom */}
        <div className="mt-2 pt-2 border-t border-slate-800/60 sticky bottom-2">
          <ChatInputBar
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            selectedTimeframe={timeframe}
            onSelectTimeframe={(tf) => setTimeframe(tf)}
            currentPrice={displayedPrice}
          />
        </div>
      </main>

      {/* Strategy Rulebook Modal */}
      <StrategyRulebookModal
        isOpen={isRulebookOpen}
        onClose={() => setIsRulebookOpen(false)}
      />

      {/* Telegram Bot Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={telegramConfig}
        onSaveConfig={handleSaveTelegramConfig}
      />

      {/* Subtle Institutional Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/90 py-2.5 text-center text-[11px] text-slate-400 font-mono">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Senior Institutional Gold Specialist</span>
            <span className="text-slate-600">•</span>
            <a
              href="https://www.tradingview.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>بيانات TradingView المباشرة</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <span className="text-slate-400">حسابات مايكرو باليورو (€) • حماية رأس المال 100% • تأمين Breakeven فوري</span>
        </div>
      </footer>
    </div>
  );
}

