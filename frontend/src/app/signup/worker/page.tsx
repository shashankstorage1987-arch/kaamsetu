'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Input from '@/components/Input';
import PinInput from '@/components/PinInput';
import Button from '@/components/Button';
import { User, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/config/api';

export default function WorkerSignUpPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/signup');
    }
  };

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError(t('Please enter your full name'));
      return;
    }
    if (!phone || phone.length !== 10) {
      setError(t('Please enter a valid 10-digit phone number'));
      return;
    }
    if (!pin || pin.length !== 6) {
      setError(t('Please enter a 6-digit security PIN'));
      return;
    }
    if (!aadhaar || aadhaar.length !== 12) {
      setError(t('Please enter a valid 12-digit Aadhaar number for identity verification'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup/worker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phoneNumber: phone,
          pin,
          aadhaarNumber: aadhaar,
          full_name: fullName,
          phone_number: phone,
          aadhaar_number: aadhaar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || t('Worker sign up failed'));
      }

      localStorage.setItem('kaamsetu_token', data.token);
      localStorage.setItem('kaamsetu_role', data.role);
      localStorage.setItem('kaamsetu_user_id', data.user_id);

      // Proceed to Screen 1.2 Work Experience
      router.push('/onboard/experience');
    } catch (err: any) {
      setError(err.message || t('Worker sign up failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <Header
        title={t('Worker Sign Up')}
        subtitle={t('Create your verified worker profile')}
        stepInfo={t('Step 1 of 4')}
        showBack={true}
        onBack={handleBack}
      />

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">{t(error)}</p>
            </div>
          )}

          <Input
            label={t('Full Name (as per Aadhaar)')}
            type="text"
            placeholder={t('e.g. Ramesh Kumar')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<User className="w-5 h-5" />}
          />

          <Input
            label={t('10-Digit Mobile Number')}
            type="tel"
            maxLength={10}
            placeholder={t('10-digit mobile number')}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            icon={<Phone className="w-5 h-5" />}
          />

          <PinInput
            value={pin}
            onChange={setPin}
            label={t('6-Digit Security PIN')}
          />

          <Input
            label={t('12-Digit Aadhaar Number (Verification Only)')}
            type="password"
            maxLength={12}
            placeholder={t('12-digit Aadhaar number')}
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/[^0-9]/g, ''))}
            icon={<ShieldCheck className="w-5 h-5" />}
            helperText={t('Raw Aadhaar number is verified transiently and NEVER saved in our system.')}
          />
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Button type="submit" isLoading={loading}>
            {t('Create Profile & Continue')}
          </Button>
        </div>
      </form>
    </MobileContainer>
  );
}
