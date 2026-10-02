"use client";

import React, { useEffect, useState } from "react";
import { randomFloat } from "../../lib/rng/random";

export interface PlinkoVisualProps {
  targetSlotIndex: number; // 0..6
  isDropping?: boolean;
  onAnimationEnd?: () => void;
  className?: string;
}

export const PLINKO_SLOTS = [
  { index: 0, multiplier: 8.5, label: "8.5x", color: "text-amber-400 bg-amber-500/20 border-amber-500/40" },
  { index: 1, multiplier: 2.0, label: "2x", color: "text-blue-400 bg-blue-500/20 border-blue-500/40" },
  { index: 2, multiplier: 0.5, label: "0.5x", color: "text-slate-400 bg-slate-500/20 border-slate-500/40" },
  { index: 3, multiplier: 0.35, label: "0.35x", color: "text-loss-light bg-loss/20 border-loss/40" },
  { index: 4, multiplier: 0.5, label: "0.5x", color: "text-slate-400 bg-slate-500/20 border-slate-500/40" },
  { index: 5, multiplier: 2.0, label: "2x", color: "text-blue-400 bg-blue-500/20 border-blue-500/40" },
  { index: 6, multiplier: 8.5, label: "8.5x", color: "text-amber-400 bg-amber-500/20 border-amber-500/40" },
];

export const PlinkoVisual: React.FC<PlinkoVisualProps> = ({
  targetSlotIndex,
  isDropping = false,
  onAnimationEnd,
  className = "",
}) => {
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!isDropping) {
      setBallPos(null);
      return;
    }

    // Build a six-step left/right path whose total right-steps equal the target
    // slot index. The path is purely decorative: the payout was already fixed.
    const steps: number[] = [];
    let rightsRemaining = targetSlotIndex;
    let levelsRemaining = 6;

    for (let i = 0; i < 6; i++) {
      levelsRemaining--;
      const chooseRight = randomFloat(0, 1) < rightsRemaining / (levelsRemaining + 1);
      if (chooseRight && rightsRemaining > 0) {
        steps.push(1);
        rightsRemaining--;
      } else {
        steps.push(0);
      }
    }

    setBallPos({ x: 50, y: 5 });

    let currentStep = 0;
    let currentX = 50;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= 6) {
        const dir = steps[currentStep - 1] === 1 ? 1 : -1;
        currentX += dir * 6.2;
        const currentY = 5 + currentStep * 13;
        setBallPos({ x: currentX, y: currentY });
      } else {
        const finalSlotX = 7 + targetSlotIndex * 14.3;
        setBallPos({ x: finalSlotX, y: 92 });
        clearInterval(interval);
        setTimeout(() => {
          if (onAnimationEnd) onAnimationEnd();
        }, 300);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isDropping, targetSlotIndex, onAnimationEnd]);

  return (
    <div
      className={`relative w-full max-w-xs h-72 bg-arcade-950 border border-arcade-800 rounded-2xl p-4 overflow-hidden select-none flex flex-col justify-between ${className}`}
    >
      <div className="relative w-full h-56 pt-2">
        {[2, 3, 4, 5, 6, 7].map((numPegs, rowIdx) => (
          <div
            key={rowIdx}
            className="flex justify-around items-center"
            style={{ marginTop: rowIdx === 0 ? "8px" : "18px" }}
          >
            {Array.from({ length: numPegs }).map((_, pegIdx) => (
              <div
                key={pegIdx}
                className="w-2.5 h-2.5 rounded-full bg-arcade-600 shadow-sm border border-arcade-400"
              />
            ))}
          </div>
        ))}

        {ballPos && (
          <div
            className="absolute w-4 h-4 rounded-full bg-brand-400 border border-white shadow-lg shadow-brand-500/50 transition-all duration-200 ease-out z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
          />
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 pt-2 border-t border-arcade-800">
        {PLINKO_SLOTS.map((slot) => (
          <div
            key={slot.index}
            className={`text-center py-1 rounded text-[10px] font-mono font-bold border transition-all ${slot.color} ${
              !isDropping && targetSlotIndex === slot.index ? "ring-2 ring-brand-400 scale-105" : ""
            }`}
          >
            {slot.label}
          </div>
        ))}
      </div>
    </div>
  );
};
