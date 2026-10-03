import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Smartphone, Check, AlertCircle } from 'lucide-react';
import { formatRoomCodeInput, isValidRoomCode } from '../utils/roomId';
import { joinSession } from '../services/api';

interface JoinSessionModalProps {
  isOpen: boolean;
  initialDisplayName?: string;
  onClose: () => void;
  onJoinSuccess: (
    roomId: string,
    displayName: string,
    backendData?: {
      sessionId: string;
      participantId: string;
      identity: string;
      sessionTitle: string;
    }
  ) => void;
  initialRoomCode?: string;
}

export const JoinSessionModal: React.FC<JoinSessionModalProps> = ({
  isOpen,
  initialDisplayName = '',
  onClose,
  onJoinSuccess,
  initialRoomCode = '',
}) => {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(initialDisplayName || '');
      setRoomCode(initialRoomCode || '');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialRoomCode, initialDisplayName]);

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

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRoomCodeInput(e.target.value);
    setRoomCode(formatted);
    if (error) setError(null);
  };

  const handleUseDemoCode = () => {
    setRoomCode('RT-749-218');
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = displayName.trim();
    const trimmedCode = roomCode.trim().toUpperCase();

    if (!trimmedName) {
      setError('Please enter your display name.');
      return;
    }
    if (trimmedName.length < 2) {
      setError('Display name must be at least 2 characters.');
      return;
    }
    if (!trimmedCode) {
      setError('Please enter the room code.');
      return;
    }
    if (!isValidRoomCode(trimmedCode)) {
      setError('Please enter a valid room code.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await joinSession({
        roomCode: trimmedCode,
        displayName: trimmedName,
        deviceType: 'phone',
        preferredCaptionLanguage: 'en',
        speechLanguage: 'en',
      });

      if (response.session && response.participant) {
        onJoinSuccess(response.session.roomCode, response.participant.displayName, {
          sessionId: response.session.id,
          participantId: response.participant.id,
          identity: response.participant.identity,
          sessionTitle: response.session.title,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join session on backend';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-session-title"
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

        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Participant Entry
          </span>
        </div>

        <h2
          id="join-session-title"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          Join a Session
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter the room code provided by the host to connect your microphone.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Display Name */}
          <div>
            <label
              htmlFor="joinDisplayName"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Your display name <span className="text-rose-500">*</span>
            </label>
            <input
              id="joinDisplayName"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., Liam Vance"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-[#FCFBF9] text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Room Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="joinRoomCode"
                className="block text-xs font-medium text-slate-700"
              >
                Room code <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleUseDemoCode}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-medium underline underline-offset-2 cursor-pointer"
              >
                Use sample code
              </button>
            </div>
            <input
              id="joinRoomCode"
              type="text"
              value={roomCode}
              onChange={handleRoomCodeChange}
              maxLength={10}
              placeholder="RT-XXX-XXX"
              className="w-full font-mono uppercase tracking-wider px-3.5 py-2.5 rounded-lg border border-slate-200 bg-[#FCFBF9] text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Friendly Error Notice */}
          {error && (
            <div
              role="alert"
              className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium flex items-center gap-2"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Device notice */}
          <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Connecting as physical acoustic source</span>
            </span>
            <span className="text-slate-400 text-[11px]">Auto-leveled</span>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              {isSubmitting ? (
                <span>Locating Room...</span>
              ) : (
                <>
                  <span>Join Room</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
