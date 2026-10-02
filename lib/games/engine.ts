/**
 * Deterministic Round Resolution Engine
 *
 * Every game outcome — in real play and in the Monte Carlo audit — is resolved
 * by this single module. It is pure: it never mutates player state, never reads
 * the balance, and never looks at previous results, so probabilities cannot be
 * influenced by stake size, balance, or streaks.
 *
 * The RNG is injectable. Production uses the Web Crypto implementation from
 * `lib/rng/random`; simulations and tests inject a seeded generator.
 */

import { CardDefinition, GameDefinition, GameResult, Rank, Suit } from "../types/game";
import { GAMES_MAP } from "./definitions";
import {
  randomChoice,
  randomFloat,
  randomInt,
  shuffle,
  weightedChoice,
} from "../rng/random";
import { calculateRoundXP } from "../economy/rewards";
import { rollItemDrop } from "../economy/inventory";
import type { IRandomGenerator } from "../rng/seeded";

export const SYSTEM_RNG: IRandomGenerator = {
  randomInt,
  randomFloat,
  randomChoice,
  weightedChoice,
  shuffle,
};

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Array<{ rank: Rank; value: number }> = [
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 },
  { rank: "6", value: 6 },
  { rank: "7", value: 7 },
  { rank: "8", value: 8 },
  { rank: "9", value: 9 },
  { rank: "10", value: 10 },
  { rank: "J", value: 11 },
  { rank: "Q", value: 12 },
  { rank: "K", value: 13 },
  { rank: "A", value: 14 },
];

/** Board games keep a fixed 0.98 per-choice edge, matching the published odds. */
export const BOARD_EDGE = 0.98;

interface RoundOutcome {
  label: string;
  multiplier: number;
  details?: Record<string, unknown>;
}

function buildDeck(rng: IRandomGenerator): CardDefinition[] {
  const cards: CardDefinition[] = [];
  for (const suit of SUITS) {
    for (const entry of RANKS) {
      cards.push({
        suit,
        rank: entry.rank,
        value: entry.value,
        id: `${entry.rank}_of_${suit}`,
      });
    }
  }
  return rng.shuffle(cards);
}

