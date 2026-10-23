'use client';

import React, { useEffect, useState, useCallback } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Briefcase,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Navigation,
  ExternalLink
} from 'lucide-react';

interface JobDetail {
  jobId: string;
  employerId: string;
  employerBusinessName: string;
  trade: string;
  profession: string;
  experienceRequiredYears: number;
  salary: number;
  shift: 'DAY' | 'NIGHT';
  timing?: string;
  radiusKm: number;
  status: 'ACTIVE' | 'CLOSED';
  closeReason?: string;
  createdAt: string;
  addressLine?: string;
  area?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

export default function WorkerViewJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, translateTrade, translateProfession, translateStatus } = useLanguage();
  const jobId = params?.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  // Interest State
  const [applying, setApplying] = useState(false);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
  const [appliedAt, setAppliedAt] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`http://localhost:8080/api/v1/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: any = await res.json();
        setJob(data);
        if (data.hasApplied || data.has_applied) {
          setHasExpressedInterest(true);
        }
      } else {
        setError('Failed to fetch job details.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error fetching job details.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const checkExistingApplication = useCallback(async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`http://localhost:8080/api/v1/workers/me/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const apps = await res.json();
        const existing = apps.find((a: any) => a.jobId === jobId);
        if (existing) {
          setHasExpressedInterest(true);
          setAppliedAt(existing.createdAt || existing.created_at || existing.expressedInterestAt);
          setAppStatus(existing.status);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchJob();
      checkExistingApplication();
    }
  }, [jobId, fetchJob, checkExistingApplication]);

  const handleExpressInterest = async () => {
    setApplying(true);
    setSuccessMessage(null);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`http://localhost:8080/api/v1/jobs/${jobId}/interest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHasExpressedInterest(true);
        setAppliedAt(data.expressedInterestAt || new Date().toISOString());
        setAppStatus('EXPRESSED_INTEREST');
        setSuccessMessage('Your interest has been submitted! The employer will review your profile.');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to express interest in job.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting interest.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <Header title="Job Details" subtitle="Loading..." showBack={true} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileContainer>
    );
  }

  if (error || !job) {
    return (
      <MobileContainer>
        <Header title="Job Details" subtitle="Error" showBack={true} />
        <div className="flex-1 p-5 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm font-bold text-slate-800">{error || 'Job not found'}</p>
          <Button onClick={() => router.push('/home')} variant="outline" className="mt-2">
            Back to Home
          </Button>
        </div>
      </MobileContainer>
    );
  }

  const isActive = job.status === 'ACTIVE';

  return (
    <MobileContainer>
      <Header
        title={`${translateTrade(job.trade)} · ${translateProfession(job.profession)}`}
        subtitle={`${t('Posted by')} ${job.employerBusinessName}`}
        showBack={true}
        onBack={handleBack}
      />

      <div className="flex-1 min-h-0 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col gap-4">

          {/* Employer Card Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-3xl shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white/90">
                {translateTrade(job.trade)}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
              }`}>
                {translateStatus(job.status)}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black">{translateProfession(job.profession)}</h2>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-1 font-semibold">
                <Building2 className="w-4 h-4 text-blue-200 shrink-0" />
                <span>{job.employerBusinessName}</span>
                {[job.area, job.city].filter(Boolean).length > 0 && (
                  <span className="text-blue-200 font-normal">
                    &bull; {[job.area, job.city].filter(Boolean).join(', ')}
                  </span>
                )}
              </p>
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-blue-200 uppercase font-semibold">{t('OFFERED PAY')}</p>
                <p className="text-lg font-black text-amber-300">₹{job.salary.toLocaleString()} <span className="text-xs font-normal text-white">{t('/ month')}</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-blue-200 uppercase font-semibold">{t('Min Experience')}</p>
                <p className="text-sm font-extrabold">{job.experienceRequiredYears} {t('Years')}</p>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 text-emerald-900">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold">
                <p className="font-bold text-emerald-800">{t('Success!')}</p>
                <p className="mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Existing Application Banner */}
          {hasExpressedInterest && !successMessage && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between text-blue-900">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">{t('Interest Already Expressed')}</p>
                  <p className="text-[11px] text-blue-700">
                    {t('Submitted on')} {appliedAt && !isNaN(new Date(appliedAt).getTime()) ? new Date(appliedAt).toLocaleDateString() : t('Recently')}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/applications')}
                variant="outline"
                className="text-xs py-1 px-3 border-blue-300 text-blue-800 font-bold"
              >
                {t('View Details')}
              </Button>
            </div>
          )}

          {/* Job Requirement Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Requirement Details')}</h3>

            <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><Sparkles className="w-4 h-4 text-slate-400" /> {t('Job Status')}</span>
              <span className={`font-extrabold px-3 py-1 rounded-full text-xs ${
                isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                {job.status === 'ACTIVE' ? `🟢 ${t('Active & Hiring')}` : `🔴 ${t('CLOSED')}`}
              </span>
            </div>

            {appStatus && (
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400" /> {t('Your Application Status')}</span>
                <span className={`font-extrabold px-3 py-1 rounded-full text-xs ${
                  appStatus === 'HIRED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : appStatus === 'NOT_SELECTED'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {appStatus === 'HIRED' ? `🎉 ${t('Hired')}` : appStatus === 'NOT_SELECTED' ? `❌ ${t('Rejected')}` : `⏳ ${t('Pending Review')}`}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {t('Category Trade')}</span>
              <span className="font-bold text-slate-900">{translateTrade(job.trade)}</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> {t('Work Shift')}</span>
              <span className="font-bold text-slate-900">{job.shift === 'DAY' ? t('Day Shift') : t('Night Shift')} ({job.timing || t('Standard')})</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {t('Target Radius')}</span>
              <span className="font-bold text-slate-900">{job.radiusKm} {t('KM')}</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {t('Workplace Location')}</span>
              <span className="font-bold text-slate-900 truncate max-w-[180px] text-right">
                {[job.area, job.city].filter(Boolean).join(', ') || t('Local Area')}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5">
              <span className="text-slate-500 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-400" /> {t('Verification')}</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t('Verified Employer')}
              </span>
            </div>
          </div>

          {/* Shop & Workplace Location Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> {t('Shop & Workplace Address')}
              </h3>
              {job.distanceKm && job.distanceKm > 0 ? (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  📍 {job.distanceKm} {t('km away')}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{job.employerBusinessName}</span>
              </div>

              <div className="text-xs text-slate-600 ml-6 flex flex-col gap-0.5">
                {job.addressLine && <p className="font-semibold text-slate-800">{job.addressLine}</p>}
                <p className="text-slate-600">
                  {[job.area, job.city].filter(Boolean).join(', ')}
                  {job.pincode ? ` - ${job.pincode}` : ''}
                </p>
                {!job.addressLine && !job.area && !job.city && (
                  <p className="text-slate-400 italic">{t('Address not configured by employer')}</p>
                )}
              </div>

              {/* Direct Google Maps Directions Navigation Button */}
              {((job.latitude && job.longitude) || job.addressLine || job.area || job.city) && (
                <a
                  href={
                    job.latitude && job.longitude
                      ? `https://www.google.com/maps/search/?api=1&query=${job.latitude},${job.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          [job.employerBusinessName, job.addressLine, job.area, job.city, job.pincode].filter(Boolean).join(', ')
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 shadow-xs transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('Get Directions (Google Maps)')}</span>
                  <ExternalLink className="w-3 h-3 text-blue-400 ml-0.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          {!hasExpressedInterest && isActive ? (
            <Button
              onClick={handleExpressInterest}
              disabled={applying}
              className="w-full font-bold bg-blue-600 text-white hover:bg-blue-700 py-3.5 text-base shadow-md"
            >
              {applying ? t('Processing...') : t('Express Interest in Job')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => router.push('/applications')}
              className="w-full font-bold bg-slate-900 text-white hover:bg-slate-800 py-3.5"
            >
              {t('My Applications & Status')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          <Button onClick={handleBack} variant="secondary" className="flex items-center justify-center gap-2 font-bold py-3.5 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('Back to Job Search')}</span>
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
