import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();
  
  // Pricing state
  const [months, setMonths] = React.useState(12);
  
  // Fixed pricing table
  const pricingTable = [
    19,   // 1 month
    35,   // 2 months  
    45,   // 3 months
    55,   // 4 months
    65,   // 5 months
    75,   // 6 months
    85,   // 7 months
    95,   // 8 months
    105,  // 9 months
    115,  // 10 months
    125,  // 11 months
    130   // 12 months
  ];
  
  const baseMonthly = 19; // Base price for 1 month
  const totalPrice = pricingTable[months - 1];
  const monthlyPrice = +(totalPrice / months).toFixed(2);
  const standardTotal = baseMonthly * months;
  const savings = +(standardTotal - totalPrice).toFixed(2);
  const discount = savings > 0 ? +(savings / standardTotal).toFixed(3) : 0;
  
  const today = new Date();
  const endDate = new Date(today);
  endDate.setMonth(today.getMonth() + months);
  function formatDate(d) {
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  const navigate = useNavigate();
  const demoRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleGetStarted = () => navigate('/register');
  const handleLogin = () => navigate('/auth');
  const handlePreviewDemo = () => {
    if (demoRef.current) {
      demoRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl" style={{color: '#0C2230'}}>MedQuest</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#home" className="text-gray-700 hover:opacity-80 font-medium transition" style={{color: '#1F3A4B'}}>{t('landing.nav.home')}</a>
            <a href="#features" className="text-gray-700 hover:opacity-80 font-medium transition" style={{color: '#1F3A4B'}}>{t('landing.nav.features')}</a>
            <a href="#pricing" className="text-gray-700 hover:opacity-80 font-medium transition" style={{color: '#1F3A4B'}}>{t('landing.nav.pricing')}</a>
            <button onClick={handleLogin} className="text-gray-700 hover:opacity-80 font-medium transition" style={{color: '#1F3A4B'}}>{t('landing.nav.login')}</button>
            
            {/* Language Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`p-1 rounded-md transition ${
                  language === 'fr' 
                    ? 'bg-white shadow-sm ring-2 ring-blue-200' 
                    : 'hover:bg-gray-200'
                }`}
                title="Français"
              >
                <svg width="24" height="18" viewBox="0 0 24 18" className="rounded-sm overflow-hidden">
                  <rect width="24" height="18" fill="#ffffff" rx="2"/>
                  <rect width="8" height="18" fill="#0055A4" rx="2"/>
                  <rect x="16" width="8" height="18" fill="#EF4135"/>
                </svg>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`p-1 rounded-md transition ${
                  language === 'en' 
                    ? 'bg-white shadow-sm ring-2 ring-blue-200' 
                    : 'hover:bg-gray-200'
                }`}
                title="English"
              >
                <svg width="24" height="18" viewBox="0 0 24 18" className="rounded-sm overflow-hidden">
                  <rect width="24" height="18" fill="#012169" rx="2"/>
                  <g>
                    <path d="M0 0l24 18M24 0L0 18" stroke="#ffffff" strokeWidth="2"/>
                    <path d="M0 0l24 18M24 0L0 18" stroke="#C8102E" strokeWidth="1.2"/>
                    <path d="M12 0v18M0 9h24" stroke="#ffffff" strokeWidth="4"/>
                    <path d="M12 0v18M0 9h24" stroke="#C8102E" strokeWidth="2.4"/>
                  </g>
                </svg>
              </button>
            </div>
            
            <button onClick={handleGetStarted} className="ml-4 px-4 py-2 text-white rounded-lg font-semibold shadow hover:opacity-90 transition" style={{backgroundColor: '#3C5B6F'}}>{t('landing.nav.register')}</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="home" 
        className="flex flex-col items-center justify-center py-20 px-4 text-center relative"
        style={{
          background: 'linear-gradient(135deg, rgba(12, 34, 48, 0.9) 0%, rgba(31, 58, 75, 0.8) 100%), url("/medical-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">{t('landing.hero.title')}</h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90 drop-shadow-md">
          {t('landing.hero.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={handleGetStarted} className="px-8 py-3 text-white rounded-lg font-semibold shadow-lg hover:opacity-90 transition" style={{backgroundColor: '#3C5B6F'}}>{t('landing.hero.cta')}</button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4" style={{color: '#0C2230'}}>{t('landing.features.title')}</h2>
          <p className="text-center mb-10 text-lg" style={{color: '#648598'}}>{t('landing.features.subtitle')}</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition-transform" style={{backgroundColor: '#f1f5f9'}}>
              <div className="mb-4" style={{color: '#3C5B6F'}}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{color: '#1F3A4B'}}>{t('landing.features.qcm.title')}</h3>
              <p className="text-center" style={{color: '#648598'}}>{t('landing.features.qcm.description')}</p>
            </div>
            {/* Feature 2 */}
            <div className="rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition-transform" style={{backgroundColor: '#f1f5f9'}}>
              <div className="mb-4" style={{color: '#1F3A4B'}}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M8 12h8M12 8v8"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{color: '#1F3A4B'}}>{t('landing.features.summaries.title')}</h3>
              <p className="text-center" style={{color: '#648598'}}>{t('landing.features.summaries.description')}</p>
            </div>
            {/* Feature 3 - Bilingual Platform */}
            <div className="rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition-transform relative" style={{backgroundColor: '#f1f5f9'}}>
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {t('landing.features.bilingual.badge')}
              </div>
              <div className="mb-4" style={{color: '#648598'}}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path stroke="currentColor" strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <path stroke="currentColor" strokeWidth="1.5" d="M8 8h8M8 16h8"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{color: '#1F3A4B'}}>{t('landing.features.bilingual.title')}</h3>
              <p className="text-center" style={{color: '#648598'}}>{t('landing.features.bilingual.description')}</p>
            </div>
            {/* Feature 4 */}
            <div className="rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition-transform" style={{backgroundColor: '#f1f5f9'}}>
              <div className="mb-4" style={{color: '#0C2230'}}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{color: '#1F3A4B'}}>{t('landing.features.cases.title')}</h3>
              <p className="text-center" style={{color: '#648598'}}>{t('landing.features.cases.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 flex flex-col items-center justify-center bg-white">
        <h2 className="text-3xl font-bold text-center mb-2" style={{color: '#0C2230'}}>
          {language === 'fr' ? (
            <>Choisissez l'offre qui <span style={{color: '#3C5B6F'}}>vous convient</span></>
          ) : (
            <>Choose the plan that <span style={{color: '#3C5B6F'}}>suits you</span></>
          )}
        </h2>
        <p className="text-center mb-6" style={{color: '#648598'}}>{t('landing.pricing.subtitle')}</p>
        <div className="w-full max-w-xl mx-auto mb-8 px-4">
          <div className="relative">
            <style dangerouslySetInnerHTML={{
              __html: `
                .custom-range {
                  -webkit-appearance: none;
                  appearance: none;
                  background: transparent;
                  cursor: pointer;
                  width: 100%;
                  height: 8px;
                  background: #e2e8f0;
                  border-radius: 4px;
                  outline: none;
                }
                
                .custom-range::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #3C5B6F;
                  cursor: pointer;
                }
                
                .custom-range::-moz-range-thumb {
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #3C5B6F;
                  cursor: pointer;
                  border: none;
                }
              `
            }} />
            <input
              type="range"
              min={1}
              max={12}
              value={months}
              onChange={e => setMonths(Number(e.target.value))}
              className="custom-range"
            />
            <div className="flex text-xs mt-3 relative" style={{
              color: '#648598'
            }}>
              {[...Array(12)].map((_, i) => {
                const percentage = (i / 11) * 100;
                return (
                  <span 
                    key={i} 
                    className={`absolute text-center ${months === i + 1 ? 'font-bold' : ''}`} 
                    style={{
                      left: `calc(${percentage}% - 8px)`,
                      width: '16px',
                      color: months === i + 1 ? '#3C5B6F' : '#648598'
                    }}
                  >
                    {i + 1}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div className="w-full max-w-md mx-auto rounded-2xl shadow-lg text-white mb-8 overflow-hidden" style={{backgroundColor: '#0C2230'}}>
          <div className="text-center py-6">
            <div className="text-4xl font-extrabold">{months}</div>
            <div className="uppercase tracking-widest text-sm">{t('landing.pricing.months')}</div>
          </div>
          <div className="py-4 text-center" style={{backgroundColor: '#f1f5f9', color: '#1F3A4B'}}>
            <div className="font-semibold">{t('landing.pricing.period')}</div>
            <div className="font-bold" style={{color: '#0C2230'}}>{formatDate(today)} - {formatDate(endDate)}</div>
          </div>
          <div className="py-6 text-center">
            <div className="text-3xl font-bold mb-2">{totalPrice.toFixed(2)}<span className="text-base font-normal">TND</span></div>
            <span className="inline-block text-white text-xs rounded-full px-3 py-1 font-bold" style={{backgroundColor: '#3C5B6F'}}>-{(discount * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center px-6 py-4" style={{backgroundColor: '#f1f5f9', color: '#1F3A4B'}}>
            <div>
              <div className="text-xs">{t('landing.pricing.monthlyPrice')}</div>
              <div className="text-lg font-bold">
                <span className="line-through mr-1" style={{color: '#648598'}}>{baseMonthly.toFixed(2)}TND</span>
                {monthlyPrice.toFixed(2)}TND
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs">{t('landing.pricing.savings')}</div>
              <div className="text-lg font-bold">{savings.toFixed(2)}TND</div>
            </div>
          </div>
          <div className="px-6 py-4" style={{backgroundColor: '#f8fafc'}}>
            <button 
              onClick={handleGetStarted}
              className="w-full py-3 text-white font-bold rounded-lg shadow hover:opacity-90 transition" 
              style={{backgroundColor: '#3C5B6F'}}
            >
              {t('landing.pricing.cta')}
            </button>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{color: '#0C2230'}}>{t('landing.additionalFeatures.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Feature 1 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#3C5B6F'}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2" style={{color: '#0C2230'}}>{t('landing.additionalFeatures.smartGrading.title')}</h3>
                <p style={{color: '#648598'}}>{t('landing.additionalFeatures.smartGrading.description')}</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#3C5B6F'}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2" style={{color: '#0C2230'}}>{t('landing.additionalFeatures.detailedExplanations.title')}</h3>
                <p style={{color: '#648598'}}>{t('landing.additionalFeatures.detailedExplanations.description')}</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#3C5B6F'}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2" style={{color: '#0C2230'}}>{t('landing.additionalFeatures.totalAccessibility.title')}</h3>
                <p style={{color: '#648598'}}>{t('landing.additionalFeatures.totalAccessibility.description')}</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#3C5B6F'}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2" style={{color: '#0C2230'}}>{t('landing.additionalFeatures.modernInterface.title')}</h3>
                <p style={{color: '#648598'}}>{t('landing.additionalFeatures.modernInterface.description')}</p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#3C5B6F'}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2" style={{color: '#0C2230'}}>{t('landing.additionalFeatures.regularUpdates.title')}</h3>
                <p style={{color: '#648598'}}>{t('landing.additionalFeatures.regularUpdates.description')}</p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#3C5B6F'}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2" style={{color: '#0C2230'}}>{t('landing.additionalFeatures.securePayment.title')}</h3>
                <p style={{color: '#648598'}}>{t('landing.additionalFeatures.securePayment.description')}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Demo / Preview Section */}
      <section ref={demoRef} className="py-16 px-4 bg-blue-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 flex justify-center">
            <div className="w-full h-64 bg-white rounded-xl shadow-lg flex items-center justify-center">
              {/* Placeholder for screenshot/illustration */}
              <span className="text-gray-400 text-lg">[Dashboard Preview]</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4" style={{color: '#0C2230'}}>{t('landing.demo.title')}</h3>
            <p className="mb-4" style={{color: '#1F3A4B'}}>{t('landing.demo.description')}</p>
            <ul className="list-disc list-inside" style={{color: '#648598'}}>
              <li>{language === 'fr' ? 'Parcours d\'apprentissage personnalisés' : 'Personalized learning paths'}</li>
              <li>{language === 'fr' ? 'Commentaires instantanés sur les quiz' : 'Instant feedback on quizzes'}</li>
              <li>{language === 'fr' ? 'Design adapté aux mobiles' : 'Mobile-friendly design'}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-white text-center" style={{backgroundColor: '#1F3A4B'}}>
        <h2 className="text-3xl font-bold mb-4">{t('landing.cta.title')}</h2>
        <button onClick={handleGetStarted} className="inline-block px-8 py-4 rounded-lg font-bold shadow hover:opacity-90 transition" style={{backgroundColor: '#3C5B6F', color: 'white'}}>{t('landing.cta.button')}</button>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl" style={{color: '#0C2230'}}>MedQuest</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#about" className="hover:opacity-80" style={{color: '#1F3A4B'}}>{t('landing.footer.about')}</a>
            <a href="#terms" className="hover:opacity-80" style={{color: '#1F3A4B'}}>{t('landing.footer.terms')}</a>
            <a href="#privacy" className="hover:opacity-80" style={{color: '#1F3A4B'}}>{t('landing.footer.privacy')}</a>
            <a href="#contact" className="hover:opacity-80" style={{color: '#1F3A4B'}}>{t('landing.footer.contact')}</a>
          </div>
          <div className="text-xs" style={{color: '#648598'}}>{t('landing.footer.copyright')}</div>
        </div>
      </footer>
    </>
  );
}
