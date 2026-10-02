"use client";

import React from "react";

export interface GridTile {
  index: number;
  revealed: boolean;
  content?: "safe" | "mine" | "gem" | "empty" | "treasure";
  label?: string | number;
  isHit?: boolean;
}

export interface GridVisualProps {
  tiles: GridTile[];
  columns?: number;
  onTileClick: (index: number) => void;
  disabled?: boolean;
  className?: string;
}

export const GridVisual: React.FC<GridVisualProps> = ({
  tiles,
  columns = 5,
  onTileClick,
  disabled = false,
  className = "",
}) => {
  return (
    <div
      className={`grid gap-2 max-w-sm mx-auto p-3 bg-arcade-950 border border-arcade-800 rounded-2xl shadow-inner select-none ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="grid"
    >
      {tiles.map((tile) => (
        <button
          key={tile.index}
          type="button"
          disabled={disabled || tile.revealed}
          onClick={() => onTileClick(tile.index)}
          aria-label={`Tile ${tile.index + 1}${tile.revealed ? `, revealed: ${tile.content}` : ""}`}
          className={`aspect-square rounded-xl font-bold font-mono text-sm flex items-center justify-center transition-all ${
            !tile.revealed
              ? "bg-arcade-850 hover:bg-arcade-800 active:scale-95 border border-arcade-700 shadow-sm"
              : tile.content === "mine"
              ? "bg-loss/20 border-2 border-loss text-loss-light shadow-loss/20 animate-shake"
              : tile.content === "gem" || tile.content === "treasure"
              ? "bg-brand-500/20 border-2 border-brand-400 text-brand-300 shadow-brand-500/20 animate-pop"
              : "bg-win/20 border-2 border-win text-win-light shadow-win/20 animate-pop"
          } disabled:cursor-not-allowed`}
        >
          {tile.revealed ? (
            tile.content === "mine" ? (
              "💣"
            ) : tile.content === "gem" ? (
              "💎"
            ) : tile.content === "treasure" ? (
              "👑"
            ) : tile.label ? (
              tile.label
            ) : (
              "✓"
            )
          ) : (
            <span className="text-arcade-600 text-xs">?</span>
          )}
        </button>
      ))}
    </div>
  );
};
