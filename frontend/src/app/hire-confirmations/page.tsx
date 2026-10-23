'use client';

import React, { useEffect, useState } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  UserCheck,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
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

export default function WorkerHireConfirmationsPage() {
  const router = useRouter();
  const { t, translateTrade, translateProfession } = useLanguage();
  const [confirmations, setConfirmations] = useState<HireConfirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Response Submitting State
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  useEffect(() => {
    fetchConfirmations();
  }, []);

  const fetchConfirmations = async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch('http://localhost:8080/api/v1/hire-confirmations/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: HireConfirmation[] = await res.json();
        setConfirmations(data);
      } else {
        setError('Failed to load hire confirmations. Ensure you are logged in as a worker.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error fetching hire confirmations.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (confId: string, accepted: boolean) => {
    if (!confId || confId === 'undefined') {
      alert(t('Invalid hire confirmation ID.'));
      return;
    }
    setSubmittingId(confId);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`http://localhost:8080/api/v1/hire-confirmations/${confId}/response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accepted }),
      });

      if (res.ok) {
        await fetchConfirmations();
      } else {
        const errData = await res.json();
        alert(errData.message || t('Failed to submit hire response.'));
      }
    } catch (err) {
      console.error(err);
      alert(t('Network error submitting response.'));
    } finally {
      setSubmittingId(null);
    }
  };

  const renderStatusBadge = (item: HireConfirmation) => {
    switch (item.status) {
      case 'HIRED':
      case 'CONFIRMED':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t('Confirmed Hired')}
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-red-600" /> {t('Declined (Mismatch)')}
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> {t('Response Required')}
          </span>
        );
    }
  };

  return (
    <MobileContainer>
      <Header
        title="Hire Confirmations"
        subtitle="Verify job hire requests from employers"
        showBack={true}
        onBack={handleBack}
      />

      <div className="flex-1 min-h-0 p-5 flex flex-col justify-between overflow-y-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl text-center flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-xs font-bold text-red-800">{error}</p>
          </div>
        ) : confirmations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 gap-3">
            <UserCheck className="w-12 h-12 text-slate-300" />
            <div>
              <p className="text-base font-bold text-slate-800">{t('No Hire Requests')}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {t('When an employer selects you for a job, you will receive a hire confirmation prompt here to confirm or decline.')}
              </p>
            </div>
            <Button onClick={handleBack} variant="outline" className="mt-2">
              {t('Back to Home')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('Hire Confirmation Prompts')} ({confirmations.length})
            </p>

            {confirmations.map((item, index) => {
              const confId = item.hireConfirmationId || item.confirmationId || item.id || `conf-${index}`;
              const professionName = translateProfession(item.profession || item.jobProfession || 'Helper');
              const tradeName = translateTrade(item.trade || item.jobTrade || 'General');
              const employerName = item.employerBusinessName || t('Employer');
              const ownerName = item.employerFullName ? ` (${item.employerFullName})` : '';
              const salaryAmount = item.salary || 0;

              return (
                <div
                  key={confId}
                  className={`bg-white border rounded-3xl p-5 flex flex-col gap-4 shadow-sm ${
                    item.status === 'PENDING'
                      ? 'border-amber-300 ring-2 ring-amber-400/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{professionName}</h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" /> {employerName}{ownerName}
                      </p>
                    </div>
                    {renderStatusBadge(item)}
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

                  {/* Screen 9.1 / 9.2 Confirmation Prompt Block */}
                  {item.status === 'PENDING' ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3 text-amber-950">
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">
                            {t('Did you work on this job with')} {employerName}?
                          </p>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            {t('Confirming YES will mark this job as successfully completed on KaamSetu. Select NO if you did not work.')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-1">
                        <Button
                          onClick={() => handleRespond(confId, true)}
                          disabled={submittingId === confId}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-2.5 rounded-xl shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1.5" /> {t('YES, I Worked')}
                        </Button>

                        <Button
                          onClick={() => handleRespond(confId, false)}
                          disabled={submittingId === confId}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50 font-extrabold text-sm py-2.5 rounded-xl"
                        >
                          <XCircle className="w-4 h-4 mr-1.5 text-red-600" /> {t('NO, I Did Not')}
                        </Button>
                      </div>
                    </div>
                  ) : item.status === 'HIRED' || item.status === 'CONFIRMED' ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-900 text-xs font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <p>{t('Two-sided hire confirmed! Both you and')} {employerName} {t('agreed on this job completion.')}</p>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center gap-3 text-red-900 text-xs font-semibold">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                      <p>{t('Hire mismatch logged. Job remains permanently closed on KaamSetu.')}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <Button onClick={handleBack} variant="secondary">
            {t('Back to Home')}
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
