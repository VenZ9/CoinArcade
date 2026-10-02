/**
 * Centralized Cryptographically Secure Random Number Generator
 *
 * Uses the Web Crypto API (crypto.getRandomValues) to produce unbiased,
 * cryptographically strong random outcomes for all games.
 *
 * Strictly avoids modulo bias through rejection sampling.
 */

// Get global Web Crypto implementation (Node 18+ and modern browsers)
function getCrypto(): Crypto {
  const obj = (globalThis as { crypto?: Crypto }).crypto;
  if (obj !== undefined && typeof obj.getRandomValues === "function") {
    return obj;
  }
  throw new Error("Web Crypto API (crypto.getRandomValues) is not available in this environment.");
}

/**
 * Returns a uniform random 32-bit unsigned integer [0, 2^32 - 1]
 */
export function getCryptoUint32(): number {
  const buf = new Uint32Array(1);
  getCrypto().getRandomValues(buf);
  return buf[0];
}

/**
 * Returns a cryptographically unbiased uniform integer in range [min, max] (inclusive).
 * Uses rejection sampling to completely eliminate modulo bias.
 */
export function randomInt(min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new Error(`randomInt bounds must be integers. Received min=${min}, max=${max}`);
  }
  if (min > max) {
    throw new Error(`randomInt min cannot exceed max. Received min=${min}, max=${max}`);
  }
  if (min === max) {
    return min;
  }

  const range = max - min + 1;
  const maxUint32 = 0x100000000; // 2^32
  // Largest multiple of range that fits inside 2^32
  const limit = Math.floor(maxUint32 / range) * range;

  const buf = new Uint32Array(1);
  const crypto = getCrypto();
  let sample: number;

  do {
    crypto.getRandomValues(buf);
    sample = buf[0];
  } while (sample >= limit);

  return min + (sample % range);
}

/**
 * Returns a uniform random float in [min, max) using 53 bits of cryptographic entropy.
 */
export function randomFloat(min = 0, max = 1): number {
  if (min >= max) {
    throw new Error(`randomFloat min must be strictly less than max. Received min=${min}, max=${max}`);
  }

  const buf = new Uint32Array(2);
  getCrypto().getRandomValues(buf);

  // 53 bits of precision (JavaScript double-precision float mantissa)
  const a = buf[0] >>> 5; // 27 bits
  const b = buf[1] >>> 6; // 26 bits
  const unitFloat = (a * 67108864 + b) / 9007199254740992; // [0, 1)

  return min + unitFloat * (max - min);
}

/**
 * Uniformly selects one random element from a non-empty array.
 */
export function randomChoice<T>(items: readonly T[]): T {
  if (!items || items.length === 0) {
    throw new Error("randomChoice requires a non-empty array");
  }
  const index = randomInt(0, items.length - 1);
  return items[index];
}

/**
 * Performs unbiased weighted selection across items with explicit positive weights.
 * Validates against NaN, negative, zero, and Infinity.
 */
export function weightedChoice<T extends { weight: number }>(items: readonly T[]): T {
  if (!items || items.length === 0) {
    throw new Error("weightedChoice requires at least one outcome");
  }

  let totalWeight = 0;
  for (const item of items) {
    if (typeof item.weight !== "number" || isNaN(item.weight) || !isFinite(item.weight) || item.weight < 0) {
      throw new Error(`Invalid item weight in weightedChoice: ${item.weight}`);
    }
    totalWeight += item.weight;
  }

  if (totalWeight <= 0) {
    throw new Error("Total weight in weightedChoice must be strictly greater than 0");
  }

  const roll = randomFloat(0, totalWeight);
  let cursor = 0;

  for (let i = 0; i < items.length; i++) {
    cursor += items[i].weight;
    // Using roll < cursor handles floating point edges cleanly
    if (roll < cursor || i === items.length - 1) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * Modern Fisher-Yates shuffle using cryptographically secure random integers.
 * Returns a new shuffled array without mutating the input.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
