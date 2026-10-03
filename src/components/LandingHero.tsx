import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AcousticVisualizer } from './AcousticVisualizer';

interface LandingHeroProps {
  onCreateSession: () => void;
  onJoinSession: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onCreateSession,
  onJoinSession,
}) => {
  return (
    <main className="w-full max-w-3xl mx-auto px-6 flex-1 min-h-0 flex flex-col items-center justify-center text-center">
      
      {/* Main Heading strictly as specified */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
        Every voice, heard.
      </h1>

      {/* Supporting Text strictly as specified */}
      <p className="mt-3 text-base sm:text-lg text-slate-600 font-normal max-w-md mx-auto">
        Real-time conversations, clearer than ever.
      </p>

      {/* Two Actions strictly as specified */}
      <div className="mt-6 flex items-center justify-center gap-4">
        {/* Primary button */}
        <button
          type="button"
          onClick={onCreateSession}
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm shadow-slate-900/10 inline-flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <span>Create a Session</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
        </button>

        {/* Secondary text button */}
        <button
          type="button"
          onClick={onJoinSession}
          className="px-3.5 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline rounded-lg"
        >
          <span>Join a Session</span>
        </button>
      </div>

      {/* Subtle, Understated Acoustic Waveform Element */}
      <div className="mt-8 sm:mt-10 w-full flex items-center justify-center">
        <AcousticVisualizer />
      </div>

    </main>
  );
};
