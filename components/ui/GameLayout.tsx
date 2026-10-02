"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GameDefinition } from "../../lib/types/game";
import { ArrowLeftIcon, GameCategoryIcon, HelpCircleIcon, StarIcon } from "../icons";
import { Modal } from "./Modal";
import { CoinBalance } from "./CoinBalance";
import { useGameStore } from "../../lib/state/game-store";

export interface GameLayoutProps {
  game: GameDefinition;
  children: React.ReactNode;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ game, children }) => {
  const { profile, toggleFavorite } = useGameStore();
  const [showRules, setShowRules] = useState(false);
  const isFavorite = profile.favorites.includes(game.id);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-arcade-800">
        <div className="flex items-center gap-3">
          <Link
            href="/games"
            className="p-2 rounded-lg bg-arcade-900 border border-arcade-800 text-arcade-400 hover:text-white hover:bg-arcade-800 transition-colors"
            aria-label="Back to Games Library"
          >
            <ArrowLeftIcon size={18} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                {game.name}
              </h1>
              <button
                type="button"
                onClick={() => toggleFavorite(game.id)}
                className={`p-1 rounded-md transition-colors ${
                  isFavorite ? "text-brand-400" : "text-arcade-600 hover:text-arcade-400"
                }`}
                aria-label={isFavorite ? "Favorited" : "Add to favorites"}
              >
                <StarIcon size={18} filled={isFavorite} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-arcade-400 mt-0.5">
              <GameCategoryIcon category={game.category} size={13} />
              <span className="capitalize">{game.category}</span>
              <span>•</span>
              <span>{(game.expectedReturn * 100).toFixed(0)}% Theoretical RTP</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CoinBalance balance={profile.coins} size="sm" showLabel />
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-arcade-850 hover:bg-arcade-800 border border-arcade-750 text-xs font-semibold text-arcade-200 transition-colors"
            aria-label="View game rules"
          >
            <HelpCircleIcon size={15} />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="w-full flex flex-col items-center">{children}</div>

      {/* Rules Modal */}
      <Modal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        title={`${game.name} — Transparent Rules`}
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-brand-400 mb-1">
              How to Play
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-arcade-300">
              {game.rulesText.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-arcade-800">
            <div className="p-2.5 rounded-lg bg-arcade-950 border border-arcade-800">
              <span className="text-[11px] font-bold text-win-light uppercase tracking-wider block mb-0.5">
                Win Condition
              </span>
              <p className="text-xs text-arcade-300">{game.winCondition}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-arcade-950 border border-arcade-800">
              <span className="text-[11px] font-bold text-loss-light uppercase tracking-wider block mb-0.5">
                Lose Condition
              </span>
              <p className="text-xs text-arcade-300">{game.loseCondition}</p>
            </div>
          </div>

          {game.tieCondition && (
            <div className="p-2.5 rounded-lg bg-arcade-950 border border-arcade-800">
              <span className="text-[11px] font-bold text-brand-300 uppercase tracking-wider block mb-0.5">
                Tie / Push Behavior
              </span>
              <p className="text-xs text-arcade-300">{game.tieCondition}</p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-arcade-850/60 border border-arcade-800 text-xs text-arcade-300">
            <span className="font-semibold text-white">Mathematical Model: </span>
            {game.ruleModel.type === "weighted" && (
              <span>
                Fixed weighted distribution with {(game.expectedReturn * 100).toFixed(1)}% expected return. Outcomes are chosen by cryptographically unbiased random sampling before animation begins.
              </span>
            )}
            {game.ruleModel.type === "deck" && (
              <span>
                Standard 52-card deck model, shuffled cryptographically using Fisher-Yates with Web Crypto entropy.
              </span>
            )}
            {game.ruleModel.type === "board" && (
              <span>
                Fixed grid generated once at round initialization. Object locations never shift during play.
              </span>
            )}
            {game.ruleModel.type === "deterministic" && (
              <span>
                Deterministic rules: {game.ruleModel.formulaDescription}.
              </span>
            )}
            {game.ruleModel.type === "player-skill" && (
              <span>
                Player decision affects the outcome directly according to transparent game logic.
              </span>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
