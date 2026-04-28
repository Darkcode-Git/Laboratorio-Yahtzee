/**
 * game.js
 * Core Yahtzee game state and logic.
 *
 * Dependencies (must be loaded first): scoring.js, montecarlo.js
 */

'use strict';

const MAX_ROLLS_PER_TURN = 3;
const NUM_DICE           = 5;
const NUM_PLAYERS        = 2;
const NUM_CATEGORIES     = 13;   // total turns per player

// ── State ─────────────────────────────────────────────────────────────────────

/** @type {GameState} */
let state = null;
/** @type {MonteCarloStats} */
let stats = null;

/**
 * Initialise (or reset) a new game.
 */
function initGame() {
  stats = createStats();

  state = {
    // 1 or 2
    currentPlayer: 1,
    // Rolls already used this turn (0 = not rolled yet)
    rollsUsed: 0,
    // Each die: { value: 1-6, locked: bool }
    dice: Array.from({ length: NUM_DICE }, () => ({ value: 1, locked: false })),
    // Score cards: { 1: { ones: null, … }, 2: { … } }
    scoreCards: {
      1: createEmptyScoreCard(),
      2: createEmptyScoreCard(),
    },
    // Track how many categories each player has filled
    categoriesFilled: { 1: 0, 2: 0 },
    gameOver: false,
    winner: null,
  };
}

// ── Dice helpers ───────────────────────────────────────────────────────────────

/**
 * Roll one die: uniform integer in [1, 6].
 * Uses the Monte Carlo approach: Math.random() → Math.floor(…*6)+1
 * @returns {number}
 */
function rollOneDie() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Roll all un-locked dice and update state.
 * Records the roll in Monte Carlo stats.
 * @throws {Error} if no rolls remain or game is over.
 */
function rollDice() {
  if (state.gameOver) throw new Error('El juego ha terminado.');
  if (state.rollsUsed >= MAX_ROLLS_PER_TURN) {
    throw new Error('Ya se usaron los 3 lanzamientos del turno.');
  }

  const newValues = [];
  state.dice.forEach(die => {
    if (!die.locked) {
      die.value = rollOneDie();
      newValues.push(die.value);
    }
  });

  state.rollsUsed += 1;
  recordRoll(stats, newValues);
}

/**
 * Toggle the locked/held state of a die by index.
 * A die can only be locked after the first roll and while rolls remain.
 * @param {number} index  0–4
 */
function toggleLock(index) {
  if (state.rollsUsed === 0) return;           // must roll at least once first
  if (state.rollsUsed >= MAX_ROLLS_PER_TURN) return; // no more rolls anyway
  state.dice[index].locked = !state.dice[index].locked;
}

// ── Scoring ────────────────────────────────────────────────────────────────────

/**
 * Get the potential score the current player would earn for a given category
 * based on the current dice.
 * @param {string} categoryId
 * @returns {number}
 */
function getPotentialScore(categoryId) {
  const dice = state.dice.map(d => d.value);
  const potentials = calculatePotentialScores(dice);
  return potentials[categoryId] ?? 0;
}

/**
 * Assign a category score to the current player and advance the turn.
 * The player MUST have rolled at least once before scoring.
 * @param {string} categoryId
 * @throws {Error} if the category is already filled or player has not rolled.
 */
function scoreCategory(categoryId) {
  if (state.rollsUsed === 0) {
    throw new Error('Debes lanzar los dados al menos una vez antes de anotar.');
  }

  const card = state.scoreCards[state.currentPlayer];
  if (card[categoryId] !== null) {
    throw new Error(`La categoría "${categoryId}" ya fue anotada.`);
  }

  const score = getPotentialScore(categoryId);
  card[categoryId] = score;
  state.categoriesFilled[state.currentPlayer] += 1;

  // Record in Monte Carlo stats
  recordCategoryScore(stats, categoryId, score);

  // Check if both players have filled all categories (game over)
  if (
    state.categoriesFilled[1] === NUM_CATEGORIES &&
    state.categoriesFilled[2] === NUM_CATEGORIES
  ) {
    _endGame();
  } else {
    _nextTurn();
  }
}

// ── Turn management ────────────────────────────────────────────────────────────

function _nextTurn() {
  // Alternate between player 1 and 2
  state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
  state.rollsUsed = 0;
  // Unlock all dice for the new turn
  state.dice.forEach(die => {
    die.locked = false;
    die.value  = 1;
  });
}

function _endGame() {
  const totals1 = computeTotals(state.scoreCards[1]);
  const totals2 = computeTotals(state.scoreCards[2]);

  recordGameEnd(stats, totals1.grandTotal, totals2.grandTotal);

  state.gameOver = true;
  if (totals1.grandTotal > totals2.grandTotal) {
    state.winner = 1;
  } else if (totals2.grandTotal > totals1.grandTotal) {
    state.winner = 2;
  } else {
    state.winner = 0; // draw
  }
}

// ── Accessors ──────────────────────────────────────────────────────────────────

/** @returns {GameState} */
function getState() { return state; }

/** @returns {MonteCarloStats} */
function getStats() { return stats; }

/**
 * Return a snapshot of the current dice values and lock states.
 * @returns {{ value: number, locked: boolean }[]}
 */
function getDice() {
  return state.dice.map(d => ({ value: d.value, locked: d.locked }));
}

/**
 * Return the score card for the given player.
 * @param {number} player 1 or 2
 * @returns {Object.<string, number|null>}
 */
function getScoreCard(player) {
  return { ...state.scoreCards[player] };
}

/**
 * Return computed totals for a player.
 * @param {number} player 1 or 2
 * @returns {{ upperRaw, upperBonus, lowerTotal, grandTotal }}
 */
function getPlayerTotals(player) {
  return computeTotals(state.scoreCards[player]);
}

/**
 * @returns {number} rolls remaining this turn (0–3)
 */
function getRollsRemaining() {
  return MAX_ROLLS_PER_TURN - state.rollsUsed;
}
