"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "../lib/state/game-store";
import { ALL_GAMES, GAMES_MAP } from "../lib/games/definitions";
import { CoinBalance } from "../components/ui/CoinBalance";
import { XPBar } from "../components/ui/XPBar";
import { GameCard } from "../components/ui/GameCard";
import { GameButton } from "../components/ui/GameButton";
import { FlameIcon, SparklesIcon, TrophyIcon, ChevronRightIcon, GameCategoryIcon } from "../components/icons";
import { useToast } from "../components/ui/Toast";

export default function HomePage() {
  const { profile, claimDailyReward, isHydrated } = useGameStore();
  const { showToast } = useToast();

  const today = new Date().toISOString().slice(0, 10);
  const alreadyClaimedDaily = profile.lastDailyClaimDate === today;

  const handleClaimDaily = () => {
    const res = claimDailyReward();
    if (res.success) {
      showToast(res.message, "success");
    } else {
      showToast(res.message, "info");
    }
  };

  // Recent games from history
  const recentGameIds = Array.from(new Set(profile.history.map((h) => h.gameId))).slice(0, 4);
  const recentGames = recentGameIds.map((id) => GAMES_MAP.get(id)).filter(Boolean) as typeof ALL_GAMES;

  // Favorite games
  const favoriteGames = profile.favorites.map((id) => GAMES_MAP.get(id)).filter(Boolean) as typeof ALL_GAMES;

  // Featured flagship games
  const featuredIds = ["coin-flip", "lucky-wheel", "slots", "mines", "crash", "plinko"];
  const featuredGames = featuredIds.map((id) => GAMES_MAP.get(id)).filter(Boolean) as typeof ALL_GAMES;

  const categories = [
    { id: "chance", label: "Chance", count: 15 },
    { id: "risk", label: "Risk & Decision", count: 7 },
    { id: "rewards", label: "Rewards", count: 7 },
    { id: "prediction", label: "Prediction", count: 5 },
    { id: "choice", label: "Choice", count: 4 },
  ];

  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 text-arcade-400">
          <span className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Loading Arcade...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col gap-8">
      {/* Top Welcome & Progression Summary Bar */}
      <div className="bg-gradient-to-r from-arcade-900 to-arcade-850 border border-arcade-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕹️</span>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Welcome Back, {profile.username}!
            </h1>
          </div>
          <p className="text-xs md:text-sm text-arcade-300">
            Enjoy 38 cryptographically fair arcade minigames with transparent rules and pure in-game Coin points.
          </p>
          <div className="mt-2 max-w-md">
            <XPBar xp={profile.xp} />
          </div>
        </div>

        {/* Daily Reward & Coin Status */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-arcade-800">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-arcade-400 uppercase font-mono block">Your Balance</span>
              <CoinBalance balance={profile.coins} size="lg" />
            </div>
          </div>

          {/* Daily Reward Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-arcade-950 border border-arcade-800 text-xs font-mono">
              <FlameIcon size={14} className="text-brand-400" />
              <span className="text-arcade-300">{profile.streak} Day Streak</span>
            </div>
            <GameButton
              size="sm"
              variant={alreadyClaimedDaily ? "secondary" : "primary"}
              disabled={alreadyClaimedDaily}
              onClick={handleClaimDaily}
            >
              <SparklesIcon size={14} />
              <span>{alreadyClaimedDaily ? "Claimed Today" : "Claim Daily Bonus"}</span>
            </GameButton>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-arcade-300 uppercase tracking-wider font-mono">
            Browse Categories
          </h2>
          <Link
            href="/games"
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-0.5"
          >
            View All 38 Games
            <ChevronRightIcon size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/games?category=${cat.id}`}
              className="bg-arcade-900 hover:bg-arcade-850 border border-arcade-800 hover:border-arcade-700 rounded-xl p-3.5 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-arcade-950 border border-arcade-800 flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform">
                  <GameCategoryIcon category={cat.id} size={16} />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block group-hover:text-brand-300 transition-colors">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-arcade-400 font-mono">{cat.count} Games</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Games */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrophyIcon size={16} className="text-brand-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Featured Flagship Games
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Favorite Games (if any) */}
      {favoriteGames.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>⭐</span> Your Favorite Games
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Played Games (if any) */}
      {recentGames.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Recently Played
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
