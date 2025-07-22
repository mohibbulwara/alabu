'use client';

import { createContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { translations } from '@/lib/translations';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof (typeof translations)['en']) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'bn' : 'en'));
  }, []);

  const t = useCallback((key: keyof (typeof translations)['en']): string => {
    return translations[language][key] || translations['en'][key];
  }, [language]);

  const value = useMemo(() => ({
    language,
    toggleLanguage,
    t,
  }), [language, toggleLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
