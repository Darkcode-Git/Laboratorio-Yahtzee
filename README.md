# Laboratorio-Yahtzee
Aplicación del Método de Montecarlo — Simulación de juego con distribución uniforme de probabilidad

Monte Carlo Method application — Game simulation with a uniform probability distribution.

## Simulación Monte Carlo en Python (ES)
Incluye un script en Python que simula partidas de Yahtzee con decisiones aleatorias (sin estrategia) para estimar distribuciones y promedios. La simulación re-lanza todos los dados en cada tirada y selecciona la categoría al azar. Las reglas de puntuación siguen las definidas en `scoring.js`.

Ejecuta:
```bash
python python/montecarlo_simulation.py --games 1000 --seed 42
```

Opciones principales:
- `--games`: número de partidas a simular (por defecto 1000).
- `--players`: número de jugadores (por defecto 2).
- `--seed`: semilla aleatoria opcional para reproducibilidad.

## Monte Carlo Simulation in Python (EN)
This repository includes a Python script that simulates Yahtzee games using random decisions (no strategy) to estimate score distributions and averages. The simulation re-rolls all dice on each roll and selects a scoring category at random. Scoring rules follow those defined in `scoring.js`.

Run:
```bash
python python/montecarlo_simulation.py --games 1000 --seed 42
```

Main options:
- `--games`: number of games to simulate (default 1000).
- `--players`: number of players (default 2).
- `--seed`: optional random seed for reproducibility.

---

## Objetivo principal (ES)
Comprender y aplicar el método de Montecarlo en una aplicación que permita su ejecución y explotación de los resultados aleatorios obtenidos mediante la simulación del juego Yahtzee clásico con 2 jugadores.

## Main objective (EN)
Understand and apply the Monte Carlo method in an application that allows running and leveraging the random results obtained by simulating the classic Yahtzee game with 2 players.

---

## Simulación estocástica (ES)
Implementar lanzamientos aleatorios de dados con distribución uniforme de probabilidad.

## Stochastic simulation (EN)
Implement random dice rolls with a uniform probability distribution.

---

## Análisis de resultados (ES)
Explotar y analizar los resultados aleatorios obtenidos durante las simulaciones.

## Results analysis (EN)
Leverage and analyze the random results obtained during simulations.

---

## Implementación práctica (ES)
Desarrollar un algoritmo funcional que simule el juego completo de Yahtzee.

## Practical implementation (EN)
Develop a working algorithm that simulates a complete Yahtzee game.

---

## Metodología de implementación / Implementation methodology

### 1) Diseño y especificación (ES)
**Problema:** simular el juego Yahtzee con 2 jugadores usando el método de Montecarlo.

**Variables aleatorias:** 5 dados de 6 caras cada uno.

**Distribución:** uniforme discreta \( P(X=k)=1/6 \) para \( k \in \{1,2,3,4,5,6\} \).

**Restricciones:** máximo 3 lanzamientos por turno, posibilidad de bloquear dados.

### 1) Design and specification (EN)
**Problem:** simulate Yahtzee with 2 players using the Monte Carlo method.

**Random variables:** 5 six-sided dice.

**Distribution:** discrete uniform \( P(X=k)=1/6 \) for \( k \in \{1,2,3,4,5,6\} \).

**Constraints:** up to 3 rolls per turn, with the option to lock dice.

---

### 2) Estructura de datos (ES)
- **Estado del juego:** turno actual, jugador activo, lanzamientos restantes.
- **Dados:** array de 5 elementos con valores 1–6 y estado de bloqueo.
- **Puntuaciones:** objeto con 13 categorías por jugador.
- **Estadísticas:** total de lanzamientos, distribución de resultados.

### 2) Data structures (EN)
- **Game state:** current turn, active player, rolls remaining.
- **Dice:** array of 5 dice with values 1–6 and a lock state.
- **Score sheet:** object with 13 categories per player.
- **Statistics:** total rolls, outcome distribution.

---

### 3) Algoritmo de simulación (ES)
**Generación de números aleatorios:**
- Usar `Math.random()` para generar números pseudoaleatorios.
- Transformar a enteros en rango `[1,6]`: `Math.floor(Math.random() * 6) + 1`.
- Aplicar solo a dados no bloqueados.

### 3) Simulation algorithm (EN)
**Random number generation:**
- Use `Math.random()` to generate pseudo-random numbers.
- Convert to integers in `[1,6]`: `Math.floor(Math.random() * 6) + 1`.
- Apply only to unlocked dice.

---

### 4) Reglas de puntuación (ES)

| Categoría | Descripción | Puntuación |
|---|---|---|
| Unos - Seises | Suma de dados con ese número | Suma total |
| Trío | 3 dados iguales | Suma de todos los dados |
| Póker | 4 dados iguales | Suma de todos los dados |
| Full House | 3 de un tipo + 2 de otro | 25 puntos |
| Escalera Menor | 4 dados consecutivos | 30 puntos |
| Escalera Mayor | 5 dados consecutivos | 40 puntos |
| Yahtzee | 5 dados iguales | 50 puntos |
| Chance | Cualquier combinación | Suma de todos los dados |

