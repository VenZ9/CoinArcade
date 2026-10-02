import React from "react";
import { getXPProgress } from "../../lib/economy/rewards";

export interface XPBarProps {
  xp: number;
  showDetails?: boolean;
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({ xp, showDetails = true, className = "" }) => {
  const { currentLevel, xpInCurrentLevel, xpNeededForNextLevel, progressPercent } = getXPProgress(xp);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded font-mono font-bold text-xs uppercase">
            LVL {currentLevel}
          </span>
          <span className="text-arcade-200 font-medium">Rank {currentLevel}</span>
        </div>
        {showDetails && (
          <span className="font-mono text-arcade-400 text-xs">
            {xpInCurrentLevel} / {xpNeededForNextLevel} XP
          </span>
        )}
      </div>

      <div className="w-full h-2 bg-arcade-900 border border-arcade-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`XP progress: ${progressPercent}%`}
        />
      </div>
    </div>
  );
};
