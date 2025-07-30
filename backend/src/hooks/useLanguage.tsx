
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '@/data/translations';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const savedLanguage = localStorage.getItem('medquest-language') as Language;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    } else {
      // Set French as default if no language is saved
      setLanguage('fr');
      localStorage.setItem('medquest-language', 'fr');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('medquest-language', language);
    // Force a re-render of all components using translations
    forceUpdate({});
  }, [language]);

  const t = (key: string, params?: any): string => {
    try {
      const keys = key.split('.');
      let translation: any = translations[language];
      
      for (const k of keys) {
        if (translation && typeof translation === 'object') {
          translation = translation[k];
        } else {
          console.warn(`Translation not found for key: ${key} at step: ${k}`);
          return key;
        }
      }
      
      if (typeof translation !== 'string') {
        console.warn('Translation not found for key:', key);
        return key;
      }
      
      // Handle parameter substitution
      if (params) {
        Object.keys(params).forEach(param => {
          translation = translation.replace(`{${param}}`, params[param]);
        });
      }
      
      return translation;
    } catch (err) {
      console.error('Translation error for key:', key, err);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
