'use client';

import React, { useState, useEffect, Suspense } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/config/api';
import {
  Search,
  MapPin,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Info,
  Plus,
  Building2,
  DollarSign,
  Clock,
  ArrowRight
} from 'lucide-react';

interface MatchBreakdown {
  tradeMatch: boolean;
  professionMatch: boolean;
  tradeScore: number;
  professionScore: number;
  experienceScore: number;
  distanceScore: number;
  availabilityScore: number;
}

interface WorkerCandidate {
  workerId: string;
  fullName: string;
  photoUrl?: string;
  trade: string;
  profession: string;
  experienceYears: number;
  distanceKm: number;
  isAvailable: boolean;
  aadhaarVerified: boolean;
  matchScore: number;
  matchBreakdown: MatchBreakdown;
  hasApplied?: boolean;
}

interface JobCandidate {
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
  distanceKm?: number;
  hasApplied?: boolean;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
  addressLine?: string;
  area?: string;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

const TRADE_OPTIONS = [
  { label: 'All Trades', value: '' },
  { label: 'Electrical Shop', value: 'ELECTRICAL' },
  { label: 'Hardware Store', value: 'HARDWARE' },
  { label: 'Salon / Parlour', value: 'SALON' },
  { label: 'Grocery / Kirana', value: 'GROCERY' },
  { label: 'Restaurant / Cafe', value: 'RESTAURANT' },
  { label: 'Medical Store', value: 'MEDICAL' },
  { label: 'Auto Garage', value: 'GARAGE' },
  { label: 'Other', value: 'OTHER' },
];

const PROFESSION_OPTIONS = [
  { label: 'All Professions', value: '' },
  { label: 'Helper', value: 'HELPER' },
  { label: 'Biller', value: 'BILLER' },
  { label: 'Sales Assistant', value: 'SALES' },
  { label: 'Barber / Stylist', value: 'BARBER' },
  { label: 'Waiter / Server', value: 'WAITER' },
  { label: 'Mechanic', value: 'MECHANIC' },
  { label: 'Cashier', value: 'CASHIER' },
  { label: 'Delivery', value: 'DELIVERY' },
  { label: 'Other', value: 'OTHER' },
];

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1.0 },
  { label: '5 km', value: 5.0 },
  { label: '25 km', value: 25.0 },
  { label: '100 km', value: 100.0 },
  { label: '500 KM+', value: 500.0 },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'jobs' ? 'jobs' : 'workers';

  const [searchMode, setSearchMode] = useState<'workers' | 'jobs'>(initialMode);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { t, translateTrade, translateProfession } = useLanguage();

  // Search parameters initialized safely with static defaults to prevent hydration mismatch
  const [selectedTrade, setSelectedTrade] = useState<string>('');
  const [selectedProfession, setSelectedProfession] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(5.0);
  const [availableNow, setAvailableNow] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [similarShopOnly, setSimilarShopOnly] = useState<boolean>(false);
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  // Restore saved search filter state from sessionStorage on client mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('kaamsetu_search_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.trade !== undefined) setSelectedTrade(parsed.trade);
        if (parsed.profession !== undefined) setSelectedProfession(parsed.profession);
        if (parsed.radiusKm !== undefined) setRadiusKm(Number(parsed.radiusKm));
        if (parsed.availableNow !== undefined) setAvailableNow(Boolean(parsed.availableNow));
        if (parsed.verifiedOnly !== undefined) setVerifiedOnly(Boolean(parsed.verifiedOnly));
        if (parsed.similarShopOnly !== undefined) setSimilarShopOnly(Boolean(parsed.similarShopOnly));
      }
    } catch (e) {}
    setHasHydrated(true);
  }, []);

  // Persist search filter changes to sessionStorage after hydration
  useEffect(() => {
    if (!hasHydrated) return;
    try {
      sessionStorage.setItem('kaamsetu_search_state', JSON.stringify({
        trade: selectedTrade,
        profession: selectedProfession,
        radiusKm,
        availableNow,
        verifiedOnly,
        similarShopOnly,
      }));
    } catch (e) {}
  }, [hasHydrated, selectedTrade, selectedProfession, radiusKm, availableNow, verifiedOnly, similarShopOnly]);

  // User location - dynamic from profile or geolocation
  const [lat, setLat] = useState<number>(28.6315);
  const [lon, setLon] = useState<number>(77.2167);
  const [locationLoaded, setLocationLoaded] = useState<boolean>(false);

  // Results state
  const [candidates, setCandidates] = useState<WorkerCandidate[]>([]);
  const [jobs, setJobs] = useState<JobCandidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedWorkerId, setExpandedWorkerId] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('kaamsetu_role');
    setUserRole(role);
    if (role === 'WORKER') {
      setSearchMode('jobs');
    } else if (role === 'EMPLOYER') {
      setSearchMode('workers');
    }

    // Check if location was already saved in sessionStorage
    let hasSavedLocation = false;
    try {
      const savedLat = sessionStorage.getItem('kaamsetu_user_lat');
      const savedLon = sessionStorage.getItem('kaamsetu_user_lon');
      if (savedLat && savedLon) {
        setLat(parseFloat(savedLat));
        setLon(parseFloat(savedLon));
        setLocationLoaded(true);
        hasSavedLocation = true;
      }
    } catch (e) {}

    // Attempt to load user's actual profile coordinates
    const fetchProfileLocation = async () => {
      try {
        const token = localStorage.getItem('kaamsetu_token');
        if (!token) {
          setLocationLoaded(true);
          return;
        }
        const endpoint = role === 'EMPLOYER'
          ? `${API_BASE_URL}/api/v1/employers/me`
          : `${API_BASE_URL}/api/v1/workers/me`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const profileData = await res.json();
          if (profileData.address?.latitude && profileData.address?.longitude) {
            setLat(profileData.address.latitude);
            setLon(profileData.address.longitude);
            try {
              sessionStorage.setItem('kaamsetu_user_lat', profileData.address.latitude.toString());
              sessionStorage.setItem('kaamsetu_user_lon', profileData.address.longitude.toString());
            } catch (e) {}
            setLocationLoaded(true);
            return;
          }
        }
      } catch (e) {
        // Fallback to defaults
      }

      // Check device GPS if profile coordinates not found
      if (!hasSavedLocation && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLat(pos.coords.latitude);
            setLon(pos.coords.longitude);
            try {
              sessionStorage.setItem('kaamsetu_user_lat', pos.coords.latitude.toString());
              sessionStorage.setItem('kaamsetu_user_lon', pos.coords.longitude.toString());
            } catch (e) {}
            setLocationLoaded(true);
          },
          () => {
            setLocationLoaded(true);
          },
          { timeout: 5000, maximumAge: 60000 }
        );
      } else {
        setLocationLoaded(true);
      }
    };

    fetchProfileLocation();
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const queryParams = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        radiusKm: radiusKm.toString(),
      });

      if (selectedTrade) queryParams.append('trade', selectedTrade);
      if (selectedProfession) queryParams.append('profession', selectedProfession);

      if (searchMode === 'workers') {
        if (availableNow) queryParams.append('availableNow', 'true');
        if (verifiedOnly) queryParams.append('verified', 'true');
        if (similarShopOnly) queryParams.append('similarShop', 'true');

        const res = await fetch(`${API_BASE_URL}/api/v1/search/workers?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setCandidates(data.workers || []);
        } else {
          setCandidates([]);
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/v1/search/jobs?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setJobs(data || []);
        } else {
          setJobs([]);
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
      setCandidates([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationLoaded) {
      fetchData();
    }
  }, [locationLoaded, lat, lon, searchMode, selectedTrade, selectedProfession, radiusKm, availableNow, verifiedOnly, similarShopOnly]);

  const toggleBreakdown = (workerId: string) => {
    setExpandedWorkerId(prev => (prev === workerId ? null : workerId));
  };

  return (
    <MobileContainer>
      <Header
        title={searchMode === 'jobs' ? 'Find Jobs' : 'Find Workers'}
        subtitle={searchMode === 'jobs' ? 'Hyperlocal Jobs Near You' : 'Hyperlocal Nearby Candidates'}
        showBack={true}
      />

      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto pb-6">
        {/* Mode Switcher Tabs - Only shown when user role is unassigned */}
        {!userRole && (
          <div className="bg-slate-200 p-1 flex border-b border-slate-300">
            <button
              type="button"
              onClick={() => setSearchMode('jobs')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                searchMode === 'jobs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Find Jobs ({jobs.length})
            </button>

            <button
              type="button"
              onClick={() => setSearchMode('workers')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                searchMode === 'workers' ? 'bg-green-700 text-white shadow-xs' : 'text-slate-700'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Find Workers ({candidates.length})
            </button>
          </div>
        )}

        {/* Search & Filter Header Section */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block uppercase tracking-wider">
                {t('Category Trade', 'Category Trade')}
              </label>
              <div className="relative">
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2.5 appearance-none text-slate-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {TRADE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value ? translateTrade(opt.label) : t(opt.label)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block uppercase tracking-wider">
                {t('Select Role', 'Select Role')}
              </label>
              <div className="relative">
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2.5 appearance-none text-slate-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {PROFESSION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value ? translateProfession(opt.label) : t(opt.label)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Distance Bar & Slider (1 to 500 KM) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <span>{t('Search Radius Distance', 'Search Radius Distance')}</span>
              <span className="text-blue-700 font-extrabold text-xs bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                {radiusKm >= 500 ? t('500 KM+') : `${radiusKm} ${t('KM')}`}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="500"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {[5, 25, 100, 500].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                    radiusKm === r
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {r >= 500 ? t('500 KM+') : `${r} ${t('KM')}`}
                </button>
              ))}
            </div>
          </div>

          {/* Worker Search Specific Chips */}
          {searchMode === 'workers' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setAvailableNow(prev => !prev)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                  availableNow
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                ⚡ {t('Available Now', 'Available Now')}
              </button>

              <button
                type="button"
                onClick={() => setVerifiedOnly(prev => !prev)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                  verifiedOnly
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                🛡️ {t('Aadhaar Verified', 'Aadhaar Verified')}
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="p-4 flex-1">
          {loading || !locationLoaded ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Finding nearby {searchMode === 'jobs' ? 'jobs' : 'workers'}...</p>
            </div>
          ) : searchMode === 'jobs' ? (
            /* WORKER JOB RESULTS */
            jobs.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                  <span>{jobs.length} {t('ACTIVE JOBS NEARBY')}</span>
                  <span className="text-slate-400">{t('Sorted by Date & Distance')}</span>
                </div>

                {jobs.map((job) => (
                  <div
                    key={job.jobId}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-extrabold border border-blue-200">
                            {translateTrade(job.trade)}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {job.shift === 'DAY' ? t('Day Shift') : job.shift === 'NIGHT' ? t('Night Shift') : `${job.shift} ${t('Shift')}`}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-tight mt-1.5">
                          {translateProfession(job.profession)}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.employerBusinessName}</span>
                          {[job.area, job.city].filter(Boolean).length > 0 && (
                            <span className="text-slate-400 font-normal">
                              &bull; {[job.area, job.city].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </p>
                      </div>

                      {job.hasApplied && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-extrabold text-xs shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {t('Applied')}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>₹{job.salary.toLocaleString()} {t('/ month')}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{t('Min')} {job.experienceRequiredYears} {t('Yrs Exp')}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{job.distanceKm ? `${job.distanceKm} ${t('km away')}` : `${job.radiusKm} ${t('km radius')}`}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{job.timing || t('Standard Timing')}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push(`/jobs/${job.jobId}/view`)}
                      className="w-full mt-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      {t('View Details & Apply')} <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 px-4 bg-blue-50/50 border border-blue-200 rounded-3xl flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {t('No active jobs found within')} {radiusKm} {t('KM')}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs">
                    {t('No employers have posted active jobs matching your criteria within')} {radiusKm} {t('KM')}. {t('Try expanding your search radius.')}
                  </p>
                </div>
                <div className="w-full flex flex-col gap-2 mt-1">
                  {radiusKm < 500 && (
                    <button
                      type="button"
                      onClick={() => setRadiusKm(Math.min(500, radiusKm + 50))}
                      className="w-full py-2.5 bg-white border border-blue-300 text-blue-900 rounded-xl font-bold text-xs shadow-xs hover:bg-blue-50 transition-colors"
                    >
                      {t('Expand Radius by +50 KM')} ({Math.min(500, radiusKm + 50)} {t('KM')})
                    </button>
                  )}
                  {radiusKm < 500 && (
                    <button
                      type="button"
                      onClick={() => setRadiusKm(500)}
                      className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-xs hover:bg-blue-700 transition-colors"
                    >
                      {t('Expand Radius to Maximum (500 KM)')}
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            /* EMPLOYER WORKER RESULTS */
            candidates.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                  <span>{candidates.length} {t('WORKERS FOUND NEARBY')}</span>
                  <span className="text-slate-400">{t('Sorted by Match Score')}</span>
                </div>

                {candidates.map((worker) => (
                  <div
                    key={worker.workerId}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {worker.fullName}
                        </h3>
                        <p className="text-xs font-medium text-slate-600 mt-0.5">
                          {translateTrade(worker.trade)} &bull; {translateProfession(worker.profession)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleBreakdown(worker.workerId)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-extrabold text-xs hover:bg-emerald-100 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{worker.matchScore}% {t('Match Score', 'Match')}</span>
                      </button>
                    </div>

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
                          {t('Available Now', 'Available Now')}
                        </span>
                      )}

                      {worker.aadhaarVerified && (
                        <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          {t('Aadhaar Verified', 'Aadhaar Verified')}
                        </span>
                      )}

                      {worker.hasApplied && (
                        <span className="flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                          {t('Already Applied', 'Already Applied')}
                        </span>
                      )}
                    </div>

                    {expandedWorkerId === worker.workerId && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col gap-1.5 mt-1">
                        <div className="flex items-center justify-between font-bold text-slate-700 pb-1 border-b border-slate-200">
                          <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-slate-500" /> {t('Match Breakdown')}</span>
                          <span className="text-emerald-700">{worker.matchScore}% {t('Total')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 pt-1">
                          <span>{t('Trade (35%):')} <strong className="text-slate-900">{worker.matchBreakdown?.tradeScore}%</strong></span>
                          <span>{t('Profession (30%):')} <strong className="text-slate-900">{worker.matchBreakdown?.professionScore}%</strong></span>
                          <span>{t('Experience (15%):')} <strong className="text-slate-900">{worker.matchBreakdown?.experienceScore}%</strong></span>
                          <span>{t('Distance (15%):')} <strong className="text-slate-900">{worker.matchBreakdown?.distanceScore}%</strong></span>
                          <span>{t('Availability (5%):')} <strong className="text-slate-900">{worker.matchBreakdown?.availabilityScore}%</strong></span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => router.push(`/workers/${worker.workerId}?from=search`)}
                      variant="secondary"
                      className="w-full mt-1 min-h-[44px]"
                    >
                      {t('View Skill Passport', 'View Skill Passport')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 px-4 bg-amber-50/50 border border-amber-200 rounded-3xl flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
                  <Search className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {radiusKm >= 500
                      ? t('No matching candidates found in 500KM+ radius', 'No workers found within 500 KM+')
                      : `No workers found within ${radiusKm} km`}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs">
                    {radiusKm >= 500
                      ? t('There are no workers matching your criteria even across 500 KM+. You can post a fallback job need.')
                      : `There are no workers matching your criteria within ${radiusKm} km. Expand your search radius or post a fallback job need.`}
                  </p>
                </div>
                <div className="w-full flex flex-col gap-2 mt-2">
                  {radiusKm < 500 && (
                    <button
                      type="button"
                      onClick={() => setRadiusKm(Math.min(500, radiusKm + 50))}
                      className="w-full py-2.5 bg-white border border-amber-300 text-amber-900 rounded-xl font-bold text-xs shadow-xs hover:bg-amber-100 transition-colors"
                    >
                      Search in +50 KM Radius ({Math.min(500, radiusKm + 50)} KM)
                    </button>
                  )}
                  {radiusKm < 500 && (
                    <button
                      type="button"
                      onClick={() => setRadiusKm(500)}
                      className="w-full py-2.5 bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs hover:bg-amber-700 transition-colors"
                    >
                      Search Across 500 KM+ Radius
                    </button>
                  )}
                  <div className="pt-2 border-t border-amber-200 mt-1">
                    <button
                      type="button"
                      onClick={() => router.push('/jobs/new')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" /> Post a Job Need Instead
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </MobileContainer>
  );
}

export default function EmployerSearchPage() {
  return (
    <Suspense fallback={
      <MobileContainer>
        <Header title="Search" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </MobileContainer>
    }>
      <SearchContent />
    </Suspense>
  );
}
