# CoinArcade

A mobile-first web arcade of **38 short minigames**, played with a purely **fictional in-app currency called Coins**. Built with Next.js 14, React 18, TypeScript and Tailwind CSS.

> **Coins have no monetary value.** There is no purchase, cash-out, crypto, or real-money wagering anywhere in this project — it is a self-contained arcade of skill/chance minigames with transparent, documented rules.

---

## Highlights

- **38 minigames** across five categories: Chance (15), Risk & Decision (7), Rewards (7), Prediction (5) and Choice (4).
- **Cryptographically fair outcomes** — every result is produced by the Web Crypto API (`crypto.getRandomValues`) with rejection sampling to remove modulo bias.
- **Transparent rule models** — each game publishes its outcome weights, probabilities, reward multipliers, win and lose conditions.
- **Odds independent of stake** — probabilities are never influenced by wager size, coin balance, or previous results (no "streak" manipulation).
- **Progress & economy** — XP/levels, achievements, daily-reward streaks, a collectible inventory, favorites and full play history.
- **Client-side state only** — progress is stored in `localStorage`; no account, database, or backend is required.
- **Accessible & responsive** — dark arcade theme, keyboard-focusable controls and reduced-motion support.

## Tech Stack

| Layer      | Choice                          |
| ---------- | ------------------------------- |
| Framework  | Next.js 14 (App Router)         |
| Language   | TypeScript 5, strict mode       |
| UI         | React 18, Tailwind CSS 3        |
| RNG        | Web Crypto API (`getRandomValues`) |
| Tests      | Node.js built-in `node --test`  |
| Persistence| `localStorage` (client-side)    |

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

### Scripts

| Command         | Purpose                                        |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Start the development server                    |
| `npm run build` | Create an optimized production build            |
| `npm start`     | Serve the production build                      |
| `npm test`      | Run the fairness & integrity test suite         |
| `npm run lint`  | Run the Next.js linter                          |

## Testing & Fairness

The suite under `tests/` validates the properties the arcade guarantees:

- **RNG integrity** — bounds enforcement, integer output, and uniform distribution (no modulo bias).
- **Input validation** — rejection of `NaN`, `Infinity`, negative and out-of-range wagers.
- **Deck integrity** — the standard 52-card deck has no duplicates and correct composition.
- **Weighted-selection integrity** — negative/zero weights are rejected; observed frequencies match configured probabilities.
- **Stake & history independence** — win rates are statistically identical for different balances/wagers and after losing streaks.
- **Transaction model** — a game result is committed exactly once and is immutable.
- **Registry integrity** — exactly 38 games, unique IDs, valid wager bounds, and probabilities summing to 1.0.

```bash
npm test
```

## Project Structure

```
app/                 Next.js routes (home, library, per-game, profile, inventory, debug/fairness)
components/
  games/             Game-specific interactive players + the universal player
  ui/                Reusable UI primitives (buttons, cards, wager control, toasts…)
  visuals/           Presentational visuals (coin, dice, wheel, plinko, reels…)
  layout/            App shell and navigation
lib/
  games/             Game definitions (rule models) and the resolution engine
  rng/               Cryptographic RNG + a seeded RNG for tests/simulations only
  economy/           Rewards, balance guards, achievements, inventory
  validation/        Runtime validation of state, results and distributions
  types/             Shared TypeScript types
tests/               Node test suite + fixtures
```

## Safety

Coins are a fictional counter used only inside the arcade. Do not add payment, cash-out, or real-money wagering integrations. The app ships with no secrets and requires no environment variables (see `.env.example`).

## License

Released for personal and educational use.
