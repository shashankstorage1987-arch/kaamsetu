import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileContainer({ children, className = '' }: MobileContainerProps) {
  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-slate-100 flex justify-center items-center p-0 sm:p-2 md:p-3 text-slate-900 selection:bg-green-100 selection:text-green-900">
      <main className={`w-full max-w-md h-full sm:h-full sm:max-h-[min(844px,calc(100dvh-1.5rem))] bg-white sm:rounded-3xl shadow-2xl border-x border-slate-200 flex flex-col relative overflow-hidden ${className}`}>
        {children}
      </main>
    </div>
  );
}
