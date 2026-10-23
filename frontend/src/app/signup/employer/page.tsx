'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Input from '@/components/Input';
import PinInput from '@/components/PinInput';
import Button from '@/components/Button';
import { Store, User, Phone, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/config/api';

export default function EmployerSignUpPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/signup');
    }
  };

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!businessName.trim()) {
      setError(t('Please enter your business or shop name'));
      return;
    }
    if (!ownerName.trim()) {
      setError(t('Please enter owner / manager name'));
      return;
    }
    if (!phone || phone.length !== 10) {
      setError(t('Please enter a valid 10-digit mobile number'));
      return;
    }
    if (!pin || pin.length !== 6) {
      setError(t('Please enter a 6-digit security PIN'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup/employer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          ownerName,
          phoneNumber: phone,
          pin,
          business_name: businessName,
          owner_name: ownerName,
          phone_number: phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || t('Employer sign up failed'));
      }

      localStorage.setItem('kaamsetu_token', data.token);
      localStorage.setItem('kaamsetu_role', data.role);
      localStorage.setItem('kaamsetu_user_id', data.user_id);

      // Proceed to Screen 3.2 Business Details
      router.push('/onboard/business');
    } catch (err: any) {
      setError(err.message || t('Employer sign up failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <Header
        title={t('Employer Sign Up')}
        subtitle={t('Create your employer account')}
        stepInfo={t('Step 1 of 3')}
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
            label={t('Shop / Business Name')}
            type="text"
            placeholder={t('e.g. Sharma Electricals & Hardware')}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            icon={<Store className="w-5 h-5" />}
          />

          <Input
            label={t('Owner / Manager Name')}
            type="text"
            placeholder={t('e.g. Suresh Sharma')}
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
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
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Button type="submit" isLoading={loading}>
            {t('Create Account & Continue')}
          </Button>
        </div>
      </form>
    </MobileContainer>
  );
}
