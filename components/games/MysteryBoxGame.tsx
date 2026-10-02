"use client";

import React from "react";
import { useState } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt, weightedChoice } from "../../lib/rng/random";

interface MysteryBoxGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

const BOXES = ["📦", "🎁", "🗝️"];

/** Published loot tiers, mirroring `lib/games/game-catalog.json`. */
const PRIZES = [
  { id: "common", label: "Common Loot", multiplier: 0.5, weight: 60 },
  { id: "rare", label: "Rare Loot", multiplier: 1.25, weight: 28 },
  { id: "epic", label: "Epic Loot", multiplier: 2.0, weight: 9 },
  { id: "legendary", label: "Legendary Loot", multiplier: 4.0, weight: 3 },
];

export const MysteryBoxGame: React.FC<MysteryBoxGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [isOpening, setIsOpening] = useState(false);
  const [opened, setOpened] = useState<number | null>(null);
  const [prize, setPrize] = useState<(typeof PRIZES)[number] | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);

  const openBox = (index: number) => {
    if (isOpening || result) return;
    setIsOpening(true);
    setOpened(index);

    // The tier is drawn from the published distribution before the box opens.
    const picked = weightedChoice(PRIZES);
    const reward = Math.floor(wager * picked.multiplier);
    setPrize(picked);

    setTimeout(() => {
      setIsOpening(false);
      const gameResult: GameResult = {
        id: `res_${Date.now()}_${randomInt(0, 999999)}`,
        gameId: game.id,
        gameName: game.name,
        wager,
        outcome: `Unboxed ${picked.label} (${picked.multiplier}x)`,
        reward,
        netChange: reward - wager,
        xpGained: game.xpConfig.baseXP + (reward > wager ? game.xpConfig.winBonus : 0),
        timestamp: Date.now(),
        details: { prize: picked.label },
      };
      const commit = applyGameResult(gameResult);
      if (commit.success) setResult(gameResult);
      onFinished(gameResult);
    }, 700);
  };

  const reset = () => {
    setResult(null);
    setOpened(null);
    setPrize(null);
    onReset();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      {!result && (
        <div className="flex gap-3">
          {BOXES.map((box, index) => (
            <button
              key={index}
              type="button"
              disabled={isOpening}
              onClick={() => openBox(index)}
              className={`w-24 h-28 rounded-2xl border-2 flex items-center justify-center text-4xl transition-all ${
                opened === index
                  ? "bg-brand-500/20 border-brand-500 scale-105"
                  : "bg-arcade-900 border-arcade-800 hover:border-arcade-600"
              } ${isOpening && opened === index ? "animate-bounce" : ""}`}
            >
              {opened === index && prize ? "✨" : box}
            </button>
          ))}
        </div>
      )}

      {!result && opened === null && (
        <p className="text-xs text-arcade-400">Pick a box to reveal your prize tier.</p>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
