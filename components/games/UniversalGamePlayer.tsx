"use client";

import React, { useState } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { useGameStore } from "../../lib/state/game-store";
import { WagerControl } from "../ui/WagerControl";
import { GameButton } from "../ui/GameButton";
import { ResultPanel } from "../ui/ResultPanel";
import {
  CoinFlipGame,
  DiceRollGame,
  HighCardGame,
  LuckyWheelGame,
  MinesGame,
  PlinkoGame,
  SlotsGame,
  CrashGame,
  BlackjackGame,
  MysteryBoxGame,
} from "./index";
import { resolveGameRound } from "../../lib/games/engine";
import { GameTileBoard } from "./GenericOutcomeGame";

export interface UniversalGamePlayerProps {
  game: GameDefinition;
}

/**
 * Games that ship with a bespoke, hand-built interactive player component.
 */
const DEDICATED_PLAYERS: Record<string, React.FC<any>> = {
  "coin-flip": CoinFlipGame,
  "dice-roll": DiceRollGame,
  "high-card": HighCardGame,
  "lucky-wheel": LuckyWheelGame,
  "mines": MinesGame,
  "plinko": PlinkoGame,
  slots: SlotsGame,
  crash: CrashGame,
  "blackjack-21": BlackjackGame,
  "mystery-box": MysteryBoxGame,
};

export const UniversalGamePlayer: React.FC<UniversalGamePlayerProps> = ({ game }) => {
  const { profile } = useGameStore();
  const [wager, setWager] = useState(Math.max(game.minWager, Math.min(game.maxWager, 100)));
  const [sessionResult, setSessionResult] = useState<GameResult | null>(null);

  const Dedicated = DEDICATED_PLAYERS[game.id];

  if (Dedicated) {
    return (
      <div className="w-full flex flex-col items-center gap-5">
        <div className="w-full max-w-md">
          <WagerControl
            balance={profile.coins}
            minimum={game.minWager}
            maximum={game.maxWager}
            value={wager}
            onChange={setWager}
            disabled={Boolean(sessionResult)}
          />
        </div>
        <Dedicated
          game={game}
          wager={wager}
          onFinished={(r: GameResult) => setSessionResult(r)}
          onReset={() => setSessionResult(null)}
        />
      </div>
    );
  }

  // Generic outcome engine for games without a bespoke player.
  return (
    <GenericOutcomePlayer game={game} wager={wager} onWagerChange={setWager} />
  );
};

export const GenericOutcomePlayer: React.FC<{
  game: GameDefinition;
  wager: number;
  onWagerChange: (w: number) => void;
}> = ({ game, wager, onWagerChange }) => {
  const { profile, applyGameResult } = useGameStore();
  const [result, setResult] = useState<GameResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setResult(null);

    setTimeout(() => {
      const gameResult = resolveGameRound(game.id, wager);
      const commit = applyGameResult(gameResult);
      if (commit.success) setResult(gameResult);
      setIsPlaying(false);
    }, 450);
  };

  const reset = () => {
    setResult(null);
  };

  if (game.ruleModel.type === "board") {
    return (
      <div className="w-full flex flex-col items-center gap-5">
        <div className="w-full max-w-md">
          <WagerControl
            balance={profile.coins}
            minimum={game.minWager}
            maximum={game.maxWager}
            value={wager}
            onChange={onWagerChange}
            disabled={Boolean(result)}
          />
        </div>
        <GameTileBoard game={game} wager={wager} onFinished={setResult} onReset={reset} />
        {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-5">
      <div className="w-full max-w-md">
        <WagerControl
          balance={profile.coins}
          minimum={game.minWager}
          maximum={game.maxWager}
          value={wager}
          onChange={onWagerChange}
          disabled={Boolean(result)}
        />
      </div>

      {!result && (
        <GameButton size="lg" className="w-full max-w-md" loading={isPlaying} disabled={isPlaying} onClick={play}>
          {isPlaying ? "Resolving..." : `Play Round — ${wager} Coins`}
        </GameButton>
      )}

      {result && <ResultPanel result={result} currentBalance={profile.coins} onPlayAgain={reset} />}
    </div>
  );
};
