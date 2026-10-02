"use client";

import React, { useRef, useState } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { SlotReelVisual } from "../visuals/SlotReelVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt, weightedChoice } from "../../lib/rng/random";

interface SlotsGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

/**
 * The published paytable. Weights mirror `lib/games/game-catalog.json` so the
 * paytable shown in the UI and the audited model are the same numbers.
 */
const SYMBOLS = [
  { id: "seven", symbols: ["7", "7", "7"], mult: 25.0, weight: 1, label: "Jackpot 777" },
  { id: "diamond", symbols: ["💎", "💎", "💎"], mult: 10.0, weight: 2, label: "Diamond Line" },
  { id: "bell", symbols: ["🔔", "🔔", "🔔"], mult: 5.0, weight: 4, label: "Triple Bell" },
  { id: "cherry3", symbols: ["🍒", "🍒", "🍒"], mult: 3.0, weight: 6, label: "Cherry Trio" },
  { id: "cherry2", symbols: ["🍒", "🍒", "⭐"], mult: 1.5, weight: 10, label: "Cherry Pair" },
  { id: "miss", symbols: ["⭐", "🪙", "🔔"], mult: 0.0, weight: 77, label: "No Match" },
];

export const SlotsGame: React.FC<SlotsGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [symbols, setSymbols] = useState<string[]>(["7", "💎", "🔔"]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const spinTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // Decide the payline first; the reels then animate to that decided result.
    const picked = weightedChoice(SYMBOLS);

    if (spinTimer.current) clearInterval(spinTimer.current);
    spinTimer.current = setInterval(() => {
      setSymbols([
        SYMBOLS[randomInt(0, SYMBOLS.length - 1)].symbols[0],
        SYMBOLS[randomInt(0, SYMBOLS.length - 1)].symbols[0],
        SYMBOLS[randomInt(0, SYMBOLS.length - 1)].symbols[0],
      ]);
    }, 80);

    setTimeout(() => {
      if (spinTimer.current) clearInterval(spinTimer.current);
      setSymbols(picked.symbols);
      setIsSpinning(false);

      const reward = Math.floor(wager * picked.mult);
      const isWin = reward > wager;

      const gameResult: GameResult = {
        id: `res_${Date.now()}_${randomInt(0, 999999)}`,
        gameId: game.id,
        gameName: game.name,
        wager,
        outcome: picked.mult > 0 ? `${picked.label} — Win!` : "No matching line",
        reward,
        netChange: reward - wager,
        xpGained: game.xpConfig.baseXP + (isWin ? game.xpConfig.winBonus : 0),
        timestamp: Date.now(),
        details: { combination: picked.id, multiplier: picked.mult },
      };
      const commit = applyGameResult(gameResult);
      if (commit.success) setResult(gameResult);
      onFinished(gameResult);
    }, 1400);
  };

  const reset = () => {
    setResult(null);
    onReset();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      <SlotReelVisual symbols={symbols} isSpinning={isSpinning} />

      {!result && (
        <GameButton size="lg" className="w-full" loading={isSpinning} disabled={isSpinning} onClick={spin}>
          {isSpinning ? "Spinning..." : `Spin Reels — ${wager} Coins`}
        </GameButton>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
