"use client";

import React, { useMemo, useState } from "react";
import { GameDefinition, GameResult } from "../../lib/types/game";
import { GridVisual, GridTile } from "../visuals/GridVisual";
import { useGameStore } from "../../lib/state/game-store";
import { randomInt } from "../../lib/rng/random";
import { BOARD_EDGE } from "../../lib/games/engine";

export interface GameTileBoardProps {
  game: GameDefinition;
  wager: number;
  onFinished: (result: GameResult) => void;
  onReset: () => void;
}

/**
 * Board-style player used by grid games that ship without a bespoke component.
 * One tile is opened per round; the layout is committed before the first click.
 */
export const GameTileBoard: React.FC<GameTileBoardProps> = ({
  game,
  wager,
  onFinished,
  onReset,
}) => {
  const { applyGameResult } = useGameStore();

  const boardRules =
    game.ruleModel.type === "board" ? game.ruleModel.boardRules : { rows: 1, cols: 3, trapCount: 1, treasureCount: 0 };
  const total = boardRules.rows * boardRules.cols;
  const safeTiles = Math.max(1, total - boardRules.trapCount);

  // The trap layout is committed once, before the player interacts.
  const layout = useMemo(() => {
    const tiles = Array.from({ length: total }, (_, index) => index < boardRules.trapCount);
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      const tmp = tiles[i];
      tiles[i] = tiles[j];
      tiles[j] = tmp;
    }
    return tiles;
  }, [total, boardRules.trapCount]);

  const [opened, setOpened] = useState<number[]>([]);
  const [result, setResult] = useState<GameResult | null>(null);

  const openTile = (index: number) => {
    if (result || opened.length > 0) return;
    setOpened([index]);

    const isTrap = layout[index];
    const multiplier = isTrap ? 0 : Number(((BOARD_EDGE * total) / safeTiles).toFixed(4));
    const reward = Math.floor(wager * multiplier);

    const gameResult: GameResult = {
      id: `res_${Date.now()}_${randomInt(0, 999999)}`,
      gameId: game.id,
      gameName: game.name,
      wager,
      outcome: isTrap ? "Hit a trap" : `Safe tile (${multiplier}x)`,
      reward,
      netChange: reward - wager,
      xpGained:
        game.xpConfig.baseXP + (reward > wager ? game.xpConfig.winBonus : 0),
      timestamp: Date.now(),
      details: { openedIndex: index, result: isTrap ? "trap" : "safe" },
    };

    const commit = applyGameResult(gameResult);
    if (!commit.success) {
      // The round could not be committed (e.g. insufficient balance); roll back.
      setOpened([]);
      return;
    }
    setResult(gameResult);
    onFinished(gameResult);
  };

  const reset = () => {
    setOpened([]);
    setResult(null);
    onReset();
  };

  const tiles: GridTile[] = Array.from({ length: total }, (_, index) => {
    const isOpen = opened.includes(index);
    const isTrap = layout[index];
    return {
      index,
      revealed: isOpen,
      content: isOpen ? (isTrap ? "mine" : "gem") : undefined,
      isHit: isOpen && isTrap,
    };
  });

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <GridVisual
        tiles={tiles}
        columns={boardRules.cols}
        onTileClick={openTile}
        disabled={Boolean(result) || opened.length > 0}
      />
      <p className="text-xs text-arcade-400 text-center max-w-sm">
        One safe tile pays {((BOARD_EDGE * total) / safeTiles).toFixed(2)}x. The trap layout was fixed before you
        clicked.
      </p>
      {result && (
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-arcade-800 hover:bg-arcade-750 text-xs font-semibold text-brand-300 transition-colors"
        >
          Play Again
        </button>
      )}
    </div>
  );
};
