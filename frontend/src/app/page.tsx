'use client';

import React from 'react';
import Link from 'next/link';
import MobileContainer from '@/components/MobileContainer';
import Button from '@/components/Button';
import { Briefcase, UserCheck, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LandingPage() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <MobileContainer className="flex flex-col justify-between p-5">
      {/* Top Language Toggle */}
      <div className="flex justify-end pt-1 shrink-0">
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
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center text-center py-2 gap-3.5">
        <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-green-600/30 shrink-0">
          KS
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('KaamSetu')}</h1>
          <p className="text-xs font-semibold text-green-700 tracking-wide uppercase mt-1">
            {t('Hyperlocal Worker Discovery')}
          </p>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 px-2 mt-1">
          {t('Connecting local businesses with trusted, verified skilled workers in real-time.')}
        </p>

        <div className="grid grid-cols-2 gap-2.5 w-full mt-3">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col items-center text-center gap-1.5">
            <UserCheck className="w-7 h-7 text-green-600" />
            <span className="text-xs font-bold text-slate-800">{t('For Workers')}</span>
            <span className="text-[11px] text-slate-500">{t('Find daily & full-time local jobs')}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col items-center text-center gap-1.5">
            <Briefcase className="w-7 h-7 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">{t('For Employers')}</span>
            <span className="text-[11px] text-slate-500">{t('Hire skilled helpers & billers nearby')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 shrink-0">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span>{t('Aadhaar ID Verified Platform')}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-3 pb-2 shrink-0">
        <Link href="/signup">
          <Button variant="primary">{t('Create New Account')}</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">{t('Log In with PIN')}</Button>
        </Link>
      </div>
    </MobileContainer>
  );
}
