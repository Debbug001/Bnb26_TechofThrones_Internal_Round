import React from 'react';
import { Radio, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DeviceConnectionState } from '../types';

interface AudioCoordinationIndicatorProps {
  state: DeviceConnectionState;
  deviceCount: number;
  onCycleState?: () => void;
}

export const AudioCoordinationIndicator: React.FC<AudioCoordinationIndicatorProps> = ({
  state,
  deviceCount,
  onCycleState,
}) => {
  return (
    <div
      onClick={onCycleState}
      title={onCycleState ? 'Click to simulate coordination state change' : undefined}
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors select-none ${
        onCycleState ? 'cursor-pointer hover:bg-slate-50' : ''
      } ${
        state === 'connected'
          ? 'bg-teal-50/70 border-teal-200/80 text-teal-800'
          : state === 'syncing'
          ? 'bg-amber-50/70 border-amber-200/80 text-amber-800'
          : 'bg-rose-50/70 border-rose-200/80 text-rose-800'
      }`}
    >
      {/* Icon / Pulse Indicator */}
      <span className="relative flex h-2 w-2">
        {state === 'connected' && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
          </>
        )}
        {state === 'syncing' && (
          <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-600 -ml-0.5" />
        )}
        {state === 'reconnecting' && (
          <AlertCircle className="w-2.5 h-2.5 text-rose-600 -ml-0.5" />
        )}
      </span>

      {/* State Label */}
      <div className="flex items-center gap-1.5">
        <span className="capitalize font-semibold">
          {state === 'connected' ? 'Connected' : state === 'syncing' ? 'Syncing' : 'Reconnecting'}
        </span>
        <span aria-hidden="true" className="opacity-40">·</span>
        <span className="text-[11px] opacity-80">
          {deviceCount} {deviceCount === 1 ? 'device' : 'devices'} active
        </span>
      </div>
    </div>
  );
};
