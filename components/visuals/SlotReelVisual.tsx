"use client";

import React from "react";

export interface SlotReelProps {
  symbols: string[]; // the 3 visible stopping symbols
  isSpinning?: boolean;
  className?: string;
}

export const SlotReelVisual: React.FC<SlotReelProps> = ({
  symbols,
  isSpinning = false,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-3 p-4 bg-arcade-950 border-4 border-arcade-800 rounded-2xl shadow-inner select-none ${className}`}
    >
      {symbols.map((sym, idx) => (
        <div
          key={idx}
          className="relative w-20 h-28 bg-arcade-900 border-2 border-arcade-700 rounded-xl overflow-hidden shadow-md flex items-center justify-center"
        >
          {/* Subtle reel gradient glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none z-10" />

          {/* Central payline indicator line */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500/30 z-10" />

          <div
            className={`flex flex-col items-center justify-center font-black text-3xl font-mono text-white transition-all ${
              isSpinning ? "animate-pulse blur-[1px]" : "animate-pop"
            }`}
          >
            <span>{sym}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
