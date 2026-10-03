import React, { useEffect } from 'react';
import { X, LogOut, ArrowRight } from 'lucide-react';

interface LeaveSessionModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmLeave: () => void;
  sessionTitle: string;
}

export const LeaveSessionModal: React.FC<LeaveSessionModalProps> = ({
  isOpen,
  onCancel,
  onConfirmLeave,
  sessionTitle,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-session-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          <LogOut className="w-5 h-5 ml-0.5" />
        </div>

        <h3
          id="leave-session-title"
          className="text-base font-bold text-slate-900"
        >
          Leave Conversation?
        </h3>

        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          You are about to exit <span className="font-semibold text-slate-800">"{sessionTitle}"</span>. The synchronized live transcript will be preserved in your session summary.
        </p>

        <div className="mt-6 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Stay in Session
          </button>

          <button
            type="button"
            onClick={onConfirmLeave}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Leave & View Summary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
