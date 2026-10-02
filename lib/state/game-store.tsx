"use client";

/**
 * Client-Side Player State & Transaction Store
 *
 * Implements transaction-like commits for GameResults, LocalStorage persistence,
 * multi-tab synchronization, balance validation, and progression tracking.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { GameResult, InventoryItem, PlayerProfile } from "../types/game";
import {
  DEFAULT_PLAYER_PROFILE,
  validateGameResult,
  validatePlayerProfile,
} from "../validation/game-validation";
import { getDailyReward, getLevelFromXP } from "../economy/rewards";
import { evaluateAchievements } from "../economy/achievements";
import { MASTER_ITEMS } from "../economy/inventory";

const STORAGE_KEY = "coin_arcade_player_profile_v1";
const COMMITTED_IDS_KEY = "coin_arcade_committed_results_v1";

interface GameStoreContextType {
  profile: PlayerProfile;
  isHydrated: boolean;
  applyGameResult: (result: GameResult) => { success: boolean; error?: string };
  claimDailyReward: () => { success: boolean; coins: number; xp: number; streak: number; message: string };
  toggleFavorite: (gameId: string) => void;
  updateSettings: (settings: Partial<PlayerProfile["settings"]>) => void;
  updateAvatar: (avatar: string) => void;
  updateUsername: (username: string) => void;
  resetProgress: () => void;
  // Dev utilities
  addDevCoins: (amount: number) => void;
  addDevXP: (amount: number) => void;
}

const GameStoreContext = createContext<GameStoreContextType | null>(null);

function loadStoredProfile(): PlayerProfile {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PLAYER_PROFILE };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PLAYER_PROFILE };
    const parsed = JSON.parse(raw);
    return validatePlayerProfile(parsed);
  } catch (err) {
    console.error("Failed to parse stored player profile, restoring default:", err);
    return { ...DEFAULT_PLAYER_PROFILE };
  }
}

function saveStoredProfile(profile: PlayerProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to persist player profile to LocalStorage:", err);
  }
}

function loadCommittedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(COMMITTED_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function recordCommittedId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const set = loadCommittedIds();
    set.add(id);
    const arr = Array.from(set).slice(-200); // keep recent 200
    sessionStorage.setItem(COMMITTED_IDS_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export const GameStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PLAYER_PROFILE);
  const [isHydrated, setIsHydrated] = useState(false);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // Hydrate from LocalStorage on mount
  useEffect(() => {
    const loaded = loadStoredProfile();
    setProfile(loaded);
    setIsHydrated(true);

    // Multi-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const fresh = validatePlayerProfile(JSON.parse(e.newValue));
          setProfile(fresh);
        } catch (err) {
          console.error("Storage sync parse error:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  /**
   * Transaction-like commit of a completed GameResult
   */
  const applyGameResult = useCallback((result: GameResult): { success: boolean; error?: string } => {
    // 1. Validate the result object
    const validation = validateGameResult(result);
    if (!validation.valid) {
      console.error("applyGameResult rejected invalid result:", validation.error);
      return { success: false, error: validation.error };
    }

    // 2. Prevent duplicate commit
    const committed = loadCommittedIds();
    if (committed.has(result.id)) {
      console.warn("applyGameResult: Result ID already committed:", result.id);
      return { success: false, error: "Result already committed." };
    }

    const current = profileRef.current;

    // 3. Prevent spending more coins than currently possessed
    if (result.wager > current.coins) {
      return { success: false, error: "Insufficient Coin balance for this wager." };
    }

    // 4. Calculate new coin balance and XP
    const newCoins = Math.max(0, current.coins + result.netChange);
    const newXP = current.xp + result.xpGained;
    const newLevel = getLevelFromXP(newXP);

    // 5. Update game statistics (purely descriptive)
    const isWin = result.reward > result.wager;
    const isLoss = result.reward < result.wager;
    const currentStreak = isWin ? Math.max(1, current.stats.currentStreak + 1) : 0;
    const longestWinStreak = Math.max(current.stats.longestWinStreak, currentStreak);
    const longestLossStreak = isLoss
      ? Math.max(current.stats.longestLossStreak, current.stats.currentStreak < 0 ? Math.abs(current.stats.currentStreak) + 1 : 1)
      : current.stats.longestLossStreak;

    const playCountMap = { ...current.stats.perGamePlayCount };
    playCountMap[result.gameId] = (playCountMap[result.gameId] || 0) + 1;

    // Determine favorite game by play count
    let topGame = current.stats.favoriteGame;
    let maxPlays = 0;
    for (const [gId, count] of Object.entries(playCountMap)) {
      if (count > maxPlays) {
        maxPlays = count;
        topGame = gId;
      }
    }

    const updatedStats = {
      ...current.stats,
      gamesPlayed: current.stats.gamesPlayed + 1,
      gamesWon: current.stats.gamesWon + (isWin ? 1 : 0),
      gamesLost: current.stats.gamesLost + (isLoss ? 1 : 0),
      totalCoinsWon: current.stats.totalCoinsWon + result.reward,
      totalCoinsWagered: current.stats.totalCoinsWagered + result.wager,
      favoriteGame: topGame,
      highestWin: Math.max(current.stats.highestWin, result.reward),
      currentStreak: isWin ? currentStreak : isLoss ? -1 : 0,
      longestWinStreak,
      longestLossStreak,
      perGamePlayCount: playCountMap,
    };

    // 6. Evaluate achievements
    const { updatedAchievements, newlyUnlocked } = evaluateAchievements(
      current.achievements,
      updatedStats,
      newLevel,
      current.streak
    );

    let bonusAchievementCoins = 0;
    let bonusAchievementXP = 0;
    for (const ach of newlyUnlocked) {
      bonusAchievementCoins += ach.coinsReward;
      bonusAchievementXP += ach.xpReward;
    }

    // 7. Update inventory if an item was earned
    let updatedInventory = [...current.inventory];
    if (result.itemEarned) {
      const existingIdx = updatedInventory.findIndex((i) => i.id === result.itemEarned!.id);
      if (existingIdx >= 0) {
        updatedInventory[existingIdx] = {
          ...updatedInventory[existingIdx],
          quantity: updatedInventory[existingIdx].quantity + result.itemEarned.quantity,
        };
      } else {
        updatedInventory.push(result.itemEarned);
      }
    }

    // 8. Update history (keep last 50)
    const historyEntry = {
      id: result.id,
      gameId: result.gameId,
      gameName: result.gameName,
      outcome: result.outcome,
      wager: result.wager,
      reward: result.reward,
      netChange: result.netChange,
      xpGained: result.xpGained,
      timestamp: result.timestamp,
    };
    const updatedHistory = [historyEntry, ...current.history].slice(0, 50);

    const finalProfile: PlayerProfile = {
      ...current,
      coins: newCoins + bonusAchievementCoins,
      xp: newXP + bonusAchievementXP,
      level: getLevelFromXP(newXP + bonusAchievementXP),
      history: updatedHistory,
      inventory: updatedInventory,
      achievements: updatedAchievements,
      stats: updatedStats,
    };

    // Mark as committed
    recordCommittedId(result.id);

    // Save and update state
    saveStoredProfile(finalProfile);
    setProfile(finalProfile);

    return { success: true };
  }, []);

  /**
   * Daily Reward Claim
   */
  const claimDailyReward = useCallback((): {
    success: boolean;
    coins: number;
    xp: number;
    streak: number;
    message: string;
  } => {
    const current = profileRef.current;
    const today = new Date().toISOString().slice(0, 10);

    if (current.lastDailyClaimDate === today) {
      return {
        success: false,
        coins: 0,
        xp: 0,
        streak: current.streak,
        message: "You have already claimed today's daily reward. Come back tomorrow!",
      };
    }

    let nextStreak = 1;
    if (current.lastDailyClaimDate) {
      const last = new Date(current.lastDailyClaimDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        nextStreak = current.streak + 1;
      }
    }

    const reward = getDailyReward(nextStreak);
    const newCoins = current.coins + reward.coins;
    const newXP = current.xp + reward.xp;
    const newLevel = getLevelFromXP(newXP);

    const updatedProfile: PlayerProfile = {
      ...current,
      coins: newCoins,
      xp: newXP,
      level: newLevel,
      streak: nextStreak,
      lastDailyClaimDate: today,
    };

    saveStoredProfile(updatedProfile);
    setProfile(updatedProfile);

    return {
      success: true,
      coins: reward.coins,
      xp: reward.xp,
      streak: nextStreak,
      message: `Claimed Day ${reward.streakDay} Reward: +${reward.coins} Coins & +${reward.xp} XP!`,
    };
  }, []);

  const toggleFavorite = useCallback((gameId: string) => {
    const current = profileRef.current;
    const exists = current.favorites.includes(gameId);
    const favorites = exists
      ? current.favorites.filter((id) => id !== gameId)
      : [...current.favorites, gameId];

    const updated: PlayerProfile = { ...current, favorites };
    saveStoredProfile(updated);
    setProfile(updated);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<PlayerProfile["settings"]>) => {
    const current = profileRef.current;
    const updated: PlayerProfile = {
      ...current,
      settings: { ...current.settings, ...newSettings },
    };
    saveStoredProfile(updated);
    setProfile(updated);
  }, []);

  const updateAvatar = useCallback((avatar: string) => {
    const current = profileRef.current;
    const updated: PlayerProfile = { ...current, avatar };
    saveStoredProfile(updated);
    setProfile(updated);
  }, []);

  const updateUsername = useCallback((username: string) => {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length > 25) return;
    const current = profileRef.current;
    const updated: PlayerProfile = { ...current, username: trimmed };
    saveStoredProfile(updated);
    setProfile(updated);
  }, []);

  const resetProgress = useCallback(() => {
    const reset = { ...DEFAULT_PLAYER_PROFILE };
    saveStoredProfile(reset);
    setProfile(reset);
  }, []);

  // Developer testing helpers
  const addDevCoins = useCallback((amount: number) => {
    const current = profileRef.current;
    const updated: PlayerProfile = {
      ...current,
      coins: Math.max(0, current.coins + amount),
    };
    saveStoredProfile(updated);
    setProfile(updated);
  }, []);

  const addDevXP = useCallback((amount: number) => {
    const current = profileRef.current;
    const newXP = Math.max(0, current.xp + amount);
    const updated: PlayerProfile = {
      ...current,
      xp: newXP,
      level: getLevelFromXP(newXP),
    };
    saveStoredProfile(updated);
    setProfile(updated);
  }, []);

  return (
    <GameStoreContext.Provider
      value={{
        profile,
        isHydrated,
        applyGameResult,
        claimDailyReward,
        toggleFavorite,
        updateSettings,
        updateAvatar,
        updateUsername,
        resetProgress,
        addDevCoins,
        addDevXP,
      }}
    >
      {children}
    </GameStoreContext.Provider>
  );
};

export function useGameStore(): GameStoreContextType {
  const ctx = useContext(GameStoreContext);
  if (!ctx) {
    throw new Error("useGameStore must be used within a GameStoreProvider");
  }
  return ctx;
}