### 4) Scoring rules (EN)

| Category | Description | Score |
|---|---|---|
| Ones - Sixes | Sum of dice showing that number | Sum |
| Three of a kind | 3 equal dice | Sum of all dice |
| Four of a kind | 4 equal dice | Sum of all dice |
| Full House | 3 of one value + 2 of another | 25 points |
| Small Straight | 4 consecutive dice | 30 points |
| Large Straight | 5 consecutive dice | 40 points |
| Yahtzee | 5 equal dice | 50 points |
| Chance | Any combination | Sum of all dice |

---

### 5) Flujo del juego (ES)
1. Inicializar juego con 2 jugadores.
2. Turno del jugador activo (13 turnos por jugador).
3. Lanzar 5 dados (distribución uniforme).
4. El jugador puede bloquear dados deseados.
5. Relanzar dados no bloqueados (máximo 2 veces más).
6. Seleccionar categoría de puntuación disponible.
7. Calcular y registrar puntos.
8. Cambiar turno al siguiente jugador.
9. Repetir hasta completar 13 turnos por jugador.
10. Determinar ganador por mayor puntuación total.

### 5) Game flow (EN)
1. Initialize the game with 2 players.
2. Active player turn (13 turns per player).
3. Roll 5 dice (uniform distribution).
4. Player may lock selected dice.
5. Re-roll unlocked dice (up to 2 additional times).
6. Choose an available scoring category.
7. Compute and record points.
8. Switch to the next player.
9. Repeat until each player completes 13 turns.
10. Determine the winner by highest total score.

---

## Simulación interactiva del juego / Interactive game simulation

### ES
- **Turno de:** Jugador 1
- **Lanzamientos restantes:** 3
- Botones: **Lanzar Dados**, **Nuevo Juego**, **Instrucciones**

**Indicaciones:**
- Haz clic en **"Lanzar Dados"** para comenzar tu turno.
- Haz clic en un dado para **bloquearlo/desbloquearlo**.
- Después de lanzar, selecciona una **categoría de puntuación**.
- Tienes máximo **3 lanzamientos por turno**.
- El jugador con más puntos al final gana.

### EN
- **Turn:** Player 1
- **Rolls remaining:** 3
- Buttons: **Roll Dice**, **New Game**, **Instructions**

**Instructions:**
- Click **"Roll Dice"** to start your turn.
- Click a die to **lock/unlock** it.
- After rolling, choose a **scoring category**.
- You have up to **3 rolls per turn**.
- The player with the highest score at the end wins.

---

## Implementación del algoritmo / Algorithm implementation

### Código principal — generación de números aleatorios (ES)
El núcleo del método de Montecarlo en este juego es la generación de números aleatorios con distribución uniforme.

### Core code — uniform random generation (EN)
The core of the Monte Carlo method in this project is generating uniform random values for dice rolls.

```js
// Función principal: Lanzar un dado con distribución uniforme
function rollSingleDie() {
  // Genera número aleatorio en [0,1) con distribución uniforme
  const random = Math.random();

  // Transforma a entero en [1,6]
  // P(X=k) = 1/6 para k ∈ {1,2,3,4,5,6}
  return Math.floor(random * 6) + 1;
}

// Lanzar múltiples dados (simulación Montecarlo)
function rollDice() {
  if (gameState.rollsLeft === 0) return;

  // Lanzar solo dados no bloqueados
  gameState.dice.forEach((die) => {
    if (!die.locked) {
      // Aplicar método de Montecarlo
      die.value = rollSingleDie();
      gameState.totalRolls++;
    }
  });

  gameState.rollsLeft--;
  updateDisplay();
}

// Calcular puntuación según categoría
function calculateScore(category, diceValues) {
  const counts = {};
  const sum = diceValues.reduce((a, b) => a + b, 0);

  // Contar frecuencias
  diceValues.forEach((val) => {
    counts[val] = (counts[val] || 0) + 1;
  });

  const frequencies = Object.values(counts);

  switch (category) {
    case "ones":
    case "twos":
    case "threes":
    case "fours":
    case "fives":
    case "sixes": {
      const num = {
        ones: 1,
        twos: 2,
        threes: 3,
        fours: 4,
        fives: 5,
        sixes: 6,
      }[category];
      return (counts[num] || 0) * num;
    }

    case "threeOfKind":
      return frequencies.some((f) => f >= 3) ? sum : 0;

    case "fourOfKind":
      return frequencies.some((f) => f >= 4) ? sum : 0;

    case "fullHouse":
      return frequencies.includes(3) && frequencies.includes(2) ? 25 : 0;

    case "smallStraight": {
      const sorted = [...new Set(diceValues)].sort();
      return hasSequence(sorted, 4) ? 30 : 0;
    }

    case "largeStraight":
      return hasSequence(diceValues.sort(), 5) ? 40 : 0;

    case "yahtzee":
      return frequencies.includes(5) ? 50 : 0;

    case "chance":
      return sum;

    default:
      return 0;
  }
}
```

