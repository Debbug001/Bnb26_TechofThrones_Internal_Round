import React, { useEffect } from 'react';
import { X, Mic2, Users, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-teal-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            About Roundtable
          </span>
        </div>
        
        <h2
          id="about-dialog-title"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          Every voice, heard.
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Traditional meeting rooms struggle with distant speakers, cross-talk, and muffled audio.
          Roundtable turns every laptop, phone, and tablet around the table into a coordinated, multi-angle acoustic array.
        </p>

        {/* 3 Pillar highlights (clean, unboxed text format adhering to zero-pill rules) */}
        <div className="mt-6 space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900">
                Multi-Device Acoustic Capture
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Participants contribute nearby device audio feeds. The platform synchronizes microphones to eliminate dead zones.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <Mic2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900">
                Zero Proprietary Hardware
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                No expensive room systems or boundary microphones. Anyone joins directly with a 6-digit room code in seconds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900">
                Live Speaker Diarization
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Proximity calculations ensure every word is attributed accurately to whoever is speaking in the physical space.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Phase 1 · Session Entry & Room Routing</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
