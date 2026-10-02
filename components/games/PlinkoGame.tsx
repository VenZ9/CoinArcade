"use client";

import React, { useState } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { PlinkoVisual, PLINKO_SLOTS } from "../visuals/PlinkoVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt, weightedChoice } from "../../lib/rng/random";

interface PlinkoGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

/** Bucket weights and payouts, mirrored from `lib/games/game-catalog.json`. */
const OUTCOMES = [
  { id: "slot_0", weight: 1, multiplier: 8.5 },
  { id: "slot_1", weight: 6, multiplier: 2.0 },
  { id: "slot_2", weight: 15, multiplier: 0.5 },
  { id: "slot_3", weight: 20, multiplier: 0.35 },
  { id: "slot_4", weight: 15, multiplier: 0.5 },
  { id: "slot_5", weight: 6, multiplier: 2.0 },
  { id: "slot_6", weight: 1, multiplier: 8.5 },
];

export const PlinkoGame: React.FC<PlinkoGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [isDropping, setIsDropping] = useState(false);
  const [targetSlot, setTargetSlot] = useState(3);
  const [result, setResult] = useState<GameResult | null>(null);

  const drop = () => {
    if (isDropping) return;
    setIsDropping(true);
    setResult(null);

    // The bucket is decided up front; the bounce path only visualises it.
    const picked = weightedChoice(OUTCOMES);
    const slotIndex = parseInt(picked.id.replace("slot_", ""), 10);
    setTargetSlot(slotIndex);

    const reward = Math.floor(wager * picked.multiplier);

    setTimeout(() => {
      setIsDropping(false);
      const gameResult: GameResult = {
        id: `res_${Date.now()}_${randomInt(0, 999999)}`,
        gameId: game.id,
        gameName: game.name,
        wager,
        outcome: `Landed in the ${picked.multiplier}x bucket`,
        reward,
        netChange: reward - wager,
        xpGained: game.xpConfig.baseXP + (reward > wager ? game.xpConfig.winBonus : 0),
        timestamp: Date.now(),
        details: { slotIndex, multiplier: picked.multiplier },
      };
      const commit = applyGameResult(gameResult);
      if (commit.success) setResult(gameResult);
      onFinished(gameResult);
    }, 2200);
  };

  const reset = () => {
    setResult(null);
    onReset();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-5">
      <PlinkoVisual targetSlotIndex={targetSlot} isDropping={isDropping} />

      <div className="flex gap-1 w-full max-w-xs">
        {PLINKO_SLOTS.map((slot) => (
          <div key={slot.index} className="flex-1 text-center text-[9px] font-mono text-arcade-500">
            {slot.label}
          </div>
        ))}
      </div>

      {!result && (
        <GameButton size="lg" className="w-full" loading={isDropping} disabled={isDropping} onClick={drop}>
          {isDropping ? "Dropping..." : `Drop Ball — ${wager} Coins`}
        </GameButton>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