### Características de la implementación (ES)
- Usa `Math.random()` como generador de números pseudoaleatorios.
- Distribución uniforme discreta para cada dado.
- Independencia entre lanzamientos (propiedad de Montecarlo).
- Permite bloqueo selectivo de dados.
- Calcula todas las categorías de puntuación de Yahtzee.

### Implementation highlights (EN)
- Uses `Math.random()` as the pseudo-random generator.
- Discrete uniform distribution for each die.
- Independence between rolls (Monte Carlo property).
- Allows selective dice locking.
- Computes all Yahtzee scoring categories.

---

## Resultados y análisis / Results and analysis

### Análisis probabilístico (ES)
- **Distribución uniforme:** cada cara del dado tiene probabilidad \( P(X=k)=1/6 \approx 16.67\% \).
- **Valor esperado:** \( E[X]=(1+2+3+4+5+6)/6=3.5 \).
- **Varianza:** \( Var(X)=2.917 \).
- **Desviación estándar:** \( \sigma=1.708 \).

### Probabilistic analysis (EN)
- **Uniform distribution:** each face has probability \( P(X=k)=1/6 \approx 16.67\% \).
- **Expected value:** \( E[X]=3.5 \).
- **Variance:** \( Var(X)=2.917 \).
- **Standard deviation:** \( \sigma=1.708 \).

---

### Probabilidades de combinaciones (1 lanzamiento) (ES)
| Combinación | Probabilidad | Explicación |
|---|---:|---|
| Yahtzee (5 iguales) | 0.077% (1/1296) | \(6 \times (1/6)^5\) |
| Póker (4 iguales) | 1.93% | Más probable con relanzamientos |
| Full House | 3.86% | 3 de un tipo + 2 de otro |
| Escalera mayor | 3.09% | 1-2-3-4-5 o 2-3-4-5-6 |
| Escalera menor | 12.35% | 4 consecutivos |

### Combination probabilities (single roll) (EN)
| Combination | Probability | Notes |
|---|---:|---|
| Yahtzee (5 of a kind) | 0.077% (1/1296) | \(6 \times (1/6)^5\) |
| Four of a kind | 1.93% | More likely with re-rolls |
| Full House | 3.86% | 3 of one value + 2 of another |
| Large Straight | 3.09% | 1-2-3-4-5 or 2-3-4-5-6 |
| Small Straight | 12.35% | 4 consecutive |

---

## Observaciones importantes / Important notes

### ES
- La probabilidad de obtener Yahtzee en un solo lanzamiento es muy baja (0.077\%).
- Con 3 lanzamientos y estrategia óptima, la probabilidad aumenta significativamente.
- El bloqueo estratégico de dados es crucial para maximizar puntuación.
- La distribución uniforme garantiza equidad en el juego.

### EN
- Getting a Yahtzee in a single roll is very unlikely (0.077\%).
- With 3 rolls and optimal strategy, the probability increases significantly.
- Strategic dice locking is crucial to maximize scoring.
- A uniform distribution ensures fairness.

---

## Conclusiones / Conclusions

### ES
- **Método de Montecarlo:** se implementó mediante generación de números aleatorios con distribución uniforme para simular lanzamientos de dados.
- **Distribución uniforme:** garantiza que cada resultado (1–6) tenga la misma probabilidad, simulando dados reales.
- **Aplicación práctica:** Yahtzee es un buen caso para simulación de eventos aleatorios con reglas complejas.

### EN
- **Monte Carlo method:** implemented via uniform random number generation to simulate dice rolls.
- **Uniform distribution:** ensures each outcome (1–6) is equally likely, accurately modeling real dice.
- **Practical application:** Yahtzee is a strong example for simulating random events with complex rules.

---

## Entregables del laboratorio / Deliverables

### ES
- **Documento principal:** `Apellido_Nombre_Montecarlo.doc` (introducción, metodología, resultados, conclusiones).
- **Código fuente (anexo):** algoritmo de simulación, funciones de puntuación, interfaz de usuario, comentarios.
- **Análisis de resultados:** estadísticas, distribución de probabilidades, gráficos/tablas e interpretación de datos.

### EN
- **Main document:** `Lastname_Firstname_Montecarlo.doc` (introduction, methodology, results, conclusions).
- **Source code (appendix):** simulation algorithm, scoring functions, UI, explanatory comments.
- **Results analysis:** simulation statistics, probability distributions, charts/tables, and interpretation.

---

## Referencias / References
- Yahtzee Official Rules — Hasbro Gaming
- Ross, S. M. (2013). *Simulation* (5th ed.). Academic Press
- Law, A. M. (2015). *Simulation Modeling and Analysis* (5th ed.)