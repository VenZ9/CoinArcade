"use strict";

/**
 * Test-side view of the game catalog.
 *
 * Loads the SAME `lib/games/game-catalog.json` single source of truth used by
 * the application and derives probabilities and expected returns with the same
 * formulas as `lib/games/definitions.ts`. This guarantees the tests validate the
 * exact numbers the runtime publishes to players.
 */

const rawCatalog = require("../../lib/games/game-catalog.json");

function enrichOutcomes(specs) {
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

function normalizeRuleModel(raw) {
  switch (raw.type) {
    case "weighted":
      return { type: "weighted", outcomes: enrichOutcomes(raw.outcomes) };
    case "deck":
      return {
        type: "deck",
        deckCount: typeof raw.deckCount === "number" ? raw.deckCount : 1,
        drawRules: raw.drawRules,
      };
    case "board":
      return { type: "board", boardRules: raw.boardRules };
    case "deterministic":
      return {
        type: "deterministic",
        formulaDescription: String(raw.formulaDescription || ""),
        parameters: raw.parameters || {},
      };
    case "player-skill":
      return {
        type: "player-skill",
        decisionDescription: String(raw.decisionDescription || ""),
        possibleDecisions: Array.isArray(raw.possibleDecisions) ? raw.possibleDecisions : [],
      };
    default:
      throw new Error("Unknown rule model type in game catalog: " + String(raw.type));
  }
}

function computeExpectedReturn(ruleModel, published) {
  if (ruleModel.type !== "weighted") return published;
  const total = ruleModel.outcomes.reduce(
    (sum, outcome) => sum + outcome.probability * outcome.rewardMultiplier,
    0
  );
  return Number(total.toFixed(4));
}

const ALL_GAMES = rawCatalog.map((spec) => {
  const ruleModel = normalizeRuleModel(spec.ruleModel);
  return {
    id: spec.id,
    name: spec.name,
    category: spec.category,
    minWager: spec.minWager,
    maxWager: spec.maxWager,
    ruleModel,
    rulesText: spec.rulesText,
    winCondition: spec.winCondition,
    loseCondition: spec.loseCondition,
    expectedReturn: computeExpectedReturn(ruleModel, spec.expectedReturn),
  };
});

module.exports = { ALL_GAMES };
