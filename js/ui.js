/**
 * ui.js
 * DOM manipulation and rendering for the Yahtzee game.
 *
 * Dependencies (must be loaded first): scoring.js, montecarlo.js, game.js
 */

'use strict';

// ── Die face SVG paths (dots) ──────────────────────────────────────────────────
const DIE_DOTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

/**
 * Build an SVG representation of a die face.
 * @param {number} value  1–6
 * @param {boolean} locked
 * @returns {string} SVG markup
 */
function buildDieSVG(value, locked) {
  const dots = (DIE_DOTS[value] || [])
    .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="7"/>`)
    .join('');
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
         class="die-svg${locked ? ' die-locked-svg' : ''}">
      <rect x="5" y="5" width="90" height="90" rx="15" ry="15"
            class="die-face${locked ? ' die-face-locked' : ''}"/>
      ${dots}
    </svg>`;
}

// ── Main render ────────────────────────────────────────────────────────────────

function render() {
  const s = getState();
  if (!s) return;

  renderDice(s);
  renderScoreCards(s);
  renderControls(s);
  renderStatus(s);

  if (s.gameOver) {
    renderGameOver(s);
  } else {
    document.getElementById('game-over-modal').classList.add('hidden');
  }
}

// ── Dice ───────────────────────────────────────────────────────────────────────

function renderDice(s) {
  const container = document.getElementById('dice-container');
  container.innerHTML = '';

  const potentials = s.rollsUsed > 0
    ? calculatePotentialScores(s.dice.map(d => d.value))
    : null;

  s.dice.forEach((die, i) => {
    const btn = document.createElement('button');
    btn.className = 'die-btn' + (die.locked ? ' locked' : '');
    btn.setAttribute('aria-label',
      `Dado ${i + 1}: ${die.value}${die.locked ? ' (bloqueado)' : ''}`);
    btn.setAttribute('aria-pressed', die.locked);
    btn.innerHTML = buildDieSVG(die.value, die.locked);

    const canLock = s.rollsUsed > 0 && s.rollsUsed < MAX_ROLLS_PER_TURN && !s.gameOver;
    btn.disabled = !canLock;
    if (canLock) {
      btn.addEventListener('click', () => {
        toggleLock(i);
        render();
      });
    }
    container.appendChild(btn);
  });

  // Show potential scores hint bar
  const hintBar = document.getElementById('potential-scores');
  if (potentials && !s.gameOver) {
    hintBar.innerHTML = '';
    SCORING_CATEGORIES.forEach(cat => {
      if (s.scoreCards[s.currentPlayer][cat.id] !== null) return;
      const span = document.createElement('span');
      span.className = 'potential-hint';
      span.textContent = `${cat.label}: ${potentials[cat.id]}`;
      hintBar.appendChild(span);
    });
  } else {
    hintBar.innerHTML = '';
  }
}

// ── Score cards ────────────────────────────────────────────────────────────────

function renderScoreCards(s) {
  [1, 2].forEach(p => {
    const card  = s.scoreCards[p];
    const totals = computeTotals(card);
    const potentials = s.rollsUsed > 0 && s.currentPlayer === p && !s.gameOver
      ? calculatePotentialScores(s.dice.map(d => d.value))
      : null;

    SCORING_CATEGORIES.forEach(cat => {
      const cell = document.getElementById(`score-p${p}-${cat.id}`);
      if (!cell) return;

      cell.className = 'score-cell';

      if (card[cat.id] !== null) {
        // Already filled
        cell.textContent = card[cat.id];
        cell.classList.add('filled');
      } else if (potentials && s.currentPlayer === p) {
        // Show potential score as interactive option
        cell.textContent = potentials[cat.id];
        cell.classList.add('potential');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label',
          `Anotar ${cat.label}: ${potentials[cat.id]} puntos`);
        cell.onclick = () => {
          try {
            scoreCategory(cat.id);
            render();
          } catch (e) {
            showToast(e.message);
          }
        };
        cell.onkeydown = (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') cell.click();
        };
      } else {
        cell.textContent = '—';
        cell.removeAttribute('tabindex');
        cell.removeAttribute('role');
        cell.onclick = null;
      }
    });

    // Update totals
    _setText(`total-upper-p${p}`,  totals.upperRaw);
    _setText(`bonus-p${p}`,         totals.upperBonus);
    _setText(`total-lower-p${p}`,   totals.lowerTotal);
    _setText(`grand-total-p${p}`,   totals.grandTotal);
    _setText(`upper-progress-p${p}`,
      `${totals.upperRaw} / ${UPPER_BONUS_THRESHOLD} (bono: ${UPPER_BONUS_VALUE} pts)`);
  });
}

// ── Controls ───────────────────────────────────────────────────────────────────

function renderControls(s) {
  const rollBtn = document.getElementById('btn-roll');
  const remaining = getRollsRemaining();

  rollBtn.disabled = s.gameOver || remaining === 0;
  rollBtn.textContent =
    remaining > 0 ? `🎲 Lanzar (${remaining} restante${remaining !== 1 ? 's' : ''})` : '🎲 Sin lanzamientos';

  // Stats button always available
}

