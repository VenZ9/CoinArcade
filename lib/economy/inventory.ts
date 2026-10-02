/**
 * Arcade Collectibles & Inventory System
 *
 * Every drop decision is drawn from a published rarity table using the same
 * cryptographically secure generator as the games themselves.
 */

import { InventoryItem, ItemRarity } from "../types/game";
import { randomChoice, randomFloat, randomInt, shuffle, weightedChoice } from "../rng/random";
import type { IRandomGenerator } from "../rng/seeded";

const SYSTEM_RNG: IRandomGenerator = {
  randomInt,
  randomFloat,
  randomChoice,
  weightedChoice,
  shuffle,
};

export const MASTER_ITEMS: Record<string, Omit<InventoryItem, "quantity">> = {
  // Common
  pixel_coin: {
    id: "pixel_coin",
    name: "Pixel Coin",
    category: "collectible",
    rarity: "common",
    description: "An authentic 8-bit arcade coin minted in memory of retro cabinets.",
    icon: "coin",
  },
  wooden_die: {
    id: "wooden_die",
    name: "Wooden Die",
    category: "charm",
    rarity: "common",
    description: "A hand-carved six-sided wooden die with rounded edges.",
    icon: "dice",
  },
  bronze_ticket: {
    id: "bronze_ticket",
    name: "Bronze Ticket",
    category: "ticket",
    rarity: "common",
    description: "A classic strip ticket from the ticket-dispenser era.",
    icon: "ticket",
  },

  // Uncommon
  silver_spinner: {
    id: "silver_spinner",
    name: "Silver Spinner",
    category: "charm",
    rarity: "uncommon",
    description: "A smoothly weighted fidget spinner with polished metallic sheen.",
    icon: "sparkles",
  },
  lucky_clover: {
    id: "lucky_clover",
    name: "Lucky Clover",
    category: "charm",
    rarity: "uncommon",
    description: "A preserved four-leaf clover set in clear resin.",
    icon: "clover",
  },
  brass_key: {
    id: "brass_key",
    name: "Brass Arcade Key",
    category: "badge",
    rarity: "uncommon",
    description: "A vintage key once used to unlock service panels on arcade machines.",
    icon: "key",
  },

  // Rare
  golden_horseshoe: {
    id: "golden_horseshoe",
    name: "Golden Horseshoe",
    category: "charm",
    rarity: "rare",
    description: "An ornate mini horseshoe forged from gleaming brass and gold alloy.",
    icon: "horseshoe",
  },
  sapphire_gem: {
    id: "sapphire_gem",
    name: "Sapphire Prism",
    category: "collectible",
    rarity: "rare",
    description: "A deep cobalt blue cut gemstone that reflects ambient light.",
    icon: "gem",
  },
  retro_cartridge: {
    id: "retro_cartridge",
    name: "Retro Cartridge",
    category: "collectible",
    rarity: "rare",
    description: "A grey 16-bit gaming cartridge labeled 'FAIR PLAY v1.0'.",
    icon: "gamepad",
  },

  // Epic
  ruby_heart: {
    id: "ruby_heart",
    name: "Ruby Heart",
    category: "collectible",
    rarity: "epic",
    description: "A faceted crimson gemstone pulsating with subtle radiant warmth.",
    icon: "heart",
  },
  emerald_crown: {
    id: "emerald_crown",
    name: "Emerald Crown",
    category: "badge",
    rarity: "epic",
    description: "A majestic miniature crown studded with emerald crystals.",
    icon: "crown",
  },
  cyber_blade: {
    id: "cyber_blade",
    name: "Cyber Dagger",
    category: "trophy",
    rarity: "epic",
    description: "A laser-honed commemorative arcade blade glowing with neon edge.",
    icon: "sword",
  },

  // Legendary
  phoenix_feather: {
    id: "phoenix_feather",
    name: "Phoenix Feather",
    category: "charm",
    rarity: "legendary",
    description: "An iridescent golden feather symbolizing rebirth and endless retries.",
    icon: "feather",
  },
  golden_joystick: {
    id: "golden_joystick",
    name: "Golden Joystick",
    category: "trophy",
    rarity: "legendary",
    description: "The coveted highest honor for competitive arcade high-scorers.",
    icon: "joystick",
  },
  star_fragment: {
    id: "star_fragment",
    name: "Star Fragment",
    category: "collectible",
    rarity: "legendary",
    description: "A shimmering piece of cosmic stardust that hums with energy.",
    icon: "star",
  },

  // Mythic
  celestial_orb: {
    id: "celestial_orb",
    name: "Celestial Orb",
    category: "trophy",
    rarity: "mythic",
    description: "A swirling spherical microcosm representing the boundless universe of play.",
    icon: "planet",
  },
  master_trophy: {
    id: "master_trophy",
    name: "Grand Arcade Cup",
    category: "trophy",
    rarity: "mythic",
    description: "The legendary supreme trophy awarded only to true master players.",
    icon: "trophy",
  },
};

/** Published rarity drop weights for reward-game loot. */
export const RARITY_DROP_WEIGHTS: Array<{ rarity: ItemRarity; weight: number }> = [
  { rarity: "common", weight: 60 },
  { rarity: "uncommon", weight: 25 },
  { rarity: "rare", weight: 10 },
  { rarity: "epic", weight: 4 },
  { rarity: "legendary", weight: 0.9 },
  { rarity: "mythic", weight: 0.1 },
];

/**
 * Rolls one item from the configured rarity table.
 *
 * @param rng    Optional injectable generator (seeded generators are used by
 *               simulations and tests; production uses the Web Crypto source).
 * @param customPool Optional whitelist of item ids to draw from.
 */
export function rollItemDrop(
  rng: IRandomGenerator = SYSTEM_RNG,
  customPool?: string[]
): InventoryItem {
  const rarityChoice = rng.weightedChoice(RARITY_DROP_WEIGHTS);
  const eligible = Object.values(MASTER_ITEMS).filter((item) => {
    if (customPool && !customPool.includes(item.id)) return false;
    return item.rarity === rarityChoice.rarity;
  });

  const selected =
    eligible.length > 0
      ? eligible[rng.randomInt(0, eligible.length - 1)]
      : MASTER_ITEMS.pixel_coin;

  return { ...selected, quantity: 1 };
}
