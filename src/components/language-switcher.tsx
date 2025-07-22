
'use client';

import { useLanguage } from '@/lib/hooks';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage}>
      <span className="text-lg">{language === 'en' ? '🇧🇩' : '🇬🇧'}</span>
      <span className="sr-only">
        {language === 'en' ? 'Switch to Bengali' : 'Switch to English'}
      </span>
    </Button>
  );
}
