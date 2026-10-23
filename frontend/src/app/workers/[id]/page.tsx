'use client';

import React, { useState, useEffect } from 'react';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/config/api';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Briefcase,
  MapPin,
  Globe,
  Award,
  ChevronRight,
  Eye,
  Lock,
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  Edit3,
  X,
  ArrowLeft
} from 'lucide-react';

interface Experience {
  id?: string;
  trade: string;
  profession: string;
  previousEmployerName?: string;
  durationMonths: number;
  coreSkills?: string[];
}

interface WorkerProfile {
  userId: string;
  fullName: string;
  totalExperienceYears: number;
  languages: string[];
  preferredSalary?: number;
  preferredDistanceKm: number;
  isAvailable: boolean;
  photoUrl?: string;
  photo_url?: string;
  address?: {
    addressLine?: string;
    area?: string;
    city?: string;
    pincode?: string;
  };
  experiences: Experience[];
  shopCategories: string[];
  recentlyCompletedHiresCount: number;
  phoneNumber?: string;
  aadhaarVerified?: boolean;
}

export default function WorkerSkillPassportPage() {
  const router = useRouter();
  const params = useParams();
  const { t, translateTrade, translateProfession } = useLanguage();
  const workerId = params.id as string;

  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Contact Reveal state
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealing, setRevealing] = useState<boolean>(false);
  const [isSelfView, setIsSelfView] = useState<boolean>(false);
  const [fromSource, setFromSource] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setFromSource(params.get('from') || '');
    }
  }, []);

  const getBackText = () => {
    if (isSelfView) {
      return t('Back to Home');
    }
    if (fromSource === 'dashboard') {
      return t('Back to Dashboard');
    }
    if (fromSource === 'applicants') {
      return t('Back to Applicants');
    }
    if (fromSource === 'job') {
      return t('Back to Job Details');
    }
    return t('Back to Search Results');
  };

  // Photo Upload state
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);

  // Profile Edit Modal state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editSalary, setEditSalary] = useState<string>('');
  const [editDistanceKm, setEditDistanceKm] = useState<string>('');
  const [editAddressLine, setEditAddressLine] = useState<string>('');
  const [editArea, setEditArea] = useState<string>('');
  const [editCity, setEditCity] = useState<string>('');
  const [editPincode, setEditPincode] = useState<string>('');
  const [editLanguages, setEditLanguages] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  const openEditModal = () => {
    if (!profile) return;
    setEditFullName(profile.fullName || '');
    setEditSalary(profile.preferredSalary && profile.preferredSalary > 0 ? profile.preferredSalary.toString() : '');
    setEditDistanceKm(profile.preferredDistanceKm && profile.preferredDistanceKm > 0 ? profile.preferredDistanceKm.toString() : '5.0');
    setEditAddressLine(profile.address?.addressLine || '');
    setEditArea(profile.address?.area || '');
    setEditCity(profile.address?.city || '');
    setEditPincode(profile.address?.pincode || '');
    setEditLanguages(profile.languages ? profile.languages.join(', ') : '');
    setIsEditingProfile(true);
  };

  // Freeze background when worker profile edit modal is open
  useEffect(() => {
    if (isEditingProfile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isEditingProfile]);

  const handleSaveProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sal = editSalary.trim() ? parseInt(editSalary, 10) : null;
    const dist = editDistanceKm.trim() ? parseFloat(editDistanceKm) : null;

    if (sal !== null && (isNaN(sal) || sal < 1000 || sal > 500000)) {
      alert(t('Preferred monthly salary must be between ₹1,000 and ₹5,00,000'));
      return;
    }

    if (dist !== null && (isNaN(dist) || dist < 0.5 || dist > 100)) {
      alert(t('Preferred distance must be between 0.5 KM and 100 KM'));
      return;
    }

    setSavingProfile(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const langArray = editLanguages ? editLanguages.split(',').map((l) => l.trim()).filter(Boolean) : [];

      const res = await fetch(`${API_BASE_URL}/api/v1/workers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: editFullName,
          full_name: editFullName,
          preferredSalary: sal,
          preferred_salary: sal,
          preferredDistanceKm: dist,
          preferred_distance_km: dist,
          addressLine: editAddressLine,
          address_line: editAddressLine,
          area: editArea,
          city: editCity,
          pincode: editPincode,
          languages: langArray,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditingProfile(false);
        setPhotoSuccess('Profile updated successfully!');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Network error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    const fetchSkillPassport = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('kaamsetu_token');
        const res = await fetch(`${API_BASE_URL}/api/v1/workers/${workerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);

          // Check if current user is the worker themselves
          const currentUserId = localStorage.getItem('kaamsetu_user_id');
          if (currentUserId === data.userId || (data.phoneNumber && !data.phoneNumber.includes('X'))) {
            setIsSelfView(true);
            setRevealedPhone(data.phoneNumber);
          }
        }
      } catch (err) {
        console.error('Failed to load skill passport:', err);
      } finally {
        setLoading(false);
      }
    };

    if (workerId) {
      fetchSkillPassport();
    }
  }, [workerId]);

  const handleRevealContact = async () => {
    setRevealing(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const res = await fetch(`${API_BASE_URL}/api/v1/workers/${workerId}/reveal-contact`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRevealedPhone(data.phoneNumber);
      } else {
        alert('Failed to reveal contact information. Employer login required.');
      }
    } catch (err) {
      console.error('Contact reveal error:', err);
      alert('Error revealing contact details.');
    } finally {
      setRevealing(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setPhotoSuccess(null);

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const rawUrl = reader.result as string;
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }
          const base64Data = canvas.toDataURL('image/jpeg', 0.85);

          const token = localStorage.getItem('kaamsetu_token');
          const res = await fetch(`${API_BASE_URL}/api/v1/workers/me/photo`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ photo_url: base64Data }),
          });

          if (res.ok) {
            const updated = await res.json();
            setProfile((prev) => prev ? { ...prev, photoUrl: updated.photoUrl || base64Data, photo_url: updated.photoUrl || base64Data } : null);
            setPhotoSuccess('Profile photo updated successfully!');
          } else {
            setPhotoError('Failed to upload profile photo. Please try again.');
          }
          setUploadingPhoto(false);
        };
        img.src = rawUrl;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setPhotoError('Network error uploading profile photo.');
      setUploadingPhoto(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      const role = localStorage.getItem('kaamsetu_role');
      if (role === 'EMPLOYER') {
        router.push('/dashboard');
      } else {
        router.push('/home');
      }
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <Header title={t('Worker Skill Passport')} onBack={handleBack} />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
          <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">{t('Loading Skill Passport...')}</p>
        </div>
      </MobileContainer>
    );
  }

  if (!profile) {
    return (
      <MobileContainer>
        <Header title={t('Worker Skill Passport')} onBack={handleBack} />
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-3">
          <p className="font-bold text-slate-800">{t('Worker profile not found.')}</p>
          <Button onClick={handleBack} variant="outline">
            {t('Go Back')}
          </Button>
        </div>
      </MobileContainer>
    );
  }

  const avatarUrl = profile.photoUrl || profile.photo_url;

  return (
    <MobileContainer>
      <Header title="Skill Passport" subtitle="Verified Worker Credentials" showBack={true} onBack={handleBack} />

      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4 pb-8">

        {/* Photo Status Banner */}
        {photoSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{photoSuccess}</span>
          </div>
        )}
        {photoError && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-red-900 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{photoError}</span>
          </div>
        )}

        {/* Worker Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative group shrink-0 w-20 h-20 min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px] rounded-full border-2 border-emerald-500 shadow-sm bg-slate-100 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}

                {/* Photo Upload Overlay for Self Profile */}
                {isSelfView && (
                  <label className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-all active:scale-95 z-10">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight truncate">
                  {profile.fullName}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {profile.address?.area || profile.address?.city || t('Local Area')}
                  </span>
                </div>

                {isSelfView && (
                  <div className="flex items-center gap-2 mt-2">
                    <label className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-extrabold cursor-pointer hover:underline">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingPhoto ? t('Uploading...') : t('Change Profile Photo')}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-extrabold hover:underline"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t('Edit Profile')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>


          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {profile.aadhaarVerified && (
              <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                {t('Aadhaar ID Verified')}
              </span>
            )}

            {profile.isAvailable && (
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {t('Available Now')}
              </span>
            )}
          </div>
        </div>

        {/* Contact / Self Profile Info Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-md flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-400" />
              {t('Contact Information')}
            </span>

            {isSelfView && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-emerald-600 text-white rounded-full">
                  {t('Self Profile')}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="text-[11px] font-bold px-2 py-0.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{t('Edit Profile')}</span>
                </button>
              </div>
            )}
          </div>

          {isSelfView ? (
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">{t('Registered Mobile Number')}</p>
                  <p className="text-lg font-mono font-extrabold text-white tracking-wide mt-0.5">
                    {revealedPhone || profile.phoneNumber || t('Registered Phone')}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {t('Verified')}
                </span>
              </div>
            </div>
          ) : revealedPhone ? (
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl">
                <div>
                  <p className="text-[11px] text-slate-400 font-medium">{t('Direct Phone Number')}</p>
                  <p className="text-lg font-mono font-extrabold text-white tracking-wide mt-0.5">
                    {revealedPhone}
                  </p>
                </div>

                <a
                  href={`tel:${revealedPhone}`}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t('Call Now')}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 p-3 rounded-2xl">
                <span className="text-sm font-mono font-bold text-slate-300">
                  {profile.phoneNumber || '+91 XXXXX X1234'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> {t('Masked')}
                </span>
              </div>

              <Button
                onClick={handleRevealContact}
                isLoading={revealing}
                variant="primary"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white min-h-[44px]"
              >
                <Eye className="w-4 h-4 mr-2" /> {t('View Contact Number')}
              </Button>
            </div>
          )}
        </div>

        {/* Experience & Skills Overview */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-green-700" />
            {t('Experience Summary')}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500">{t('Total Experience')}</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5">
                {(profile.totalExperienceYears === 0 || !profile.totalExperienceYears)
                  ? t('0 Years (Fresher)')
                  : `${profile.totalExperienceYears} ${t('Years')}`}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col">
              <span className="text-[11px] font-semibold text-slate-500">{t('Preferred Distance')}</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5">
                {(profile.preferredDistanceKm && profile.preferredDistanceKm > 0 ? profile.preferredDistanceKm : 5.0)} {t('KM')}
              </span>
            </div>
          </div>

          {profile.preferredSalary && profile.preferredSalary > 0 ? (
            <div className="p-3.5 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">{t('Expected Monthly Pay')}</span>
              <span className="font-extrabold text-emerald-800 text-sm">₹{profile.preferredSalary.toLocaleString()} {t('/ mo')}</span>
            </div>
          ) : null}

          {/* Registered Trades */}
          {profile.shopCategories && profile.shopCategories.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Registered Trades')}</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.shopCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    {translateTrade(cat)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Experiences */}
          {profile.experiences && profile.experiences.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Work History')}</span>
              {profile.experiences.map((exp, idx) => {
                const isFresherRecord = !exp.durationMonths || exp.durationMonths === 0 || exp.previousEmployerName === 'Fresher';
                return (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-sm">{translateProfession(exp.profession)}</span>
                      <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                        {translateTrade(exp.trade)}
                      </span>
                    </div>
                    {isFresherRecord ? (
                      <div className="flex items-center gap-1.5 py-0.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-xs">
                          🌱 {t('Fresher (Looking for First Job)')}
                        </span>
                      </div>
                    ) : (
                      <>
                        {exp.previousEmployerName && (
                          <p className="text-slate-600">{t('Shop / Business:')} <strong className="text-slate-800">{exp.previousEmployerName}</strong></p>
                        )}
                        <p className="text-slate-600">{t('Duration:')} <strong className="text-slate-800">{exp.durationMonths} {t('Months')}</strong></p>
                      </>
                    )}
                    {exp.coreSkills && exp.coreSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {exp.coreSkills.map((sk, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[11px]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Languages & Location Details */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-700" />
            {t('Location & Languages')}
          </h3>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
            <span className="text-slate-500">{t('Address Line')}</span>
            <span className="font-bold text-slate-800">{profile.address?.addressLine || t('Not specified')}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
            <span className="text-slate-500">{t('Area / City')}</span>
            <span className="font-bold text-slate-800">{profile.address?.area || profile.address?.city || t('Local Area')}</span>
          </div>

          {profile.languages && profile.languages.length > 0 && (
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-slate-500">{t('Known Languages')}</span>
              <span className="font-bold text-slate-800">{profile.languages.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Back navigation button */}
        <div className="mt-2">
          <Button onClick={handleBack} variant="secondary" className="flex items-center justify-center gap-2 font-bold py-3.5 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>{getBackText()}</span>
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm flex flex-col gap-4 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Worker Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdit} className="flex flex-col gap-3">
              <Input
                label="Full Name"
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Monthly Salary (₹)"
                  type="number"
                  min={1000}
                  max={500000}
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="15000"
                />

                <Input
                  label="Max Distance (KM)"
                  type="number"
                  min={0.5}
                  max={100}
                  step="0.5"
                  value={editDistanceKm}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || parseFloat(val) >= 0) {
                      setEditDistanceKm(val);
                    }
                  }}
                  placeholder="5.0"
                />
              </div>

              <Input
                label="Street Address Line"
                type="text"
                value={editAddressLine}
                onChange={(e) => setEditAddressLine(e.target.value)}
                placeholder="Shop / House No."
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Area / Sector"
                  type="text"
                  value={editArea}
                  onChange={(e) => setEditArea(e.target.value)}
                  placeholder="Sector 143"
                />
                <Input
                  label="City"
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Noida"
                />
              </div>

              <Input
                label="Known Languages (comma-separated)"
                type="text"
                value={editLanguages}
                onChange={(e) => setEditLanguages(e.target.value)}
                placeholder="Hindi, English"
              />

              <div className="flex gap-2 mt-2">
                <Button type="button" onClick={() => setIsEditingProfile(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={savingProfile} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}
