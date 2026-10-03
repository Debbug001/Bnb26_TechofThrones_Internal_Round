import React from 'react';
import { Mic, MicOff, Laptop, Smartphone, Tablet, Users } from 'lucide-react';
import { Participant } from '../types';

interface ParticipantsPanelProps {
  participants: Participant[];
  currentUserId: string;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  currentUserId,
}) => {
  return (
    <aside className="w-72 lg:w-80 shrink-0 border-l border-slate-200/80 bg-[#FCFBF9] flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Participants ({participants.length})
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Acoustic Mesh</span>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {participants.map((p) => {
          const isMe = p.id === currentUserId;

          return (
            <div
              key={p.id}
              className={`p-3 rounded-xl border transition-all ${
                p.isSpeaking
                  ? 'bg-white border-slate-200/90 shadow-2xs ring-1 ring-teal-500/20'
                  : 'bg-white/50 border-slate-200/50 hover:bg-white hover:border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Subtle initial disc with speaker accent indicator */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 relative"
                    style={{ backgroundColor: p.accentColor }}
                  >
                    {p.name.charAt(0)}
                    {p.isSpeaking && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-white animate-pulse" />
                    )}
                  </div>

                  {/* Name and Device */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1 rounded shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        {p.deviceType === 'Laptop' && <Laptop className="w-3 h-3 text-slate-400" />}
                        {p.deviceType === 'Phone' && <Smartphone className="w-3 h-3 text-slate-400" />}
                        {p.deviceType === 'Tablet' && <Tablet className="w-3 h-3 text-slate-400" />}
                        <span>{p.deviceType}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`capitalize ${
                          p.connectionState === 'connected'
                            ? 'text-teal-700'
                            : p.connectionState === 'syncing'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {p.connectionState}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mic Status & Audio Activity Level */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {/* Micro Audio Wave Meter (Visible when speaking) */}
                  {p.isSpeaking && !p.isMuted && (
                    <div className="flex items-center gap-0.5 h-3">
                      <span className="w-0.5 h-3 bg-teal-600 rounded-full animate-pulse" />
                      <span className="w-0.5 h-2 bg-teal-500 rounded-full animate-pulse delay-75" />
                      <span className="w-0.5 h-3.5 bg-teal-600 rounded-full animate-pulse delay-150" />
                    </div>
                  )}

                  {/* Mic Icon */}
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      p.isMuted
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                    title={p.isMuted ? 'Microphone muted' : 'Microphone contributing'}
                  >
                    {p.isMuted ? (
                      <MicOff className="w-3.5 h-3.5" />
                    ) : (
                      <Mic className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel Bottom Footnote */}
      <div className="p-3 border-t border-slate-200/60 bg-white/70 text-[11px] text-slate-400 text-center">
        <span>Continuous acoustic spatial diarization</span>
      </div>
    </aside>
  );
};
