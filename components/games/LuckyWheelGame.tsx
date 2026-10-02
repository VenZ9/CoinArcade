"use client";

import React, { useState } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { WheelVisual, WheelSegment } from "../visuals/WheelVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt, weightedChoice } from "../../lib/rng/random";

interface LuckyWheelGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

/**
 * The eight wheel segments. Weights are published and mirror the values in
 * `lib/games/game-catalog.json` so the visible wheel and the audited model agree.
 */
const SEGMENTS: WheelSegment[] = [
  { id: "seg0", label: "0x", multiplier: 0, color: "#334155" },
  { id: "seg05", label: "0.5x", multiplier: 0.5, color: "#475569" },
  { id: "seg12", label: "1.2x", multiplier: 1.2, color: "#0d9488" },
  { id: "seg15", label: "1.5x", multiplier: 1.5, color: "#0ea5e9" },
  { id: "seg20", label: "2x", multiplier: 2.0, color: "#6366f1" },
  { id: "seg30", label: "3x", multiplier: 3.0, color: "#a855f7" },
  { id: "seg50", label: "5x", multiplier: 5.0, color: "#f59e0b" },
  { id: "seg0b", label: "0x", multiplier: 0, color: "#1e293b" },
];

const WEIGHTS = [
  { id: "seg0", weight: 14, multiplier: 0 },
  { id: "seg05", weight: 25, multiplier: 0.5 },
  { id: "seg12", weight: 18, multiplier: 1.2 },
  { id: "seg15", weight: 12, multiplier: 1.5 },
  { id: "seg20", weight: 11, multiplier: 2.0 },
  { id: "seg30", weight: 4, multiplier: 3.0 },
  { id: "seg50", weight: 2, multiplier: 5.0 },
  { id: "seg0b", weight: 14, multiplier: 0 },
];

export const LuckyWheelGame: React.FC<LuckyWheelGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // The outcome is committed before the animation begins, so the visual spin
    // is a faithful replay of an already-decided result rather than a fresh draw.
    const picked = weightedChoice(WEIGHTS);
    const segIndex = SEGMENTS.findIndex((s) => s.id === picked.id);
    const anglePerSegment = 360 / SEGMENTS.length;
    const targetAngle = 360 - (segIndex * anglePerSegment + anglePerSegment / 2);
    const fullSpins = 5 * 360;
    const jitter = randomInt(-100, 100) / 100;
    setRotation((prev) => prev + fullSpins + targetAngle + jitter);

    const reward = Math.floor(wager * picked.multiplier);
    const isWin = reward > wager;

    setTimeout(() => {
      setIsSpinning(false);
      const gameResult: GameResult = {
        id: `res_${Date.now()}_${randomInt(0, 999999)}`,
        gameId: game.id,
        gameName: game.name,
        wager,
        outcome: `Landed on ${picked.multiplier}x`,
        reward,
        netChange: reward - wager,
        xpGained: game.xpConfig.baseXP + (isWin ? game.xpConfig.winBonus : 0),
        timestamp: Date.now(),
        details: { segment: picked.id, multiplier: picked.multiplier },
      };
      const commit = applyGameResult(gameResult);
      if (commit.success) setResult(gameResult);
      onFinished(gameResult);
    }, 3400);
  };

  const reset = () => {
    setResult(null);
    setRotation(0);
    onReset();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      <WheelVisual segments={SEGMENTS} rotationDegrees={rotation} isSpinning={isSpinning} size={280} />

      {!result && (
        <GameButton size="lg" className="w-full" loading={isSpinning} disabled={isSpinning} onClick={spin}>
          {isSpinning ? "Spinning..." : `Spin the Wheel — ${wager} Coins`}
        </GameButton>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
