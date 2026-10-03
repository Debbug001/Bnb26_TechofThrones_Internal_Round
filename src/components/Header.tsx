import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenProfile: () => void;
  onOpenMySessions: () => void;
  onOpenAbout: () => void;
  onResetToLanding?: () => void;
  isLobbyActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onOpenProfile,
  onOpenMySessions,
  onOpenAbout,
  onResetToLanding,
  isLobbyActive = false,
}) => {
  return (
    <header className="w-full max-w-6xl mx-auto px-6 h-14 flex items-center justify-between shrink-0 select-none">
      {/* Roundtable Wordmark & Logo */}
      <button
        type="button"
        onClick={onResetToLanding}
        className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg p-1 -ml-1"
      >
        {/* Restrained acoustic roundmark icon */}
        <div className="relative w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-2xs group-hover:bg-slate-800 transition-colors">
          {/* Subtle concentric rings mark */}
          <div className="w-3.5 h-3.5 rounded-full border border-teal-400/80 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
        </div>

        <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-slate-800 transition-colors">
          Roundtable
        </span>
      </button>

      {/* Navigation & Auth Actions on the right */}
      <nav className="flex items-center gap-3 sm:gap-4">
        {/* About Link */}
        <button
          type="button"
          onClick={onOpenAbout}
          className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2 cursor-pointer focus-visible:outline-none focus-visible:underline"
        >
          About
        </button>

        {/* If user is logged in */}
        {currentUser ? (
          <>
            <button
              type="button"
              onClick={onOpenMySessions}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors py-1.5 px-2 cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              My Sessions
            </button>

            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Open User Profile"
            >
              <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate hidden sm:inline">
                {currentUser.name}
              </span>
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shadow-2xs">
                {currentUser.name.charAt(0)}
              </div>
            </button>
          </>
        ) : (
          /* Two minimal actions on the top right strictly as specified: Log in and Sign up */
          <>
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors py-1.5 px-2.5 cursor-pointer focus-visible:outline-none focus-visible:underline"
            >
              Log in
            </button>

            <button
              type="button"
              onClick={onOpenSignup}
              className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Sign up
            </button>
          </>
        )}

        {isLobbyActive && onResetToLanding && (
          <button
            type="button"
            onClick={onResetToLanding}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer py-1.5 px-2"
          >
            Exit Session
          </button>
        )}
      </nav>
    </header>
  );
};
