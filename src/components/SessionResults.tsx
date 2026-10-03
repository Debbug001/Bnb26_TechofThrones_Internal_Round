import React, { useState } from 'react';
import { ArrowLeft, Clock, Users, FileText, CheckCircle2 } from 'lucide-react';
import { SessionData } from '../types';
import { TranscriptTab } from './TranscriptTab';
import { AIAssistantTab } from './AIAssistantTab';

interface SessionResultsProps {
  session: SessionData;
  initialTab?: 'transcript' | 'assistant';
  onReturnHome: () => void;
  onShowToast: (msg: string) => void;
}

export const SessionResults: React.FC<SessionResultsProps> = ({
  session,
  initialTab,
  onReturnHome,
  onShowToast,
}) => {
  // If the user arrived requesting an AI summary (e.g. from My Sessions "View AI summary"),
  // seed the ChatGPT-style sidebar with the summary prompt.
  const [initialAiQuery] = useState<string | undefined>(
    initialTab === 'assistant' ? 'Summarize this meeting' : undefined
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 h-full flex flex-col min-h-0 select-none animate-in fade-in duration-150">
      
      {/* Top Header: Session Info, Metadata & Return action */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-slate-200/80 gap-3 shrink-0">
        
        {/* Left: Back to Home & Session Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onReturnHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group shrink-0 p-1 -ml-1 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Home</span>
          </button>

          <span aria-hidden="true" className="text-slate-300">/</span>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {session.sessionName}
            </h1>
            <span className="font-mono text-[11px] text-slate-400 font-medium bg-slate-100 border border-slate-200/70 px-1.5 py-0.5 rounded shrink-0">
              {session.roomId}
            </span>
          </div>
        </div>

        {/* Right: Meeting duration and speaker count kept in the top header */}
        <div className="flex items-center gap-3.5 text-xs text-slate-500 shrink-0 self-end sm:self-auto">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">{formatDuration(session.durationSeconds)}</span>
          </div>

          <span aria-hidden="true" className="text-slate-300">·</span>

          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{session.participants.length} speakers</span>
          </div>

          <span aria-hidden="true" className="text-slate-300">·</span>

          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{session.captions.length} statements</span>
          </div>
        </div>
      </header>

      {/* Main Dual-Panel Workspace: Transcript (~65%) on left, AI Assistant (~35%) on right */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 pt-3.5 overflow-hidden">
        
        {/* LEFT PANEL: Main Meeting Transcript (~65% width) */}
        <section
          aria-label="Meeting Transcript"
          className="w-full lg:w-[65%] flex flex-col min-h-0 h-full"
        >
          <TranscriptTab
            captions={session.captions}
            participants={session.participants}
            onShowToast={onShowToast}
          />
        </section>

        {/* RIGHT PANEL: Modern ChatGPT-style AI Assistant Sidebar (~35% width) */}
        <aside
          aria-label="AI Assistant"
          className="w-full lg:w-[35%] flex flex-col min-h-0 h-full"
        >
          <AIAssistantTab
            session={session}
            initialQuery={initialAiQuery}
          />
        </aside>

      </main>

    </div>
  );
};
