import React, { useState } from 'react';
import { Search, X, Copy, Check, Filter, User } from 'lucide-react';
import { Caption, Participant } from '../types';

interface TranscriptTabProps {
  captions: Caption[];
  participants: Participant[];
  onShowToast: (msg: string) => void;
}

export const TranscriptTab: React.FC<TranscriptTabProps> = ({
  captions,
  participants,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // Extract unique speaker names from captions
  const availableSpeakers = Array.from(
    new Set(captions.map((c) => c.speakerName))
  );

  // Filter captions by search query and selected speaker
  const filteredCaptions = captions.filter((c) => {
    const matchesSpeaker =
      selectedSpeaker === 'all' || c.speakerName === selectedSpeaker;
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.speakerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpeaker && matchesSearch;
  });

  const handleCopy = () => {
    const lines = captions.map(
      (c) => `[${c.timestamp}] ${c.speakerName}: "${c.text}"`
    );
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    onShowToast('Transcript copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden select-none">
      {/* Controls Bar: Search & Speaker Filter */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-[#FCFBF9]/60">
        
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-7 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: Speaker Filter & Copy */}
        <div className="flex items-center gap-2">
          {/* Speaker Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
            <Filter className="w-3 h-3 text-slate-400 ml-1.5" />
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="text-xs text-slate-700 bg-transparent pr-2 py-0.5 focus:outline-none cursor-pointer font-medium"
            >
              <option value="all">All Speakers ({captions.length})</option>
              {availableSpeakers.map((speaker) => {
                const count = captions.filter((c) => c.speakerName === speaker).length;
                return (
                  <option key={speaker} value={speaker}>
                    {speaker} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg text-xs font-medium shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transcript Items Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {filteredCaptions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <Search className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-600">No matching statements found</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Try adjusting your search query or speaker filter.
            </p>
          </div>
        ) : (
          filteredCaptions.map((caption) => (
            <article
              key={caption.id}
              className="group p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-[#FCFBF9] hover:bg-white transition-colors"
            >
              {/* Speaker Metadata Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Subtle initial disc with speaker accent color */}
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: caption.accentColor }}
                  >
                    {caption.speakerName.charAt(0)}
                  </div>

                  <span
                    className="text-xs font-semibold"
                    style={{ color: caption.accentColor }}
                  >
                    {caption.speakerName}
                  </span>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {caption.timestamp}
                  </span>
                </div>

                {caption.deviceType && (
                  <span className="text-[10px] text-slate-400 bg-white border border-slate-200/80 px-1.5 py-0.5 rounded font-medium">
                    {caption.deviceType}
                  </span>
                )}
              </div>

              {/* Statement Content */}
              <p className="text-slate-800 text-sm leading-relaxed pl-7 select-text">
                "{caption.text}"
              </p>
            </article>
          ))
        )}
      </div>

      {/* Footer Status */}
      <div className="px-5 py-2.5 border-t border-slate-100 bg-[#FCFBF9] text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        <span>
          Showing {filteredCaptions.length} of {captions.length} statements
        </span>
        <span>Acoustic speech identification verified</span>
      </div>
    </div>
  );
};
