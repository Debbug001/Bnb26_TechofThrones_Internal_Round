import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, Tablet } from 'lucide-react';

interface VoiceNode {
  id: string;
  label: string;
  device: string;
  type: 'laptop' | 'phone' | 'tablet';
  position: number; // percentage along the horizontal axis
  energy: number;
}

export const AcousticVisualizer: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('node-host');
  const [tick, setTick] = useState(0);

  // Soft continuous harmonic resonance
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 360);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  const nodes: VoiceNode[] = [
    {
      id: 'node-left',
      label: 'Speaker 1',
      device: 'Nearby Phone',
      type: 'phone',
      position: 18,
      energy: 0.55 + Math.sin(tick * 0.07) * 0.18,
    },
    {
      id: 'node-host',
      label: 'Host',
      device: 'MacBook Pro',
      type: 'laptop',
      position: 50,
      energy: 0.8 + Math.cos(tick * 0.06) * 0.14,
    },
    {
      id: 'node-right',
      label: 'Speaker 2',
      device: 'Nearby Tablet',
      type: 'tablet',
      position: 82,
      energy: 0.45 + Math.sin(tick * 0.05 + 2) * 0.15,
    },
  ];

  return (
    <div className="w-full max-w-[440px] mx-auto select-none py-1">
      {/* Visual Canvas Container */}
      <div className="relative h-36 sm:h-40 w-full flex items-center justify-center">
        
        {/* Subtle background acoustic resonance field */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Subtle outer acoustic ellipse */}
          <div className="w-[92%] h-[82%] rounded-full border border-slate-200/50 bg-gradient-to-b from-white/60 to-slate-50/20 shadow-2xs" />
          
          {/* Concentric harmonic ripple */}
          <div
            className="absolute w-[56%] h-[68%] rounded-full border border-teal-600/15"
            style={{
              transform: `scale(${1 + Math.sin(tick * 0.05) * 0.02})`,
              transition: 'transform 0.15s ease-out',
            }}
          />
        </div>

        {/* SVG Waveforms connecting the voices */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 440 160"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveTeal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#0D9488" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="waveMuted" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#94A3B8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Continuous baseline acoustic wave */}
          <path
            d={`M 40 80 Q 120 ${80 + Math.sin(tick * 0.08) * 12} 220 80 T 400 80`}
            fill="none"
            stroke="url(#waveTeal)"
            strokeWidth="1.75"
          />

          {/* Secondary harmonic wave */}
          <path
            d={`M 40 80 Q 120 ${80 - Math.cos(tick * 0.06) * 10} 220 80 T 400 80`}
            fill="none"
            stroke="url(#waveMuted)"
            strokeWidth="1.25"
            strokeDasharray="4 3"
          />
        </svg>

        {/* Interactive Device / Voice Nodes */}
        {nodes.map((node) => {
          const isSelected = activeId === node.id;
          const isHost = node.id === 'node-host';

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setActiveId(node.id)}
              style={{
                left: `${node.position}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute top-1/2 z-10 flex flex-col items-center cursor-pointer transition-all duration-150 outline-none focus-visible:ring-1 focus-visible:ring-teal-600 rounded-lg p-1"
              title={`${node.label} · ${node.device}`}
            >
              {/* Disc */}
              <div
                className={`rounded-full flex items-center justify-center transition-all duration-150 ${
                  isHost
                    ? isSelected
                      ? 'w-10 h-10 bg-slate-900 text-white shadow-sm ring-2 ring-teal-500/30'
                      : 'w-10 h-10 bg-white text-slate-800 border border-slate-300 shadow-2xs'
                    : isSelected
                    ? 'w-8 h-8 bg-slate-900 text-white shadow-xs ring-1 ring-teal-500/30'
                    : 'w-8 h-8 bg-white text-slate-600 border border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {node.type === 'laptop' && <Laptop className={isHost ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
                {node.type === 'phone' && <Smartphone className="w-3.5 h-3.5" />}
                {node.type === 'tablet' && <Tablet className="w-3.5 h-3.5" />}
              </div>

              {/* Harmonic Audio Bars */}
              <div className="mt-1 flex items-center gap-0.5">
                {[0, 1, 2].map((idx) => {
                  const threshold = (idx + 1) * 0.28;
                  const isLit = node.energy >= threshold;
                  return (
                    <span
                      key={idx}
                      className={`w-0.5 rounded-full transition-all duration-100 ${
                        isLit
                          ? isSelected
                            ? 'bg-teal-600 h-2'
                            : 'bg-slate-400 h-1.5'
                          : 'bg-slate-200 h-1'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Node Label */}
              <span
                className={`mt-0.5 text-[10px] tracking-tight whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'font-semibold text-slate-900'
                    : 'font-medium text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {node.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Understated caption */}
      <div className="text-center pt-1">
        <span className="text-[11px] font-medium text-slate-400">
          Spatial voice synchronization
        </span>
      </div>
    </div>
  );
};
