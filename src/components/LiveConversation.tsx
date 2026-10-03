import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, LogOut, Radio, ArrowDown, Sparkles } from 'lucide-react';
import { Caption, Participant, SessionData, DeviceConnectionState } from '../types';
import { UPCOMING_MOCK_DIALOGUES } from '../utils/mockConversation';
import { ParticipantsPanel } from './ParticipantsPanel';
import { AudioCoordinationIndicator } from './AudioCoordinationIndicator';
import { LeaveSessionModal } from './LeaveSessionModal';
import { api } from '../services/api';

interface LiveConversationProps {
  session: SessionData;
  currentUserId: string;
  onLeaveSession: (finalSession: SessionData) => void;
  onShowToast: (msg: string) => void;
}

export const LiveConversation: React.FC<LiveConversationProps> = ({
  session,
  currentUserId,
  onLeaveSession,
  onShowToast,
}) => {
  const [captions, setCaptions] = useState<Caption[]>(session.captions);
  const [participants, setParticipants] = useState<Participant[]>(session.participants);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [coordinationState, setCoordinationState] = useState<DeviceConnectionState>('connected');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  // Track next dialogue index
  const nextDialogueIndex = useRef(0);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Timer for session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Poll real participants from backend if connected
  useEffect(() => {
    if (!session.backendSessionId) return;

    let isMounted = true;
    const fetchParticipants = async () => {
      try {
        const res = await api.getSessionParticipants(session.backendSessionId!);
        if (isMounted && res.success && res.participants.length > 0) {
          const mapped: Participant[] = res.participants.map((bp) => {
            const isMe = bp.id === session.backendParticipantId || bp.id === currentUserId;
            return {
              id: bp.id,
              name: isMe ? `${bp.displayName} (You)` : bp.displayName,
              role: bp.isGuest ? 'participant' : 'host',
              deviceType: (bp.deviceType === 'phone' ? 'Phone' : bp.deviceType === 'tablet' ? 'Tablet' : 'Laptop') as 'Laptop' | 'Phone' | 'Tablet',
              connectionState: bp.isOnline ? 'connected' : 'reconnecting',
              isMuted: false,
              isSpeaking: false,
              joinedAt: new Date(bp.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              accentColor: isMe ? '#0F172A' : '#0D9488',
            };
          });

          setParticipants(mapped);
        }
      } catch {
        // Fall back gracefully to current participant list
      }
    };

    fetchParticipants();
    const interval = setInterval(fetchParticipants, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [session.backendSessionId, session.backendParticipantId, currentUserId]);

  // Simulate incoming live captions from other participants
  useEffect(() => {
    const interval = setInterval(() => {
      if (nextDialogueIndex.current < UPCOMING_MOCK_DIALOGUES.length) {
        const nextItem = UPCOMING_MOCK_DIALOGUES[nextDialogueIndex.current];
        nextDialogueIndex.current += 1;

        // Set speaking participant
        setParticipants((prev) =>
          prev.map((p) => ({
            ...p,
            isSpeaking: p.id === nextItem.speakerId,
          }))
        );

        // Add caption
        const newCaption: Caption = {
          id: `cap-${Date.now()}`,
          speakerId: nextItem.speakerId,
          speakerName: nextItem.speakerName,
          text: nextItem.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          deviceType: nextItem.deviceType,
          accentColor: nextItem.accentColor,
        };

        setCaptions((prev) => [...prev, newCaption]);

        // Stop speaking animation after 3 seconds
        setTimeout(() => {
          setParticipants((prev) =>
            prev.map((p) => (p.id === nextItem.speakerId ? { ...p, isSpeaking: false } : p))
          );
        }, 3200);
      } else {
        // Cycle coordination state for realistic vitality if dialogue finished
        setCoordinationState((current) => (current === 'connected' ? 'connected' : 'connected'));
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll handler
  useEffect(() => {
    if (autoScroll && transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTo({
        top: transcriptContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [captions, autoScroll]);

  // Monitor user scroll position to toggle auto-scroll
  const handleScroll = () => {
    if (!transcriptContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = transcriptContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isAtBottom) {
      setIsUserScrolledUp(false);
      setAutoScroll(true);
    } else {
      setIsUserScrolledUp(true);
      setAutoScroll(false);
    }
  };

  const handleScrollToBottom = () => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTo({
        top: transcriptContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setIsUserScrolledUp(false);
      setAutoScroll(true);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextState = !isMicMuted;
    setIsMicMuted(nextState);

    setParticipants((prev) =>
      prev.map((p) =>
        p.id === currentUserId
          ? { ...p, isMuted: nextState, isSpeaking: nextState ? false : p.isSpeaking }
          : p
      )
    );

    onShowToast(nextState ? 'Microphone muted.' : 'Microphone unmuted and contributing.');
  };

  // Cycle coordination states for testing
  const handleCycleCoordinationState = () => {
    setCoordinationState((prev) => {
      const next: DeviceConnectionState =
        prev === 'connected' ? 'syncing' : prev === 'syncing' ? 'reconnecting' : 'connected';
      onShowToast(`Acoustic mesh state: ${next}`);
      return next;
    });
  };

  const handleConfirmLeave = () => {
    setIsLeaveModalOpen(false);
    const finalSession: SessionData = {
      ...session,
      captions,
      participants,
      durationSeconds: elapsedSeconds,
    };
    onLeaveSession(finalSession);
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-[#FAF9F6] text-slate-900 overflow-hidden select-none">
      {/* Top Session Workspace Header */}
      <header className="h-14 px-6 border-b border-slate-200/80 bg-white/70 backdrop-blur-xs flex items-center justify-between shrink-0">
        {/* Session Title & Live Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Live
            </span>
          </div>

          <span aria-hidden="true" className="text-slate-300">|</span>

          <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {session.sessionName}
          </h1>

          <span className="hidden sm:inline text-xs text-slate-400 font-mono">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        {/* Audio Coordination Status */}
        <div className="flex items-center gap-3">
          <AudioCoordinationIndicator
            state={coordinationState}
            deviceCount={participants.length}
            onCycleState={handleCycleCoordinationState}
          />
        </div>
      </header>

      {/* Main Workspace Body: Transcript Area (~72%) + Participants Panel (~28%) */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* MAIN TRANSCRIPT AREA (70-75% width) */}
        <section
          aria-label="Live Transcript"
          className="flex-1 flex flex-col min-h-0 bg-[#FAF9F6] relative overflow-hidden"
        >
          {/* Transcript Scrollable Feed */}
          <div
            ref={transcriptContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-5 max-w-4xl w-full mx-auto"
          >
            {captions.map((caption, idx) => {
              const isCurrentUser = caption.speakerId === currentUserId;
              const isLastCaption = idx === captions.length - 1;

              return (
                <article
                  key={caption.id}
                  className={`group transition-all duration-200 animate-in fade-in slide-in-from-bottom-1 ${
                    isLastCaption ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Speaker Label & Timestamp Header */}
                  <div className="flex items-center gap-2 mb-1.5">
                    {/* Subtle colored speaker dot indicator */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: caption.accentColor }}
                    />
                    
                    <span
                      className="text-xs font-semibold tracking-tight"
                      style={{ color: caption.accentColor }}
                    >
                      {caption.speakerName}
                      {isCurrentUser && (
                        <span className="text-slate-400 font-normal ml-1">(You)</span>
                      )}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {caption.timestamp}
                    </span>

                    {caption.deviceType && (
                      <span className="text-[10px] text-slate-400 bg-slate-100/80 px-1 rounded font-normal">
                        {caption.deviceType}
                      </span>
                    )}
                  </div>

                  {/* Caption Speech Bubble / Statement Card */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-slate-800 text-sm leading-relaxed max-w-2xl">
                    <p className="font-normal select-text">"{caption.text}"</p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Jump to live bottom prompt when scrolled up */}
          {isUserScrolledUp && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <button
                type="button"
                onClick={handleScrollToBottom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-md shadow-slate-900/15 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <span>Latest updates</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* COMPACT PARTICIPANTS PANEL (compact right-side, ~25-30%) */}
        <ParticipantsPanel
          participants={participants}
          currentUserId={currentUserId}
        />
      </div>

      {/* BOTTOM CONTROLS: Only essential controls strictly as requested */}
      <footer className="h-16 px-6 border-t border-slate-200/80 bg-white flex items-center justify-between shrink-0 select-none">
        {/* Left: Quiet Audio Health Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          <span className="hidden sm:inline">Acoustic matrix calibrated</span>
          <span className="sm:hidden">Live Matrix</span>
        </div>

        {/* Center: Essential Mute/Unmute Control */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleMute}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
              isMicMuted
                ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
            }`}
          >
            {isMicMuted ? (
              <>
                <MicOff className="w-4 h-4 text-rose-600" />
                <span>Unmute Microphone</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-teal-400" />
                <span>Mute Microphone</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Essential Leave Session Control */}
        <div>
          <button
            type="button"
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Leave Session</span>
          </button>
        </div>
      </footer>

      {/* Leave Session Confirmation Dialog */}
      <LeaveSessionModal
        isOpen={isLeaveModalOpen}
        onCancel={() => setIsLeaveModalOpen(false)}
        onConfirmLeave={handleConfirmLeave}
        sessionTitle={session.sessionName}
      />
    </div>
  );
};
