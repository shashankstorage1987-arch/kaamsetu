'use client';

import React, { useState } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useRouter } from 'next/navigation';
import { AlertCircle, Briefcase, DollarSign, Clock, MapPin, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const TRADE_OPTIONS = [
  { label: 'Electrical Shop', value: 'ELECTRICAL' },
  { label: 'Hardware Store', value: 'HARDWARE' },
  { label: 'Salon / Parlour', value: 'SALON' },
  { label: 'Grocery / Kirana', value: 'GROCERY' },
  { label: 'Restaurant / Cafe', value: 'RESTAURANT' },
  { label: 'Medical Store', value: 'MEDICAL' },
  { label: 'Auto Garage', value: 'GARAGE' },
  { label: 'Other', value: 'OTHER' },
];

const PROFESSION_OPTIONS = [
  { label: 'Helper', value: 'HELPER' },
  { label: 'Biller', value: 'BILLER' },
  { label: 'Sales Assistant', value: 'SALES' },
  { label: 'Barber / Stylist', value: 'BARBER' },
  { label: 'Waiter / Server', value: 'WAITER' },
  { label: 'Mechanic', value: 'MECHANIC' },
  { label: 'Cashier', value: 'CASHIER' },
  { label: 'Delivery', value: 'DELIVERY' },
  { label: 'Other', value: 'OTHER' },
];

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1.0 },
  { label: '5 km', value: 5.0 },
  { label: '25 km', value: 25.0 },
  { label: '100 km', value: 100.0 },
  { label: '500 KM+', value: 500.0 },
];

export default function PostJobPage() {
  const router = useRouter();
  const { t, translateTrade, translateProfession } = useLanguage();

  const [trade, setTrade] = useState('ELECTRICAL');
  const [profession, setProfession] = useState('HELPER');
  const [experienceYears, setExperienceYears] = useState('2.0');
  const [salary, setSalary] = useState('18000');
  const [shift, setShift] = useState<'DAY' | 'NIGHT'>('DAY');
  const [timing, setTiming] = useState('9 AM - 6 PM');
  const [radiusKm, setRadiusKm] = useState<number>(1.0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const salaryNum = parseInt(salary, 10);
    if (isNaN(salaryNum) || salaryNum < 1000 || salaryNum > 1000000) {
      setError(t('Monthly salary must be between ₹1,000 and ₹10,00,000.'));
      return;
    }

    const expNum = parseFloat(experienceYears);
    if (isNaN(expNum) || expNum < 0 || expNum > 50) {
      setError(t('Required experience must be between 0 and 50 years.'));
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch('http://localhost:8080/api/v1/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trade,
          profession,
          experienceRequiredYears: expNum,
          experience_required_years: expNum,
          salary: salaryNum,
          shift,
          timing,
          radiusKm,
          radius_km: radiusKm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const jobId = data.jobId || data.job_id || data.id;
        if (jobId) {
          router.push(`/jobs/${jobId}`);
        } else {
          setError(t('Job created, but could not determine job ID.'));
        }
      } else {
        const errData = await res.json();
        setError(errData.message || t('Failed to post job. Please try again.'));
      }
    } catch (err) {
      console.error(err);
      setError(t('Network error. Please verify your connection.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <Header
        title="Post a Job Need"
        subtitle="Fallback Hiring Requirement"
        showBack={true}
        onBack={handleBack}
      />

      <div className="flex-1 min-h-0 p-5 overflow-y-auto">
        {/* Search-First Banner Notice */}
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs mb-5 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{t('Search-First Recommendation')}</p>
            <p className="mt-0.5 text-amber-800">
              {t('KaamSetu connects you instantly with nearby workers. Job posting is a fallback when nearby candidate search returns no suitable matches.')}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Trade Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block uppercase tracking-wider">
              {t('Trade / Industry *')}
            </label>
            <div className="relative">
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-3 appearance-none text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {TRADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {translateTrade(opt.label)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
            </div>
          </div>

          {/* Profession Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block uppercase tracking-wider">
              {t('Profession / Role *')}
            </label>
            <div className="relative">
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-xl px-3.5 py-3 appearance-none text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {PROFESSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {translateProfession(opt.label)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-4 pointer-events-none" />
            </div>
          </div>

          {/* Required Experience & Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                {t('Min Exp (Yrs)')}
              </label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="2.0"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                {t('Monthly Salary (₹) *')}
              </label>
              <Input
                type="number"
                min="1000"
                max="1000000"
                value={salary}
                onChange={(e) => setSalary(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="18000"
                required
              />
            </div>
          </div>

          {/* Shift & Timing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                {t('Work Shift *')}
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setShift('DAY')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    shift === 'DAY' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {t('Day')}
                </button>
                <button
                  type="button"
                  onClick={() => setShift('NIGHT')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    shift === 'NIGHT' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {t('Night')}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block uppercase tracking-wider">
                {t('Working Timing')}
              </label>
              <Input
                type="text"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                placeholder="9 AM - 6 PM"
              />
            </div>
          </div>

          {/* Search Radius */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between uppercase tracking-wider">
              <span>{t('Matching Radius')}</span>
              <span className="text-blue-700 font-extrabold">
                {t(RADIUS_OPTIONS.find(o => o.value === radiusKm)?.label || `${radiusKm} KM`)}
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRadiusKm(r.value)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    radiusKm === r.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t(r.label)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Button type="submit" disabled={loading} className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-700 font-bold">
              {loading ? t('Posting Job...') : t('Publish Active Job')}
            </Button>
          </div>
        </form>
      </div>
    </MobileContainer>
  );
}
