"use client";

import React, { useState } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { GridVisual, GridTile } from "../visuals/GridVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt, shuffle } from "../../lib/rng/random";

interface MinesGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

const TOTAL_TILES = 25;
const MINE_COUNT = 3;

function minesMultiplier(safeFound: number): number {
  return Number((0.98 * Math.pow(TOTAL_TILES / (TOTAL_TILES - MINE_COUNT), safeFound)).toFixed(2));
}

export const MinesGame: React.FC<MinesGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [mineIndices, setMineIndices] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [hitMine, setHitMine] = useState<number | null>(null);

  const start = () => {
    const indices = shuffle(Array.from({ length: TOTAL_TILES }, (_, i) => i)).slice(0, MINE_COUNT);
    setMineIndices(indices);
    setRevealed([]);
    setHitMine(null);
    setResult(null);
    setIsActive(true);
  };

  const finalize = (reward: number, safeCount: number, exploded: boolean) => {
    const gameResult: GameResult = {
      id: `res_${Date.now()}_${randomInt(100000, 999999)}`,
      gameId: game.id,
      gameName: game.name,
      wager,
      outcome: exploded ? "Mine detonated!" : `Cashed out with ${safeCount} gems (${minesMultiplier(safeCount)}x)`,
      reward,
      netChange: reward - wager,
      xpGained: game.xpConfig.baseXP + (reward > wager ? game.xpConfig.winBonus : 0),
      timestamp: Date.now(),
      details: { safeCount, exploded },
    };
    const commit = applyGameResult(gameResult);
    if (commit.success) setResult(gameResult);
    setIsActive(false);
    onFinished(gameResult);
  };

  const onTileClick = (index: number) => {
    if (!isActive || revealed.includes(index)) return;
    if (mineIndices.includes(index)) {
      setHitMine(index);
      setRevealed((prev) => [...prev, index]);
      finalize(0, revealed.length, true);
    } else {
      setRevealed((prev) => [...prev, index]);
    }
  };

  const cashOut = () => {
    if (!isActive || revealed.length === 0) return;
    const mult = minesMultiplier(revealed.length);
    finalize(Math.floor(wager * mult), revealed.length, false);
  };

  const reset = () => {
    setMineIndices([]);
    setRevealed([]);
    setHitMine(null);
    setResult(null);
    setIsActive(false);
    onReset();
  };

  const tiles: GridTile[] = Array.from({ length: TOTAL_TILES }, (_, i) => {
    const isRevealed = revealed.includes(i);
    const isMine = mineIndices.includes(i);
    return {
      index: i,
      revealed: isRevealed,
      content: isRevealed ? (isMine ? "mine" : "gem") : undefined,
      isHit: hitMine === i,
    };
  });

  const currentMult = revealed.length > 0 ? minesMultiplier(revealed.length) : 0;
  const potentialWin = Math.floor(wager * currentMult);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-5">
      <GridVisual tiles={tiles} columns={5} onTileClick={onTileClick} disabled={!isActive} />

      {isActive && (
        <div className="w-full text-center text-xs font-mono text-arcade-300">
          Safe picks: <span className="text-white font-bold">{revealed.length}</span> • Current multiplier:{" "}
          <span className="text-brand-300 font-bold">{currentMult}x</span> • Cash out value:{" "}
          <span className="text-win-light font-bold">{potentialWin}</span>
        </div>
      )}

      {!isActive && !result && (
        <GameButton size="lg" className="w-full" onClick={start}>
          Reveal Tiles
        </GameButton>
      )}

      {isActive && (
        <GameButton variant="success" size="lg" className="w-full" disabled={revealed.length === 0} onClick={cashOut}>
          Cash Out ({potentialWin} Coins)
        </GameButton>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
