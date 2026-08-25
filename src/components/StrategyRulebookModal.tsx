import React, { useState } from 'react';
import { X, BookOpen, Search, CheckCircle, ShieldAlert, Award, ArrowRight, Zap, Target } from 'lucide-react';

interface StrategyRulebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StrategyRulebookModal: React.FC<StrategyRulebookModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'cycles' | 'indicators' | 'algos' | 'risk'>('cycles');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">كتيب القواعد المؤسسية واستراتيجيات الذهب</h2>
              <p className="text-xs text-slate-400">
                الدليل التشغيلي الكامل لدورات الانضغاط والتمدد وخوارزميات حركة السعر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'cycles', label: 'دورات الانضغاط والتمدد' },
            { id: 'indicators', label: 'مؤشرات الاتجاه والزخم' },
            { id: 'algos', label: 'البصمة الخوارزمية والأسرار المؤسسية' },
            { id: 'risk', label: 'إدارة حسابات المايكرو والأزمات' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed max-h-[70vh]">
          {activeTab === 'cycles' && (
            <div className="space-y-5">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  قاعدة التقلب الجوهرية (Volatility Mean Reversion)
                </h3>
                <p className="text-xs text-slate-300">
                  الأسواق تتحرك بدورات طبيعية مستمرة بين حالتين:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 mt-2 space-y-1">
                  <li><strong>انضغاط (Contraction):</strong> فترة هدوء، تداول ضيق، فوليوم منخفض - المشترون والبائعون بحالة توازن نسبي.</li>
                  <li><strong>تمدد (Expansion):</strong> فترة حركة قوية، مدى واسع، فوليوم مرتفع - اختلال واضح لصالح طرف واحد.</li>
                  <li><strong>القاعدة الرياضية:</strong> التقلب يميل للتذبذب حول متوسطه؛ فترات الهدوء الشديد تُتبع إحصائياً بحركات سعرية انفجارية.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-xs text-white">المرحلة 1: قياس مستوى التقلب</h4>
                  <p className="text-[11px] text-slate-400">
                    استخدام <strong>ATR</strong> ومقارنته بقمته التاريخية (لو أقل من 20-30% = انضغاط شديد)، ومراقبة <strong>Bollinger Band Width</strong> (Squeeze).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-xs text-white">المرحلة 2: الطاقة المتجمعة</h4>
                  <p className="text-[11px] text-slate-400">
                    طول فترة الهدوء (أيام أو أسابيع) وتناقص الفوليوم التدريجي يؤكد أن السوق ينتظر محفزاً إخبارياً لانفجار قوي.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-xs text-white">المرحلة 3: الاتجاه المرجح</h4>
                  <p className="text-[11px] text-slate-400">
                    الاستمرارية أرجح من الانعكاس؛ انضغاط فوق EMA 200 في ترند صاعد يرجح استمرار الصعود مع مراقبة الدايفرجنس السلبي.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'indicators' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. الميزان الديناميكي (EMA 50 & EMA Stack)</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    <li>إغلاق فوق EMA 50 + زاوية صاعدة = تأكيد شراء.</li>
                    <li>إغلاق تحت EMA 50 + زاوية هابطة = تأكيد بيع.</li>
                    <li>ترتيب المتوسطات (السعر &gt; EMA20 &gt; EMA50 &gt; EMA200) = اتجاه صاعد مؤسسي متماسك.</li>
                    <li>EMA مسطح (أفقي) = لا يوجد اتجاه، تجنب التداول.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-cyan-300">2. نبض الزخم (RSI & MACD)</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    <li><strong>RSI فوق 50:</strong> زخم صاعد مهيمن؛ تحته = هابط.</li>
                    <li>لا نشتري أبداً فوق 70 (تشبع شرائي)، ولا نبيع تحت 30 (تشبع بيعي).</li>
                    <li><strong>MACD خط الصفر:</strong> الهيستوجرام فوق الصفر مع تباعد الخطين = تسارع الزخم.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-300">3. بنية السوق الحقيقية (Market Structure)</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    <li>قمم أعلى وقيعان أعلى (HH/HL) = صعود مؤكد هيكلياً.</li>
                    <li>قمم أدنى وقيعان أدنى (LH/LL) = هبوط مؤكد هيكلياً.</li>
                    <li>الموجات الدافعة (Impulse) تكون أطول وأسرع من الموجات التصحيحية.</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-purple-300">4. فوليوم البنوك والارتباط الماكرو</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    <li>شموع صاعدة بفوليوم مرتفع + هبوط بفوليوم ضعيف = صحة الاتجاه.</li>
                    <li>مراقبة مؤشر الدولار <strong>DXY</strong> وعوائد السندات (علاقة عكسية تاريخية).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'algos' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-300 text-sm">البصمة الخوارزمية (Algorithmic Footprint Protocol)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-amber-400 font-mono">1D (CTA Algos):</span>
                    <p className="text-[11px] text-slate-300 mt-1">تتبع خوارزميات شراء الزخم (Momentum Ignition) والاختراقات الكبرى.</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-purple-400 font-mono">4H (Order Block Algos):</span>
                    <p className="text-[11px] text-slate-300 mt-1">تمركز كتل الطلب والعرض المؤسسية ومناطق إعادة الشحن.</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-cyan-400 font-mono">1H (FVG Imbalance Algos):</span>
                    <p className="text-[11px] text-slate-300 mt-1">الفجوات السعرية غير المغطاة ومغناطيس السيولة المؤسسية.</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-bold text-rose-400 font-mono">5M / 1M (HFT Algos):</span>
                    <p className="text-[11px] text-slate-300 mt-1">صيد الستوبات (Stop Hunts) عبر الذيول الطويلة والارتدادات الخاطفة (V-Shape).</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <strong className="text-amber-300">سر الاختراقات الكاذبة:</strong> اختراق القمة أو القاع بالذيل فقط دون إغلاق جسم الشمعة هو «صيد سيولة» واضح، ويعتبر إشارة انعكاس قوية جداً للقناص.
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-emerald-400 text-sm">بروتوكول حماية رأس المال بنسبة 100%</h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">1. قاعدة الـ Breakeven الفورية:</strong>
                      <p className="text-slate-400 mt-0.5">الهدف الأول TP1 يوضع عند 3$ - 5$، وفور تحقيقه يُنقل الستوب لسعر الدخول فوراً لإلغاء أي خطر على الحساب.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">2. وقف خسارة محكم وصارم (SL):</strong>
                      <p className="text-slate-400 mt-0.5">يوضع خلف ذيل شمعة الرفض أو خلف EMA 50 مباشرة، بحدود خسارة (-0.20€ إلى -0.60€) على عقد المايكرو 0.01.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">3. خطة التهديج (Hedging / Damage Control):</strong>
                      <p className="text-slate-400 mt-0.5">في حال حدوث خطأ أو صفقة عالقة، يتم تفريغ RSI وانتظار التصحيح نحو EMA 50 للخروج بأقل ضرر، أو قفل الحساب بهيدج فوري في حال كسر القمم التاريخية.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>خبير الذهب وحركة السعر المؤسسي • XAUUSD Specialist</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
          >
            إغلاق الكتيب
          </button>
        </div>
      </div>
    </div>
  );
};
