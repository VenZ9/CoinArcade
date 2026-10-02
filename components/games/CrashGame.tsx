"use client";

import React, { useState, useRef, useEffect } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { CrashVisual } from "../visuals/CrashVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomFloat, randomInt } from "../../lib/rng/random";

interface CrashGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

export const CrashGame: React.FC<CrashGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [multiplier, setMultiplier] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [hasLockedIn, setHasLockedIn] = useState(false);
  const [lockedMultiplier, setLockedMultiplier] = useState<number | undefined>();
  const [result, setResult] = useState<GameResult | null>(null);

  const crashPointRef = useRef<number>(1.0);
  const lockedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRound = () => {
    if (isRunning) return;
    setResult(null);
    setHasCrashed(false);
    setHasLockedIn(false);
    setLockedMultiplier(undefined);
    lockedRef.current = false;
    setMultiplier(1.0);

    const u = randomFloat(0, 0.96);
    const crashPoint = Math.max(1.0, Number((0.98 / (1 - u)).toFixed(2)));
    crashPointRef.current = crashPoint;
    setIsRunning(true);

    let current = 1.0;
    timerRef.current = setInterval(() => {
      current = Number((current + 0.01 + current * 0.005).toFixed(2));
      if (current >= crashPointRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        setMultiplier(crashPointRef.current);
        setIsRunning(false);
        setHasCrashed(true);
        if (!lockedRef.current) finalize(0, crashPointRef.current, undefined);
      } else {
        setMultiplier(current);
      }
    }, 60);
  };

  const lockIn = () => {
    if (!isRunning || lockedRef.current) return;
    lockedRef.current = true;
    const locked = multiplier;
    setHasLockedIn(true);
    setLockedMultiplier(locked);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    finalize(Math.floor(wager * locked), crashPointRef.current, locked);
  };

  const finalize = (reward: number, crashPoint: number, locked: number | undefined) => {
    const isWin = reward > 0;
    const gameResult: GameResult = {
      id: `res_${Date.now()}_${randomInt(100000, 999999)}`,
      gameId: game.id,
      gameName: game.name,
      wager,
      outcome: isWin
        ? `Secured @ ${locked?.toFixed(2)}x (crashed at ${crashPoint}x)`
        : `Crashed @ ${crashPoint}x`,
      reward,
      netChange: reward - wager,
      xpGained: game.xpConfig.baseXP + (isWin ? game.xpConfig.winBonus : 0),
      timestamp: Date.now(),
      details: { crashPoint, locked },
    };

    const commit = applyGameResult(gameResult);
    if (commit.success) setResult(gameResult);
    onFinished(gameResult);
  };

  const reset = () => {
    setResult(null);
    setMultiplier(1.0);
    setHasCrashed(false);
    setHasLockedIn(false);
    setLockedMultiplier(undefined);
    onReset();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      <CrashVisual
        currentMultiplier={multiplier}
        hasCrashed={hasCrashed}
        hasLockedIn={hasLockedIn}
        lockedMultiplier={lockedMultiplier}
      />

      {!result && (
        <div className="w-full">
          {!isRunning && !hasCrashed && !hasLockedIn && (
            <GameButton size="lg" className="w-full" onClick={startRound}>
              Start Round
            </GameButton>
          )}

          {isRunning && (
            <GameButton variant="success" size="lg" className="w-full" onClick={lockIn} disabled={hasLockedIn}>
              {hasLockedIn ? `Locked @ ${lockedMultiplier?.toFixed(2)}x` : `Lock In @ ${multiplier.toFixed(2)}x`}
            </GameButton>
          )}

          {(hasCrashed || hasLockedIn) && (
            <GameButton size="lg" className="w-full" onClick={reset}>
              Play Again
            </GameButton>
          )}
        </div>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
