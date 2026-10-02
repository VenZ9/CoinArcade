"use client";

import React from "react";
import Link from "next/link";
import { GameDefinition } from "../../lib/types/game";
import { GameCategoryIcon, StarIcon, ChevronRightIcon } from "../icons";
import { useGameStore } from "../../lib/state/game-store";

export interface GameCardProps {
  game: GameDefinition;
  compact?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, compact = false }) => {
  const { profile, toggleFavorite } = useGameStore();
  const isFavorite = profile.favorites.includes(game.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  const categoryColorClasses: Record<string, string> = {
    chance: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    risk: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    rewards: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    prediction: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    choice: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <Link
      href={`/games/${game.id}`}
      className="group relative flex flex-col justify-between bg-arcade-900 border border-arcade-800 hover:border-arcade-700 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/40 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
    >
      <div>
        {/* Top category row + Favorite toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider border ${
              categoryColorClasses[game.category] || "text-arcade-300 bg-arcade-800 border-arcade-700"
            }`}
          >
            <GameCategoryIcon category={game.category} size={13} />
            {game.category}
          </span>

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? `Remove ${game.name} from favorites` : `Add ${game.name} to favorites`}
            className={`p-1.5 rounded-lg transition-colors ${
              isFavorite
                ? "text-brand-400 hover:text-brand-300 bg-brand-500/10"
                : "text-arcade-600 hover:text-arcade-400 hover:bg-arcade-800"
            }`}
          >
            <StarIcon size={16} filled={isFavorite} />
          </button>
        </div>

        {/* Game Title */}
        <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
          {game.name}
        </h3>

        {/* Tagline */}
        <p className="text-xs text-arcade-400 mt-1 line-clamp-2 leading-relaxed">
          {game.tagline || game.description}
        </p>
      </div>

      {/* Bottom info: Min/Max Wager + Play action */}
      <div className="mt-4 pt-3 border-t border-arcade-800/80 flex items-center justify-between text-xs">
        <span className="font-mono text-arcade-400">
          {game.supportsWager ? `Wager: ${game.minWager}–${game.maxWager}` : "Free to Play"}
        </span>

        <span className="inline-flex items-center gap-1 font-semibold text-brand-400 group-hover:translate-x-0.5 transition-transform">
          Play
          <ChevronRightIcon size={14} />
        </span>
      </div>
    </Link>
  );
};
