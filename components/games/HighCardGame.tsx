"use client";

import React, { useState } from "react";
import { GameDefinition, GameResult, CardDefinition } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { CardVisual } from "../visuals/CardVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt, shuffle } from "../../lib/rng/random";

interface HighCardGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

function createDeck(): CardDefinition[] {
  const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;
  const d: CardDefinition[] = [];
  for (const s of suits) {
    for (const r of ranks) {
      d.push({ suit: s, rank: r, value: ranks.indexOf(r) + 2, id: `${r}_of_${s}` });
    }
  }
  return d;
}

export const HighCardGame: React.FC<HighCardGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [playerCard, setPlayerCard] = useState<CardDefinition | null>(null);
  const [dealerCard, setDealerCard] = useState<CardDefinition | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);

  const draw = () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setResult(null);

    const deck = shuffle(createDeck());
    const p = deck[0];
    const d = deck[1];

    let outcome = "";
    let reward = 0;
    if (p.value > d.value) {
      outcome = `${p.rank} beats ${d.rank} — Win!`;
      reward = wager * 2;
    } else if (p.value === d.value) {
      outcome = `Both drew ${p.rank} — Push!`;
      reward = wager;
    } else {
      outcome = `${d.rank} beats ${p.rank} — Dealer wins`;
      reward = 0;
    }

    setTimeout(() => {
      setPlayerCard(p);
      setDealerCard(d);
      setIsDrawing(false);

      const gameResult: GameResult = {
        id: `res_${Date.now()}_${randomInt(100000, 999999)}`,
        gameId: game.id,
        gameName: game.name,
        wager,
        outcome,
        reward,
        netChange: reward - wager,
        xpGained: game.xpConfig.baseXP + (reward > wager ? game.xpConfig.winBonus : 0),
        timestamp: Date.now(),
        details: { playerCard: p, dealerCard: d },
      };

      const commit = applyGameResult(gameResult);
      if (commit.success) setResult(gameResult);
      onFinished(gameResult);
    }, 700);
  };

  const reset = () => {
    setPlayerCard(null);
    setDealerCard(null);
    setResult(null);
    onReset();
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-mono text-arcade-400 uppercase tracking-wider">You</span>
          <CardVisual
            card={playerCard}
            isFlipped={Boolean(playerCard)}
            size="lg"
            isWinning={Boolean(result && result.reward > result.wager)}
          />
        </div>
        <span className="text-sm font-black text-arcade-600 font-mono">VS</span>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-mono text-arcade-400 uppercase tracking-wider">Dealer</span>
          <CardVisual card={dealerCard} isFlipped={Boolean(dealerCard)} size="lg" />
        </div>
      </div>

      {!result && (
        <GameButton size="lg" className="w-full max-w-xs" loading={isDrawing} disabled={isDrawing} onClick={draw}>
          {isDrawing ? "Drawing..." : "Draw Cards"}
        </GameButton>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
