/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingHero } from './components/LandingHero';
import { CreateSessionModal } from './components/CreateSessionModal';
import { JoinSessionModal } from './components/JoinSessionModal';
import { AboutModal } from './components/AboutModal';
import { LoginModal } from './components/LoginModal';
import { SignupModal } from './components/SignupModal';
import { UserProfileModal } from './components/UserProfileModal';
import { LiveConversation } from './components/LiveConversation';
import { SessionResults } from './components/SessionResults';
import { MySessionsPage } from './components/MySessionsPage';
import { Toast } from './components/Toast';
import { SessionData, ActiveView, Participant, User, SavedSessionItem } from './types';
import { INITIAL_CAPTIONS, INITIAL_PARTICIPANTS } from './utils/mockConversation';
import { INITIAL_SAVED_SESSIONS } from './utils/mockHistory';
import { api, checkBackendHealth, ConnectionStatus } from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  
  // Backend connection status
  const [backendStatus, setBackendStatus] = useState<ConnectionStatus>('checking');

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [initialJoinCode, setInitialJoinCode] = useState('');
  
  // Active conversation state
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);
  const [currentUserId, setCurrentUserId] = useState('user-host');
  const [initialResultsTab, setInitialResultsTab] = useState<'transcript' | 'assistant'>('transcript');
  
  // Saved sessions history
  const [savedSessions, setSavedSessions] = useState<SavedSessionItem[]>(INITIAL_SAVED_SESSIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check backend connection health on mount and periodically
  useEffect(() => {
    let isMounted = true;
    const verifyConnection = async () => {
      const result = await checkBackendHealth();
      if (isMounted) {
        setBackendStatus(result.status);
      }
    };

    verifyConnection();
    const timer = setInterval(verifyConnection, 20000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Deep linking for room codes e.g. ?join=RT-123-456
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('join') || params.get('room');
      if (codeFromUrl) {
        setInitialJoinCode(codeFromUrl);
        setIsJoinOpen(true);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 2800);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    showToast(`Welcome back, ${user.name}`);
  };

  const handleSignupSuccess = (user: User) => {
    setCurrentUser(user);
    setIsSignupOpen(false);
    showToast(`Account created for ${user.name}`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setIsProfileOpen(false);
    if (activeView === 'my_sessions') {
      setActiveView('landing');
    }
    showToast('Signed out successfully.');
  };

  // Called when user clicks "Continue" in Create Session modal
  const handleSessionCreated = (createdSession: SessionData) => {
    const hostUser: Participant = {
      id: 'user-host',
      name: currentUser ? currentUser.name : createdSession.hostName,
      role: 'host',
      deviceType: 'Laptop',
      connectionState: 'connected',
      isMuted: false,
      isSpeaking: false,
      joinedAt: 'Just now',
      accentColor: '#0F172A',
    };

    const liveSessionData: SessionData = {
      ...createdSession,
      hostName: hostUser.name,
      participants: [hostUser, ...INITIAL_PARTICIPANTS],
      captions: [...INITIAL_CAPTIONS],
    };

    setActiveSession(liveSessionData);
    setCurrentUserId('user-host');
    setIsCreateOpen(false);
    setActiveView('live_session');
    showToast(`Live conversation started: ${createdSession.roomId}`);
  };

  // Called when user enters room code and clicks "Join Room"
  const handleSessionJoined = (
    roomId: string,
    displayName: string,
    backendData?: {
      sessionId: string;
      participantId: string;
      identity: string;
      sessionTitle: string;
    }
  ) => {
    const participantName = currentUser ? currentUser.name : displayName;
    const participantId = backendData?.participantId || `user-participant-${Date.now()}`;
    const joinedUser: Participant = {
      id: participantId,
      name: `${participantName} (You)`,
      role: 'participant',
      deviceType: 'Phone',
      connectionState: 'connected',
      isMuted: false,
      isSpeaking: false,
      joinedAt: 'Just now',
      accentColor: '#0F172A',
    };

    const liveSessionData: SessionData = {
      roomId,
      sessionName: backendData?.sessionTitle || 'Roundtable Discussion',
      hostName: 'Host',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: 0,
      shareableUrl: `${window.location.origin}/?join=${roomId}`,
      backendSessionId: backendData?.sessionId,
      backendParticipantId: backendData?.participantId,
      backendParticipantIdentity: backendData?.identity,
      participants: [joinedUser, ...INITIAL_PARTICIPANTS],
      captions: [...INITIAL_CAPTIONS],
    };

    setActiveSession(liveSessionData);
    setCurrentUserId(participantId);
    setIsJoinOpen(false);
    setActiveView('live_session');
    showToast(`Joined live session ${roomId}`);
  };

  // Called when user confirms "Leave & View Summary" in LiveConversation
  const handleLeaveToResults = (finalSession: SessionData) => {
    // Notify backend that participant left if connected
    if (finalSession.backendSessionId && finalSession.backendParticipantId) {
      api.leaveSession(finalSession.backendSessionId, finalSession.backendParticipantId).catch(() => {
        // Non-blocking background notification
      });
    }

    setActiveSession(finalSession);
    setInitialResultsTab('transcript');

    // Archive this completed session to personal history
    const mins = Math.floor(finalSession.durationSeconds / 60);
    const secs = finalSession.durationSeconds % 60;
    const newSaved: SavedSessionItem = {
      id: `saved-${Date.now()}`,
      sessionName: finalSession.sessionName,
      date: 'Just now',
      durationFormatted: `${mins}m ${secs < 10 ? '0' : ''}${secs}s`,
      durationSeconds: finalSession.durationSeconds,
      roomId: finalSession.roomId,
      speakerCount: finalSession.participants.length,
      captions: finalSession.captions,
      participants: finalSession.participants,
    };
    setSavedSessions((prev) => [newSaved, ...prev]);

    setActiveView('session_results');
    showToast('Session ended. Summary and transcript prepared.');
  };

  const handleReturnHome = () => {
    setActiveSession(null);
    setActiveView('landing');
  };

  const handleOpenSavedSession = (
    session: SessionData,
    tab: 'transcript' | 'assistant'
  ) => {
    setActiveSession(session);
    setInitialResultsTab(tab);
    setActiveView('session_results');
  };

  return (
    <div className="h-screen max-h-screen w-full bg-[#FAF9F6] text-slate-900 flex flex-col justify-between overflow-hidden selection:bg-teal-100 selection:text-teal-900">
      
      {/* LANDING VIEW */}
      {activeView === 'landing' && (
        <>
          {/* Header strictly: Roundtable wordmark on left; About, Log in & Sign up on right */}
          <Header
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenSignup={() => setIsSignupOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenMySessions={() => setActiveView('my_sessions')}
            onOpenAbout={() => setIsAboutOpen(true)}
            isLobbyActive={false}
          />

          {/* Centered Landing Hero */}
          <LandingHero
            onCreateSession={() => setIsCreateOpen(true)}
            onJoinSession={() => setIsJoinOpen(true)}
          />

          {/* Subtle footer line with backend connection status */}
          <footer className="w-full max-w-6xl mx-auto px-6 h-10 flex items-center justify-between text-xs text-slate-400 font-normal shrink-0">
            <span>AI-powered conversation intelligence.</span>
            
            {/* Subtle backend connection indicator */}
            <div
              className="flex items-center gap-1.5 text-[11px] select-none"
              title={
                backendStatus === 'connected'
                  ? 'Connected to Roundtable Node.js Backend (port 5000)'
                  : backendStatus === 'checking'
                  ? 'Checking connection to backend...'
                  : 'Backend unavailable (running with local frontend mock data)'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  backendStatus === 'connected'
                    ? 'bg-emerald-500 shadow-2xs shadow-emerald-500/50'
                    : backendStatus === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-slate-300'
                }`}
              />
              <span className="text-slate-400">
                {backendStatus === 'connected' && 'Connected'}
                {backendStatus === 'checking' && 'Checking connection'}
                {backendStatus === 'unavailable' && 'Backend unavailable'}
              </span>
            </div>
          </footer>
        </>
      )}

      {/* LIVE SESSION VIEW */}
      {activeView === 'live_session' && activeSession && (
        <div className="flex-1 flex flex-col min-h-0">
          <LiveConversation
            session={activeSession}
            currentUserId={currentUserId}
            onLeaveSession={handleLeaveToResults}
            onShowToast={showToast}
          />
        </div>
      )}

      {/* SESSION RESULTS VIEW */}
      {activeView === 'session_results' && activeSession && (
        <div className="flex-1 flex flex-col min-h-0">
          <SessionResults
            session={activeSession}
            initialTab={initialResultsTab}
            onReturnHome={handleReturnHome}
            onShowToast={showToast}
          />
        </div>
      )}

      {/* MY SESSIONS HISTORY VIEW */}
      {activeView === 'my_sessions' && (
        <div className="flex-1 flex flex-col min-h-0">
          <MySessionsPage
            savedSessions={savedSessions}
            onReturnHome={() => setActiveView('landing')}
            onOpenSession={handleOpenSavedSession}
          />
        </div>
      )}

      {/* Modals for Create & Join & About */}
      <CreateSessionModal
        isOpen={isCreateOpen}
        initialDisplayName={currentUser?.name || ''}
        onClose={() => setIsCreateOpen(false)}
        onSessionCreated={handleSessionCreated}
        onShowToast={showToast}
      />

      <JoinSessionModal
        isOpen={isJoinOpen}
        initialDisplayName={currentUser?.name || ''}
        onClose={() => setIsJoinOpen(false)}
        onJoinSuccess={handleSessionJoined}
        initialRoomCode={initialJoinCode}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />

      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onOpenMySessions={() => setActiveView('my_sessions')}
          onSignOut={handleSignOut}
        />
      )}

      {/* Toast Feedback */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
