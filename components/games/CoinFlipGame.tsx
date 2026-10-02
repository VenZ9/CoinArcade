"use client";

import React, { useState, useEffect } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { CoinVisual } from "../visuals/CoinVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt } from "../../lib/rng/random";

interface CoinFlipGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

export const CoinFlipGame: React.FC<CoinFlipGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [choice, setChoice] = useState<"heads" | "tails" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [displaySide, setDisplaySide] = useState<"heads" | "tails">("heads");

  useEffect(() => {
    if (!isFlipping) return;
    const interval = setInterval(() => {
      setDisplaySide((prev) => (prev === "heads" ? "tails" : "heads"));
    }, 90);
    return () => clearInterval(interval);
  }, [isFlipping]);

  const flip = () => {
    if (!choice || isFlipping) return;
    setIsFlipping(true);
    setResult(null);

    const landed = randomInt(0, 1) === 0 ? "heads" : "tails";
    const isWin = landed === choice;
    const reward = isWin ? Math.floor(wager * 1.96) : 0;

    setTimeout(() => {
      setIsFlipping(false);
      setDisplaySide(landed);

      const gameResult: GameResult = {
        id: `res_${Date.now()}_${randomInt(100000, 999999)}`,
        gameId: game.id,
        gameName: game.name,
        wager,
        outcome: isWin ? `Flipped ${landed} — Win!` : `Flipped ${landed} — Loss`,
        reward,
        netChange: reward - wager,
        xpGained: game.xpConfig.baseXP + (isWin ? game.xpConfig.winBonus : 0),
        timestamp: Date.now(),
        details: { flipResult: landed, playerChoice: choice },
      };

      const commit = applyGameResult(gameResult);
      if (commit.success) setResult(gameResult);
      onFinished(gameResult);
    }, 1200);
  };

  const reset = () => {
    setResult(null);
    setChoice(null);
    onReset();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      <CoinVisual side={displaySide} isFlipping={isFlipping} size="lg" />

      {!result && (
        <div className="flex gap-3 w-full">
          <button
            type="button"
            disabled={isFlipping}
            onClick={() => setChoice("heads")}
            className={`flex-1 py-4 rounded-xl border-2 font-bold uppercase tracking-wider transition-all ${
              choice === "heads"
                ? "bg-brand-500/20 border-brand-500 text-brand-300"
                : "bg-arcade-900 border-arcade-800 text-arcade-300 hover:border-arcade-600"
            } disabled:opacity-50`}
          >
            Heads
          </button>
          <button
            type="button"
            disabled={isFlipping}
            onClick={() => setChoice("tails")}
            className={`flex-1 py-4 rounded-xl border-2 font-bold uppercase tracking-wider transition-all ${
              choice === "tails"
                ? "bg-brand-500/20 border-brand-500 text-brand-300"
                : "bg-arcade-900 border-arcade-800 text-arcade-300 hover:border-arcade-600"
            } disabled:opacity-50`}
          >
            Tails
          </button>
        </div>
      )}

      {!result && (
        <GameButton size="lg" className="w-full" disabled={!choice || isFlipping} loading={isFlipping} onClick={flip}>
          {isFlipping ? "Flipping..." : `Flip for ${wager} Coins`}
        </GameButton>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
