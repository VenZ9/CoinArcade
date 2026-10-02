"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useGameStore } from "../../lib/state/game-store";
import { InventoryItem, ItemRarity } from "../../lib/types/game";
import { SparklesIcon, CloseIcon } from "../../components/icons";
import { Modal } from "../../components/ui/Modal";

const RARITY_STYLES: Record<ItemRarity, { text: string; bg: string; border: string }> = {
  common: { text: "text-slate-300", bg: "bg-slate-900", border: "border-slate-700" },
  uncommon: { text: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-600/40" },
  rare: { text: "text-blue-400", bg: "bg-blue-950/40", border: "border-blue-600/40" },
  epic: { text: "text-purple-400", bg: "bg-purple-950/40", border: "border-purple-600/40" },
  legendary: { text: "text-amber-400", bg: "bg-amber-950/40", border: "border-amber-600/40" },
  mythic: { text: "text-rose-400", bg: "bg-rose-950/40", border: "border-rose-600/40" },
};

const ITEM_EMOJIS: Record<string, string> = {
  coin: "🪙",
  dice: "🎲",
  ticket: "🎟️",
  sparkles: "✨",
  clover: "🍀",
  key: "🗝️",
  horseshoe: "🧲",
  gem: "💎",
  gamepad: "🕹️",
  heart: "❤️",
  crown: "👑",
  sword: "🗡️",
  feather: "🪶",
  joystick: "🕹️",
  star: "⭐",
  planet: "🪐",
  trophy: "🏆",
};

export default function InventoryPage() {
  const { profile } = useGameStore();

  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | "all">("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const rarities: (ItemRarity | "all")[] = [
    "all",
    "common",
    "uncommon",
    "rare",
    "epic",
    "legendary",
    "mythic",
  ];

  const filteredItems = useMemo(() => {
    return profile.inventory.filter((item) => {
      if (selectedRarity !== "all" && item.rarity !== selectedRarity) {
        return false;
      }
      return true;
    });
  }, [profile.inventory, selectedRarity]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Prize Inventory</h1>
          <p className="text-xs text-arcade-400 mt-0.5">
            Collect arcade charms, tokens, trophies, and relics from reward games and achievements.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-arcade-300 bg-arcade-900 border border-arcade-800 px-3 py-1.5 rounded-xl w-fit">
          <SparklesIcon size={14} className="text-brand-400" />
          <span>Total Items: {profile.inventory.reduce((acc, i) => acc + i.quantity, 0)}</span>
        </div>
      </div>

      {/* Rarity Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {rarities.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setSelectedRarity(r)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium font-mono uppercase transition-all select-none ${
              selectedRarity === r
                ? "bg-brand-500 text-arcade-950 font-bold"
                : "bg-arcade-900 hover:bg-arcade-850 text-arcade-400 border border-arcade-800"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredItems.map((item) => {
            const style = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`relative flex flex-col justify-between p-3.5 rounded-xl border ${style.bg} ${style.border} hover:border-arcade-600 transition-all cursor-pointer group shadow-sm select-none`}
              >
                {/* Quantity Badge */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${style.text}`}
                  >
                    {item.rarity}
                  </span>
                  <span className="font-mono text-xs font-bold text-white bg-arcade-950/80 px-2 py-0.5 rounded border border-arcade-800">
                    x{item.quantity}
                  </span>
                </div>

                {/* Central Item Icon */}
                <div className="py-3 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {ITEM_EMOJIS[item.icon] || "🎁"}
                </div>

                {/* Item Label & Category */}
                <div className="mt-2 text-center">
                  <h3 className="text-xs font-bold text-white truncate">{item.name}</h3>
                  <span className="text-[10px] font-mono text-arcade-400 capitalize block mt-0.5">
                    {item.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="w-full py-16 flex flex-col items-center justify-center text-center p-6 bg-arcade-900/60 border border-dashed border-arcade-800 rounded-2xl">
          <span className="text-4xl mb-3">🧰</span>
          <h3 className="text-base font-bold text-white mb-1">No items in this category</h3>
          <p className="text-xs text-arcade-400 max-w-sm mb-4">
            Play Reward minigames like Mystery Box, Treasure Chests, and Scratch Cards to discover rare arcade prizes!
          </p>
          <Link
            href="/games?category=rewards"
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-xs font-bold text-arcade-950 transition-colors"
          >
            Play Reward Games
          </Link>
        </div>
      )}

      {/* Item Details Inspection Modal */}
      {selectedItem && (
        <Modal
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.name}
          maxWidth="sm"
        >
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="text-6xl mb-1">{ITEM_EMOJIS[selectedItem.icon] || "🎁"}</div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  RARITY_STYLES[selectedItem.rarity].text
                } bg-arcade-950 border border-arcade-800`}
              >
                {selectedItem.rarity}
              </span>
              <span className="text-xs font-mono text-arcade-400 capitalize">
                {selectedItem.category}
              </span>
            </div>

            <p className="text-xs text-arcade-300 leading-relaxed max-w-xs">
              {selectedItem.description}
            </p>

            <div className="w-full pt-3 mt-2 border-t border-arcade-800 flex items-center justify-between text-xs text-arcade-400 font-mono">
              <span>Quantity Owned:</span>
              <span className="font-bold text-white">{selectedItem.quantity}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
