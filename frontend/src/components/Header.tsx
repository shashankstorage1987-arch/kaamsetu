'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  stepInfo?: string;
  showLanguageToggle?: boolean;
}

export default function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  stepInfo,
  showLanguageToggle = true,
}: HeaderProps) {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const translatedTitle = title ? t(title) : '';
  const translatedSubtitle = subtitle ? t(subtitle) : '';
  const translatedStepInfo = stepInfo ? t(stepInfo) : '';

  return (
    <header className="px-5 pt-4 pb-3 bg-white border-b border-slate-100 flex flex-col gap-1.5 sticky top-0 z-20 shrink-0">
      <div className="flex items-center justify-between min-h-[44px]">
        {showBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="w-10" />
        )}

        <div className="flex items-center gap-2">
          {stepInfo && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
              {translatedStepInfo}
            </span>
          )}
          {showLanguageToggle && (
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full transition-all min-h-[36px] active:scale-95 shadow-2xs"
              onClick={toggleLanguage}
              title="Switch language / भाषा बदलें"
              aria-label="Toggle language between English and Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className={language === 'en' ? 'font-black text-blue-700 underline underline-offset-2' : 'text-slate-500 font-medium'}>
                ENG
              </span>
              <span className="text-slate-300">/</span>
              <span className={language === 'hi' ? 'font-black text-emerald-700 underline underline-offset-2' : 'text-slate-500 font-medium'}>
                हिंदी
              </span>
            </button>
          )}
        </div>
      </div>

      {(title || subtitle) && (
        <div className="mt-1">
          {title && <h1 className="text-xl font-bold text-slate-900 tracking-tight">{translatedTitle}</h1>}
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{translatedSubtitle}</p>}
        </div>
      )}
    </header>
  );
}
