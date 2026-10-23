'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';
import { useLanguage } from '@/context/LanguageContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'white';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  fullWidth = true,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const { t } = useLanguage();

  const baseStyle =
    'min-h-[50px] px-6 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shadow-sm';

  const variants = {
    primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-4 focus:ring-green-100 active:bg-green-800 shadow-green-600/20',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-4 focus:ring-slate-200 active:bg-slate-950',
    outline: 'bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-4 focus:ring-slate-100 active:bg-slate-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-4 focus:ring-red-100 active:bg-red-800',
    white: 'bg-white hover:bg-slate-50 text-blue-950 border border-slate-200 shadow-sm focus:ring-4 focus:ring-blue-100 active:bg-blue-50',
  };

  const renderChildren = () => {
    if (typeof children === 'string') {
      return t(children);
    }
    return children;
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyle,
          variants[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{t('Processing...', 'Processing...')}</span>
        </span>
      ) : (
        renderChildren()
      )}
    </button>
  );
}
