/**
 * Centralized Validation Utilities
 *
 * Provides runtime validation for probability distributions, player state,
 * game results, and LocalStorage data protection against corruption.
 */

import { GameResult, PlayerProfile, WeightedOutcome } from "../types/game";
import { INITIAL_ACHIEVEMENTS } from "../economy/achievements";
import { getLevelFromXP } from "../economy/rewards";

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface DistributionValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  totalWeight: number;
  totalProbability: number;
}

/**
 * Validates a weighted outcome distribution without silently normalizing errors.
 */
export function validateProbabilityDistribution(outcomes: WeightedOutcome[]): DistributionValidationResult {
  const issues: ValidationIssue[] = [];

  if (!outcomes || !Array.isArray(outcomes) || outcomes.length === 0) {
    issues.push({ field: "outcomes", message: "Outcomes array must contain at least one outcome." });
    return { valid: false, issues, totalWeight: 0, totalProbability: 0 };
  }

  const seenIds = new Set<string>();
  let totalWeight = 0;
  let totalProbability = 0;

  for (let i = 0; i < outcomes.length; i++) {
    const outcome = outcomes[i];

    if (!outcome.id || typeof outcome.id !== "string") {
      issues.push({ field: `outcomes[${i}].id`, message: "Outcome ID must be a non-empty string." });
    } else if (seenIds.has(outcome.id)) {
      issues.push({ field: `outcomes[${i}].id`, message: `Duplicate outcome ID detected: '${outcome.id}'.` });
    } else {
      seenIds.add(outcome.id);
    }

    if (typeof outcome.weight !== "number" || isNaN(outcome.weight) || !isFinite(outcome.weight) || outcome.weight < 0) {
      issues.push({ field: `outcomes[${i}].weight`, message: `Weight must be a non-negative finite number. Received: ${outcome.weight}` });
    } else {
      totalWeight += outcome.weight;
    }

    if (typeof outcome.probability !== "number" || isNaN(outcome.probability) || !isFinite(outcome.probability) || outcome.probability < 0) {
      issues.push({ field: `outcomes[${i}].probability`, message: `Probability must be a non-negative finite number. Received: ${outcome.probability}` });
    } else {
      totalProbability += outcome.probability;
    }

    if (typeof outcome.rewardMultiplier !== "number" || isNaN(outcome.rewardMultiplier) || !isFinite(outcome.rewardMultiplier) || outcome.rewardMultiplier < 0) {
      issues.push({ field: `outcomes[${i}].rewardMultiplier`, message: `Reward multiplier must be a non-negative finite number. Received: ${outcome.rewardMultiplier}` });
    }
  }

  // Check total probability equals 1.0 (with 1e-4 tolerance for floating point representations)
  if (Math.abs(totalProbability - 1.0) > 0.0001 && Math.abs(totalProbability - 100) > 0.01) {
    issues.push({
      field: "totalProbability",
      message: `Total probability must equal 1.0 (or 100%). Current sum: ${totalProbability.toFixed(5)}`,
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    totalWeight,
    totalProbability,
  };
}

/**
 * Validates a completed GameResult object before committing state.
 */
export function validateGameResult(result: unknown): { valid: boolean; error?: string } {
  if (!result || typeof result !== "object") {
    return { valid: false, error: "Result must be a non-null object." };
  }

  const r = result as Partial<GameResult>;

  if (!r.id || typeof r.id !== "string") {
    return { valid: false, error: "Result must have a valid string ID." };
  }

  if (!r.gameId || typeof r.gameId !== "string") {
    return { valid: false, error: "Result must specify a valid gameId." };
  }

  if (typeof r.wager !== "number" || isNaN(r.wager) || !isFinite(r.wager) || r.wager < 0) {
    return { valid: false, error: "Result wager must be a non-negative finite integer." };
  }

  if (typeof r.reward !== "number" || isNaN(r.reward) || !isFinite(r.reward) || r.reward < 0) {
    return { valid: false, error: "Result reward must be a non-negative finite integer." };
  }

  if (typeof r.netChange !== "number" || isNaN(r.netChange) || !isFinite(r.netChange)) {
    return { valid: false, error: "Result netChange must be a finite number." };
  }

  if (r.netChange !== r.reward - r.wager) {
    return { valid: false, error: `Result netChange (${r.netChange}) does not equal reward - wager (${r.reward - r.wager}).` };
  }

  if (typeof r.xpGained !== "number" || isNaN(r.xpGained) || !isFinite(r.xpGained) || r.xpGained < 0) {
    return { valid: false, error: "Result xpGained must be a non-negative finite integer." };
  }

  return { valid: true };
}

/**
 * Default safe player profile
 */
export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  username: "ArcadeChampion",
  avatar: "joystick",
  coins: 1000, // starting balance
  xp: 0,
  level: 1,
  streak: 0,
  lastDailyClaimDate: null,
  favorites: ["coin-flip", "lucky-wheel", "mines", "crash"],
  history: [],
  inventory: [],
  achievements: INITIAL_ACHIEVEMENTS,
  stats: {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalCoinsWon: 0,
    totalCoinsWagered: 0,
    favoriteGame: "coin-flip",
    highestWin: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    longestLossStreak: 0,
    perGamePlayCount: {},
  },
  settings: {
    reducedMotion: false,
    soundEnabled: true,
  },
};

/**
 * Validates untrusted LocalStorage data, cleans corruption, and falls back to safe defaults.
 */
export function validatePlayerProfile(data: unknown): PlayerProfile {
  if (!data || typeof data !== "object") {
    return { ...DEFAULT_PLAYER_PROFILE };
  }

  const raw = data as Record<string, any>;

  const coins =
    typeof raw.coins === "number" && !isNaN(raw.coins) && isFinite(raw.coins) && raw.coins >= 0
      ? Math.floor(raw.coins)
      : DEFAULT_PLAYER_PROFILE.coins;

  const xp =
    typeof raw.xp === "number" && !isNaN(raw.xp) && isFinite(raw.xp) && raw.xp >= 0
      ? Math.floor(raw.xp)
      : DEFAULT_PLAYER_PROFILE.xp;

  const level = getLevelFromXP(xp);

  const username =
    typeof raw.username === "string" && raw.username.trim().length > 0 && raw.username.length <= 30
      ? raw.username.trim()
      : DEFAULT_PLAYER_PROFILE.username;

  const avatar =
    typeof raw.avatar === "string" && raw.avatar.length > 0
      ? raw.avatar
      : DEFAULT_PLAYER_PROFILE.avatar;

  const streak =
    typeof raw.streak === "number" && !isNaN(raw.streak) && raw.streak >= 0
      ? Math.floor(raw.streak)
      : 0;

  const lastDailyClaimDate =
    typeof raw.lastDailyClaimDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastDailyClaimDate)
      ? raw.lastDailyClaimDate
      : null;

  const favorites = Array.isArray(raw.favorites)
    ? raw.favorites.filter((f) => typeof f === "string")
    : DEFAULT_PLAYER_PROFILE.favorites;

  const history = Array.isArray(raw.history)
    ? raw.history.slice(0, 50).filter((h) => h && typeof h === "object" && typeof h.id === "string")
    : [];

  const inventory = Array.isArray(raw.inventory)
    ? raw.inventory.filter((item) => item && typeof item.id === "string" && item.quantity > 0)
    : [];

  // Merge achievements with initial template to ensure newly added achievements exist
  const existingAchievementsMap = new Map<string, any>();
  if (Array.isArray(raw.achievements)) {
    for (const a of raw.achievements) {
      if (a && typeof a.id === "string") {
        existingAchievementsMap.set(a.id, a);
      }
    }
  }

  const achievements = INITIAL_ACHIEVEMENTS.map((template) => {
    const existing = existingAchievementsMap.get(template.id);
    if (!existing) return template;
    return {
      ...template,
      unlocked: Boolean(existing.unlocked),
      unlockedAt: typeof existing.unlockedAt === "number" ? existing.unlockedAt : undefined,
      progress: typeof existing.progress === "number" ? existing.progress : template.progress,
    };
  });

  const rawStats = raw.stats || {};
  const stats = {
    gamesPlayed: Math.max(0, Math.floor(Number(rawStats.gamesPlayed) || 0)),
    gamesWon: Math.max(0, Math.floor(Number(rawStats.gamesWon) || 0)),
    gamesLost: Math.max(0, Math.floor(Number(rawStats.gamesLost) || 0)),
    totalCoinsWon: Math.max(0, Math.floor(Number(rawStats.totalCoinsWon) || 0)),
    totalCoinsWagered: Math.max(0, Math.floor(Number(rawStats.totalCoinsWagered) || 0)),
    favoriteGame: typeof rawStats.favoriteGame === "string" ? rawStats.favoriteGame : "coin-flip",
    highestWin: Math.max(0, Math.floor(Number(rawStats.highestWin) || 0)),
    currentStreak: Math.max(0, Math.floor(Number(rawStats.currentStreak) || 0)),
    longestWinStreak: Math.max(0, Math.floor(Number(rawStats.longestWinStreak) || 0)),
    longestLossStreak: Math.max(0, Math.floor(Number(rawStats.longestLossStreak) || 0)),
    perGamePlayCount:
      rawStats.perGamePlayCount && typeof rawStats.perGamePlayCount === "object"
        ? rawStats.perGamePlayCount
        : {},
  };

  const settings = {
    reducedMotion: Boolean(raw.settings?.reducedMotion),
    soundEnabled: raw.settings?.soundEnabled !== false,
  };

  return {
    username,
    avatar,
    coins,
    xp,
    level,
    streak,
    lastDailyClaimDate,
    favorites,
    history,
    inventory,
    achievements,
    stats,
    settings,
  };
}
