/**
 * scoring.js
 * Yahtzee scoring logic – all 13 standard categories.
 * Each function receives an array of 5 die values (integers 1-6)
 * and returns the score for that category (0 if the combination does not qualify).
 */

'use strict';

const SCORING_CATEGORIES = [
  // ── Upper section ──────────────────────────────────────────────
  { id: 'ones',   label: 'Ases (1s)',   section: 'upper' },
  { id: 'twos',   label: 'Doses (2s)',  section: 'upper' },
  { id: 'threes', label: 'Treses (3s)', section: 'upper' },
  { id: 'fours',  label: 'Cuatros (4s)',section: 'upper' },
  { id: 'fives',  label: 'Cincos (5s)', section: 'upper' },
  { id: 'sixes',  label: 'Seises (6s)', section: 'upper' },
  // ── Lower section ──────────────────────────────────────────────
  { id: 'threeOfAKind', label: 'Trío',           section: 'lower' },
  { id: 'fourOfAKind',  label: 'Póker',          section: 'lower' },
  { id: 'fullHouse',    label: 'Full House',      section: 'lower' },
  { id: 'smallStraight',label: 'Escalera Corta',  section: 'lower' },
  { id: 'largeStraight',label: 'Escalera Larga',  section: 'lower' },
  { id: 'yahtzee',      label: 'Yahtzee',         section: 'lower' },
  { id: 'chance',       label: 'Oportunidad',     section: 'lower' },
];

const UPPER_BONUS_THRESHOLD = 63;
const UPPER_BONUS_VALUE     = 35;

/**
 * Returns a frequency map {face: count} for the given dice array.
 * @param {number[]} dice
 * @returns {Object.<number, number>}
 */
function frequencies(dice) {
  return dice.reduce((acc, d) => {
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
}

/** Sum of all dice showing the given face. */
function upperScore(dice, face) {
  return dice.filter(d => d === face).reduce((s, d) => s + d, 0);
}

/** Sum of all dice if at least `count` of the same face appear, else 0. */
function ofAKind(dice, count) {
  const freq = frequencies(dice);
  const qualifies = Object.values(freq).some(c => c >= count);
  return qualifies ? dice.reduce((s, d) => s + d, 0) : 0;
}

/** Full House: three of one face + two of another → 25 pts. */
function fullHouse(dice) {
  const freq = Object.values(frequencies(dice));
  return (freq.includes(3) && freq.includes(2)) ? 25 : 0;
}

/** Small Straight: 4 sequential unique faces → 30 pts. */
function smallStraight(dice) {
  const unique = [...new Set(dice)].sort((a, b) => a - b);
  const sequences = [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6],
  ];
  return sequences.some(seq => seq.every(n => unique.includes(n))) ? 30 : 0;
}

/** Large Straight: 5 sequential unique faces → 40 pts. */
function largeStraight(dice) {
  const unique = [...new Set(dice)].sort((a, b) => a - b);
  const sequences = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6],
  ];
  return sequences.some(seq => seq.every(n => unique.includes(n))) ? 40 : 0;
}

/** Yahtzee: all five dice the same → 50 pts. */
function yahtzee(dice) {
  return Object.values(frequencies(dice)).includes(5) ? 50 : 0;
}

/** Chance: sum of all dice, no conditions. */
function chance(dice) {
  return dice.reduce((s, d) => s + d, 0);
}

/**
 * Calculate the potential score for every category given the current dice.
 * Returns an object mapping categoryId → score.
 * @param {number[]} dice
 * @returns {Object.<string, number>}
 */
function calculatePotentialScores(dice) {
  return {
    ones:         upperScore(dice, 1),
    twos:         upperScore(dice, 2),
    threes:       upperScore(dice, 3),
    fours:        upperScore(dice, 4),
    fives:        upperScore(dice, 5),
    sixes:        upperScore(dice, 6),
    threeOfAKind: ofAKind(dice, 3),
    fourOfAKind:  ofAKind(dice, 4),
    fullHouse:    fullHouse(dice),
    smallStraight:smallStraight(dice),
    largeStraight:largeStraight(dice),
    yahtzee:      yahtzee(dice),
    chance:       chance(dice),
  };
}

/**
 * Compute the final total score for a player's score card.
 * @param {Object.<string, number|null>} scoreCard  – values null mean not yet scored.
 * @returns {{ upperRaw: number, upperBonus: number, lowerTotal: number, grandTotal: number }}
 */
function computeTotals(scoreCard) {
  const upperIds = SCORING_CATEGORIES
    .filter(c => c.section === 'upper')
    .map(c => c.id);
  const lowerIds = SCORING_CATEGORIES
    .filter(c => c.section === 'lower')
    .map(c => c.id);

  const upperRaw = upperIds.reduce((s, id) => s + (scoreCard[id] ?? 0), 0);
  const upperBonus = upperRaw >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_VALUE : 0;
  const lowerTotal = lowerIds.reduce((s, id) => s + (scoreCard[id] ?? 0), 0);

  return {
    upperRaw,
    upperBonus,
    lowerTotal,
    grandTotal: upperRaw + upperBonus + lowerTotal,
  };
}

/**
 * Create a blank score card (all categories null = not yet filled).
 * @returns {Object.<string, null>}
 */
function createEmptyScoreCard() {
  return SCORING_CATEGORIES.reduce((obj, cat) => {
    obj[cat.id] = null;
    return obj;
  }, {});
}
