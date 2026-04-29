# Laboratorio-Yahtzee
Aplicación del Método de Montecarlo  Simulación de juego con distribución uniforme de probabilidad

## Simulación Monte Carlo en Python
Incluye un script en Python que simula partidas de Yahtzee con decisiones aleatorias
(sin estrategia) para estimar distribuciones y promedios. Las reglas de puntuación
siguen las definidas en `scoring.js`.

Ejecuta:
```
python python/montecarlo_simulation.py --games 1000 --seed 42
```

Opciones principales:
- `--games`: número de partidas a simular (por defecto 1000).
- `--players`: número de jugadores (por defecto 2).
- `--seed`: semilla aleatoria opcional para reproducibilidad.
