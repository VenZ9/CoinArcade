import React from "react";
import Link from "next/link";
import { ALL_GAMES, GAMES_MAP } from "../../../lib/games/definitions";
import { GameLayout } from "../../../components/ui/GameLayout";
import { UniversalGamePlayer } from "../../../components/games/UniversalGamePlayer";

// Generate static routes for all 38 games for fast static rendering
export function generateStaticParams() {
  return ALL_GAMES.map((game) => ({
    id: game.id,
  }));
}

export default function GamePage({ params }: { params: { id: string } }) {
  const game = GAMES_MAP.get(params.id);

  if (!game) {
    return (
      <div className="w-full max-w-md mx-auto py-16 px-4 text-center">
        <span className="text-4xl mb-3 block">🕹️</span>
        <h1 className="text-xl font-bold text-white mb-2">Game Not Found</h1>
        <p className="text-xs text-arcade-400 mb-6">
          The requested minigame does not exist in our library catalog.
        </p>
        <Link
          href="/games"
          className="inline-block px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-arcade-950 font-bold text-xs uppercase tracking-wider transition-colors"
        >
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <GameLayout game={game}>
      <UniversalGamePlayer game={game} />
    </GameLayout>
  );
}
