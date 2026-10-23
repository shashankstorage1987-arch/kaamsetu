'use client';

import React, { useEffect, useState } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { Store, MapPin, Briefcase, Search, Plus, LogOut, ChevronRight, CheckCircle2, XCircle, Users, ArrowRight, X, Edit3, Clock, Phone, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/config/api';

interface JobSummary {
  jobId: string;
  trade: string;
  profession: string;
  salary: number;
  shift: string;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
  applicantsCount?: number;
  selectedCount?: number;
  rejectedCount?: number;
}

interface DashboardData {
  activeJobsCount: number;
  closedJobsCount: number;
  totalAppliedCount?: number;
  totalSelectedCount?: number;
  totalRejectedCount?: number;
  jobs: JobSummary[];
}

export default function EmployerDashboardPage() {
  const router = useRouter();
  const { t, translateTrade, translateProfession, translateStatus } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatusState] = useState<'ACTIVE' | 'CLOSED'>('ACTIVE');

  // Restore saved filter status after client hydration
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('kaamsetu_employer_dashboard_filter');
      if (saved === 'ACTIVE' || saved === 'CLOSED') {
        setFilterStatusState(saved);
      }
    } catch (e) {}
  }, []);

  const setFilterStatus = (status: 'ACTIVE' | 'CLOSED') => {
    setFilterStatusState(status);
    try {
      sessionStorage.setItem('kaamsetu_employer_dashboard_filter', status);
    } catch (e) {}
  };
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showHiredModal, setShowHiredModal] = useState(false);
  const [hiredWorkers, setHiredWorkers] = useState<any[]>([]);
  const [loadingHiredWorkers, setLoadingHiredWorkers] = useState(false);

  // Freeze body scroll when either modal is open
  useEffect(() => {
    if (showBusinessModal || showHiredModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showBusinessModal, showHiredModal]);

  const fetchHiredWorkers = async () => {
    setLoadingHiredWorkers(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/employers/me/hired-workers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHiredWorkers(data);
      }
    } catch (err) {
      console.error('Failed to load hired workers:', err);
    } finally {
      setLoadingHiredWorkers(false);
    }
  };

  useEffect(() => {
    if (showHiredModal) {
      fetchHiredWorkers();
    }
  }, [showHiredModal]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('kaamsetu_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [profRes, dashRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/employers/me`, { headers }),
          fetch(`${API_BASE_URL}/api/v1/employers/me/dashboard`, { headers }),
        ]);

        if (profRes.ok) {
          const pData = await profRes.json();
          setProfile(pData);
        }
        if (dashRes.ok) {
          const dData: DashboardData = await dashRes.json();
          setDashboard(dData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('kaamsetu_token');
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      // Ignore
    }
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <MobileContainer>
        <Header title="Employer Dashboard" subtitle="Loading profile..." showBack={false} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileContainer>
    );
  }

  const jobsList = dashboard?.jobs || [];
  const activeCount = dashboard?.activeJobsCount || 0;
  const closedCount = dashboard?.closedJobsCount || 0;
  const filteredJobs = jobsList.filter((j) => j.status === filterStatus);

  return (
    <MobileContainer>
      <Header title="Employer Dashboard" subtitle="KaamSetu Business Hub" showBack={false} />

      <div className="flex-1 min-h-0 p-5 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col gap-4">

          {/* Search-First Top Primary Action Card */}
          <div className="p-5 bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-3xl shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">{t('Primary Employer Action')}</p>
                <h2 className="text-lg font-black mt-0.5">{t('Find Skilled Workers Nearby')}</h2>
              </div>
              <Search className="w-8 h-8 text-blue-300 opacity-80" />
            </div>

            <p className="text-xs text-blue-100 leading-relaxed">
              {t('Search local workers by trade, profession, distance, and availability for instant contact reveal.')}
            </p>

            <Button
              onClick={() => router.push('/search')}
              variant="white"
              className="bg-white text-blue-950 hover:bg-blue-50 font-black py-3.5 shadow-md mt-1 border border-blue-200 flex items-center justify-center gap-2 group transition-all"
            >
              <Search className="w-5 h-5 text-blue-700 shrink-0 stroke-[2.5] group-hover:scale-110 transition-transform" />
              <span className="text-blue-950 font-black text-sm tracking-wide">
                {t('Search Nearby Skilled Workers')}
              </span>
            </Button>
          </div>

          {/* Secondary Fallback Action Link */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">{t('Need to post a fallback job?')}</span>
            <button
              type="button"
              onClick={() => router.push('/jobs/new')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 py-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Post a Job Need Instead')}</span>
            </button>
          </div>

          {/* Overall Hiring Pipeline Stats Card */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-md flex flex-col gap-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                {t('Overall Hiring Pipeline')}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{t('Across All Posted Jobs')}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex flex-col justify-between">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">{t('Applied')}</p>
                <p className="text-xl font-black text-blue-400 mt-0.5">{dashboard?.totalAppliedCount || 0}</p>
                <span className="text-[9px] text-slate-500 font-medium mt-0.5">{t('Candidates')}</span>
              </div>

              <div
                onClick={() => setShowHiredModal(true)}
                className="p-2.5 bg-emerald-950/60 border border-emerald-800/60 hover:border-emerald-400 hover:ring-2 hover:ring-emerald-400/50 rounded-2xl cursor-pointer transition-all active:scale-95 group flex flex-col justify-between"
                title="Click to view all hired workers"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-extrabold text-emerald-300 uppercase">{t('Selected')}</p>
                  <ChevronRight className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{dashboard?.totalSelectedCount || 0}</p>
                <p className="text-[9px] text-emerald-300 font-bold underline mt-0.5">{t('View Workers', 'View Workers')}</p>
              </div>

              <div className="p-2.5 bg-red-950/60 border border-red-800/60 rounded-2xl flex flex-col justify-between">
                <p className="text-[10px] font-extrabold text-red-300 uppercase">{t('Rejected')}</p>
                <p className="text-xl font-black text-red-400 mt-0.5">{dashboard?.totalRejectedCount || 0}</p>
                <span className="text-[9px] text-slate-500 font-medium mt-0.5">{t('Archived')}</span>
              </div>
            </div>

            {/* Quick Link to My Hired Workers if any hired */}
            {(dashboard?.totalSelectedCount ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => setShowHiredModal(true)}
                className="w-full mt-0.5 py-2 px-3 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700/80 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('View All Hired Workers', 'View All Hired Workers')} ({dashboard?.totalSelectedCount})</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Business Summary Header Card - Clickable to open Employer Details */}
          <div
            onClick={() => setShowBusinessModal(true)}
            className="p-4 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-2xl flex items-center justify-between shadow-xs transition-all cursor-pointer group active:scale-[0.99]"
            title="Click to view employer & business details"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-950 transition-colors">
                  {profile?.businessName || profile?.business_name || t('Business Details')}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {profile?.address?.area || 'Location'} &bull; {translateTrade(profile?.businessTrade || profile?.business_trade || 'Trade')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                {t('Employer')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>

          {/* Metrics Summary Row - Interactive Filter Tabs */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFilterStatus('ACTIVE')}
              className={`p-3.5 border rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer ${
                filterStatus === 'ACTIVE'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400'
                  : 'bg-blue-50 text-blue-950 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <p className={`text-[11px] font-bold uppercase tracking-wider ${filterStatus === 'ACTIVE' ? 'text-blue-100' : 'text-blue-700'}`}>
                {t('Active Jobs')} {filterStatus === 'ACTIVE' && '✓'}
              </p>
              <p className="text-2xl font-black mt-1">{activeCount}</p>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('CLOSED')}
              className={`p-3.5 border rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer ${
                filterStatus === 'CLOSED'
                  ? 'bg-slate-700 text-white border-slate-700 shadow-md ring-2 ring-slate-400'
                  : 'bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <p className={`text-[11px] font-bold uppercase tracking-wider ${filterStatus === 'CLOSED' ? 'text-slate-200' : 'text-slate-500'}`}>
                {t('Closed Jobs')} {filterStatus === 'CLOSED' && '✓'}
              </p>
              <p className="text-2xl font-black mt-1">{closedCount}</p>
            </button>
          </div>

          {/* Posted Jobs Section */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {filterStatus === 'ACTIVE' ? t('Active Jobs') : t('Closed Jobs')} ({filteredJobs.length})
              </h3>
              <span className="text-[11px] font-medium text-slate-400">{t('Click tab to switch view')}</span>
            </div>

            {filteredJobs.length === 0 ? (
              /* Empty State */
              <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center gap-2 shadow-xs">
                <Briefcase className="w-8 h-8 text-slate-400" />
                <p className="text-xs font-bold text-slate-800">
                  {filterStatus === 'ACTIVE' ? t('No active job requirements posted yet') : t('No closed job requirements found')}
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  {filterStatus === 'ACTIVE'
                    ? t('Search local workers by trade, profession, distance, and availability for instant contact reveal.')
                    : t('No closed job requirements found')}
                </p>
              </div>
            ) : (
              /* Jobs List with Scrollable Container & Candidate Navigation Links */
              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredJobs.map((j) => (
                  <div
                    key={j.jobId}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 transition-colors flex flex-col gap-3"
                  >
                    <div
                      onClick={() => router.push(`/jobs/${j.jobId}`)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {j.status === 'ACTIVE' ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {translateTrade(j.trade)} &bull; {translateProfession(j.profession)}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            ₹{j.salary.toLocaleString()} {t('/ mo')} &bull; {j.shift === 'DAY' ? t('Day Shift') : t('Night Shift')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                            j.status === 'ACTIVE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {translateStatus(j.status)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Candidate Pipeline Summary & Link for this Job */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md font-extrabold border border-blue-200">
                          {j.applicantsCount || 0} {t('Applied')}
                        </span>
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold border border-emerald-200">
                          {j.selectedCount || 0} {t('Selected')}
                        </span>
                        <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded-md font-extrabold border border-red-200">
                          {j.rejectedCount || 0} {t('Rejected')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/jobs/${j.jobId}/applicants`)}
                        className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 text-xs"
                      >
                        <span>{t('View Candidates')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" /> {t('Log Out')}
          </Button>
        </div>
      </div>

      {/* Employer Details Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col gap-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t('Employer Profile')}</h3>
                  <p className="text-[11px] text-slate-500">{t('Business & Shop Information')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBusinessModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shop Front Photo if available */}
            {(profile?.photoUrl || profile?.photo_url) ? (
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative bg-slate-100">
                <img
                  src={profile.photoUrl || profile.photo_url}
                  alt="Shop Front"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full py-6 rounded-2xl bg-blue-50/50 border border-dashed border-blue-200 flex flex-col items-center justify-center text-center gap-1.5">
                <Store className="w-8 h-8 text-blue-400" />
                <p className="text-xs font-semibold text-slate-600">{t('No shop photo uploaded yet')}</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowBusinessModal(false);
                    router.push('/onboard/business');
                  }}
                  className="text-[11px] font-bold text-blue-700 hover:underline"
                >
                  {t('+ Upload Shop Photo')}
                </button>
              </div>
            )}

            {/* Business Details Info Fields */}
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Business / Shop Name')}</span>
                <p className="text-sm font-bold text-slate-900">{profile?.businessName || profile?.business_name || 'Not provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Owner Name')}</span>
                  <p className="text-xs font-bold text-slate-800">{profile?.ownerName || profile?.owner_name || 'Not provided'}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Trade / Category')}</span>
                  <p className="text-xs font-bold text-blue-800">{translateTrade(profile?.businessTrade || profile?.business_trade || 'Trade')}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('Years in Business')}</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {profile?.yearsInBusiness ?? profile?.years_in_business ?? 1} {t('Years in operation')}
                  </p>
                </div>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              {((profile?.typicalRolesHired && profile.typicalRolesHired.length > 0) || (profile?.typical_roles_hired && profile.typical_roles_hired.length > 0)) && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Typical Roles Hired')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile.typicalRolesHired || profile.typical_roles_hired).map((r: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md border border-blue-200">
                        {translateProfession(r)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Business Address')}</span>
                <p className="text-xs font-medium text-slate-800 leading-relaxed">
                  {[
                    profile?.address?.addressLine || profile?.address?.address_line,
                    profile?.address?.area,
                    profile?.address?.city,
                    profile?.address?.pincode ? `PIN: ${profile.address.pincode}` : '',
                  ].filter(Boolean).join(', ') || t('Address not configured')}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  setShowBusinessModal(false);
                  router.push('/onboard/business');
                }}
                variant="primary"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {t('Edit Business Profile')}
              </Button>
              <Button
                onClick={() => setShowBusinessModal(false)}
                variant="outline"
                className="w-full"
              >
                {t('Close')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* My Hired Workers Modal */}
      {showHiredModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col gap-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{t('My Hired Workers', 'My Hired Workers')}</h3>
                  <p className="text-[11px] text-slate-500">{t('Verified Workers Hired via KaamSetu', 'Verified Workers Hired via KaamSetu')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHiredModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {loadingHiredWorkers ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600"></div>
                <p className="text-xs text-slate-500 font-medium">{t('Loading hired workers...', 'Loading hired workers...')}</p>
              </div>
            ) : hiredWorkers.length === 0 ? (
              <div className="py-12 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center gap-2">
                <Users className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-bold text-slate-800">{t('No hired workers yet', 'No hired workers yet')}</p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  {t('Once you select and confirm candidate hires from your active jobs, they will appear here with direct contact details.')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {hiredWorkers.map((hw: any) => (
                  <div
                    key={hw.confirmationId}
                    className="p-4 bg-white border border-emerald-200 rounded-2xl shadow-xs hover:border-emerald-400 transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {hw.workerPhotoUrl ? (
                            <img src={hw.workerPhotoUrl} alt={hw.workerFullName} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{hw.workerFullName || t('Hired Worker')}</h4>
                          <p className="text-xs font-semibold text-emerald-800">
                            {translateTrade(hw.workerTrade || 'OTHER')}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {[hw.workerAddressArea, hw.workerAddressCity].filter(Boolean).join(', ') || t('Local Worker')} &bull; {(!hw.workerExperienceYears || hw.workerExperienceYears === 0) ? t('Fresher') : `${hw.workerExperienceYears} ${t('Yrs Exp')}`}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full shrink-0">
                        ₹{(hw.salary || hw.agreedSalary || 0).toLocaleString()} {t('/ mo')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      {hw.workerPhoneNumber ? (
                        <a
                          href={`tel:${hw.workerPhoneNumber}`}
                          className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t('Call')}</span>
                        </a>
                      ) : (
                        <div className="py-2 px-3 bg-slate-50 text-slate-400 rounded-xl text-xs text-center">
                          {t('No Phone')}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowHiredModal(false);
                          router.push(`/workers/${hw.workerId}?from=dashboard`);
                        }}
                        className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>{t('Passport')} &rarr;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Bottom CTA */}
            <div className="pt-2 border-t border-slate-100">
              <Button onClick={() => setShowHiredModal(false)} variant="secondary" className="w-full">
                {t('Close', 'Close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}
