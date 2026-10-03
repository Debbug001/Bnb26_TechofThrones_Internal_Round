import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, FileText, Sparkles, Search, X } from 'lucide-react';
import { SavedSessionItem, SessionData } from '../types';

interface MySessionsPageProps {
  savedSessions: SavedSessionItem[];
  onReturnHome: () => void;
  onOpenSession: (session: SessionData, initialTab: 'transcript' | 'assistant') => void;
}

export const MySessionsPage: React.FC<MySessionsPageProps> = ({
  savedSessions,
  onReturnHome,
  onOpenSession,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredSessions = savedSessions.filter(
    (s) =>
      s.sessionName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.roomId.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleLaunch = (item: SavedSessionItem, tab: 'transcript' | 'assistant') => {
    const sessionData: SessionData = {
      roomId: item.roomId,
      sessionName: item.sessionName,
      hostName: 'Elena Rostova',
      createdAt: item.date,
      durationSeconds: item.durationSeconds,
      shareableUrl: `${window.location.origin}/?join=${item.roomId}`,
      participants: item.participants,
      captions: item.captions,
    };
    onOpenSession(sessionData, tab);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-6 h-full flex flex-col min-h-0 select-none animate-in fade-in duration-150">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 shrink-0">
        <button
          type="button"
          onClick={onReturnHome}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Landing</span>
        </button>

        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
          {searchFilter && (
            <button
              type="button"
              onClick={() => setSearchFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Page Title */}
      <div className="pt-6 pb-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Sessions
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Your recorded conversation archive, speaker transcripts, and AI insights.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {savedSessions.length} {savedSessions.length === 1 ? 'session' : 'sessions'} recorded
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white/40">
            <Clock className="w-8 h-8 stroke-1 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">No sessions found</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Start a new conversation session to see it archived here.
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Session Meta */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {session.sessionName}
                  </h3>
                  <span className="font-mono text-[11px] text-slate-400 font-medium bg-slate-50 border border-slate-200/70 px-1.5 py-0.5 rounded">
                    {session.roomId}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{session.date}</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{session.durationFormatted}</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{session.speakerCount} speakers</span>
                </div>
              </div>

              {/* Action Buttons: Open transcript & View AI summary strictly as specified */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleLaunch(session, 'transcript')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open transcript</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunch(session, 'assistant')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>View AI summary</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
