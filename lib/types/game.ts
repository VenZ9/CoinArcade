/**
 * Game System Type Definitions
 *
 * Provides strong typing for rule models, outcomes, game results,
 * player economy, inventory items, achievements, and statistics.
 */

export type GameCategory = "chance" | "risk" | "rewards" | "prediction" | "choice";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export interface WeightedOutcome {
  id: string;
  name: string;
  weight: number;
  probability: number; // exact mathematical probability [0..1]
  rewardMultiplier: number;
  description?: string;
}

export type Suit = "hearts" | "diamonds" | "clubs" | "spades";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface CardDefinition {
  suit: Suit;
  rank: Rank;
  value: number; // 2..14 (Ace high or 1/11 in blackjack)
  id: string;
}

export interface DeckRules {
  deckCount: number;
  shuffleFrequency: "per-round" | "shoe";
  dealerStandOn: number;
  tieRule: "push" | "dealer-win" | "war";
}

export interface BoardRules {
  rows: number;
  cols: number;
  trapCount: number;
  treasureCount: number;
}

export type GameRuleModel =
  | {
      type: "weighted";
      outcomes: WeightedOutcome[];
    }
  | {
      type: "deck";
      deckCount: number;
      drawRules: DeckRules;
    }
  | {
      type: "board";
      boardRules: BoardRules;
    }
  | {
      type: "deterministic";
      formulaDescription: string;
      parameters: Record<string, number | string>;
    }
  | {
      type: "player-skill";
      decisionDescription: string;
      possibleDecisions: string[];
    };

export interface InventoryItem {
  id: string;
  name: string;
  category: "collectible" | "badge" | "ticket" | "charm" | "trophy";
  rarity: ItemRarity;
  description: string;
  quantity: number;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinsReward: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface GameHistoryEntry {
  id: string;
  gameId: string;
  gameName: string;
  outcome: string;
  wager: number;
  reward: number;
  netChange: number;
  xpGained: number;
  timestamp: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalCoinsWon: number;
  totalCoinsWagered: number;
  favoriteGame: string;
  highestWin: number;
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
  perGamePlayCount: Record<string, number>;
}

export interface GameResult {
  id: string;
  gameId: string;
  gameName: string;
  wager: number;
  outcome: string;
  reward: number; // gross reward in Coins
  netChange: number; // reward - wager
  xpGained: number;
  itemEarned?: InventoryItem;
  timestamp: number;
  details?: Record<string, any>;
}

export interface AnimationConfig {
  durationMs: number;
  reducedMotionDurationMs: number;
  type: string;
}

export interface XPConfig {
  baseXP: number;
  winBonus: number;
  maxXPPerRound: number;
}

export interface GameDefinition {
  id: string;
  name: string;
  category: GameCategory;
  description: string;
  tagline: string;
  icon: string;
  minWager: number;
  maxWager: number;
  supportsWager: boolean;
  ruleModel: GameRuleModel;
  rulesText: string[];
  winCondition: string;
  loseCondition: string;
  tieCondition?: string;
  expectedReturn: number; // Theoretical Expected Value (e.g. 0.95 = 95% return)
  animationConfig: AnimationConfig;
  xpConfig: XPConfig;
}

export interface PlayerProfile {
  username: string;
  avatar: string;
  coins: number;
  xp: number;
  level: number;
  streak: number;
  lastDailyClaimDate: string | null;
  favorites: string[];
  history: GameHistoryEntry[];
  inventory: InventoryItem[];
  achievements: Achievement[];
  stats: GameStats;
  settings: {
    reducedMotion: boolean;
    soundEnabled: boolean;
  };
}
