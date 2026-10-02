"use strict";

const test = require("node:test");
const assert = require("node:assert");

// Load games definitions
// Note: Since definitions are in TypeScript, we load our test copy of the game definitions or test them directly
const { ALL_GAMES } = require("./fixtures/games-catalog.cjs");

test("8. Registry Completeness: Exactly 38 games defined across 5 categories", () => {
  assert.strictEqual(ALL_GAMES.length, 38, `Expected exactly 38 games, found ${ALL_GAMES.length}`);

  const categories = new Set(ALL_GAMES.map((g) => g.category));
  assert.ok(categories.has("chance"), "Missing category: chance");
  assert.ok(categories.has("risk"), "Missing category: risk");
  assert.ok(categories.has("rewards"), "Missing category: rewards");
  assert.ok(categories.has("prediction"), "Missing category: prediction");
  assert.ok(categories.has("choice"), "Missing category: choice");

  const chanceCount = ALL_GAMES.filter((g) => g.category === "chance").length;
  const riskCount = ALL_GAMES.filter((g) => g.category === "risk").length;
  const rewardsCount = ALL_GAMES.filter((g) => g.category === "rewards").length;
  const predictionCount = ALL_GAMES.filter((g) => g.category === "prediction").length;
  const choiceCount = ALL_GAMES.filter((g) => g.category === "choice").length;

  assert.strictEqual(chanceCount, 15, "Chance category must have 15 games");
  assert.strictEqual(riskCount, 7, "Risk category must have 7 games");
  assert.strictEqual(rewardsCount, 7, "Rewards category must have 7 games");
  assert.strictEqual(predictionCount, 5, "Prediction category must have 5 games");
  assert.strictEqual(choiceCount, 4, "Choice category must have 4 games");
});

test("9. Rule Model Integrity across all 38 games", () => {
  const ids = new Set();

  for (const game of ALL_GAMES) {
    assert.ok(game.id && typeof game.id === "string", "Game must have valid string id");
    assert.strictEqual(ids.has(game.id), false, `Duplicate game id detected: ${game.id}`);
    ids.add(game.id);

    assert.ok(game.name && typeof game.name === "string", `Game ${game.id} missing name`);
    assert.ok(game.minWager > 0, `Game ${game.id} minWager must be > 0`);
    assert.ok(game.maxWager >= game.minWager, `Game ${game.id} maxWager must be >= minWager`);
    assert.ok(game.expectedReturn > 0.8 && game.expectedReturn <= 1.0, `Game ${game.id} expectedReturn must be reasonable arcade RTP`);

    assert.ok(Array.isArray(game.rulesText) && game.rulesText.length > 0, `Game ${game.id} missing rulesText`);
    assert.ok(game.winCondition && typeof game.winCondition === "string", `Game ${game.id} missing winCondition`);
    assert.ok(game.loseCondition && typeof game.loseCondition === "string", `Game ${game.id} missing loseCondition`);

    // Weighted model validation
    if (game.ruleModel.type === "weighted") {
      let sumProb = 0;
      const outcomeIds = new Set();
      for (const out of game.ruleModel.outcomes) {
        assert.ok(!outcomeIds.has(out.id), `Duplicate outcome ID: ${out.id} in game ${game.id}`);
        outcomeIds.add(out.id);
        assert.ok(out.weight >= 0, `Weight must be non-negative in ${game.id}`);
        assert.ok(out.probability >= 0, `Probability must be non-negative in ${game.id}`);
        assert.ok(out.rewardMultiplier >= 0, `Reward multiplier must be non-negative in ${game.id}`);
        sumProb += out.probability;
      }
      assert.ok(
        Math.abs(sumProb - 1.0) < 0.005 || Math.abs(sumProb - 100) < 0.5,
        `Probabilities for ${game.id} must sum to 1.0. Current: ${sumProb}`
      );
    }
  }
});