// ── Status bar ─────────────────────────────────────────────────────────────────

function renderStatus(s) {
  const bar = document.getElementById('status-bar');
  if (s.gameOver) {
    bar.textContent = 'Juego terminado';
    return;
  }
  const remaining = getRollsRemaining();
  bar.textContent =
    `Turno del Jugador ${s.currentPlayer} | ` +
    `Lanzamientos restantes: ${remaining}`;
}

// ── Game-over modal ────────────────────────────────────────────────────────────

function renderGameOver(s) {
  const modal  = document.getElementById('game-over-modal');
  const msg    = document.getElementById('game-over-message');
  const detail = document.getElementById('game-over-scores');
  const t1 = computeTotals(s.scoreCards[1]);
  const t2 = computeTotals(s.scoreCards[2]);

  let winnerText;
  if (s.winner === 0)      winnerText = '🤝 ¡Empate!';
  else if (s.winner === 1) winnerText = '🏆 ¡Gana el Jugador 1!';
  else                     winnerText = '🏆 ¡Gana el Jugador 2!';

  msg.textContent    = winnerText;
  detail.textContent =
    `Jugador 1: ${t1.grandTotal} pts  |  Jugador 2: ${t2.grandTotal} pts`;

  modal.classList.remove('hidden');
}

// ── Monte Carlo stats modal ────────────────────────────────────────────────────

function renderStatsModal() {
  const summary = computeSummary(getStats());
  const body    = document.getElementById('stats-body');
  body.innerHTML = '';

  // Face distribution
  const sectionFace = _makeSection('Distribución de Caras (Monte Carlo)');
  const faceTable = _makeTable(
    ['Cara', 'Frecuencia', 'Probabilidad Emp.', 'P Teórica (1/6)'],
    [1, 2, 3, 4, 5, 6].map(f => [
      f,
      summary.faceDistribution[f],
      (summary.faceProbs[f] * 100).toFixed(2) + '%',
      '16.67%',
    ])
  );
  sectionFace.appendChild(faceTable);

  const chi = document.createElement('p');
  chi.className = 'stats-note';
  chi.textContent =
    `χ² (Chi-cuadrado) vs distribución uniforme: ${summary.chiSquared}` +
    ` | Total de lanzamientos individuales: ${summary.totalRolls}`;
  sectionFace.appendChild(chi);
  body.appendChild(sectionFace);

  // Category hits
  const sectionCat = _makeSection('Frecuencia de Categorías Anotadas');
  const catRows = SCORING_CATEGORIES.map(cat => [
    cat.label,
    summary.categoryHits[cat.id] ?? 0,
    summary.avgCategoryScores[cat.id] !== undefined
      ? summary.avgCategoryScores[cat.id].toFixed(1)
      : '—',
  ]);
  sectionCat.appendChild(
    _makeTable(['Categoría', 'Veces Obtenida (>0)', 'Puntaje Promedio'], catRows)
  );
  body.appendChild(sectionCat);

  // Player scores
  if (summary.gamesCompleted > 0) {
    const sectionPlayers = _makeSection('Puntajes Finales Promedio');
    sectionPlayers.appendChild(
      _makeTable(
        ['Jugador', 'Puntaje Promedio', 'Partidas Completadas'],
        [1, 2].map(p => [
          `Jugador ${p}`,
          summary.avgFinalScore[p].toFixed(1),
          summary.gamesCompleted,
        ])
      )
    );
    body.appendChild(sectionPlayers);
  }

  document.getElementById('stats-modal').classList.remove('hidden');
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function _makeSection(title) {
  const sec = document.createElement('section');
  const h3  = document.createElement('h3');
  h3.textContent = title;
  sec.appendChild(h3);
  return sec;
}

function _makeTable(headers, rows) {
  const table = document.createElement('table');
  table.className = 'stats-table';

  const thead = table.createTHead();
  const hrow  = thead.insertRow();
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    hrow.appendChild(th);
  });

  const tbody = table.createTBody();
  rows.forEach(rowData => {
    const tr = tbody.insertRow();
    rowData.forEach(cell => {
      const td = tr.insertCell();
      td.textContent = cell;
    });
  });

  return table;
}

// ── Bootstrap ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // New game / restart
  document.getElementById('btn-new-game').addEventListener('click', () => {
    initGame();
    render();
    document.getElementById('game-over-modal').classList.add('hidden');
  });

  // Roll dice
  document.getElementById('btn-roll').addEventListener('click', () => {
    try {
      rollDice();
      render();
    } catch (e) {
      showToast(e.message);
    }
  });

  // Open stats
  document.getElementById('btn-stats').addEventListener('click', () => {
    renderStatsModal();
  });

  // Close stats modal
  document.getElementById('btn-close-stats').addEventListener('click', () => {
    document.getElementById('stats-modal').classList.add('hidden');
  });

  // Close game-over modal (just dismiss, keep state)
  document.getElementById('btn-close-gameover').addEventListener('click', () => {
    document.getElementById('game-over-modal').classList.add('hidden');
  });

  // Start immediately
  initGame();
  render();
});
