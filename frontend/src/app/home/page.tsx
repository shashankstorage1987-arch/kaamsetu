'use client';

import React, { useEffect, useState, useCallback } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { UserCheck, ShieldCheck, Clock, MapPin, Briefcase, LogOut, Power, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface AvailabilityData {
  isAvailable?: boolean;
  is_available?: boolean;
  availableUntil?: string | null;
  available_until?: string | null;
  remainingSeconds?: number;
  remaining_seconds?: number;
  effectiveAvailable?: boolean;
  effective_available?: boolean;
}

export default function WorkerHomePage() {
  const router = useRouter();
  const { t, translateTrade, language } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  const fetchProfileAndAvailability = useCallback(async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [profRes, availRes] = await Promise.all([
        fetch('http://localhost:8080/api/v1/workers/me', { headers }),
        fetch('http://localhost:8080/api/v1/workers/me/availability', { headers }),
      ]);

      if (profRes.ok) {
        const pData = await profRes.json();
        setProfile(pData);
      }
      if (availRes.ok) {
        const aData: any = await availRes.json();
        const norm = {
          isAvailable: aData.isAvailable ?? aData.is_available ?? false,
          availableUntil: aData.availableUntil ?? aData.available_until ?? null,
          remainingSeconds: aData.remainingSeconds ?? aData.remaining_seconds ?? 0,
          effectiveAvailable: aData.effectiveAvailable ?? aData.effective_available ?? false,
        };
        setAvailability(norm);
        setTimerSeconds(norm.remainingSeconds);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfileAndAvailability();
  }, [fetchProfileAndAvailability]);

  // Live countdown timer effect
  const isEffectiveAvailable = availability?.effectiveAvailable ?? availability?.effective_available ?? false;

  useEffect(() => {
    if (!isEffectiveAvailable || timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          fetchProfileAndAvailability();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isEffectiveAvailable, timerSeconds, fetchProfileAndAvailability]);

  const handleToggleAvailability = async (targetAvailable: boolean) => {
    setToggling(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch('http://localhost:8080/api/v1/workers/me/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isAvailable: targetAvailable,
          is_available: targetAvailable,
        }),
      });

      if (res.ok) {
        const aData: any = await res.json();
        const norm = {
          isAvailable: aData.isAvailable ?? aData.is_available ?? false,
          availableUntil: aData.availableUntil ?? aData.available_until ?? null,
          remainingSeconds: aData.remainingSeconds ?? aData.remaining_seconds ?? 0,
          effectiveAvailable: aData.effectiveAvailable ?? aData.effective_available ?? false,
        };
        setAvailability(norm);
        setTimerSeconds(norm.remainingSeconds);
      }
    } catch (e) {
      console.error('Failed to toggle availability:', e);
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      await fetch('http://localhost:8080/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      // Ignore network logout error
    }
    localStorage.clear();
    router.push('/login');
  };

  const formatRemainingTime = (seconds: number) => {
    if (seconds <= 0) return language === 'hi' ? '0 घंटे 0 मिनट' : '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return language === 'hi'
        ? `${hours} घंटे ${mins} मिनट शेष`
        : `${hours}h ${mins}m remaining`;
    }
    return language === 'hi'
      ? `${mins} मिनट ${secs} सेकंड शेष`
      : `${mins}m ${secs}s remaining`;
  };

  if (loading) {
    return (
      <MobileContainer>
        <Header title="Worker Home" subtitle="Loading availability..." showBack={false} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </MobileContainer>
    );
  }

  const rawAvailable = availability?.isAvailable ?? availability?.is_available ?? false;
  const effectiveAvailable = availability?.effectiveAvailable ?? availability?.effective_available ?? false;

  const isAvailableState = rawAvailable && effectiveAvailable;
  const isExpiredState = rawAvailable && !effectiveAvailable;

  const workerFullName = profile?.fullName || profile?.full_name || 'Worker Profile';
  const totalExperience = profile?.totalExperienceYears ?? profile?.total_experience_years ?? 0;
  const preferredDistance = (profile?.preferredDistanceKm && profile.preferredDistanceKm > 0)
    ? profile.preferredDistanceKm
    : ((profile?.preferred_distance_km && profile.preferred_distance_km > 0) ? profile.preferred_distance_km : 5.0);
  const categories = profile?.shopCategories || profile?.shop_categories || [];

    return (
    <MobileContainer>
      <Header title="Worker Home" subtitle="KaamSetu Skill Passport" showBack={false} />

      <div className="flex-1 min-h-0 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col gap-4">

          {/* Availability Card: Screen 2.1 (Available) or Screen 2.2 (Expired / Turned Off) */}
          {isAvailableState ? (
            /* SCREEN 2.1: Available State */
            <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600"></span>
                  </span>
                  <span className="text-sm font-extrabold text-emerald-900 tracking-wide uppercase">
                    {t('Available Now')}
                  </span>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-600 text-white rounded-full flex items-center gap-1 shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                  {t('12h Active Window')}
                </span>
              </div>

              <div className="bg-white/80 rounded-xl p-3.5 border border-emerald-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">{t('Session Time Left')}</p>
                  <p className="text-xl font-black text-emerald-950 mt-0.5">
                    {formatRemainingTime(timerSeconds)}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-600 opacity-80" />
              </div>

              <p className="text-xs text-emerald-800">
                {t('Employers nearby can discover your Skill Passport. Your availability stays active for 12 hours.')}
              </p>

              <Button
                onClick={() => handleToggleAvailability(false)}
                disabled={toggling}
                variant="outline"
                className="bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100 mt-1 font-semibold"
              >
                <Power className="w-4 h-4 mr-2 text-emerald-700" />
                {toggling ? t('Processing...') : t('Turn Availability Off')}
              </Button>
            </div>
          ) : isExpiredState ? (
            /* SCREEN 2.2: Expired State */
            <div className="p-5 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-sm font-extrabold text-amber-900 tracking-wide uppercase">
                  {t('12-Hour Availability Expired')}
                </span>
              </div>

              <p className="text-xs text-amber-800 leading-relaxed">
                {t('Your 12-hour active period has ended. You are currently hidden from employer searches until you turn availability back on.')}
              </p>

              <Button
                onClick={() => handleToggleAvailability(true)}
                disabled={toggling}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 mt-1 shadow-md"
              >
                <Power className="w-4 h-4 mr-2" />
                {toggling ? t('Processing...') : t('Turn Available Back On')}
              </Button>
            </div>
          ) : (
            /* Off / Unavailable Initial State */
            <div className="p-5 bg-slate-100 border border-slate-300 rounded-2xl flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-slate-400"></span>
                  <span className="text-sm font-bold text-slate-700 tracking-wide uppercase">
                    {t('Not Available')}
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                  {t('Offline')}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                {t('Turn on availability to allow local employers to search and match with your Skill Passport for 12 hours.')}
              </p>

              <Button
                onClick={() => handleToggleAvailability(true)}
                disabled={toggling}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 mt-1 shadow-md"
              >
                <Power className="w-4 h-4 mr-2" />
                {toggling ? t('Processing...') : t('Set Available for 12 Hours')}
              </Button>
            </div>
          )}

          {/* Skill Passport Summary Card (Clickable to My Profile) */}
          <div
            onClick={() => {
              const targetId = profile?.userId || profile?.user_id || localStorage.getItem('kaamsetu_user_id');
              if (targetId) router.push(`/workers/${targetId}`);
            }}
            className="bg-white border border-slate-200 hover:border-green-500 rounded-2xl p-4 flex flex-col gap-3 shadow-xs cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                {profile?.photoUrl || profile?.photo_url ? (
                  <img
                    src={profile?.photoUrl || profile?.photo_url}
                    alt={workerFullName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-base">
                    {workerFullName.charAt(0) || 'W'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-black text-slate-900 group-hover:text-green-700 transition-colors">{workerFullName}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-green-700 font-semibold mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('Aadhaar ID Verified')}</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 bg-green-50 text-green-800 rounded-full flex items-center gap-1 border border-green-200">
                {t('My Profile →')}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {t('Total Experience')}</span>
              <span className="font-bold text-slate-900">
                {(totalExperience === 0 || !totalExperience) ? t('0 Years (Fresher)') : `${totalExperience} ${t('Years')}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {t('Preferred Distance')}</span>
              <span className="font-bold text-slate-900">{preferredDistance} {t('KM')}</span>
            </div>

            {categories && categories.length > 0 && (
              <div className="flex flex-col gap-1.5 py-1">
                <span className="text-xs font-semibold text-slate-500">{t('Registered Trades')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat: string) => (
                    <span key={cat} className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {translateTrade(cat)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Find Jobs / Applications & Hire Confirmations Nav */}
          <div className="flex flex-col gap-2.5">
            <Button
              onClick={() => router.push('/search?mode=jobs')}
              className="w-full font-extrabold bg-blue-600 hover:bg-blue-700 text-white text-sm py-3 shadow-md flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" /> {t('Find & Browse Nearby Jobs')}
            </Button>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                onClick={() => router.push('/applications')}
                variant="outline"
                className="w-full font-bold border-blue-200 text-blue-900 hover:bg-blue-50 text-xs py-2.5"
              >
                <Briefcase className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> {t('My Applications')}
              </Button>
              <Button
                onClick={() => router.push('/hire-confirmations')}
                variant="outline"
                className="w-full font-bold border-amber-300 text-amber-950 hover:bg-amber-50 text-xs py-2.5"
              >
                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-amber-600" /> {t('Hire Prompts')}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" /> {t('Log Out')}
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
