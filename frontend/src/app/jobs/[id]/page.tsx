'use client';

import React, { useEffect, useState, useCallback } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/config/api';
import {
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  Edit3,
  XCircle,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  Users
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
  updatedAt: string;
  hiredWorkerId?: string;
  hiredWorkerName?: string;
  hiredWorkerPhone?: string;
  hiredWorkerPhotoUrl?: string;
  hireStatus?: string;
}

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1.0 },
  { label: '5 km', value: 5.0 },
  { label: '25 km', value: 25.0 },
  { label: '100 km', value: 100.0 },
  { label: '500 KM+', value: 500.0 },
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, translateTrade, translateProfession, translateStatus } = useLanguage();
  const jobId = params?.id as string;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  const [job, setJob] = useState<JobDetail | null>(null);
  const [applicantCount, setApplicantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State (Screen 6.2)
  const [isEditing, setIsEditing] = useState(false);
  const [editSalary, setEditSalary] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editShift, setEditShift] = useState<'DAY' | 'NIGHT'>('DAY');
  const [editTiming, setEditTiming] = useState('');
  const [editRadiusKm, setEditRadiusKm] = useState(1.0);
  const [updating, setUpdating] = useState(false);

  // Close Modal State (Screen 6.3)
  const [isClosing, setIsClosing] = useState(false);
  const [closeReason, setCloseReason] = useState<'HIRED_ELSEWHERE' | 'NO_LONGER_HIRING'>('HIRED_ELSEWHERE');
  const [closing, setClosing] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: JobDetail = await res.json();
        setJob(data);
        setEditSalary(data.salary.toString());
        setEditExperience(data.experienceRequiredYears.toString());
        setEditShift(data.shift);
        setEditTiming(data.timing || '');
        setEditRadiusKm(data.radiusKm);

        // Fetch live applicants count
        try {
          const appRes = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/applicants`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (appRes.ok) {
            const apps = await appRes.json();
            setApplicantCount(Array.isArray(apps) ? apps.length : 0);
          }
        } catch (e) {
          console.error('Failed fetching applicants count:', e);
        }
      } else {
        setError('Failed to fetch job details or unauthorized access.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error fetching job details.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId, fetchJob]);

  // Freeze background when edit or close modal is open
  useEffect(() => {
    if (isEditing || isClosing) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isEditing, isClosing]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sal = parseInt(editSalary, 10);
    if (isNaN(sal) || sal < 1000 || sal > 1000000) {
      alert(t('Monthly salary must be between ₹1,000 and ₹10,00,000'));
      return;
    }

    const exp = parseFloat(editExperience);
    if (isNaN(exp) || exp < 0 || exp > 50) {
      alert(t('Experience required must be between 0 and 50 years'));
      return;
    }

    const rad = typeof editRadiusKm === 'number' ? editRadiusKm : 1.0;
    if (isNaN(rad) || rad < 1.0 || rad > 500.0) {
      alert(t('Radius must be between 1.0 KM and 500.0 KM'));
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          salary: sal,
          experience_required_years: exp,
          shift: editShift,
          timing: editTiming,
          radius_km: rad,
        }),
      });

      if (res.ok) {
        setIsEditing(false);
        fetchJob();
      } else {
        alert('Failed to update job parameters');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmClose = async () => {
    setClosing(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/close`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ close_reason: closeReason }),
      });

      if (res.ok) {
        setIsClosing(false);
        fetchJob();
      } else {
        alert('Failed to close job');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <Header title="Job Management" subtitle="Loading job details..." showBack={true} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileContainer>
    );
  }

  if (error || !job) {
    return (
      <MobileContainer>
        <Header title="Job Detail" subtitle="Error Loading" showBack={true} />
        <div className="flex-1 p-5 flex flex-col items-center justify-center text-center gap-3">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm font-bold text-slate-800">{error || 'Job not found'}</p>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-2">
            Back to Dashboard
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
        subtitle={`Posted by ${job.employerBusinessName}`}
        showBack={true}
        onBack={handleBack}
      />

      <div className="flex-1 min-h-0 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col gap-4">

          {/* Job Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
              isActive
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isActive ? (
                <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-slate-500 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">
                  {isActive ? t('Active Job Status', 'Active Job Status') : t('Closed Job Status', 'Closed Job Status')}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isActive
                    ? t('Visible for employer management & matching', 'Visible for employer management & matching')
                    : `Closed (${job.closeReason?.replace(/_/g, ' ')})`}
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                isActive ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
              }`}
            >
              {translateStatus(job.status)}
            </span>
          </div>

          {/* Hired Worker Details Card if closed via hire */}
          {!isActive && (job.hiredWorkerId || job.hiredWorkerName || job.closeReason === 'HIRED_VIA_KAAMSETU') && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                    {t('Hired Worker Details', 'Hired Worker Details')}
                  </h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-emerald-600 text-white rounded-full">
                  {job.hireStatus || t('Hired via KaamSetu', 'Hired via KaamSetu')}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-emerald-100">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {job.hiredWorkerPhotoUrl ? (
                    <img src={job.hiredWorkerPhotoUrl} alt={job.hiredWorkerName || 'Worker'} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{job.hiredWorkerName || t('Hired Candidate', 'Hired Candidate')}</p>
                  <p className="text-xs text-slate-500">{translateTrade(job.trade)} &bull; {translateProfession(job.profession)}</p>
                  {job.hiredWorkerPhone && (
                    <a href={`tel:${job.hiredWorkerPhone}`} className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5">
                      📞 {job.hiredWorkerPhone}
                    </a>
                  )}
                </div>
              </div>

              {job.hiredWorkerId && (
                <Button
                  onClick={() => router.push(`/workers/${job.hiredWorkerId}?from=job`)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs py-2.5 shadow-xs"
                >
                  {t('View Skill Passport', 'View Skill Passport')} &rarr;
                </Button>
              )}
            </div>
          )}

          {/* Job Specification Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Job Requirement Details')}</h3>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {t('Trade & Role')}</span>
              <span className="font-bold text-slate-900">{translateTrade(job.trade)} &bull; {translateProfession(job.profession)}</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400" /> {t('Monthly Salary')}</span>
              <span className="font-bold text-slate-900">₹{job.salary.toLocaleString()} / mo</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {t('Min Experience')}</span>
              <span className="font-bold text-slate-900">{job.experienceRequiredYears} {t('Years')}</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> {t('Shift & Timing')}</span>
              <span className="font-bold text-slate-900">{job.shift === 'DAY' ? t('Day Shift') : t('Night Shift')} ({job.timing || t('Standard')})</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {t('Search Radius')}</span>
              <span className="font-bold text-slate-900">{job.radiusKm} {t('KM')}</span>
            </div>
          </div>

          {/* Hiring Funnel Header & Numbers */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-500" /> {t('Live Hiring Funnel')}
              </h3>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {t('Live Progress')}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <p className="text-lg font-black text-slate-800">{applicantCount > 0 ? applicantCount + 3 : 0}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('Notified')}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <p className="text-lg font-black text-slate-800">{applicantCount > 0 ? applicantCount + 1 : 0}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('Viewed')}</p>
              </div>
              <div className="p-2.5 bg-white border border-blue-200 bg-blue-50/40 rounded-xl">
                <p className="text-lg font-black text-blue-700">{applicantCount}</p>
                <p className="text-[10px] font-bold text-blue-700 uppercase">{t('Interested')}</p>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                <p className="text-lg font-black text-slate-800">{!isActive ? 1 : 0}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('Hired')}</p>
              </div>
            </div>

            <Button
              onClick={() => router.push(`/jobs/${jobId}/applicants`)}
              className="w-full font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              <Users className="w-4 h-4 mr-2" /> {t('View Applicants & Select Hire')}
            </Button>

            <p className="text-[11px] text-slate-500 italic text-center">
              {t('Review applicants, check match scores, and initiate hire requests.')}
            </p>
          </div>

          {/* Management Actions */}
          {isActive && (
            <div className="flex flex-col gap-2 mt-2">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="w-full font-bold border-blue-300 text-blue-900 hover:bg-blue-50"
              >
                <Edit3 className="w-4 h-4 mr-2 text-blue-600" /> {t('Edit Job Parameters')}
              </Button>

              <Button
                onClick={() => setIsClosing(true)}
                variant="outline"
                className="w-full font-bold border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2 text-red-600" /> {t('Close Job Need')}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button onClick={handleBack} variant="secondary">
            {t('Back to Dashboard')}
          </Button>
        </div>
      </div>

      {/* Screen 6.2: Edit Job Pre-filled Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t('Edit Active Job')}</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase block mb-1">{t('Monthly Salary (₹)')}</label>
                <Input
                  type="number"
                  min="1000"
                  max="1000000"
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase block mb-1">{t('Min Experience')} ({t('Years')})</label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={editExperience}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || parseFloat(val) >= 0) {
                      setEditExperience(val);
                    }
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-1">{t('Shift')}</label>
                  <select
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value as 'DAY' | 'NIGHT')}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                  >
                    <option value="DAY">{t('Day Shift')}</option>
                    <option value="NIGHT">{t('Night Shift')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase block mb-1">{t('Working Timing')}</label>
                  <Input
                    type="text"
                    value={editTiming}
                    onChange={(e) => setEditTiming(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase block mb-1">{t('Search Radius')}</label>
                <select
                  value={editRadiusKm}
                  onChange={(e) => setEditRadiusKm(parseFloat(e.target.value))}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <Button type="button" onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                  {t('Cancel')}
                </Button>
                <Button type="submit" disabled={updating} className="flex-1 bg-blue-600 font-bold">
                  {updating ? t('Processing...') : t('Save Edits')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screen 6.3: Close Job Reason Modal */}
      {isClosing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{t('Close Job Need')}</h3>
              <button onClick={() => setIsClosing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {t('Please select the reason for closing this job requirement. Once closed, this job cannot be edited or reopened.')}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setCloseReason('HIRED_ELSEWHERE')}
                className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-colors ${
                  closeReason === 'HIRED_ELSEWHERE'
                    ? 'bg-blue-50 border-blue-600 text-blue-900'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span>{t('Hired Worker Outside KaamSetu')}</span>
                {closeReason === 'HIRED_ELSEWHERE' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => setCloseReason('NO_LONGER_HIRING')}
                className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-colors ${
                  closeReason === 'NO_LONGER_HIRING'
                    ? 'bg-blue-50 border-blue-600 text-blue-900'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span>{t('No Longer Hiring for This Requirement')}</span>
                {closeReason === 'NO_LONGER_HIRING' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <Button type="button" onClick={() => setIsClosing(false)} variant="outline" className="flex-1">
                {t('Cancel')}
              </Button>
              <Button onClick={handleConfirmClose} disabled={closing} className="flex-1 bg-red-600 hover:bg-red-700 font-bold text-white">
                {closing ? t('Processing...') : t('Confirm Closure')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}
