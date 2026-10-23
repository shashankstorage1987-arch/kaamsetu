'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Input from '@/components/Input';
import PinInput from '@/components/PinInput';
import Button from '@/components/Button';
import { Phone, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTimeout = searchParams.get('timeout') === 'true';
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!pin || pin.length !== 6) {
      setError('Please enter your 6-digit security PIN');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, phone_number: phone, pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Too many failed login attempts. Account locked for 15 minutes.');
        }
        throw new Error(data.message || 'Invalid phone number or PIN');
      }

      localStorage.setItem('kaamsetu_token', data.token);
      localStorage.setItem('kaamsetu_role', data.role);
      localStorage.setItem('kaamsetu_user_id', data.user_id);

      // If permissions were already granted/completed previously, skip permissions screen
      const permissionsCompleted = localStorage.getItem('kaamsetu_permissions_completed') === 'true';
      if (permissionsCompleted) {
        if (data.role === 'WORKER') {
          router.push('/home');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/permissions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col justify-between">
      <div className="flex flex-col gap-5">
        {/* Screen 11.6 Session Timeout Banner */}
        {isTimeout && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">{t('Session Expired')}</p>
              <p className="text-xs text-amber-800 mt-0.5">{t('You were logged out due to inactivity. Enter your PIN to log back in.')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">{t(error)}</p>
          </div>
        )}

        <Input
          label="Mobile Phone Number"
          type="tel"
          maxLength={10}
          placeholder="10-digit mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
          icon={<Phone className="w-5 h-5" />}
        />

        <PinInput
          value={pin}
          onChange={setPin}
          label="6-Digit PIN"
        />

        <div className="flex justify-end">
          <Link href="/forgot-pin" className="text-xs font-semibold text-green-700 hover:underline py-1">
            {t('Forgot PIN?')}
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <Button type="submit" isLoading={loading}>
          {t('Log In')}
        </Button>

        <div className="text-center">
          <p className="text-sm text-slate-600">
            {t("Don't have an account?")}{' '}
            <Link href="/signup" className="font-bold text-green-700 hover:underline">
              {t('Sign Up')}
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}

export default function LoginPage() {
  const router = useRouter();

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
        title="Log In"
        subtitle="Enter mobile number & PIN to continue"
        showBack={true}
        onBack={handleBack}
      />
      <Suspense fallback={<div className="p-5 text-center text-slate-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </MobileContainer>
  );
}
