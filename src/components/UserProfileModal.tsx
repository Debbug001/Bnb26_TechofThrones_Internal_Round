import React, { useEffect } from 'react';
import { X, User as UserIcon, Mail, Calendar, History, FileText, LogOut, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onOpenMySessions: () => void;
  onSignOut: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenMySessions,
  onSignOut,
}) => {
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
      aria-labelledby="profile-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-6 sm:p-7 relative"
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

        {/* Profile Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-base flex items-center justify-center shadow-xs">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 id="profile-dialog-title" className="text-base font-bold text-slate-900 truncate">
              {user.name}
            </h2>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Profile Details List */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCFBF9] border border-slate-100">
            <span className="text-slate-500 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Member Since</span>
            </span>
            <span className="font-semibold text-slate-800">{user.createdAt}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#FCFBF9] border border-slate-100">
            <span className="text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Acoustic Profile</span>
            </span>
            <span className="font-semibold text-teal-800">Auto-Calibrated</span>
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div className="mt-5 space-y-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMySessions();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-colors text-xs font-semibold text-slate-800 cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-slate-500" />
              <span>My Sessions</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">View History →</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMySessions();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-200/80 transition-colors text-xs font-semibold text-slate-800 cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Saved Transcripts</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Browse Transcripts →</span>
          </button>
        </div>

        {/* Sign Out Button */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="w-full py-2.5 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
