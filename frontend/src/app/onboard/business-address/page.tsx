'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileContainer from '@/components/MobileContainer';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { MapPin, Navigation, Crosshair, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/config/api';

export default function BusinessAddressPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/onboard/business');
    }
  };

  useEffect(() => {
    const fetchAddressDetails = async () => {
      setInitialLoading(true);
      try {
        const token = localStorage.getItem('kaamsetu_token');
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/v1/employers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.address) {
            if (data.address.addressLine) setAddressLine(data.address.addressLine);
            if (data.address.area) setArea(data.address.area);
            if (data.address.city) setCity(data.address.city);
            if (data.address.pincode) setPincode(data.address.pincode);
            if (data.address.latitude !== undefined && data.address.latitude !== null) {
              setLatitude(data.address.latitude);
            }
            if (data.address.longitude !== undefined && data.address.longitude !== null) {
              setLongitude(data.address.longitude);
              setGpsSuccess(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching address profile:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAddressDetails();
  }, []);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setError(t('Geolocation is not supported by your browser'));
      return;
    }

    setGpsDetecting(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsSuccess(true);
        setGpsDetecting(false);
      },
      (err) => {
        setGpsDetecting(false);
        setError(t('Unable to get high-accuracy location. You can still enter your address manually.'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!area.trim() || !city.trim() || !pincode.trim()) {
      setError(t('Please fill in area, city, and pincode'));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('kaamsetu_token');

      const res = await fetch(`${API_BASE_URL}/api/v1/employers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address_line: addressLine,
          addressLine,
          area,
          city,
          pincode,
          latitude,
          longitude,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || t('Failed to save business address'));
      }

      // Proceed to permissions prompt (Screen 11.2 & 11.3)
      router.push('/permissions');
    } catch (err: any) {
      setError(err.message || t('Failed to save business address'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <Header
        title="Business Address"
        subtitle="Location where workers will report"
        stepInfo="Step 3 of 3"
        showBack={true}
        onBack={handleBack}
      />

      {initialLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-xs font-semibold">{t('Loading address details...')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{t(error)}</div>}

            {/* GPS Location Button */}
            <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{t('GPS Spatial Precision')}</p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {t('Use exact device coordinates for employer location matching')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectGps}
                disabled={gpsDetecting}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Crosshair className="w-4 h-4" />
                {gpsDetecting
                  ? t('Detecting Location...')
                  : gpsSuccess
                  ? `${t('GPS Captured')} (${latitude?.toFixed(4)}, ${longitude?.toFixed(4)})`
                  : t('Use Current Device Location')}
              </button>
              {gpsSuccess && (
                <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {t('Exact device GPS point saved for spatial query')}
                </p>
              )}
            </div>

            <Input
              label="Shop Address / Landmark"
              type="text"
              placeholder="Shop No., Market / Building"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              icon={<MapPin className="w-5 h-5" />}
            />

            <Input
              label="Area / Sector"
              type="text"
              placeholder="e.g. Sector 143"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              icon={<MapPin className="w-5 h-5" />}
            />

            <Input
              label="City"
              type="text"
              placeholder="e.g. Noida"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <Input
              label="Pincode"
              type="text"
              maxLength={6}
              placeholder="e.g. 201301"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <Button type="submit" isLoading={loading}>
              {t('Complete Business Profile')}
            </Button>
          </div>
        </form>
      )}
    </MobileContainer>
  );
}
