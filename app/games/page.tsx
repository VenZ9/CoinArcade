"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_GAMES } from "../../lib/games/definitions";
import { GameCategory } from "../../lib/types/game";
import { GameCard } from "../../components/ui/GameCard";
import { SearchIcon, StarIcon, CloseIcon } from "../../components/icons";
import { useGameStore } from "../../lib/state/game-store";

function GamesLibraryContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as GameCategory | "all") || "all";

  const { profile } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | "all">(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const categories: { id: GameCategory | "all"; label: string; count: number }[] = [
    { id: "all", label: "All Games", count: ALL_GAMES.length },
    { id: "chance", label: "Chance", count: 15 },
    { id: "risk", label: "Risk & Decision", count: 7 },
    { id: "rewards", label: "Rewards", count: 7 },
    { id: "prediction", label: "Prediction", count: 5 },
    { id: "choice", label: "Choice", count: 4 },
  ];

  const filteredGames = useMemo(() => {
    return ALL_GAMES.filter((game) => {
      // Category filter
      if (selectedCategory !== "all" && game.category !== selectedCategory) {
        return false;
      }
      // Favorites filter
      if (favoritesOnly && !profile.favorites.includes(game.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = game.name.toLowerCase().includes(q);
        const matchesDesc = game.description.toLowerCase().includes(q);
        const matchesTag = game.tagline.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, favoritesOnly, searchQuery, profile.favorites]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Game Library</h1>
          <p className="text-xs text-arcade-400 mt-0.5">
            Select any minigame to play with transparent rules and zero real-world cost.
          </p>
        </div>

        {/* Search input & Favorites toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <SearchIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-arcade-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search 38 arcade games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-arcade-900 border border-arcade-800 focus:border-brand-500 rounded-xl text-xs text-white placeholder-arcade-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-arcade-500 hover:text-white p-1"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`h-10 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all select-none ${
              favoritesOnly
                ? "bg-brand-500/20 text-brand-300 border-brand-500/40"
                : "bg-arcade-900 text-arcade-400 hover:text-arcade-200 border-arcade-800"
            }`}
          >
            <StarIcon size={14} filled={favoritesOnly} />
            <span className="hidden sm:inline">Favorites</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono transition-all select-none ${
              selectedCategory === cat.id
                ? "bg-brand-500 text-arcade-950 font-bold shadow-sm shadow-brand-500/20"
                : "bg-arcade-900 hover:bg-arcade-850 text-arcade-300 border border-arcade-800"
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Game Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6 bg-arcade-900/60 border border-dashed border-arcade-800 rounded-2xl">
          <span className="text-4xl mb-3">🔍</span>
          <h3 className="text-base font-bold text-white mb-1">No matching games found</h3>
          <p className="text-xs text-arcade-400 max-w-sm mb-4">
            Try adjusting your search query or clear the active category filters to see more games.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setFavoritesOnly(false);
            }}
            className="px-4 py-2 rounded-lg bg-arcade-800 hover:bg-arcade-750 text-xs font-semibold text-brand-300 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <GamesLibraryContent />
    </Suspense>
  );
}
