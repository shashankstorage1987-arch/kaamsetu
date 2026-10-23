'use client';

import React, { useEffect, useState, useCallback } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  UserCheck,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface HireConfirmation {
  id?: string;
  confirmationId?: string;
  hireConfirmationId?: string;
  jobId: string;
  trade?: string;
  jobTrade?: string;
  profession?: string;
  jobProfession?: string;
  employerBusinessName?: string;
  employerFullName?: string;
  salary?: number;
  employerConfirmed: boolean;
  workerConfirmed?: boolean | null;
  status: 'PENDING' | 'HIRED' | 'MISMATCH' | 'CONFIRMED';
  initiatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function HireConfirmationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, translateTrade, translateProfession } = useLanguage();
  const confirmationId = params?.id as string;

  const [confirmation, setConfirmation] = useState<HireConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/hire-confirmations');
    }
  };

  const fetchConfirmation = useCallback(async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch('http://localhost:8080/api/v1/hire-confirmations/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const list: HireConfirmation[] = await res.json();
        const found = list.find(
          (item) => item.hireConfirmationId === confirmationId || item.confirmationId === confirmationId || item.id === confirmationId
        );
        if (found) {
          setConfirmation(found);
        } else {
          setError('Hire confirmation not found.');
        }
      } else {
        setError('Failed to load hire confirmation details.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error fetching hire confirmation.');
    } finally {
      setLoading(false);
    }
  }, [confirmationId]);

  useEffect(() => {
    if (confirmationId) {
      fetchConfirmation();
    }
  }, [confirmationId, fetchConfirmation]);

  const handleRespond = async (accepted: boolean) => {
    const targetId = confirmation?.hireConfirmationId || confirmation?.confirmationId || confirmation?.id || confirmationId;
    if (!targetId || targetId === 'undefined') {
      alert(t('Invalid confirmation ID.'));
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`http://localhost:8080/api/v1/hire-confirmations/${targetId}/response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accepted }),
      });

      if (res.ok) {
        await fetchConfirmation();
      } else {
        const errData = await res.json();
        alert(errData.message || t('Failed to submit hire response.'));
      }
    } catch (err) {
      console.error(err);
      alert(t('Network error submitting response.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <Header title="Hire Confirmation" subtitle="Loading..." showBack={true} onBack={handleBack} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileContainer>
    );
  }

  if (error || !confirmation) {
    return (
      <MobileContainer>
        <Header title="Hire Confirmation" subtitle="Error" showBack={true} onBack={handleBack} />
        <div className="flex-1 p-5 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm font-bold text-slate-800">{error ? t(error) : t('Confirmation not found')}</p>
          <Button onClick={() => router.push('/hire-confirmations')} variant="outline" className="mt-2">
            {t('View All Confirmations')}
          </Button>
        </div>
      </MobileContainer>
    );
  }

  const professionName = translateProfession(confirmation.profession || confirmation.jobProfession || 'Helper');
  const tradeName = translateTrade(confirmation.trade || confirmation.jobTrade || 'General');
  const employerName = confirmation.employerBusinessName || t('Employer');
  const ownerName = confirmation.employerFullName ? ` (${confirmation.employerFullName})` : '';
  const salaryAmount = confirmation.salary || 0;

  return (
    <MobileContainer>
      <Header
        title="Hire Request Detail"
        subtitle={`${t('From')} ${employerName}`}
        showBack={true}
        onBack={handleBack}
      />

      <div className="flex-1 min-h-0 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">{professionName}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> {employerName}{ownerName}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                confirmation.status === 'HIRED' || confirmation.status === 'CONFIRMED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : confirmation.status === 'MISMATCH'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-900 animate-pulse'
              }`}>
                {confirmation.status === 'HIRED' || confirmation.status === 'CONFIRMED'
                  ? t('Confirmed Hired')
                  : confirmation.status === 'MISMATCH'
                  ? t('Declined (Mismatch)')
                  : t('Response Required')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl">
              <div>
                <span className="text-slate-400 font-medium">{t('Trade Role:')}</span>
                <p className="font-bold text-slate-800">{tradeName}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">{t('Agreed Pay:')}</span>
                <p className="font-bold text-emerald-700">₹{salaryAmount.toLocaleString()} / mo</p>
              </div>
            </div>

            {/* Response CTA */}
            {confirmation.status === 'PENDING' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3 text-amber-950">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">
                      {t('Did you work on this job with')} {confirmation.employerBusinessName}?
                    </p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {t('Confirming YES marks this job as successfully completed. Select NO if you did not work.')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <Button
                    onClick={() => handleRespond(true)}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-2.5 rounded-xl shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> {t('YES, I Worked')}
                  </Button>

                  <Button
                    onClick={() => handleRespond(false)}
                    disabled={submitting}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 font-extrabold text-sm py-2.5 rounded-xl"
                  >
                    <XCircle className="w-4 h-4 mr-1.5 text-red-600" /> {t('NO, I Did Not')}
                  </Button>
                </div>
              </div>
            ) : confirmation.status === 'HIRED' || confirmation.status === 'CONFIRMED' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-900 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p>{t('Two-sided hire confirmed! Both parties agreed on job completion.')}</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center gap-3 text-red-900 text-xs font-semibold">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <p>{t('Hire mismatch logged. Job remains permanently closed.')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleBack} variant="secondary">
            {t('Back to Confirmations List')}
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
