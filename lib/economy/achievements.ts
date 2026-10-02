/**
 * Achievements Registry & Evaluation
 */

import { Achievement, GameStats, PlayerProfile } from "../types/game";

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_game",
    title: "First Steps",
    description: "Play your very first arcade game.",
    xpReward: 50,
    coinsReward: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "games_10",
    title: "Arcade Regular",
    description: "Play 10 games.",
    xpReward: 100,
    coinsReward: 250,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "games_50",
    title: "Arcade Veteran",
    description: "Play 50 games.",
    xpReward: 300,
    coinsReward: 750,
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: "games_100",
    title: "Arcade Legend",
    description: "Play 100 games across the arcade.",
    xpReward: 600,
    coinsReward: 1500,
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: "first_win",
    title: "Victory!",
    description: "Win your first game round.",
    xpReward: 50,
    coinsReward: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: "streak_3",
    title: "On Fire",
    description: "Achieve a 3-game winning streak.",
    xpReward: 150,
    coinsReward: 400,
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: "big_win_1000",
    title: "Big Jackpot",
    description: "Win 1,000 or more Coins in a single round.",
    xpReward: 250,
    coinsReward: 500,
    unlocked: false,
    progress: 0,
    maxProgress: 1000,
  },
  {
    id: "reach_level_5",
    title: "Rising Star",
    description: "Reach Player Level 5.",
    xpReward: 200,
    coinsReward: 500,
    unlocked: false,
    progress: 1,
    maxProgress: 5,
  },
  {
    id: "reach_level_10",
    title: "Arcade Master",
    description: "Reach Player Level 10.",
    xpReward: 500,
    coinsReward: 1200,
    unlocked: false,
    progress: 1,
    maxProgress: 10,
  },
  {
    id: "explorer_10",
    title: "Curious Explorer",
    description: "Try 10 different games in the library.",
    xpReward: 200,
    coinsReward: 400,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "try_every_game",
    title: "Grand Tour",
    description: "Play every game in the arcade collection.",
    xpReward: 1000,
    coinsReward: 3000,
    unlocked: false,
    progress: 0,
    maxProgress: 38,
  },
  {
    id: "daily_streak_3",
    title: "Dedicated Gamer",
    description: "Claim daily rewards 3 days in a row.",
    xpReward: 200,
    coinsReward: 600,
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
];

/**
 * Checks and updates achievements based on latest profile statistics.
 * Returns newly unlocked achievements.
 */
export function evaluateAchievements(
  currentAchievements: Achievement[],
  stats: GameStats,
  level: number,
  streak: number
): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const updatedAchievements: Achievement[] = [];
  const newlyUnlocked: Achievement[] = [];
  const distinctGamesPlayed = Object.keys(stats.perGamePlayCount || {}).length;

  for (const ach of currentAchievements) {
    if (ach.unlocked) {
      updatedAchievements.push(ach);
      continue;
    }

    let progress = ach.progress;
    let shouldUnlock = false;

    switch (ach.id) {
      case "first_game":
        progress = Math.min(1, stats.gamesPlayed);
        shouldUnlock = stats.gamesPlayed >= 1;
        break;
      case "games_10":
        progress = Math.min(10, stats.gamesPlayed);
        shouldUnlock = stats.gamesPlayed >= 10;
        break;
      case "games_50":
        progress = Math.min(50, stats.gamesPlayed);
        shouldUnlock = stats.gamesPlayed >= 50;
        break;
      case "games_100":
        progress = Math.min(100, stats.gamesPlayed);
        shouldUnlock = stats.gamesPlayed >= 100;
        break;
      case "first_win":
        progress = Math.min(1, stats.gamesWon);
        shouldUnlock = stats.gamesWon >= 1;
        break;
      case "streak_3":
        progress = Math.min(3, stats.longestWinStreak);
        shouldUnlock = stats.longestWinStreak >= 3;
        break;
      case "big_win_1000":
        progress = Math.min(1000, stats.highestWin);
        shouldUnlock = stats.highestWin >= 1000;
        break;
      case "reach_level_5":
        progress = Math.min(5, level);
        shouldUnlock = level >= 5;
        break;
      case "reach_level_10":
        progress = Math.min(10, level);
        shouldUnlock = level >= 10;
        break;
      case "explorer_10":
        progress = Math.min(10, distinctGamesPlayed);
        shouldUnlock = distinctGamesPlayed >= 10;
        break;
      case "try_every_game":
        progress = Math.min(38, distinctGamesPlayed);
        shouldUnlock = distinctGamesPlayed >= 38;
        break;
      case "daily_streak_3":
        progress = Math.min(3, streak);
        shouldUnlock = streak >= 3;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      const unlockedAch: Achievement = {
        ...ach,
        progress: ach.maxProgress,
        unlocked: true,
        unlockedAt: Date.now(),
      };
      updatedAchievements.push(unlockedAch);
      newlyUnlocked.push(unlockedAch);
    } else {
      updatedAchievements.push({
        ...ach,
        progress,
      });
    }
  }

  return { updatedAchievements, newlyUnlocked };
}
