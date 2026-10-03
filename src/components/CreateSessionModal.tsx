import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ArrowRight, Radio, Users, Sparkles, Laptop } from 'lucide-react';
import { generateRoomId } from '../utils/roomId';
import { SessionData } from '../types';
import { createSession } from '../services/api';

interface CreateSessionModalProps {
  isOpen: boolean;
  initialDisplayName?: string;
  onClose: () => void;
  onSessionCreated: (session: SessionData) => void;
  onShowToast: (msg: string) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  initialDisplayName = '',
  onClose,
  onSessionCreated,
  onShowToast,
}) => {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSession, setCreatedSession] = useState<SessionData | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDisplayName(initialDisplayName || '');
      setSessionName('');
      setError(null);
      setIsSubmitting(false);
      setCreatedSession(null);
      setCopied(false);
    }
  }, [isOpen, initialDisplayName]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setError('Please enter your display name to host the session.');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Display name must be at least 2 characters.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await createSession({
        title: sessionName.trim() || 'Roundtable Discussion',
        displayName: trimmedName,
        deviceType: 'laptop',
        preferredCaptionLanguage: 'en',
        speechLanguage: 'en',
      });

      if (response.session && response.participant) {
        const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const shareUrl = `${currentUrl}/?join=${response.session.roomCode}`;

        const session: SessionData = {
          roomId: response.session.roomCode,
          sessionName: response.session.title,
          hostName: response.participant.displayName,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          durationSeconds: 0,
          shareableUrl: shareUrl,
          backendSessionId: response.session.id,
          backendParticipantId: response.participant.id,
          backendParticipantIdentity: response.participant.identity,
          participants: [
            {
              id: response.participant.id,
              name: `${response.participant.displayName} (You)`,
              role: 'host',
              deviceType: 'Laptop',
              connectionState: 'connected',
              isMuted: false,
              isSpeaking: false,
              joinedAt: 'Just now',
              accentColor: '#0F172A',
            },
          ],
          captions: [],
        };

        setCreatedSession(session);
        onShowToast(`Room ${response.session.roomCode} ready.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create session on backend';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdSession) return;
    navigator.clipboard.writeText(createdSession.roomId);
    setCopied(true);
    onShowToast(`Room code ${createdSession.roomId} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleContinue = () => {
    if (createdSession) {
      onSessionCreated(createdSession);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-session-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xs animate-in fade-in duration-150"
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

        {!createdSession ? (
          /* FORM VIEW */
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                New Session
              </span>
            </div>

            <h2
              id="create-session-title"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              Create a Session
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Start an acoustic room. Nearby devices can join to contribute audio feeds.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Display Name Field */}
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Your display name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g., Elena Rostova"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-[#FCFBF9] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
                />
              </div>

              {/* Session Name Field (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="sessionName"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Session name
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">Optional</span>
                </div>
                <input
                  id="sessionName"
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g., Sprint Retrospective"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-[#FCFBF9] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium"
                >
                  {error}
                </div>
              )}

              {/* Device Preview note */}
              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  <span>Host device: This browser</span>
                </span>
                <span className="text-teal-700 font-medium">Acoustics ready</span>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  {isSubmitting ? (
                    <span>Generating Room...</span>
                  ) : (
                    <>
                      <span>Create Room</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* POST-CREATION / WAITING STATE */
          <div className="animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                Room Ready
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {createdSession.sessionName}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Share the room code with participants nearby to connect microphones.
            </p>

            {/* Room Code Card */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1">
                Temporary Room Code
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-2xl font-bold tracking-wider text-slate-900">
                  {createdSession.roomId}
                </span>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-lg text-xs font-medium shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-teal-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Waiting State Details */}
            <div className="mt-4 p-3.5 rounded-xl border border-dashed border-slate-200 bg-[#FCFBF9]">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
                  <span>Waiting for participants to join...</span>
                </span>
                <span className="text-slate-400">1 connected</span>
              </div>

              {/* Host list item */}
              <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-semibold flex items-center justify-center">
                    H
                  </div>
                  <span className="font-medium text-slate-900">
                    {createdSession.hostName}
                  </span>
                </div>
                <span className="text-slate-400 text-[11px]">Host · Audio Ready</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Room Link</span>
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="flex-1 py-2.5 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
