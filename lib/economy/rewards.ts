/**
 * Progression & Reward System
 *
 * Provides deterministic mathematical formulas for Leveling, XP calculation,
 * and Daily Reward streaks.
 */

import { XPConfig } from "../types/game";

/**
 * Returns total cumulative XP required to reach a given level (Level 1 = 0 XP).
 * Formula: Cumulative XP = 50 * (Level - 1) * Level
 */
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return 50 * (level - 1) * level;
}

/**
 * Calculates current level from total accumulated XP.
 * Deterministic closed-form quadratic solution:
 * L = floor((1 + sqrt(1 + 0.08 * XP)) / 2)
 */
export function getLevelFromXP(totalXP: number): number {
  if (totalXP <= 0) return 1;
  const level = Math.floor((1 + Math.sqrt(1 + (8 * totalXP) / 100)) / 2);
  return Math.max(1, level);
}

/**
 * Returns detailed progress within current level.
 */
export function getXPProgress(totalXP: number): {
  currentLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
} {
  const currentLevel = getLevelFromXP(totalXP);
  const currentLevelStartXP = getXPForLevel(currentLevel);
  const nextLevelStartXP = getXPForLevel(currentLevel + 1);

  const xpInCurrentLevel = Math.max(0, totalXP - currentLevelStartXP);
  const xpNeededForNextLevel = nextLevelStartXP - currentLevelStartXP;
  const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    currentLevel,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
}

/**
 * Calculates XP earned in a game round according to game XP configuration.
 */
export function calculateRoundXP(wager: number, isWin: boolean, config: XPConfig): number {
  let xp = config.baseXP;
  if (isWin) {
    xp += config.winBonus;
  }
  // Small wager bonus: 1 XP per 50 Coins wagered
  const wagerBonus = Math.floor(Math.max(0, wager) / 50);
  xp += wagerBonus;

  return Math.min(xp, config.maxXPPerRound);
}

/**
 * Calculates daily reward based on streak.
 */
export function getDailyReward(streak: number): {
  coins: number;
  xp: number;
  streakDay: number;
} {
  const normalizedStreak = Math.max(1, Math.min(7, streak));
  // Day 1: 250, Day 2: 300, Day 3: 350 ... Day 7: 550 Coins
  const coins = 250 + (normalizedStreak - 1) * 50;
  const xp = 25 + (normalizedStreak - 1) * 10;

  return {
    coins,
    xp,
    streakDay: normalizedStreak,
  };
}
