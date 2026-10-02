import React from "react";
import { CardDefinition, Suit, Rank } from "../../lib/types/game";

export interface CardVisualProps {
  /** Optional full card object; when present its suit/rank take precedence. */
  card?: CardDefinition | null;
  suit?: Suit;
  rank?: Rank;
  isFlipped?: boolean; // if false, shows card back
  isWinning?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const suitSymbols: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

export const CardVisual: React.FC<CardVisualProps> = ({
  card,
  suit,
  rank,
  isFlipped = true,
  isWinning = false,
  className = "",
  size = "md",
}) => {
  // A `card` object may be supplied directly; its suit/rank take precedence.
  // Falling back to defaults preserves standalone usage of the component.
  const resolvedSuit: Suit = card?.suit ?? suit ?? "spades";
  const resolvedRank: Rank = card?.rank ?? rank ?? "A";
  const isRed = resolvedSuit === "hearts" || resolvedSuit === "diamonds";

  const sizeClasses = {
    sm: "w-14 h-20 text-xs rounded-md",
    md: "w-20 h-28 text-base rounded-lg",
    lg: "w-28 h-40 text-xl rounded-xl",
  };

  if (!isFlipped) {
    // Card back
    return (
      <div
        className={`relative ${sizeClasses[size]} bg-arcade-800 border-2 border-arcade-700 flex items-center justify-center p-2 shadow-md transition-transform duration-300 select-none ${className}`}
      >
        <div className="w-full h-full border border-dashed border-arcade-600 rounded flex items-center justify-center bg-arcade-850/80">
          <span className="font-mono text-brand-400 font-extrabold text-xs">ARCADE</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${sizeClasses[size]} bg-white border-2 ${
        isWinning ? "border-win ring-2 ring-win/50 shadow-win/20" : "border-slate-300 shadow-md"
      } flex flex-col justify-between p-1.5 transition-transform duration-300 select-none ${
        isRed ? "text-red-600" : "text-slate-900"
      } ${className}`}
    >
      <div className="flex flex-col items-start leading-none font-bold font-mono">
        <span>{resolvedRank}</span>
        <span className="text-xs">{suitSymbols[resolvedSuit]}</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-2xl">
        <span>{suitSymbols[resolvedSuit]}</span>
      </div>

      <div className="flex flex-col items-end leading-none font-bold font-mono rotate-180">
        <span>{resolvedRank}</span>
        <span className="text-xs">{suitSymbols[resolvedSuit]}</span>
      </div>
    </div>
  );
};
