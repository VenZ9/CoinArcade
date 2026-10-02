"use client";

import React, { useState } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { DiceVisual } from "../visuals/DiceVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt } from "../../lib/rng/random";

interface DiceRollGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

type Prediction = { type: "over" } | { type: "under" } | { type: "exact"; number: number };

export const DiceRollGame: React.FC<DiceRollGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [roll, setRoll] = useState<number>(6);
  const [isRolling, setIsRolling] = useState(false);
  const [prediction, setPrediction] = useState<Prediction>({ type: "over" });
  const [result, setResult] = useState<GameResult | null>(null);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setResult(null);

    const landed = randomInt(1, 6);

    let isWin = false;
    let mult = 0;
    if (prediction.type === "exact") {
      isWin = landed === prediction.number;
      mult = 5.88;
    } else if (prediction.type === "under") {
      isWin = landed <= 3;
      mult = 1.96;
    } else {
      isWin = landed >= 4;
      mult = 1.96;
    }

    const reward = isWin ? Math.floor(wager * mult) : 0;

    setTimeout(() => {
      setRoll(landed);
      setIsRolling(false);

      const gameResult: GameResult = {
        id: `res_${Date.now()}_${randomInt(100000, 999999)}`,
        gameId: game.id,
        gameName: game.name,
        wager,
        outcome: isWin ? `Rolled ${landed} — Win!` : `Rolled ${landed} — Loss`,
        reward,
        netChange: reward - wager,
        xpGained: game.xpConfig.baseXP + (isWin ? game.xpConfig.winBonus : 0),
        timestamp: Date.now(),
        details: { roll: landed, prediction },
      };

      const commit = applyGameResult(gameResult);
      if (commit.success) setResult(gameResult);
      onFinished(gameResult);
    }, 800);
  };

  const reset = () => {
    setResult(null);
    onReset();
  };

  const predictionLabel =
    prediction.type === "exact" ? `Exact ${prediction.number}` : prediction.type === "under" ? "Under (1-3)" : "Over (4-6)";

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      <DiceVisual value={roll} isRolling={isRolling} size="lg" isWinning={Boolean(result && result.reward > result.wager)} />

      {!result && (
        <div className="w-full flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isRolling}
              onClick={() => setPrediction({ type: "under" })}
              className={`py-3 rounded-xl border-2 text-xs font-bold uppercase transition-all ${
                prediction.type === "under"
                  ? "bg-brand-500/20 border-brand-500 text-brand-300"
                  : "bg-arcade-900 border-arcade-800 text-arcade-300"
              }`}
            >
              Under<br />1–3
            </button>
            <button
              type="button"
              disabled={isRolling}
              onClick={() => setPrediction({ type: "over" })}
              className={`py-3 rounded-xl border-2 text-xs font-bold uppercase transition-all ${
                prediction.type === "over"
                  ? "bg-brand-500/20 border-brand-500 text-brand-300"
                  : "bg-arcade-900 border-arcade-800 text-arcade-300"
              }`}
            >
              Over<br />4–6
            </button>
            <button
              type="button"
              disabled={isRolling}
              onClick={() => setPrediction({ type: "exact", number: 6 })}
              className={`py-3 rounded-xl border-2 text-xs font-bold uppercase transition-all ${
                prediction.type === "exact"
                  ? "bg-brand-500/20 border-brand-500 text-brand-300"
                  : "bg-arcade-900 border-arcade-800 text-arcade-300"
              }`}
            >
              Exact<br />6
            </button>
          </div>

          {prediction.type === "exact" && (
            <div className="grid grid-cols-6 gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPrediction({ type: "exact", number: n })}
                  className={`py-2 rounded-lg border text-xs font-mono font-bold transition-all ${
                    prediction.number === n
                      ? "bg-brand-500 text-arcade-950 border-brand-400"
                      : "bg-arcade-900 border-arcade-800 text-arcade-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          <GameButton size="lg" className="w-full" loading={isRolling} disabled={isRolling} onClick={rollDice}>
            {isRolling ? "Rolling..." : `Roll — ${predictionLabel}`}
          </GameButton>
        </div>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
