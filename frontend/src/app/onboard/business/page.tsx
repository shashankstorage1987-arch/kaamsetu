'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Camera, Clock, Users, Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const TRADES = [
  { id: 'ELECTRICAL', label: 'Electrical Shop' },
  { id: 'HARDWARE', label: 'Hardware Store' },
  { id: 'SALON', label: 'Salon / Parlour' },
  { id: 'GROCERY', label: 'Grocery / Kirana' },
  { id: 'RESTAURANT', label: 'Restaurant / Cafe' },
  { id: 'MEDICAL', label: 'Medical Store' },
  { id: 'GARAGE', label: 'Auto Garage' },
  { id: 'OTHER', label: 'Other' },
];

export default function BusinessDetailsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, translateTrade } = useLanguage();

  const [trade, setTrade] = useState('ELECTRICAL');
  const [yearsInBusiness, setYearsInBusiness] = useState('');
  const [roles, setRoles] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/signup/employer');
    }
  };

  useEffect(() => {
    const fetchEmployerProfile = async () => {
      setInitialLoading(true);
      try {
        const token = localStorage.getItem('kaamsetu_token');
        if (!token) return;

        const res = await fetch('http://localhost:8080/api/v1/employers/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.businessTrade) {
            setTrade(data.businessTrade);
          } else if (data.business_trade) {
            setTrade(data.business_trade);
          }

          if (data.yearsInBusiness !== undefined && data.yearsInBusiness !== null) {
            setYearsInBusiness(String(data.yearsInBusiness));
          } else if (data.years_in_business !== undefined && data.years_in_business !== null) {
            setYearsInBusiness(String(data.years_in_business));
          }

          if (Array.isArray(data.typicalRolesHired)) {
            setRoles(data.typicalRolesHired.join(', '));
          } else if (Array.isArray(data.typical_roles_hired)) {
            setRoles(data.typical_roles_hired.join(', '));
          }

          if (data.photoUrl) {
            setPhotoUrl(data.photoUrl);
          } else if (data.photo_url) {
            setPhotoUrl(data.photo_url);
          }
        }
      } catch (err) {
        console.error('Error fetching employer profile:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEmployerProfile();
  }, []);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setPhotoSuccess('');

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit. Please select a smaller photo.');
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

          setPhotoUrl(base64Data);

          const token = localStorage.getItem('kaamsetu_token');
          if (token) {
            const res = await fetch('http://localhost:8080/api/v1/employers/me/photo', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                photo_url: base64Data,
                photoUrl: base64Data,
              }),
            });

            if (res.ok) {
              setPhotoSuccess('Shop photo saved!');
            }
          }
          setUploadingPhoto(false);
        };
        img.onerror = () => {
          setError('Failed to process selected image.');
          setUploadingPhoto(false);
        };
        img.src = rawUrl;
      };
      reader.onerror = () => {
        setError('Failed to read selected file.');
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Photo upload error:', err);
      setError('Failed to upload photo.');
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setPhotoSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedYears = yearsInBusiness.trim() ? parseInt(yearsInBusiness, 10) : 0;
    if (isNaN(parsedYears) || parsedYears < 0 || parsedYears > 150) {
      setError(t('Years in business must be between 0 and 150'));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');
      const rolesArray = roles ? roles.split(',').map((r) => r.trim()).filter(Boolean) : [];

      const res = await fetch('http://localhost:8080/api/v1/employers/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_trade: trade,
          businessTrade: trade,
          years_in_business: parsedYears,
          yearsInBusiness: parsedYears,
          typical_roles_hired: rolesArray,
          typicalRolesHired: rolesArray,
          photo_url: photoUrl,
          photoUrl: photoUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save business details');
      }

      // Proceed to Screen 3.3 Business Address
      router.push('/onboard/business-address');
    } catch (err: any) {
      setError(err.message || 'Failed to save business details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <Header
        title="Business Details"
        subtitle="Tell workers about your shop"
        stepInfo="Step 2 of 3"
        showBack={true}
        onBack={handleBack}
      />

      {initialLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-xs font-semibold">{t('Loading business details...')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 p-5 flex flex-col justify-between min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{t(error)}</span>
              </div>
            )}

            {photoSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{t(photoSuccess)}</span>
              </div>
            )}

            {/* Interactive Shop Photo Upload Section */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {photoUrl ? (
              <div className="flex flex-col items-center justify-center p-4 bg-emerald-50/60 border-2 border-emerald-200 rounded-2xl text-center gap-3 relative">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
                  <img src={photoUrl} alt="Shop Front" className="w-full h-full object-cover" />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {t('Change Photo')}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t('Remove')}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-green-50/50 border-2 border-dashed border-slate-200 hover:border-green-400 rounded-2xl text-center gap-2 transition-all group"
              >
                <div className="w-14 h-14 bg-slate-200 group-hover:bg-green-100 rounded-full flex items-center justify-center text-slate-500 group-hover:text-green-700 transition-colors">
                  {uploadingPhoto ? (
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-green-800">
                    {uploadingPhoto ? t('Processing photo...') : t('Upload Shop Front Photo (Optional)')}
                  </p>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-500 mt-0.5">
                    {t('Click to capture or select a photo (JPEG, PNG up to 10MB)')}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                {t('Business Trade / Category')}
              </label>
              <select
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full min-h-[50px] px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-green-600 focus:bg-white"
              >
                {TRADES.map((tItem) => (
                  <option key={tItem.id} value={tItem.id}>
                    {translateTrade(tItem.label)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Years in Business"
              type="number"
              min={0}
              max={150}
              placeholder="e.g. 5"
              helperText="Between 0 and 150 years"
              value={yearsInBusiness}
              onChange={(e) => setYearsInBusiness(e.target.value.replace(/[^0-9]/g, ''))}
              icon={<Clock className="w-5 h-5" />}
            />

            <Input
              label="Typical Roles You Hire For"
              type="text"
              placeholder="e.g. Helper, Cashier, Sales"
              value={roles}
              onChange={(e) => setRoles(e.target.value)}
              icon={<Users className="w-5 h-5" />}
            />
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <Button type="submit" isLoading={loading}>
              {t('Save Details & Next')}
            </Button>
          </div>
        </form>
      )}
    </MobileContainer>
  );
}
