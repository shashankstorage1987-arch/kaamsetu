'use client';

import React, { useEffect, useState, useCallback } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Users,
  Briefcase,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  UserCheck,
  X
} from 'lucide-react';

interface Applicant {
  workerId: string;
  fullName: string;
  trade: string;
  profession: string;
  experienceYears: number;
  distanceKm: number;
  isAvailable: boolean;
  aadhaarVerified: boolean;
  matchScore: number;
  status: string;
  expressedInterestAt: string;
}

interface JobInfo {
  jobId: string;
  status: 'ACTIVE' | 'CLOSED';
  closeReason?: string;
  trade?: string;
  profession?: string;
  hiredWorkerId?: string;
  hiredWorkerName?: string;
  hiredWorkerPhone?: string;
}

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const { t, translateTrade, translateProfession } = useLanguage();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [job, setJob] = useState<JobInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hire Confirmation Dialog State
  const [selectedWorker, setSelectedWorker] = useState<Applicant | null>(null);
  const [hiring, setHiring] = useState(false);
  const [activeTab, setActiveTab] = useState<'INTERESTED' | 'REJECTED'>('INTERESTED');

  // Restore saved active tab after client hydration
  useEffect(() => {
    if (typeof window !== 'undefined' && jobId) {
      try {
        const saved = sessionStorage.getItem(`kaamsetu_applicants_tab_${jobId}`);
        if (saved === 'INTERESTED' || saved === 'REJECTED') {
          setActiveTab(saved);
        }
      } catch (e) {}
    }
  }, [jobId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && jobId) {
      try {
        sessionStorage.setItem(`kaamsetu_applicants_tab_${jobId}`, activeTab);
      } catch (e) {}
    }
  }, [activeTab, jobId]);

  // Freeze background when hire confirmation modal is open
  useEffect(() => {
    if (selectedWorker) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedWorker]);

  const fetchApplicantsAndJob = useCallback(async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [appsRes, jobRes] = await Promise.all([
        fetch(`http://localhost:8080/api/v1/jobs/${jobId}/applicants`, { headers }),
        fetch(`http://localhost:8080/api/v1/jobs/${jobId}`, { headers }),
      ]);

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob(jobData);
      }

      if (appsRes.ok) {
        const data: Applicant[] = await appsRes.json();
        setApplicants(data);
      } else {
        setError('Failed to load applicants or unauthorized access.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error fetching applicants.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchApplicantsAndJob();
    }
  }, [jobId, fetchApplicantsAndJob]);

  const handleConfirmHire = async () => {
    if (!selectedWorker) return;
    setHiring(true);

    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`http://localhost:8080/api/v1/jobs/${jobId}/hire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ workerId: selectedWorker.workerId }),
      });

      if (res.ok) {
        setSelectedWorker(null);
        router.push(`/jobs/${jobId}`);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to execute hire selection.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error executing hire operation.');
    } finally {
      setHiring(false);
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <Header title="Applicants" subtitle="Loading interested candidates..." showBack={true} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileContainer>
    );
  }

  const handleRejectCandidate = async (workerId: string) => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`http://localhost:8080/api/v1/jobs/${jobId}/applicants/${workerId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setApplicants((prev) =>
          prev.map((app) => (app.workerId === workerId ? { ...app, status: 'NOT_SELECTED' } : app))
        );
      } else {
        alert('Failed to reject candidate in database.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error rejecting candidate.');
    }
  };

  const isJobClosed = job?.status === 'CLOSED';

  // Identify hired applicant if job was closed or applicant was marked HIRED
  const hiredApplicant = applicants.find(
    (a) => a.status === 'HIRED' || (job?.hiredWorkerId && a.workerId === job.hiredWorkerId)
  );

  // Filter lists:
  // - Interested candidates: active candidates who haven't been rejected and aren't the hired one
  // - Rejected candidates: those marked NOT_SELECTED
  const interestedApplicants = applicants.filter(
    (a) => a.status !== 'NOT_SELECTED' && a.status !== 'HIRED' && (!job?.hiredWorkerId || a.workerId !== job.hiredWorkerId)
  );
  const rejectedApplicants = applicants.filter((a) => a.status === 'NOT_SELECTED');
  const currentList = activeTab === 'INTERESTED' ? interestedApplicants : rejectedApplicants;

  return (
    <MobileContainer>
      <Header
        title={t('Applicants & Pipeline', 'Applicants & Pipeline')}
        subtitle={
          isJobClosed
            ? t('Hiring Concluded · Job Closed', 'Hiring Concluded · Job Closed')
            : t('Review applicants & track hiring decisions', 'Review applicants & track hiring decisions')
        }
        showBack={true}
      />

      <div className="flex-1 min-h-0 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col gap-4">

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Job Closed Banner Notice */}
          {isJobClosed && (
            <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-2xl flex items-center gap-2.5 text-slate-800 text-xs shadow-xs">
              <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">{t('Job Requirement Closed', 'Job Requirement Closed')}</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {job?.closeReason ? `Closed: ${job.closeReason.replace(/_/g, ' ')}` : 'Hiring concluded for this job.'}{' '}
                  &bull; {t('Candidate actions are disabled because this job is closed.')}
                </p>
              </div>
            </div>
          )}

          {/* Hired Candidate Highlight Card */}
          {hiredApplicant && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black uppercase text-emerald-900 tracking-wider">
                    {t('Hired Worker', 'Hired Worker')}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-extrabold uppercase">
                  {t('Hired via KaamSetu', 'Hired via KaamSetu')}
                </span>
              </div>

              <div
                onClick={() => router.push(`/workers/${hiredApplicant.workerId}?from=applicants`)}
                className="bg-white p-3.5 rounded-xl border border-emerald-200 cursor-pointer hover:border-emerald-400 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm hover:text-emerald-700 flex items-center gap-1.5">
                      <span>{hiredApplicant.fullName}</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {translateTrade(hiredApplicant.trade)} &bull; {translateProfession(hiredApplicant.profession)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{hiredApplicant.matchScore}% Match</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                    <Briefcase className="w-3 h-3 text-slate-400" />
                    {(!hiredApplicant.experienceYears || hiredApplicant.experienceYears === 0) ? t('Fresher') : `${hiredApplicant.experienceYears} ${t('Yrs Exp')}`}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {hiredApplicant.distanceKm} km away
                  </span>
                  {job?.hiredWorkerPhone && (
                    <a
                      href={`tel:${job.hiredWorkerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-md text-[11px] hover:underline"
                    >
                      📞 {job.hiredWorkerPhone}
                    </a>
                  )}
                </div>

                <div className="text-xs font-bold text-emerald-700 flex items-center justify-between border-t border-slate-100 pt-2 mt-1">
                  <span>{t('View Worker Skill Passport &rarr;', 'View Worker Skill Passport &rarr;')}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{t('Confirmed Hire')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Tab Switcher for Interested vs Rejected Candidates */}
          <div className="bg-slate-100 p-1 flex rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('INTERESTED')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'INTERESTED' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('Interested', 'Interested')} ({interestedApplicants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REJECTED')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'REJECTED' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('Rejected', 'Rejected')} ({rejectedApplicants.length})</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>
              {activeTab === 'INTERESTED'
                ? `${interestedApplicants.length} ${t('INTERESTED CANDIDATES', 'INTERESTED CANDIDATES')}`
                : `${rejectedApplicants.length} ${t('REJECTED CANDIDATES', 'REJECTED CANDIDATES')}`}
            </span>
            <span className="text-slate-400">{t('Sorted by Match Score', 'Sorted by Match Score')}</span>
          </div>

          {currentList.length === 0 ? (
            <div className="py-12 p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center gap-2 shadow-xs">
              <Users className="w-8 h-8 text-slate-400" />
              <p className="text-xs font-bold text-slate-800">
                {activeTab === 'INTERESTED' ? t('No interested applicants yet for this job', 'No Interested Applicants Yet') : t('No rejected applicants', 'No Rejected Candidates')}
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                {activeTab === 'INTERESTED'
                  ? t('Workers nearby will appear here as they express interest in this job requirement.')
                  : t('Candidates you reject will be tracked here.')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {currentList.map((worker) => (
                <div
                  key={worker.workerId}
                  onClick={() => router.push(`/workers/${worker.workerId}?from=applicants`)}
                  className={`bg-white border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 ${
                    activeTab === 'REJECTED'
                      ? 'border-red-200 bg-red-50/20 hover:border-red-400'
                      : 'border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {/* Top Row: Name, Match Score */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight hover:text-blue-700 flex items-center gap-1.5">
                        <span>{worker.fullName}</span>
                      </h3>
                      <p className="text-xs font-medium text-slate-600 mt-0.5">
                        {translateTrade(worker.trade)} &bull; {translateProfession(worker.profession)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-extrabold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{worker.matchScore}% Match</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {(!worker.experienceYears || worker.experienceYears === 0) ? t('Fresher') : `${worker.experienceYears} ${t('Yrs Exp')}`}
                    </span>

                    <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {worker.distanceKm} {t('km away')}
                    </span>

                    {worker.isAvailable && (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {t('Available Now')}
                      </span>
                    )}

                    {worker.aadhaarVerified && (
                      <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        {t('Aadhaar Verified')}
                      </span>
                    )}

                    {activeTab === 'REJECTED' && (
                      <span className="flex items-center gap-1 text-red-700 bg-red-100 border border-red-200 px-2.5 py-1 rounded-md font-bold">
                        <X className="w-3.5 h-3.5 text-red-600" />
                        {t('Rejected')}
                      </span>
                    )}
                  </div>

                  {/* View Skill Passport Link */}
                  <div className="text-xs font-bold text-blue-700 flex items-center gap-1 border-t border-slate-100 pt-2">
                    <span>{t('View Worker Skill Passport →')}</span>
                  </div>

                  {/* Action Buttons: Only active when job is ACTIVE and on INTERESTED tab */}
                  {!isJobClosed && activeTab === 'INTERESTED' && (
                    <div className="grid grid-cols-2 gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleRejectCandidate(worker.workerId)}
                        variant="outline"
                        className="w-full border-red-200 text-red-700 hover:bg-red-50 font-bold py-2.5 text-xs"
                      >
                        <X className="w-4 h-4 mr-1 text-red-600" />
                        {t('Reject Candidate', 'Reject Candidate')}
                      </Button>

                      <Button
                        onClick={() => setSelectedWorker(worker)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-xs shadow-sm"
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        {t('Confirm Hire', 'Confirm Hire')}
                      </Button>
                    </div>
                  )}

                  {/* On Closed Jobs: Show Position Filled notice instead of CTAs */}
                  {isJobClosed && activeTab === 'INTERESTED' && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-500">{t('Position Filled · Actions Disabled', 'Position Filled · Actions Disabled')}</span>
                      <span className="italic">{t('Job Closed', 'Job Closed')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button onClick={() => router.push(`/jobs/${jobId}`)} variant="secondary">
            Back to Job Detail
          </Button>
        </div>
      </div>

      {/* Screen 6.4 Hire Confirmation Dialog */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Confirm Hire Selection</h3>
              <button onClick={() => setSelectedWorker(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to select <strong className="text-slate-900">{selectedWorker.fullName}</strong> for this requirement?
            </p>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              <p className="font-bold">Atomic State Transition Notice</p>
              <p className="mt-0.5 text-blue-800">
                This action will atomically mark the job as <strong>CLOSED (Hired via KaamSetu)</strong> and send a 2-sided hire confirmation request to the worker.
              </p>
            </div>

            <div className="flex gap-2 mt-2">
              <Button type="button" onClick={() => setSelectedWorker(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmHire} disabled={hiring} className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold text-white">
                {hiring ? 'Processing...' : 'Confirm Hire'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}
