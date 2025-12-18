'use client';

import { useLanguage } from '@/app/lib/i18n/context';
import { Language } from '@/app/lib/i18n/translations';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  const handleChange = (newLang: Language) => {
    setLang(newLang);
  };

  return (
    <div 
      className="flex h-10 items-center rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200"
      role="radiogroup"
      aria-label="Language selection"
    >
      <button
        type="button"
        role="radio"
        aria-checked={lang === 'vi'}
        onClick={() => handleChange('vi')}
        className={`
          relative flex h-full min-w-[44px] cursor-pointer items-center justify-center 
          rounded-full px-3 transition-all duration-200
          ${lang === 'vi' 
            ? 'bg-slate-100 text-slate-900' 
            : 'text-slate-400 hover:text-slate-600'
          }
        `}
      >
        <span className="text-xs font-bold">VI</span>
      </button>
      
      <div className="h-4 w-px bg-slate-200" aria-hidden="true" />
      
      <button
        type="button"
        role="radio"
        aria-checked={lang === 'en'}
        onClick={() => handleChange('en')}
        className={`
          relative flex h-full min-w-[44px] cursor-pointer items-center justify-center 
          rounded-full px-3 transition-all duration-200
          ${lang === 'en' 
            ? 'bg-slate-100 text-slate-900' 
            : 'text-slate-400 hover:text-slate-600'
          }
        `}
      >
        <span className="text-xs font-bold">EN</span>
      </button>
    </div>
  );
}
