"use client";

import React from "react";
import { GameResult } from "../../lib/types/game";
import { CoinIcon, TrophyIcon, SparklesIcon } from "../icons";
import { GameButton } from "./GameButton";

export interface ResultPanelProps {
  result: GameResult;
  currentBalance: number;
  onPlayAgain: () => void;
  className?: string;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  result,
  currentBalance,
  onPlayAgain,
  className = "",
}) => {
  const isWin = result.reward > result.wager;
  const isTie = result.reward === result.wager && result.wager > 0;
  const isLoss = result.reward < result.wager;

  return (
    <div
      className={`w-full max-w-sm mx-auto bg-arcade-900/95 border ${
        isWin ? "border-win/40 shadow-win/10" : isTie ? "border-brand-500/40" : "border-loss/40"
      } rounded-2xl p-5 text-center shadow-lg backdrop-blur-sm animate-pop ${className}`}
    >
      {/* Result Status Header */}
      <div className="mb-3">
        <span
          className={`inline-block px-4 py-1 rounded-full text-xs font-mono font-extrabold uppercase tracking-widest ${
            isWin
              ? "bg-win/20 text-win-light border border-win/30"
              : isTie
              ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
              : "bg-loss/20 text-loss-light border border-loss/30"
          }`}
        >
          {isWin ? "WIN" : isTie ? "PUSH (TIE)" : "ROUND OVER"}
        </span>
      </div>

      {/* Outcome text */}
      <h3 className="text-xl font-bold text-white mb-3 capitalize">
        {result.outcome}
      </h3>

      {/* Numerical Rewards Breakdown */}
      <div className="bg-arcade-950/80 border border-arcade-800 rounded-xl p-3.5 mb-4 grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center">
          <span className="text-[11px] text-arcade-400 font-medium uppercase tracking-wider">
            Coin Change
          </span>
          <div
            className={`flex items-center gap-1 font-mono font-bold text-lg mt-0.5 ${
              result.netChange > 0
                ? "text-win-light"
                : result.netChange < 0
                ? "text-loss-light"
                : "text-arcade-300"
            }`}
          >
            <span>{result.netChange > 0 ? `+${result.netChange}` : result.netChange}</span>
            <CoinIcon size={16} />
          </div>
        </div>

        <div className="flex flex-col items-center border-l border-arcade-800/80 pl-3">
          <span className="text-[11px] text-arcade-400 font-medium uppercase tracking-wider">
            XP Gained
          </span>
          <div className="flex items-center gap-1 font-mono font-bold text-lg text-brand-300 mt-0.5">
            <span>+{result.xpGained}</span>
            <span className="text-xs font-sans font-semibold">XP</span>
          </div>
        </div>
      </div>

      {/* Item Drop (if rewarded) */}
      {result.itemEarned && (
        <div className="mb-4 p-2.5 rounded-lg bg-arcade-850 border border-brand-500/30 flex items-center justify-center gap-2 text-xs">
          <SparklesIcon size={16} className="text-brand-400 flex-shrink-0" />
          <span className="text-arcade-200">
            Discovered: <strong className="text-brand-300 font-bold">{result.itemEarned.name}</strong> ({result.itemEarned.rarity})
          </span>
        </div>
      )}

      {/* Updated Balance preview */}
      <div className="flex items-center justify-between text-xs text-arcade-300 mb-4 px-1">
        <span>New Balance:</span>
        <div className="flex items-center gap-1 font-mono font-bold text-white text-sm">
          <span>{currentBalance.toLocaleString()}</span>
          <CoinIcon size={14} className="text-brand-400" />
        </div>
      </div>

      {/* Primary Action Button */}
      <GameButton
        variant={isWin ? "success" : "primary"}
        size="lg"
        onClick={onPlayAgain}
        className="w-full"
      >
        Play Again
      </GameButton>
    </div>
  );
};
