#!/usr/bin/env python3
"""
Simulación Monte Carlo de Yahtzee en Python.
Genera estadísticas de lanzamientos, categorías y puntajes promedio.
Reglas de puntuación alineadas con scoring.js (sin joker de Yahtzee en full house).
La simulación re-lanza todos los dados y elige la categoría al azar (sin estrategia).
"""

from __future__ import annotations

import argparse
import random
from typing import Any, Dict, List

MAX_ROLLS_PER_TURN = 3
NUM_DICE = 5

SCORING_CATEGORIES = [
    # Sección superior
    {"id": "ones", "label": "Ases (1s)", "section": "upper"},
    {"id": "twos", "label": "Doses (2s)", "section": "upper"},
    {"id": "threes", "label": "Treses (3s)", "section": "upper"},
    {"id": "fours", "label": "Cuatros (4s)", "section": "upper"},
    {"id": "fives", "label": "Cincos (5s)", "section": "upper"},
    {"id": "sixes", "label": "Seises (6s)", "section": "upper"},
    # Sección inferior
    {"id": "threeOfAKind", "label": "Trío", "section": "lower"},
    {"id": "fourOfAKind", "label": "Póker", "section": "lower"},
    {"id": "fullHouse", "label": "Full House", "section": "lower"},
    {"id": "smallStraight", "label": "Escalera Corta", "section": "lower"},
    {"id": "largeStraight", "label": "Escalera Larga", "section": "lower"},
    {"id": "yahtzee", "label": "Yahtzee", "section": "lower"},
    {"id": "chance", "label": "Oportunidad", "section": "lower"},
]

NUM_CATEGORIES = len(SCORING_CATEGORIES)

UPPER_BONUS_THRESHOLD = 63
UPPER_BONUS_VALUE = 35


Stats = Dict[str, Any]
Summary = Dict[str, Any]


def create_stats(num_players: int) -> Stats:
    category_ids = [cat["id"] for cat in SCORING_CATEGORIES]
    return {
        "total_dice_rolls": 0,
        "face_distribution": {face: 0 for face in range(1, 7)},
        "category_hits": {cat_id: 0 for cat_id in category_ids},
        "category_scores": {cat_id: [] for cat_id in category_ids},
        "player_final_scores": {player: [] for player in range(1, num_players + 1)},
        "games_completed": 0,
    }


def record_roll(stats: Stats, dice_values: List[int]) -> None:
    stats["total_dice_rolls"] += len(dice_values)
    for face in dice_values:
        stats["face_distribution"][face] += 1


def record_category_score(stats: Stats, category_id: str, score: int) -> None:
    if score > 0:
        stats["category_hits"][category_id] += 1
    stats["category_scores"][category_id].append(score)


def record_game_end(stats: Stats, player_totals: Dict[int, int]) -> None:
    for player, total in player_totals.items():
        stats["player_final_scores"][player].append(total)
    stats["games_completed"] += 1


def compute_summary(stats: Stats) -> Summary:
    total_faces = sum(stats["face_distribution"].values())
    face_probs = {
        face: (count / total_faces if total_faces > 0 else 0)
        for face, count in stats["face_distribution"].items()
    }

    expected = total_faces / 6 if total_faces > 0 else 0
    chi_squared = 0.0
    if expected > 0:
        for face in range(1, 7):
            observed = stats["face_distribution"][face]
            chi_squared += ((observed - expected) ** 2) / expected

    avg_category_scores = {
        cat_id: (sum(scores) / len(scores) if scores else 0)
        for cat_id, scores in stats["category_scores"].items()
    }

    avg_final_score = {
        player: (sum(scores) / len(scores) if scores else 0)
        for player, scores in stats["player_final_scores"].items()
    }

    return {
        "total_dice_rolls": stats["total_dice_rolls"],
        "face_distribution": dict(stats["face_distribution"]),
        "face_probs": face_probs,
        "chi_squared": chi_squared,
        "category_hits": dict(stats["category_hits"]),
        "avg_category_scores": avg_category_scores,
        "games_completed": stats["games_completed"],
        "avg_final_score": avg_final_score,
    }


def frequencies(dice: List[int]) -> Dict[int, int]:
    counts: Dict[int, int] = {}
    for value in dice:
        counts[value] = counts.get(value, 0) + 1
    return counts


def upper_score(dice: List[int], face: int) -> int:
    return sum(value for value in dice if value == face)


def of_a_kind(dice: List[int], count: int) -> int:
    freq = frequencies(dice)
    qualifies = any(c >= count for c in freq.values())
    return sum(dice) if qualifies else 0


def full_house(dice: List[int]) -> int:
    freq = sorted(frequencies(dice).values())
    return 25 if freq == [2, 3] else 0


def small_straight(dice: List[int]) -> int:
    unique = set(dice)
    sequences = [{1, 2, 3, 4}, {2, 3, 4, 5}, {3, 4, 5, 6}]
    return 30 if any(seq.issubset(unique) for seq in sequences) else 0


