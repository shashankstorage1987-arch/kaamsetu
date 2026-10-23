'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Input from '@/components/Input';
import PinInput from '@/components/PinInput';
import Button from '@/components/Button';
import { Phone, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ForgotPinPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/login');
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter your 10-digit registered mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/forgot-pin/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: cleanPhone,
          phoneNumber: cleanPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        let msg = data.message;
        if (Array.isArray(data.details) && data.details.length > 0) {
          msg = data.details.join(', ');
        }
        if (!msg || msg.toLowerCase().includes('invalid request') || msg.toLowerCase().includes('validation failure')) {
          msg = 'Please enter a valid 10-digit registered mobile number.';
        }
        throw new Error(msg);
      }

      setSuccessMsg('OTP sent to your registered mobile number (Mock OTP: 123456)');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Unable to send OTP. Please check your mobile number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    const cleanOtp = otp.trim().replace(/[^0-9]/g, '');
    const cleanPin = newPin.trim().replace(/[^0-9]/g, '');

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit verification OTP');
      return;
    }
    if (!cleanPin || cleanPin.length !== 6) {
      setError('Please enter a new 6-digit PIN');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/forgot-pin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: cleanPhone,
          phoneNumber: cleanPhone,
          otp: cleanOtp,
          new_pin: cleanPin,
          newPin: cleanPin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        let msg = data.message;
        if (Array.isArray(data.details) && data.details.length > 0) {
          msg = data.details.join(', ');
        }
        if (!msg || msg.toLowerCase().includes('invalid request') || msg.toLowerCase().includes('validation failure')) {
          msg = 'Invalid OTP or PIN format. Please check your details and try again.';
        }
        throw new Error(msg);
      }

      alert(t('PIN reset successfully! Please log in with your new PIN.'));
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Unable to reset PIN. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <Header
        title={step === 1 ? t('Forgot PIN') : t('Reset PIN')}
        subtitle={step === 1 ? t('Verify your mobile number') : t('Enter OTP & your new PIN')}
        showBack={true}
        onBack={handleBack}
      />

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{t(error)}</p>
              </div>
            )}

            <Input
              label={t('Registered Mobile Phone Number')}
              type="tel"
              maxLength={10}
              placeholder={t('10-digit mobile number')}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              icon={<Phone className="w-5 h-5" />}
            />
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <Button type="submit" isLoading={loading}>
              {t('Send Verification OTP')}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPin} className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-5">
            {successMsg && (
              <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3 text-green-900">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{t(successMsg)}</p>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{t(error)}</p>
              </div>
            )}

            <Input
              label={t('6-Digit Verification OTP')}
              type="text"
              maxLength={6}
              placeholder={t('Enter 6-digit OTP (Mock: 123456)')}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              icon={<KeyRound className="w-5 h-5" />}
            />

            <PinInput
              value={newPin}
              onChange={setNewPin}
              label={t('Enter New 6-Digit PIN')}
            />
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <Button type="submit" isLoading={loading}>
              {t('Reset PIN & Log In')}
            </Button>
          </div>
        </form>
      )}
    </MobileContainer>
  );
}
