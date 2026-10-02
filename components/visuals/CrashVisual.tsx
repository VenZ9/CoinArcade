"use client";

import React from "react";

export interface CrashVisualProps {
  currentMultiplier: number;
  hasCrashed: boolean;
  hasLockedIn: boolean;
  lockedMultiplier?: number;
  className?: string;
}

export const CrashVisual: React.FC<CrashVisualProps> = ({
  currentMultiplier,
  hasCrashed,
  hasLockedIn,
  lockedMultiplier,
  className = "",
}) => {
  return (
    <div
      className={`relative w-full max-w-sm h-56 bg-arcade-950 border border-arcade-800 rounded-2xl flex flex-col items-center justify-center p-6 overflow-hidden select-none ${className}`}
    >
      {/* Background ascending gridlines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col justify-between p-4">
        <div className="w-full border-b border-dashed border-arcade-400" />
        <div className="w-full border-b border-dashed border-arcade-400" />
        <div className="w-full border-b border-dashed border-arcade-400" />
        <div className="w-full border-b border-dashed border-arcade-400" />
      </div>

      {/* Main multiplier display */}
      <div className="z-10 flex flex-col items-center">
        <span
          className={`font-mono font-black text-5xl md:text-6xl tracking-tight transition-colors ${
            hasCrashed
              ? "text-loss animate-shake"
              : hasLockedIn
              ? "text-win"
              : "text-brand-400"
          }`}
        >
          {currentMultiplier.toFixed(2)}x
        </span>

        <span
          className={`mt-2 font-mono text-xs font-bold uppercase tracking-widest px-3 py-0.5 rounded-full border ${
            hasCrashed
              ? "bg-loss/20 text-loss-light border-loss/30"
              : hasLockedIn
              ? "bg-win/20 text-win-light border-win/30"
              : "bg-brand-500/10 text-brand-300 border-brand-500/20"
          }`}
        >
          {hasCrashed
            ? "CRASHED"
            : hasLockedIn
            ? `SECURED @ ${lockedMultiplier?.toFixed(2)}x`
            : "RISING..."}
        </span>
      </div>
    </div>
  );
};
