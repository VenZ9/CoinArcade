"use client";

import React from "react";
import Link from "next/link";
import { AppNavigation } from "./AppNavigation";
import { CoinBalance } from "../ui/CoinBalance";
import { useGameStore } from "../../lib/state/game-store";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isHydrated } = useGameStore();

  return (
    <div className="min-h-screen bg-arcade-950 text-arcade-100 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-300">
      {/* Navigation (Desktop sidebar + Mobile bottom nav) */}
      <AppNavigation />

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-arcade-950/90 backdrop-blur-md border-b border-arcade-850">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🕹️</span>
          <span className="font-black text-sm text-white tracking-tight">COIN ARCADE</span>
        </Link>
        {isHydrated && <CoinBalance balance={profile.coins} size="sm" />}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pb-20 md:pb-8 flex flex-col w-full max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
