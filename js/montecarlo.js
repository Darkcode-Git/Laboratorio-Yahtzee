/**
 * montecarlo.js
 * Monte Carlo statistics collector for the Yahtzee simulation.
 *
 * Tracks:
 *  - Total number of individual die rolls
 *  - Face-frequency distribution across all rolls
 *  - How many times each scoring category was achieved (score > 0)
 *  - Per-player final scores history (for multi-game analysis)
 */

'use strict';

/**
 * Creates a fresh statistics object.
 * @returns {MonteCarloStats}
 */
function createStats() {
  return {
    totalRolls: 0,
    // Face distribution: how many times each face (1-6) appeared across ALL dice rolls
    faceDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    // Category hit count: how many turns each category produced a nonzero score
    categoryHits: {
      ones: 0, twos: 0, threes: 0, fours: 0, fives: 0, sixes: 0,
      threeOfAKind: 0, fourOfAKind: 0, fullHouse: 0,
      smallStraight: 0, largeStraight: 0, yahtzee: 0, chance: 0,
    },
    // Scores recorded when a category was chosen (categoryId → [score, ...])
    categoryScores: {
      ones: [], twos: [], threes: [], fours: [], fives: [], sixes: [],
      threeOfAKind: [], fourOfAKind: [], fullHouse: [],
      smallStraight: [], largeStraight: [], yahtzee: [], chance: [],
    },
    // Final grand totals per player across all completed games
    playerFinalScores: { 1: [], 2: [] },
    // Number of complete games recorded
    gamesCompleted: 0,
  };
}

/**
 * Record a single roll of `diceValues` (array of 1-5 values) into the stats.
 * @param {MonteCarloStats} stats
 * @param {number[]} diceValues  Only un-locked dice values should be passed.
 */
function recordRoll(stats, diceValues) {
  stats.totalRolls += diceValues.length;
  for (const face of diceValues) {
    stats.faceDistribution[face] = (stats.faceDistribution[face] || 0) + 1;
  }
}

/**
 * Record when a player scores a category.
 * @param {MonteCarloStats} stats
 * @param {string} categoryId
 * @param {number} score
 */
function recordCategoryScore(stats, categoryId, score) {
  if (score > 0) {
    stats.categoryHits[categoryId] = (stats.categoryHits[categoryId] || 0) + 1;
  }
  if (stats.categoryScores[categoryId]) {
    stats.categoryScores[categoryId].push(score);
  }
}

/**
 * Record the final scores when a game ends.
 * @param {MonteCarloStats} stats
 * @param {number} player1Total
 * @param {number} player2Total
 */
function recordGameEnd(stats, player1Total, player2Total) {
  stats.playerFinalScores[1].push(player1Total);
  stats.playerFinalScores[2].push(player2Total);
  stats.gamesCompleted += 1;
}

/**
 * Compute summary metrics from the accumulated stats.
 * @param {MonteCarloStats} stats
 * @returns {Object}
 */
function computeSummary(stats) {
  const totalFaces = Object.values(stats.faceDistribution).reduce((s, c) => s + c, 0);

  // Expected uniform probability is 1/6 ≈ 0.1667
  const faceProbs = {};
  for (let f = 1; f <= 6; f++) {
    faceProbs[f] = totalFaces > 0
      ? (stats.faceDistribution[f] / totalFaces)
      : 0;
  }

  // Chi-squared goodness-of-fit vs. uniform distribution
  let chiSquared = 0;
  const expected = totalFaces / 6;
  if (expected > 0) {
    for (let f = 1; f <= 6; f++) {
      const observed = stats.faceDistribution[f];
      chiSquared += Math.pow(observed - expected, 2) / expected;
    }
  }

  // Average scores per category
  const avgCategoryScores = {};
  for (const [id, scores] of Object.entries(stats.categoryScores)) {
    avgCategoryScores[id] = scores.length > 0
      ? scores.reduce((s, v) => s + v, 0) / scores.length
      : 0;
  }

  // Average final scores per player
  const avgFinalScore = {};
  for (const p of [1, 2]) {
    const arr = stats.playerFinalScores[p];
    avgFinalScore[p] = arr.length > 0
      ? arr.reduce((s, v) => s + v, 0) / arr.length
      : 0;
  }

  return {
    totalRolls: stats.totalRolls,
    faceDistribution: { ...stats.faceDistribution },
    faceProbs,
    chiSquared: chiSquared.toFixed(4),
    categoryHits: { ...stats.categoryHits },
    avgCategoryScores,
    gamesCompleted: stats.gamesCompleted,
    avgFinalScore,
  };
}
