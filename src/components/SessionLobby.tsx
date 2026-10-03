import React, { useState } from 'react';
import { Copy, Check, Radio, Laptop, Smartphone, Tablet, ArrowLeft, Plus, ShieldCheck } from 'lucide-react';
import { Participant, SessionData } from '../types';

interface SessionLobbyProps {
  session: SessionData;
  userRole: 'host' | 'participant';
  currentUserName: string;
  onLeave: () => void;
  onShowToast: (msg: string) => void;
}

export const SessionLobby: React.FC<SessionLobbyProps> = ({
  session,
  userRole,
  currentUserName,
  onLeave,
  onShowToast,
}) => {
  const [participants, setParticipants] = useState<Participant[]>(session.participants);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.roomId);
    setCopied(true);
    onShowToast(`Room code ${session.roomId} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMockDevice = () => {
    const mockNames = ['Marcus (iPhone 14)', 'Aisha (Pixel 8)', 'David (iPad Air)'];
    const remaining = mockNames.filter(
      (m) => !participants.some((p) => p.name.includes(m.split(' ')[0]))
    );

    if (remaining.length === 0) {
      onShowToast('All simulated demo devices are already connected.');
      return;
    }

    const nextName = remaining[0];
    const isTablet = nextName.includes('iPad');
    const newParticipant: Participant = {
      id: `mock-${Date.now()}`,
      name: nextName,
      role: 'participant',
      deviceType: isTablet ? 'Tablet' : 'Phone',
      connectionState: 'connected',
      isMuted: false,
      isSpeaking: false,
      joinedAt: 'Just now',
      accentColor: '#0F172A',
    };

    setParticipants((prev) => [...prev, newParticipant]);
    onShowToast(`${nextName} connected to acoustic array.`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-6 animate-in fade-in duration-200">
      {/* Top Bar with Back action */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Exit Session</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>Secure Encrypted Session</span>
        </div>
      </div>

      {/* Session Title & Room Code Header */}
      <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Room Ready</span>
            <span aria-hidden="true">·</span>
            <span>Created by {session.hostName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {session.sessionName}
          </h1>
        </div>

        {/* Room Code Badge & Copy */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="px-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Room Code
            </div>
            <div className="font-mono text-lg font-bold text-slate-900 tracking-wider">
              {session.roomId}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Connected Acoustic Devices & Acoustic Field Status */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Device Nodes List */}
        <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200/90 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Connected Devices ({participants.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each nearby device contributes its microphone feed to the spatial matrix.
              </p>
            </div>

            {userRole === 'host' && participants.length < 4 && (
              <button
                type="button"
                onClick={handleAddMockDevice}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Demo Phone</span>
              </button>
            )}
          </div>

          <div className="space-y-3 mt-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-[#FCFBF9] hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    {participant.deviceType === 'Laptop' && <Laptop className="w-4 h-4" />}
                    {participant.deviceType === 'Phone' && <Smartphone className="w-4 h-4" />}
                    {participant.deviceType === 'Tablet' && <Tablet className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {participant.name}
                      </span>
                      {participant.role === 'host' && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                          Host
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{participant.deviceType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{participant.joinedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-xs font-medium text-teal-800">
                      Audio Contributing
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Acoustic Readiness Panel */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-teal-700 mb-2">
              <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              <span>Multi-Source Spatial Array</span>
            </div>
            
            <h3 className="text-base font-semibold text-slate-900">
              Acoustic Ready State
            </h3>
            
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Place devices around your conference table or discussion area. In Phase 2, live speaker-labelled captions and spatial audio diarization will initiate when the conversation begins.
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Spatial Channels</span>
                <span className="font-semibold text-slate-800">{participants.length} Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Audio Sync Latency</span>
                <span className="font-semibold text-teal-700">&lt; 14ms (Mock)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Your Current Role</span>
                <span className="font-semibold text-slate-800 capitalize">{userRole}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCopyCode}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Invite More Devices</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
