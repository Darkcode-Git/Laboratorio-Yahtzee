# Laboratorio-Yahtzee
Aplicación del Método de Montecarlo  Simulación de juego con distribución uniforme de probabilidad

## Objetivos principales del laboratorio
- Establecer correctamente la distribución de probabilidad del problema y las estructuras de datos que gestionan la información.
- Implementar la solución asegurando que el algoritmo funcione de forma correcta y consistente.
- Analizar el caso planteado y responder de manera clara a todos los interrogantes.
- Entregar el trabajo puntualmente y en el formato indicado.
- Presentar un video que explique el diseño del sistema, muestre su funcionamiento y justifique el uso de modelos de Markov.
- Mantener el repositorio en GitHub completo, organizado y con documentación (README.md) clara y detallada.

## Simulación Monte Carlo en Python
Incluye un script en Python que simula partidas de Yahtzee con decisiones aleatorias
(sin estrategia) para estimar distribuciones y promedios. La simulación re-lanza
todos los dados en cada tirada y selecciona la categoría al azar. Las reglas de
puntuación siguen las definidas en `scoring.js`.

Ejecuta:
```
python python/montecarlo_simulation.py --games 1000 --seed 42
```

Opciones principales:
- `--games`: número de partidas a simular (por defecto 1000).
- `--players`: número de jugadores (por defecto 2).
- `--seed`: semilla aleatoria opcional para reproducibilidad.
