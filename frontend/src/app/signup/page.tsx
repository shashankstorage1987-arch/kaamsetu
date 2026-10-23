'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { UserCheck, Store, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SignUpChoicePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'WORKER' | 'EMPLOYER' | null>(null);

  const handleContinue = () => {
    if (selectedRole === 'WORKER') {
      router.push('/signup/worker');
    } else if (selectedRole === 'EMPLOYER') {
      router.push('/signup/employer');
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <MobileContainer>
      <Header
        title="Join KaamSetu"
        subtitle="Select your role to get started"
        stepInfo="Step 1 of 4"
        showBack={true}
        onBack={handleBack}
      />

      <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col justify-between">
        <div className="flex flex-col gap-4 my-auto">
          {/* Worker Card */}
          <button
            type="button"
            onClick={() => setSelectedRole('WORKER')}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-4 ${
              selectedRole === 'WORKER'
                ? 'border-green-600 bg-green-50/50 shadow-md ring-4 ring-green-100'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  selectedRole === 'WORKER' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{t('I am a Worker')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('Looking for shop helper, waiter, or mechanic jobs nearby')}</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 ${selectedRole === 'WORKER' ? 'text-green-600' : 'text-slate-400'}`} />
          </button>

          {/* Employer Card */}
          <button
            type="button"
            onClick={() => setSelectedRole('EMPLOYER')}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-4 ${
              selectedRole === 'EMPLOYER'
                ? 'border-green-600 bg-green-50/50 shadow-md ring-4 ring-green-100'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  selectedRole === 'EMPLOYER' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Store className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{t('I am a Shop Owner / Employer')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('Hiring skilled helpers, billers, and staff for my shop')}</p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 ${selectedRole === 'EMPLOYER' ? 'text-green-600' : 'text-slate-400'}`} />
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Button onClick={handleContinue} disabled={!selectedRole}>
            {t('Continue')}
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
