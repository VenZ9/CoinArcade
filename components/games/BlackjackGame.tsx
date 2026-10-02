"use client";

import React, { useState } from "react";
import { GameDefinition, GameResult, CardDefinition } from "../../lib/types/game";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import { CardVisual } from "../visuals/CardVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt, shuffle } from "../../lib/rng/random";

interface BlackjackGameProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

function cardValue(c: CardDefinition, acesHigh: boolean): number {
  if (c.rank === "A") return acesHigh ? 11 : 1;
  if (["K", "Q", "J", "10"].includes(c.rank)) return 10;
  return c.value;
}

function handTotal(hand: CardDefinition[]): number {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.rank === "A") {
      aces++;
      total += 11;
    } else {
      total += cardValue(c, true);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export const BlackjackGame: React.FC<BlackjackGameProps> = ({ game, wager, onFinished, onReset }) => {
  const { profile, applyGameResult } = useGameStore();
  const [deck, setDeck] = useState<CardDefinition[]>(() => shuffle(createDeck()));
  const [playerHand, setPlayerHand] = useState<CardDefinition[]>([]);
  const [dealerHand, setDealerHand] = useState<CardDefinition[]>([]);
  const [phase, setPhase] = useState<"idle" | "player" | "dealer" | "done">("idle");
  const [result, setResult] = useState<GameResult | null>(null);

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

  const deal = () => {
    const d = shuffle(createDeck());
    const p = [d[0], d[2]];
    const dh = [d[1], d[3]];
    setDeck(d.slice(4));
    setPlayerHand(p);
    setDealerHand(dh);
    setPhase("player");
    setResult(null);

    if (handTotal(p) === 21) {
      setTimeout(() => finishRound(p, dh, d.slice(4)), 400);
    }
  };

  const hit = () => {
    if (phase !== "player" || deck.length === 0) return;
    const newHand = [...playerHand, deck[0]];
    setPlayerHand(newHand);
    setDeck(deck.slice(1));
    if (handTotal(newHand) > 21) {
      setTimeout(() => finishRound(newHand, dealerHand, deck.slice(1)), 400);
    }
  };

  const stand = () => {
    if (phase !== "player") return;
    let dh = [...dealerHand];
    let rest = [...deck];
    while (handTotal(dh) < 17 && rest.length > 0) {
      dh.push(rest[0]);
      rest = rest.slice(1);
    }
    setDealerHand(dh);
    setDeck(rest);
    finishRound(playerHand, dh, rest);
  };

  const finishRound = (p: CardDefinition[], dh: CardDefinition[], _rest: CardDefinition[]) => {
    const pTotal = handTotal(p);
    const dTotal = handTotal(dh);
    let outcome = "";
    let reward = 0;

    if (pTotal > 21) {
      outcome = `Bust with ${pTotal}`;
      reward = 0;
    } else if (dTotal > 21) {
      outcome = `Dealer busts (${dTotal}) — You win!`;
      reward = wager * 2;
    } else if (pTotal > dTotal) {
      outcome = `${pTotal} beats dealer's ${dTotal} — Win!`;
      reward = pTotal === 21 && p.length === 2 ? Math.floor(wager * 2.5) : wager * 2;
    } else if (pTotal === dTotal) {
      outcome = `Push at ${pTotal} — Wager returned`;
      reward = wager;
    } else {
      outcome = `Dealer's ${dTotal} beats your ${pTotal}`;
      reward = 0;
    }

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
    };

    const commit = applyGameResult(gameResult);
    if (commit.success) setResult(gameResult);
    setPhase("done");
    onFinished(gameResult);
  };

  const reset = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setPhase("idle");
    setResult(null);
    setDeck(shuffle(createDeck()));
    onReset();
  };

  const pTotal = handTotal(playerHand);
  const dTotal = handTotal(dealerHand);
  const showDealer = phase === "dealer" || phase === "done";

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      {/* Dealer */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-mono text-arcade-400 uppercase tracking-wider">
          Dealer {phase !== "idle" && `(${showDealer ? dTotal : "?"})`}
        </span>
        <div className="flex gap-2">
          {dealerHand.map((c, i) => (
            <CardVisual key={i} card={c} isFlipped={showDealer || i === 0} size="md" />
          ))}
          {dealerHand.length === 0 && (
            <div className="w-20 h-28 rounded-lg border-2 border-dashed border-arcade-800" />
          )}
        </div>
      </div>

      {/* Player */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          {playerHand.map((c, i) => (
            <CardVisual key={i} card={c} size="md" isWinning={pTotal === 21 && playerHand.length === 2} />
          ))}
          {playerHand.length === 0 && (
            <div className="w-20 h-28 rounded-lg border-2 border-dashed border-arcade-800" />
          )}
        </div>
        <span className="text-xs font-mono text-arcade-400 uppercase tracking-wider">
          You {phase !== "idle" && `(${pTotal})`}
        </span>
      </div>

      {/* Controls */}
      {phase === "idle" && (
        <GameButton size="lg" onClick={deal} className="min-w-[200px]">
          Deal Cards
        </GameButton>
      )}

      {phase === "player" && pTotal !== 21 && (
        <div className="flex gap-3">
          <GameButton variant="success" onClick={hit}>
            Hit
          </GameButton>
          <GameButton variant="danger" onClick={stand}>
            Stand
          </GameButton>
        </div>
      )}

      {result && (
        <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />
      )}
    </div>
  );
};
