/**
 * Development & Testing Deterministic Seeded PRNG
 *
 * Uses Mulberry32 / SplitMix32 algorithm.
 *
 * HARD CONSTRAINT:
 * This seeded RNG is strictly for automated unit tests, fairness audits, and development simulations.
 * It is NEVER enabled for player gameplay or production outcome generation.
 */

export interface IRandomGenerator {
  randomInt(min: number, max: number): number;
  randomFloat(min?: number, max?: number): number;
  randomChoice<T>(items: readonly T[]): T;
  weightedChoice<T extends { weight: number }>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export function createSeededRNG(seedInput: number | string): IRandomGenerator {
  let state = 0;

  if (typeof seedInput === "number") {
    state = seedInput >>> 0;
  } else {
    // FNV-1a hash of the seed string into a 32-bit uint
    let hash = 2166136261;
    for (let i = 0; i < seedInput.length; i++) {
      hash ^= seedInput.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    state = hash >>> 0;
  }

  // Ensure state is non-zero
  if (state === 0) state = 0x6d2b79f5;

  // Mulberry32 step
  function nextUint32(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (t ^ (t >>> 14)) >>> 0;
  }

  function randomFloat(min = 0, max = 1): number {
    const u32 = nextUint32();
    const unitFloat = u32 / 4294967296.0;
    return min + unitFloat * (max - min);
  }

  function randomInt(min: number, max: number): number {
    if (min > max) throw new Error("min cannot exceed max");
    if (min === max) return min;
    const range = max - min + 1;
    const maxUint32 = 0x100000000;
    const limit = Math.floor(maxUint32 / range) * range;

    let sample: number;
    do {
      sample = nextUint32();
    } while (sample >= limit);

    return min + (sample % range);
  }

  function randomChoice<T>(items: readonly T[]): T {
    if (!items || items.length === 0) {
      throw new Error("randomChoice requires a non-empty array");
    }
    return items[randomInt(0, items.length - 1)];
  }

  function weightedChoice<T extends { weight: number }>(items: readonly T[]): T {
    if (!items || items.length === 0) {
      throw new Error("weightedChoice requires at least one outcome");
    }
    let totalWeight = 0;
    for (const item of items) {
      if (typeof item.weight !== "number" || isNaN(item.weight) || item.weight < 0) {
        throw new Error(`Invalid item weight: ${item.weight}`);
      }
      totalWeight += item.weight;
    }
    if (totalWeight <= 0) {
      throw new Error("Total weight must be positive");
    }
    const roll = randomFloat(0, totalWeight);
    let cursor = 0;
    for (let i = 0; i < items.length; i++) {
      cursor += items[i].weight;
      if (roll < cursor || i === items.length - 1) {
        return items[i];
      }
    }
    return items[items.length - 1];
  }

  function shuffle<T>(items: readonly T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      const temp = result[i];
      result[i] = result[j];
      result[j] = temp;
    }
    return result;
  }

  return {
    randomInt,
    randomFloat,
    randomChoice,
    weightedChoice,
    shuffle,
  };
}
