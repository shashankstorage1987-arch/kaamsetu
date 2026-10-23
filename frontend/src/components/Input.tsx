'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  icon,
  className = '',
  placeholder,
  type,
  min,
  onKeyDown,
  ...props
}: InputProps) {
  const { t } = useLanguage();

  const localizedLabel = label ? t(label) : undefined;
  const localizedPlaceholder = placeholder ? t(placeholder) : undefined;
  const localizedHelperText = helperText ? t(helperText) : undefined;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === 'number' && min !== undefined && Number(min) >= 0) {
      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
      }
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {localizedLabel && <label className="text-sm font-semibold text-slate-700">{localizedLabel}</label>}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3.5 text-slate-400 pointer-events-none">{icon}</div>}
        <input
          type={type}
          min={min}
          placeholder={localizedPlaceholder}
          onKeyDown={handleKeyDown}
          className={`w-full min-h-[50px] px-4 py-3 text-base text-slate-900 bg-slate-50 border-2 rounded-xl transition-all focus:outline-none focus:ring-4 focus:ring-green-100 ${
            icon ? 'pl-11' : ''
          } ${
            error
              ? 'border-red-400 bg-red-50 text-red-900 focus:border-red-500'
              : 'border-slate-200 focus:border-green-600 focus:bg-white'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-600">{t(error)}</p>}
      {localizedHelperText && !error && <p className="text-xs text-slate-500">{localizedHelperText}</p>}
    </div>
  );
}
