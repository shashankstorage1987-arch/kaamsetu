'use client';

import React, { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  length?: number;
}

export default function PinInput({
  value,
  onChange,
  label = '6-Digit Security PIN',
  error,
  length = 6,
}: PinInputProps) {
  const { t } = useLanguage();
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pinDigits = Array.from({ length }, (_, i) => value[i] || '');

  const handleDigitChange = (index: number, digit: String) => {
    const numericDigit = digit.replace(/[^0-9]/g, '');
    if (!numericDigit && digit !== '') return;

    const newPin = value.split('');
    newPin[index] = numericDigit;
    const combined = newPin.join('').slice(0, length);
    onChange(combined);

    if (numericDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pinDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label ? t(label) : ''}</label>
        <button
          type="button"
          onClick={() => setShowPin(!showPin)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-green-700 p-1"
        >
          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showPin ? t('Hide PIN') : t('Show PIN')}</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={1}
            value={pinDigits[index]}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-green-100 ${
              error
                ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500'
                : pinDigits[index]
                ? 'border-green-600 bg-green-50/30 text-slate-900'
                : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-green-600 focus:bg-white'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-xs font-medium text-red-600 mt-1">{error}</p>}
    </div>
  );
}