def large_straight(dice: List[int]) -> int:
    unique = set(dice)
    sequences = [{1, 2, 3, 4, 5}, {2, 3, 4, 5, 6}]
    return 40 if any(seq.issubset(unique) for seq in sequences) else 0


def yahtzee(dice: List[int]) -> int:
    return 50 if len(set(dice)) == 1 else 0


def chance(dice: List[int]) -> int:
    return sum(dice)


def calculate_potential_scores(dice: List[int]) -> Dict[str, int]:
    return {
        "ones": upper_score(dice, 1),
        "twos": upper_score(dice, 2),
        "threes": upper_score(dice, 3),
        "fours": upper_score(dice, 4),
        "fives": upper_score(dice, 5),
        "sixes": upper_score(dice, 6),
        "threeOfAKind": of_a_kind(dice, 3),
        "fourOfAKind": of_a_kind(dice, 4),
        "fullHouse": full_house(dice),
        "smallStraight": small_straight(dice),
        "largeStraight": large_straight(dice),
        "yahtzee": yahtzee(dice),
        "chance": chance(dice),
    }


def compute_totals(score_card: Dict[str, int | None]) -> Dict[str, int]:
    upper_ids = [cat["id"] for cat in SCORING_CATEGORIES if cat["section"] == "upper"]
    lower_ids = [cat["id"] for cat in SCORING_CATEGORIES if cat["section"] == "lower"]

    upper_raw = sum(score_card[cat_id] or 0 for cat_id in upper_ids)
    upper_bonus = UPPER_BONUS_VALUE if upper_raw >= UPPER_BONUS_THRESHOLD else 0
    lower_total = sum(score_card[cat_id] or 0 for cat_id in lower_ids)

    return {
        "upper_raw": upper_raw,
        "upper_bonus": upper_bonus,
        "lower_total": lower_total,
        "grand_total": upper_raw + upper_bonus + lower_total,
    }


def create_empty_score_card() -> Dict[str, int | None]:
    return {cat["id"]: None for cat in SCORING_CATEGORIES}


def roll_one_die(rng: random.Random) -> int:
    return rng.randint(1, 6)


def simulate_game(stats: Stats, rng: random.Random, num_players: int) -> None:
    players = list(range(1, num_players + 1))
    score_cards = {player: create_empty_score_card() for player in players}

    for _ in range(NUM_CATEGORIES):
        for player in players:
            dice: List[int] = []
            for _ in range(MAX_ROLLS_PER_TURN):
                dice = [roll_one_die(rng) for _ in range(NUM_DICE)]
                record_roll(stats, dice)

            available = [cat_id for cat_id, score in score_cards[player].items() if score is None]
            category_id = rng.choice(available)
            score = calculate_potential_scores(dice)[category_id]
            score_cards[player][category_id] = score
            record_category_score(stats, category_id, score)

    player_totals = {
        player: compute_totals(score_cards[player])["grand_total"] for player in players
    }
    record_game_end(stats, player_totals)


def print_summary(summary: Summary) -> None:
    print("=== Resumen Monte Carlo ===")
    print(f"Partidas completadas: {summary['games_completed']}")
    print(f"Total de lanzamientos individuales: {summary['total_dice_rolls']}")
    print(f"χ² (Chi-cuadrado) vs uniforme: {summary['chi_squared']:.4f}")
    print("")
    print("Distribución de caras:")
    for face in range(1, 7):
        count = summary["face_distribution"][face]
        prob = summary["face_probs"][face] * 100
        print(f"  Cara {face}: {count} ({prob:.2f}%)")
    print("")
    print("Frecuencia de categorías:")
    for cat in SCORING_CATEGORIES:
        cat_id = cat["id"]
        hits = summary["category_hits"][cat_id]
        avg = summary["avg_category_scores"][cat_id]
        print(f"  {cat['label']}: {hits} veces, promedio {avg:.1f}")
    print("")
    print("Puntajes finales promedio:")
    for player, avg in summary["avg_final_score"].items():
        print(f"  Jugador {player}: {avg:.1f} pts")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Simulación Monte Carlo del juego Yahtzee."
    )
    parser.add_argument("--games", type=int, default=1000, help="Número de partidas.")
    parser.add_argument("--players", type=int, default=2, help="Número de jugadores.")
    parser.add_argument("--seed", type=int, default=None, help="Semilla aleatoria.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.games <= 0:
        raise SystemExit("El número de partidas debe ser mayor que 0.")
    if args.players <= 0:
        raise SystemExit("El número de jugadores debe ser mayor que 0.")

    rng = random.Random(args.seed)
    stats = create_stats(args.players)
    for _ in range(args.games):
        simulate_game(stats, rng, args.players)

    summary = compute_summary(stats)
    print_summary(summary)


if __name__ == "__main__":
    main()
