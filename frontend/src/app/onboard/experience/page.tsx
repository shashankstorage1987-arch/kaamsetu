'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Briefcase, Building, Clock, Wrench, Sparkles, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const TRADES = [
  { id: 'ELECTRICAL', label: 'Electrical Shop' },
  { id: 'HARDWARE', label: 'Hardware Store' },
  { id: 'SALON', label: 'Salon / Parlour' },
  { id: 'GROCERY', label: 'Grocery / Kirana' },
  { id: 'RESTAURANT', label: 'Restaurant / Cafe' },
  { id: 'MEDICAL', label: 'Medical Store' },
  { id: 'GARAGE', label: 'Auto Garage' },
  { id: 'OTHER', label: 'Other' },
];

const PROFESSIONS = [
  { id: 'HELPER', label: 'Helper' },
  { id: 'BILLER', label: 'Biller' },
  { id: 'SALES', label: 'Sales Assistant' },
  { id: 'BARBER', label: 'Barber / Stylist' },
  { id: 'WAITER', label: 'Waiter / Server' },
  { id: 'MECHANIC', label: 'Mechanic' },
  { id: 'CASHIER', label: 'Cashier' },
  { id: 'DELIVERY', label: 'Delivery' },
  { id: 'OTHER', label: 'Other' },
];

export default function WorkExperiencePage() {
  const router = useRouter();
  const { t, translateTrade, translateProfession } = useLanguage();

  const [trade, setTrade] = useState('ELECTRICAL');
  const [profession, setProfession] = useState('HELPER');
  const [isFresher, setIsFresher] = useState(false);
  const [employerName, setEmployerName] = useState('');
  const [durationMonths, setDurationMonths] = useState('');
  const [skills, setSkills] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/signup/worker');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const effectiveDuration = isFresher ? 0 : parseInt(durationMonths, 10);
    const effectiveEmployer = isFresher ? (employerName.trim() || 'Fresher') : employerName.trim();

    if (!isFresher) {
      if (!effectiveEmployer) {
        setError(t('Please enter previous employer or shop name'));
        return;
      }

      if (!durationMonths.trim() || isNaN(effectiveDuration) || effectiveDuration < 1 || effectiveDuration > 600) {
        setError(t('Duration in months must be between 1 and 600 months'));
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const coreSkillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);

      const expObj = {
        trade,
        profession,
        previousEmployerName: effectiveEmployer,
        previous_employer_name: effectiveEmployer,
        durationMonths: effectiveDuration,
        duration_months: effectiveDuration,
        coreSkills: coreSkillsArray,
        core_skills: coreSkillsArray,
      };

      const res = await fetch('http://localhost:8080/api/v1/workers/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          totalExperienceYears: isFresher ? 0.0 : (effectiveDuration / 12),
          total_experience_years: isFresher ? 0.0 : (effectiveDuration / 12),
          experiences: [expObj],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save experience');
      }

      // Proceed to Screen 1.3 Worker Address
      router.push('/onboard/address');
    } catch (err: any) {
      setError(err.message || 'Failed to save work experience');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <Header
        title={t('Work Experience')}
        subtitle={t('Add your shop experience and skills')}
        stepInfo={t('Step 2 of 4')}
        showBack={true}
        onBack={handleBack}
      />

      <form onSubmit={handleSubmit} className="flex-1 p-5 flex flex-col justify-between min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{t(error)}</div>}

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              {t('Trade / Shop Type')}
            </label>
            <select
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full min-h-[50px] px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white"
            >
              {TRADES.map((tItem) => (
                <option key={tItem.id} value={tItem.id}>
                  {translateTrade(tItem.label)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              {t('Job Role / Profession')}
            </label>
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full min-h-[50px] px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white"
            >
              {PROFESSIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {translateProfession(p.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Fresher Toggle Card */}
          <div className="p-3.5 bg-blue-50/80 border-2 border-blue-200 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-start gap-2.5 pr-2">
              <div className="p-1.5 bg-blue-600 text-white rounded-lg mt-0.5 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-blue-950">
                  {t('I am a Fresher (No prior shop work experience)')}
                </span>
                <span className="text-[11px] text-blue-800 font-medium">
                  {t('No prior shop work experience (0 years)')}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isFresher}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsFresher(checked);
                  if (checked) {
                    setDurationMonths('0');
                    if (!employerName) setEmployerName('Fresher');
                  } else {
                    setDurationMonths('');
                    if (employerName === 'Fresher') setEmployerName('');
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {!isFresher ? (
            <>
              <Input
                label={t('Previous Employer / Shop Name')}
                type="text"
                placeholder={t('e.g. Sharma Electricals', 'e.g. Sharma Electricals')}
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                icon={<Building className="w-5 h-5" />}
              />

              <Input
                label={t('Duration (Months)')}
                type="number"
                min={1}
                max={600}
                placeholder="e.g. 24"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value.replace(/[^0-9]/g, ''))}
                icon={<Clock className="w-5 h-5" />}
              />
            </>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-emerald-950">{t('Fresher Status')}</span>
                <p className="text-emerald-800 leading-relaxed">
                  {t('As a fresher, your experience is set to 0.0 years. Select the trade and role you want to work in.')}
                </p>
              </div>
            </div>
          )}

          <Input
            label={t('Core Skills (comma separated)')}
            type="text"
            placeholder={t('e.g. House Wiring, Inventory, Meter Billing', 'e.g. House Wiring, Inventory, Meter Billing')}
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            icon={<Wrench className="w-5 h-5" />}
          />
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Button type="submit" isLoading={loading}>
            {t('Save & Continue')}
          </Button>
        </div>
      </form>
    </MobileContainer>
  );
}
