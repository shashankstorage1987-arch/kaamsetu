'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { IndianRupee, MapPin, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function WorkerPreferencesPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [salary, setSalary] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [isAvailableNow, setIsAvailableNow] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/onboard/address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let sal = 15000;
    if (salary.trim()) {
      sal = parseInt(salary, 10);
      if (isNaN(sal) || sal < 1000 || sal > 500000) {
        setError(t('Preferred monthly salary must be between ₹1,000 and ₹5,00,000'));
        return;
      }
    }

    let dist = 5.0;
    if (distanceKm.trim()) {
      dist = parseFloat(distanceKm);
      if (isNaN(dist) || dist < 0.5 || dist > 100) {
        setError(t('Preferred distance must be between 0.5 KM and 100 KM'));
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');

      // Phase 1 Onboarding Boundary: stores is_available boolean preference only.
      // available_until remains NULL.
      const res = await fetch('http://localhost:8080/api/v1/workers/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferredSalary: sal,
          preferred_salary: sal,
          preferredDistanceKm: dist,
          preferred_distance_km: dist,
          isAvailable: isAvailableNow,
          is_available: isAvailableNow,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || t('Failed to save preferences'));
      }

      // If worker marked themselves available, activate the 12-hour availability window immediately
      if (isAvailableNow) {
        try {
          const availRes = await fetch('http://localhost:8080/api/v1/workers/me/availability', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isAvailable: true, is_available: true }),
          });
          if (!availRes.ok) {
            console.error('Failed to activate initial availability window, status:', availRes.status);
          }
        } catch (availErr) {
          console.error('Failed to activate initial availability window:', availErr);
        }
      }

      // Proceed to permissions prompt (Screen 11.2 & 11.3)
      router.push('/permissions');
    } catch (err: any) {
      setError(err.message || t('Failed to save preferences'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <Header
        title="Worker Preferences"
        subtitle="Set your expected salary & availability"
        stepInfo="Step 4 of 4"
        showBack={true}
        onBack={handleBack}
      />

      <form onSubmit={handleSubmit} className="flex-1 p-5 flex flex-col justify-between min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-5">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{t(error)}</div>}

          <Input
            label="Preferred Monthly Salary (₹)"
            type="number"
            min={1000}
            max={500000}
            placeholder="e.g. 15000"
            helperText="Between ₹1,000 and ₹5,00,000 (Default: ₹15,000)"
            value={salary}
            onChange={(e) => setSalary(e.target.value.replace(/[^0-9]/g, ''))}
            icon={<IndianRupee className="w-5 h-5" />}
          />

          <Input
            label="Preferred Max Travel Distance (KM)"
            type="number"
            min={0.5}
            max={100}
            step="0.5"
            placeholder="e.g. 5.0"
            helperText="Between 0.5 KM and 100 KM (Default: 5.0 KM)"
            value={distanceKm}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || parseFloat(val) >= 0) {
                setDistanceKm(val);
              }
            }}
            icon={<MapPin className="w-5 h-5" />}
          />

          {/* Initial Availability Toggle */}
          <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{t('Set myself Available for work')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('Initial profile preference stored during onboarding')}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailableNow(!isAvailableNow)}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                isAvailableNow ? 'bg-green-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  isAvailableNow ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-blue-900">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              {t('Profile preference stored. You can manage your 12-hour real-time availability anytime from your Worker Home dashboard.')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Button type="submit" isLoading={loading}>
            {t('Complete Onboarding')}
          </Button>
        </div>
      </form>
    </MobileContainer>
  );
}
