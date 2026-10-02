/**
 * Canonical Registry of All 38 Arcade Minigames
 *
 * The published rule data lives in `game-catalog.json`, which is the single
 * source of truth shared by the runtime registry and the test fixtures. This
 * module derives probabilities and expected returns from the raw weights so
 * that the numbers shown to players can never drift from the numbers tested.
 */

import rawCatalog from "./game-catalog.json";
import {
  AnimationConfig,
  GameCategory,
  GameDefinition,
  GameRuleModel,
  WeightedOutcome,
  XPConfig,
} from "../types/game";

interface RawOutcomeSpec {
  id: string;
  name: string;
  weight: number;
  rewardMultiplier: number;
  description?: string;
}

interface RawGameSpec {
  id: string;
  name: string;
  category: GameCategory;
  tagline: string;
  description: string;
  icon: string;
  minWager: number;
  maxWager: number;
  ruleModel: Record<string, any>;
  rulesText: string[];
  winCondition: string;
  loseCondition: string;
  tieCondition?: string | null;
  expectedReturn?: number;
  animationConfig?: AnimationConfig;
  xpConfig?: XPConfig;
}

const CATALOG = rawCatalog as unknown as RawGameSpec[];

const DEFAULT_ANIMATION: AnimationConfig = {
  durationMs: 1200,
  reducedMotionDurationMs: 60,
  type: "arcade-standard",
};

const DEFAULT_XP: XPConfig = { baseXP: 10, winBonus: 15, maxXPPerRound: 60 };
const REWARD_XP: XPConfig = { baseXP: 8, winBonus: 12, maxXPPerRound: 50 };

/**
 * Converts raw relative weights into explicit mathematical probabilities.
 * Probabilities always sum to 1.0 over the outcome set (up to rounding).
 */
export function enrichOutcomes(specs: RawOutcomeSpec[]): WeightedOutcome[] {
  const total = specs.reduce((sum, spec) => sum + spec.weight, 0);
  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("A weighted distribution must have a strictly positive total weight.");
  }
  return specs.map((spec) => ({
    id: spec.id,
    name: spec.name,
    weight: spec.weight,
    probability: Number((spec.weight / total).toFixed(6)),
    rewardMultiplier: spec.rewardMultiplier,
    description: spec.description,
  }));
}

/**
 * Derives the theoretical expected return (RTP) of a rule model.
 * For non-weighted models the published value is supplied by the catalog.
 */
export function computeModelReturn(model: GameRuleModel): number {
  if (model.type !== "weighted") return 0;
  const total = model.outcomes.reduce(
    (sum, outcome) => sum + outcome.probability * outcome.rewardMultiplier,
    0
  );
  return Number(total.toFixed(4));
}

function normalizeRuleModel(raw: Record<string, any>): GameRuleModel {
  switch (raw.type) {
    case "weighted":
      return { type: "weighted", outcomes: enrichOutcomes(raw.outcomes as RawOutcomeSpec[]) };
    case "deck":
      return {
        type: "deck",
        deckCount: typeof raw.deckCount === "number" ? raw.deckCount : 1,
        drawRules:
          raw.drawRules ?? {
            deckCount: 1,
            shuffleFrequency: "per-round",
            dealerStandOn: 17,
            tieRule: "push",
          },
      };
    case "board":
      return { type: "board", boardRules: raw.boardRules };
    case "deterministic":
      return {
        type: "deterministic",
        formulaDescription: String(raw.formulaDescription ?? ""),
        parameters: raw.parameters ?? {},
      };
    case "player-skill":
      return {
        type: "player-skill",
        decisionDescription: String(raw.decisionDescription ?? ""),
        possibleDecisions: Array.isArray(raw.possibleDecisions) ? raw.possibleDecisions : [],
      };
    default:
      throw new Error(`Unknown rule model type in game catalog: ${String(raw.type)}`);
  }
}

function defaultXPFor(category: GameCategory): XPConfig {
  return category === "rewards" ? REWARD_XP : DEFAULT_XP;
}

/** All 38 games, fully normalized and ready for the UI and the engine. */
export const ALL_GAMES: GameDefinition[] = CATALOG.map((spec) => {
  const ruleModel = normalizeRuleModel(spec.ruleModel);
  const derivedReturn = ruleModel.type === "weighted" ? computeModelReturn(ruleModel) : 0;

  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    description: spec.description,
    tagline: spec.tagline,
    icon: spec.icon,
    minWager: spec.minWager,
    maxWager: spec.maxWager,
    supportsWager: true,
    ruleModel,
    rulesText: spec.rulesText,
    winCondition: spec.winCondition,
    loseCondition: spec.loseCondition,
    tieCondition: spec.tieCondition ?? undefined,
    expectedReturn:
      ruleModel.type === "weighted" ? derivedReturn : spec.expectedReturn ?? 0.95,
    animationConfig: spec.animationConfig ?? DEFAULT_ANIMATION,
    xpConfig: spec.xpConfig ?? defaultXPFor(spec.category),
  };
});

/** Fast lookup by game id. */
export const GAMES_MAP: Map<string, GameDefinition> = new Map(
  ALL_GAMES.map((game) => [game.id, game])
);

export function getGameById(id: string): GameDefinition | undefined {
  return GAMES_MAP.get(id);
}

export function getGamesByCategory(category: GameCategory): GameDefinition[] {
  return ALL_GAMES.filter((game) => game.category === category);
}

export const GAME_CATEGORIES: GameCategory[] = [
  "chance",
  "risk",
  "rewards",
  "prediction",
  "choice",
];

export const CATEGORY_LABELS: Record<GameCategory, string> = {
  chance: "Chance",
  risk: "Risk & Decision",
  rewards: "Rewards",
  prediction: "Prediction",
  choice: "Choice",
};

export const CATEGORY_COUNTS: Record<GameCategory, number> = {
  chance: getGamesByCategory("chance").length,
  risk: getGamesByCategory("risk").length,
  rewards: getGamesByCategory("rewards").length,
  prediction: getGamesByCategory("prediction").length,
  choice: getGamesByCategory("choice").length,
};
