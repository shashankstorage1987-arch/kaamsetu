'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { MapPin, Bell, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PermissionsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState<'location' | 'notification'>('location');
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [notificationStatus, setNotificationStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const handleLocationAllow = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationStatus('granted');
          setStep('notification');
        },
        (err) => {
          setLocationStatus('denied');
          setStep('notification');
        }
      );
    } else {
      setLocationStatus('granted');
      setStep('notification');
    }
  };

  const handleLocationNotNow = () => {
    setLocationStatus('denied');
    setStep('notification');
  };

  const handleNotificationAllow = () => {
    // Screen 11.3 UI Permission State ONLY.
    // Boundary Rule: NO FCM SDK integration, NO FCM token generation/registration, NO call to /fcm-token.
    setNotificationStatus('granted');
    finishPermissions();
  };

  const handleNotificationNotNow = () => {
    setNotificationStatus('denied');
    finishPermissions();
  };

  // Auto-redirect if permissions were already granted/completed
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyCompleted = localStorage.getItem('kaamsetu_permissions_completed') === 'true';
      const role = localStorage.getItem('kaamsetu_role');
      if (alreadyCompleted) {
        if (role === 'WORKER') {
          router.replace('/home');
        } else {
          router.replace('/dashboard');
        }
        return;
      }

      // Check if browser already granted geolocation permission
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            try {
              localStorage.setItem('kaamsetu_permissions_completed', 'true');
            } catch (e) {}
            if (role === 'WORKER') {
              router.replace('/home');
            } else {
              router.replace('/dashboard');
            }
          }
        }).catch(() => {});
      }
    }
  }, [router]);

  const finishPermissions = () => {
    try {
      localStorage.setItem('kaamsetu_permissions_completed', 'true');
    } catch (e) {}
    const role = localStorage.getItem('kaamsetu_role');
    if (role === 'WORKER') {
      router.push('/home');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <MobileContainer>
      <Header
        title={step === 'location' ? 'Location Permission' : 'Notification Permission'}
        subtitle={step === 'location' ? 'Enable location for hyperlocal job discovery' : 'Enable notifications for instant job alerts'}
        showBack={step === 'notification'}
        onBack={() => setStep('location')}
      />

      <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col justify-between">
        {step === 'location' ? (
          // Screen 11.2 Location Permission Prompt
          <div className="flex flex-col items-center text-center my-auto gap-4 px-2">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-700 shadow-inner">
              <MapPin className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('Discover Hyperlocal Opportunities')}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('KaamSetu uses your spatial location to connect you with employers and jobs within your proximity')}
              </p>
            </div>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left flex items-start gap-3 mt-2">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t('Your location is kept strictly private and secure, and is used exclusively for proximity matching and connecting you with nearby opportunities.')}
              </p>
            </div>
          </div>
        ) : (
          // Screen 11.3 Notification Permission Prompt
          <div className="flex flex-col items-center text-center my-auto gap-4 px-2">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 shadow-inner">
              <Bell className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('Never Miss a Local Opportunity')}</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {t('Get real-time alerts when shop owners search for workers in your trade or send job invitations.')}
              </p>
            </div>

            <div className="w-full bg-blue-50/60 border border-blue-200 rounded-2xl p-3.5 text-left flex items-start gap-3 mt-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                {t('Notifications help you respond instantly when local shop owners match with your profile or send hiring requests.')}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          {step === 'location' ? (
            <>
              <Button onClick={handleLocationAllow} variant="primary">
                {t('Allow Location Access')}
              </Button>
              <Button onClick={handleLocationNotNow} variant="outline">
                {t('Not Now')}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleNotificationAllow} variant="primary">
                {t('Allow Notifications')}
              </Button>
              <Button onClick={handleNotificationNotNow} variant="outline">
                {t('Not Now')}
              </Button>
            </>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}
