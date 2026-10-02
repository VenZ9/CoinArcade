"use client";

import React from "react";

export interface MysteryBoxVisualProps {
  isOpen: boolean;
  rewardText?: string;
  rarity?: string;
  isOpening?: boolean;
  type?: "box" | "chest" | "door";
  className?: string;
}

export const MysteryBoxVisual: React.FC<MysteryBoxVisualProps> = ({
  isOpen,
  rewardText,
  rarity = "common",
  isOpening = false,
  type = "box",
  className = "",
}) => {
  const rarityColors: Record<string, string> = {
    common: "text-slate-300 border-slate-500 bg-slate-800",
    uncommon: "text-green-300 border-green-500 bg-green-950",
    rare: "text-blue-300 border-blue-500 bg-blue-950",
    epic: "text-purple-300 border-purple-500 bg-purple-950",
    legendary: "text-amber-300 border-amber-500 bg-amber-950",
    mythic: "text-rose-300 border-rose-500 bg-rose-950",
  };

  const icons = {
    box: isOpen ? "📦" : "🎁",
    chest: isOpen ? "🗝️" : "🧰",
    door: isOpen ? "🚪" : "🚪",
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-6 bg-arcade-950 border border-arcade-800 rounded-2xl select-none ${className}`}
    >
      <div
        className={`text-6xl md:text-7xl transition-transform duration-300 ${
          isOpening ? "animate-bounce" : isOpen ? "scale-110 animate-pop" : "hover:scale-105"
        }`}
      >
        {icons[type]}
      </div>

      {isOpen && rewardText && (
        <div className="mt-4 animate-pop flex flex-col items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
              rarityColors[rarity] || rarityColors.common
            }`}
          >
            {rarity}
          </span>
          <span className="text-white font-bold text-base mt-1.5">{rewardText}</span>
        </div>
      )}

      {!isOpen && (
        <p className="mt-3 text-xs text-arcade-400 font-medium">
          {isOpening ? "Unlocking secrets..." : "Ready to unlock"}
        </p>
      )}
    </div>
  );
};
