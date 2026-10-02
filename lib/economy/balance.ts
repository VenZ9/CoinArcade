/**
 * Economy & Balance Protection Utilities
 *
 * Implements strict transaction-like guards for the local fictional Coin currency.
 * Guarantees whole numbers, non-negative values, and protection against NaN/Infinity.
 */

export interface WagerValidationResult {
  valid: boolean;
  sanitizedWager: number;
  error?: string;
}

/**
 * Validates a wager against current balance and game boundaries.
 */
export function validateWager(
  rawWager: number,
  currentBalance: number,
  minWager = 1,
  maxWager = 100000
): WagerValidationResult {
  if (typeof rawWager !== "number" || isNaN(rawWager) || !isFinite(rawWager)) {
    return { valid: false, sanitizedWager: minWager, error: "Wager must be a valid number." };
  }

  // Enforce whole numbers
  const wholeWager = Math.floor(rawWager);

  if (wholeWager <= 0) {
    return { valid: false, sanitizedWager: minWager, error: "Wager must be greater than zero Coins." };
  }

  if (wholeWager < minWager) {
    return { valid: false, sanitizedWager: minWager, error: `Minimum wager is ${minWager} Coins.` };
  }

  if (wholeWager > maxWager) {
    return { valid: false, sanitizedWager: maxWager, error: `Maximum wager is ${maxWager} Coins.` };
  }

  if (wholeWager > currentBalance) {
    return {
      valid: false,
      sanitizedWager: currentBalance > 0 ? currentBalance : minWager,
      error: "Wager cannot exceed your current Coin balance.",
    };
  }

  return { valid: true, sanitizedWager: wholeWager };
}

/**
 * Validates an integer coin amount to prevent corruption
 */
export function sanitizeCoins(coins: unknown, fallback = 1000): number {
  if (typeof coins !== "number" || isNaN(coins) || !isFinite(coins) || coins < 0) {
    return fallback;
  }
  return Math.floor(coins);
}

/**
 * Validates an integer XP amount
 */
export function sanitizeXP(xp: unknown, fallback = 0): number {
  if (typeof xp !== "number" || isNaN(xp) || !isFinite(xp) || xp < 0) {
    return fallback;
  }
  return Math.floor(xp);
}