/** Blackjack hand total with aces demoted from 11 to 1 as needed. */
export function handTotal(hand: CardDefinition[]): number {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.rank === "A") {
      aces += 1;
      total += 11;
    } else {
      total += card.value;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function resolveWeighted(game: GameDefinition, rng: IRandomGenerator): RoundOutcome {
  const model = game.ruleModel;
  if (model.type !== "weighted") throw new Error("resolveWeighted called with a non-weighted model.");
  const picked = rng.weightedChoice(model.outcomes);
  return {
    label: picked.name,
    multiplier: picked.rewardMultiplier,
    details: { outcomeId: picked.id, probability: picked.probability },
  };
}

function resolveBoard(game: GameDefinition, rng: IRandomGenerator): RoundOutcome {
  const model = game.ruleModel;
  if (model.type !== "board") throw new Error("resolveBoard called with a non-board model.");

  const { rows, cols, trapCount } = model.boardRules;
  const total = rows * cols;
  const safeTiles = total - trapCount;
  if (safeTiles <= 0) throw new Error(`Game ${game.id} has no safe tiles.`);

  // The layout is committed first, then one tile is opened. Opening a safe tile
  // pays the board edge scaled by the odds of having avoided every trap.
  const layout = rng.shuffle(
    Array.from({ length: total }, (_, index) => (index < trapCount ? "trap" : "safe"))
  );
  const openedIndex = rng.randomInt(0, total - 1);
  const opened = layout[openedIndex];

  if (opened === "trap") {
    return { label: "Hit a trap", multiplier: 0, details: { openedIndex, result: "trap" } };
  }

  const multiplier = Number(((BOARD_EDGE * total) / safeTiles).toFixed(4));
  return {
    label: `Safe tile (${multiplier}x)`,
    multiplier,
    details: { openedIndex, result: "safe" },
  };
}

function resolveDeterministic(game: GameDefinition, rng: IRandomGenerator): RoundOutcome {
  const model = game.ruleModel;
  if (model.type !== "deterministic") throw new Error("resolveDeterministic called with a non-deterministic model.");

  const winProbability = Number(model.parameters.winProbability ?? 0.5);
  const payoutMultiplier = Number(model.parameters.payoutMultiplier ?? 1);
  const roll = rng.randomFloat(0, 1);
  const isWin = roll < winProbability;

  return {
    label: isWin ? "Threshold Beaten" : "Threshold Missed",
    multiplier: isWin ? payoutMultiplier : 0,
    details: { roll: Number(roll.toFixed(6)), winProbability },
  };
}

function resolvePlayerSkill(
  game: GameDefinition,
  playerChoice: string | undefined,
  rng: IRandomGenerator
): RoundOutcome {
  const model = game.ruleModel;
  if (model.type !== "player-skill") throw new Error("resolvePlayerSkill called with a non-player-skill model.");

  const decisions = model.possibleDecisions;
  if (decisions.length === 0) throw new Error(`Game ${game.id} has no player decisions configured.`);

  const chosen =
    playerChoice && decisions.includes(playerChoice)
      ? playerChoice
      : decisions[rng.randomInt(0, decisions.length - 1)];
  const winning = decisions[rng.randomInt(0, decisions.length - 1)];
  const isWin = chosen === winning;
  const multiplier = isWin ? Number((BOARD_EDGE * decisions.length).toFixed(4)) : 0;

  return {
    label: isWin ? `${chosen} was the correct choice` : `${chosen} was not the winner`,
    multiplier,
    details: { chosen, winning },
  };
}

function resolveDeck(
  game: GameDefinition,
  playerChoice: string | undefined,
  rng: IRandomGenerator
): RoundOutcome {
  const deck = buildDeck(rng);

  if (game.id === "high-card") {
    const player = deck[0];
    const dealer = deck[1];
    if (player.value > dealer.value) {
      return {
        label: `${player.rank} beats ${dealer.rank}`,
        multiplier: 2,
        details: { playerCard: player.id, dealerCard: dealer.id },
      };
    }
    if (player.value === dealer.value) {
      return {
        label: `Push on ${player.rank}`,
        multiplier: 1,
        details: { playerCard: player.id, dealerCard: dealer.id },
      };
    }
    return {
      label: `${dealer.rank} beats ${player.rank}`,
      multiplier: 0,
      details: { playerCard: player.id, dealerCard: dealer.id },
    };
  }

  if (game.id === "high-low-roll") {
    const card = deck[0];
    const side = playerChoice === "low" ? "low" : "high";
    const isHigh = card.value >= 8;
    const isWin = side === "high" ? isHigh : !isHigh;
    const payout = side === "high" ? 1.82 : 2.12;
    return {
      label: `${card.rank} of ${card.suit} — ${side} ${isWin ? "wins" : "loses"}`,
      multiplier: isWin ? payout : 0,
      details: { card: card.id, side, isHigh },
    };
  }

  // Arcade 21 — the player stands on 17+, the dealer stands on 17.
  let cursor = 0;
  const playerHand = [deck[cursor++], deck[cursor++]];
  const dealerHand = [deck[cursor++], deck[cursor++]];
  const playerNatural = handTotal(playerHand) === 21;
  const dealerNatural = handTotal(dealerHand) === 21;

  while (handTotal(playerHand) < 17 && cursor < deck.length) {
    playerHand.push(deck[cursor++]);
  }
  const playerTotal = handTotal(playerHand);

  if (!playerNatural) {
    while (handTotal(dealerHand) < 17 && cursor < deck.length) {
      dealerHand.push(deck[cursor++]);
    }
  }
  const dealerTotal = handTotal(dealerHand);

  if (playerTotal > 21) {
    return { label: `Bust with ${playerTotal}`, multiplier: 0, details: { playerTotal, dealerTotal } };
  }
  if (playerNatural && !dealerNatural) {
    return { label: "Natural 21", multiplier: 2.5, details: { playerTotal, dealerTotal } };
  }
  if (dealerTotal > 21) {
    return { label: `Dealer busts on ${dealerTotal}`, multiplier: 2, details: { playerTotal, dealerTotal } };
  }
  if (playerTotal > dealerTotal) {
    return { label: `${playerTotal} beats ${dealerTotal}`, multiplier: 2, details: { playerTotal, dealerTotal } };
  }
  if (playerTotal === dealerTotal) {
    return { label: `Push at ${playerTotal}`, multiplier: 1, details: { playerTotal, dealerTotal } };
  }
  return {
    label: `Dealer's ${dealerTotal} beats ${playerTotal}`,
    multiplier: 0,
    details: { playerTotal, dealerTotal },
  };
}

export function resolveOutcome(
  game: GameDefinition,
  playerChoice: string | undefined,
  rng: IRandomGenerator
): RoundOutcome {
  switch (game.ruleModel.type) {
    case "weighted":
      return resolveWeighted(game, rng);
    case "board":
      return resolveBoard(game, rng);
    case "deterministic":
      return resolveDeterministic(game, rng);
    case "player-skill":
      return resolvePlayerSkill(game, playerChoice, rng);
    case "deck":
      return resolveDeck(game, playerChoice, rng);
    default:
      throw new Error(`Unsupported rule model for game: ${game.id}`);
  }
}

/**
 * Resolves one complete round, producing an immutable GameResult that the state
 * store can commit exactly once.
 */
export function resolveGameRound(
  gameId: string,
  wager: number,
  playerChoice?: string,
  rng: IRandomGenerator = SYSTEM_RNG
): GameResult {
  const game = GAMES_MAP.get(gameId);
  if (!game) {
    throw new Error(`Cannot resolve an unknown game id: ${gameId}`);
  }

  const requested = Number.isFinite(wager) ? Math.floor(wager) : game.minWager;
  const safeWager = Math.max(game.minWager, Math.min(game.maxWager, requested));

  const outcome = resolveOutcome(game, playerChoice, rng);
  const reward = Math.max(0, Math.floor(safeWager * outcome.multiplier));
  const isWin = reward > safeWager;

  const itemEarned =
    game.category === "rewards" && isWin && rng.randomFloat(0, 1) < 0.12
      ? rollItemDrop(rng)
      : undefined;

  return {
    id: `res_${Date.now()}_${rng.randomInt(0, 999999)}`,
    gameId: game.id,
    gameName: game.name,
    wager: safeWager,
    outcome: outcome.label,
    reward,
    netChange: reward - safeWager,
    xpGained: calculateRoundXP(safeWager, isWin, game.xpConfig),
    itemEarned,
    timestamp: Date.now(),
    details: outcome.details,
  };
}
