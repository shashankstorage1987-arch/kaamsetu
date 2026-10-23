'use client';

import React, { useEffect, useState } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  UserCheck,
  XCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

interface WorkerApplication {
  id?: string;
  interestId?: string;
  jobId: string;
  trade?: string;
  jobTrade?: string;
  profession?: string;
  jobProfession?: string;
  salary?: number;
  employerBusinessName?: string;
  employerLocation?: string;
  status: string;
  createdAt?: string;
  created_at?: string;
  expressedInterestAt?: string;
}

export default function WorkerApplicationsPage() {
  const router = useRouter();
  const { t, translateTrade, translateProfession, translateStatus } = useLanguage();
  const [applications, setApplications] = useState<WorkerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/home');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch('http://localhost:8080/api/v1/workers/me/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: WorkerApplication[] = await res.json();
        setApplications(data);
      } else {
        setError('Failed to load applications. Please ensure you are logged in as a worker.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error loading applications.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIRED':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t('Hired')}
          </span>
        );
      case 'EXPRESSED_INTEREST':
      case 'INTERESTED':
        return (
          <span className="bg-blue-100 text-blue-900 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> {t('Pending Review')}
          </span>
        );
      case 'CLOSED':
        return (
          <span className="bg-slate-200 text-slate-700 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-300">
            <XCircle className="w-3.5 h-3.5 text-slate-500" /> {t('CLOSED')}
          </span>
        );
      default:
        return (
          <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-300">
            {translateStatus(status)}
          </span>
        );
    }
  };

  return (
    <MobileContainer>
      <Header
        title="My Job Applications"
        subtitle="Track your expressed interest & hiring status"
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
        ) : applications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 gap-3">
            <Briefcase className="w-12 h-12 text-slate-300" />
            <div>
              <p className="text-base font-bold text-slate-800">{t('No Job Applications Yet')}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {t('When you express interest in jobs from employers, they will show up here.')}
              </p>
            </div>
            <Button onClick={handleBack} variant="outline" className="mt-2">
              {t('Back to Home')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
              <span className="uppercase tracking-wider">{t('SUBMITTED APPLICATIONS')} ({applications.length})</span>
              <span className="text-slate-400">{t('Sorted by Date')}</span>
            </div>

            {applications.map((app, index) => {
              const tradeName = app.trade || app.jobTrade || 'General';
              const professionName = app.profession || app.jobProfession || 'Helper';
              const employerName = app.employerBusinessName || 'Local Business';
              const locationName = app.employerLocation || 'Local Area';
              const salaryAmount = app.salary || 0;
              const dateString = app.createdAt || app.created_at || app.expressedInterestAt;
              const formattedDate = dateString && !isNaN(new Date(dateString).getTime())
                ? new Date(dateString).toLocaleDateString()
                : 'Recently';

              return (
                <div
                  key={app.id || app.interestId || `${app.jobId}-${index}`}
                  onClick={() => router.push(`/jobs/${app.jobId}/view`)}
                  className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 flex flex-col gap-3 shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-extrabold border border-blue-200 uppercase">
                          {translateTrade(tradeName)}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">{translateProfession(professionName)}</h3>
                      <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {employerName}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-semibold text-slate-700">{locationName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">{t('Offered Pay:')} </span>
                      <strong className="text-emerald-700 font-black text-sm">₹{salaryAmount.toLocaleString()} / mo</strong>
                    </div>
                    <div className="flex items-center text-blue-700 font-extrabold text-xs">
                      {t('View Details')} <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
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
