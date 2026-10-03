import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-lg shadow-slate-900/10 border border-slate-800 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
        <Check className="w-2.5 h-2.5" />
      </div>
      <span>{message}</span>
    </div>
  );
};
