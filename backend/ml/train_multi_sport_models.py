import os
import sys
import time
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split

# Resolve backend root for importing api client
ML_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(ML_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from api_clients.betsapi import BetsAPIClient  # noqa: E402

SPORT_CONFIG = {
    "basketball": {"sport_id": 18, "label": "NBA/Basketball", "score_norm": 110.0},
    "esports": {"sport_id": 151, "label": "Esports", "score_norm": 2.2},
    "tennis": {"sport_id": 13, "label": "Tennis", "score_norm": 2.2},
}

MODEL_TARGETS = [
    "winner",
    "home_goals",
    "away_goals",
    "home_cards",
    "away_cards",
    "home_penalty",
    "away_penalty",
]


def load_env() -> None:
    env_locations = [
        os.path.join(BACKEND_DIR, ".env"),
        os.path.join(os.path.dirname(BACKEND_DIR), ".env"),
    ]
    for loc in env_locations:
        if os.path.exists(loc):
            load_dotenv(loc)
            print(f"[env] loaded from {loc}")
            return


def parse_score(score_value: str) -> tuple[int, int] | None:
    if not score_value or "-" not in score_value:
        return None

    left, right = score_value.split("-", 1)
    left = "".join(ch for ch in left if ch.isdigit())
    right = "".join(ch for ch in right if ch.isdigit())
    if not left or not right:
        return None

    return int(left), int(right)


def result_label(home_score: int, away_score: int) -> str:
    if home_score > away_score:
        return "H"
    if away_score > home_score:
        return "A"
    return "D"


def compute_team_power(df: pd.DataFrame) -> dict[str, float]:
    stats = {}
    for _, row in df.iterrows():
        home = row["home_team"].strip().lower()
        away = row["away_team"].strip().lower()
        hs = float(row["home_score"])
        a_s = float(row["away_score"])

        for team in (home, away):
            if team not in stats:
                stats[team] = {"games": 0, "wins": 0, "draws": 0, "scored": 0.0, "conceded": 0.0}

        stats[home]["games"] += 1
        stats[away]["games"] += 1
        stats[home]["scored"] += hs
        stats[home]["conceded"] += a_s
        stats[away]["scored"] += a_s
        stats[away]["conceded"] += hs

        if hs > a_s:
            stats[home]["wins"] += 1
        elif a_s > hs:
            stats[away]["wins"] += 1
        else:
            stats[home]["draws"] += 1
            stats[away]["draws"] += 1

    powers = {}
    for team, s in stats.items():
        games = max(1, s["games"])
        win_rate = s["wins"] / games
        draw_rate = s["draws"] / games
        goal_diff_rate = (s["scored"] - s["conceded"]) / games
        power = 50.0 + (35.0 * win_rate) + (8.0 * draw_rate) + (4.0 * goal_diff_rate)
        powers[team] = float(np.clip(power, 20.0, 95.0))

    return powers


def build_training_frame(df_matches: pd.DataFrame, sport_key: str) -> pd.DataFrame:
    cfg = SPORT_CONFIG[sport_key]
    score_norm = cfg["score_norm"]
    team_power = compute_team_power(df_matches)

    rows = []
    for _, row in df_matches.iterrows():
        home_team = row["home_team"]
        away_team = row["away_team"]
        hs = float(row["home_score"])
        a_s = float(row["away_score"])

        home_power = team_power[home_team.strip().lower()]
        away_power = team_power[away_team.strip().lower()]

        score_total = hs + a_s
        intensity = score_total / max(1.0, score_norm)
        volatility = abs(hs - a_s) / max(1.0, score_norm)

        home_cards = float(np.clip(0.8 + (intensity * 1.5) + (volatility * 0.7), 0.2, 6.0))
        away_cards = float(np.clip(0.8 + (intensity * 1.4) + (volatility * 0.8), 0.2, 6.0))

        home_penalty = int((hs > a_s and home_power >= away_power) or (volatility > 0.25 and hs >= a_s))
        away_penalty = int((a_s > hs and away_power >= home_power) or (volatility > 0.25 and a_s >= hs))

        rows.append(
            {
                "home_team": home_team,
                "away_team": away_team,
                "home_power": home_power,
                "away_power": away_power,
                "home_goals": hs,
                "away_goals": a_s,
                "home_cards": home_cards,
                "away_cards": away_cards,
                "home_box_fouls_won": max(1.0, round((intensity * 2.0) + (home_power / 30.0), 2)),
                "away_box_fouls_won": max(1.0, round((intensity * 2.0) + (away_power / 30.0), 2)),
                "home_penalty_awarded": home_penalty,
                "away_penalty_awarded": away_penalty,
                "result": result_label(int(hs), int(a_s)),
            }
        )

    return pd.DataFrame(rows)


def fetch_sport_history(client: BetsAPIClient, sport_key: str, pages: int = 15) -> pd.DataFrame:
    sport_id = SPORT_CONFIG[sport_key]["sport_id"]
    rows = []

    for page in range(pages):
        skip = page * 50
        response = client.get_ended_events(sport_id=sport_id, skip=skip)
        events = response.get("results", [])
        if not events:
            break

        for ev in events:
            home_name = (ev.get("home") or {}).get("name")
            away_name = (ev.get("away") or {}).get("name")
            parsed = parse_score(ev.get("ss", ""))
            if not home_name or not away_name or parsed is None:
                continue

            home_score, away_score = parsed
            rows.append(
                {
                    "id": ev.get("id"),
                    "time": datetime.fromtimestamp(int(ev.get("time"))) if ev.get("time") else None,
                    "home_team": home_name,
                    "away_team": away_name,
                    "home_score": home_score,
                    "away_score": away_score,
                }
            )

        time.sleep(0.9)

    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows).drop_duplicates(subset=["id"]).reset_index(drop=True)
    return df


def ensure_min_samples(df: pd.DataFrame, min_samples: int = 450):
    if len(df) >= min_samples:
        return df

    if df.empty:
        return df

    repeat = int(np.ceil(min_samples / len(df)))
    expanded = pd.concat([df] * repeat, ignore_index=True).sample(frac=1.0, random_state=42).reset_index(drop=True)

    # Small controlled jitter so model does not overfit duplicate rows
    for col in ("home_goals", "away_goals", "home_cards", "away_cards"):
        noise = np.random.normal(0, 0.05, size=len(expanded))
        expanded[col] = np.clip(expanded[col] + noise, 0, None)

    expanded_df = expanded.iloc[:min_samples].copy()
    return expanded_df


def train_for_sport(sport_key: str, pages: int = 15) -> tuple[bool, str]:
    client = BetsAPIClient()

    print(f"\n=== {SPORT_CONFIG[sport_key]['label']} ({sport_key}) ===")
    df_hist = fetch_sport_history(client, sport_key=sport_key, pages=pages)
    if df_hist.empty:
        return False, f"Sem dados válidos para {sport_key}."

    hist_path = os.path.join(ML_DIR, f"matches_{sport_key}_dataset.csv")
    df_hist.to_csv(hist_path, index=False)

    df_train = build_training_frame(df_hist, sport_key=sport_key)
    df_train = ensure_min_samples(df_train)

    X_basic = df_train[["home_power", "away_power"]]
    X_penalty = df_train[["home_power", "away_power", "home_box_fouls_won", "away_box_fouls_won"]]

    y_result = df_train["result"]
    y_home_goals = df_train["home_goals"]
    y_away_goals = df_train["away_goals"]
    y_home_cards = df_train["home_cards"]
    y_away_cards = df_train["away_cards"]
    y_home_penalty = df_train["home_penalty_awarded"]
    y_away_penalty = df_train["away_penalty_awarded"]

    stratify_y = y_result if y_result.nunique() > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X_basic,
        y_result,
        test_size=0.22,
        random_state=42,
        stratify=stratify_y,
    )

    clf_winner = RandomForestClassifier(n_estimators=220, random_state=42, min_samples_leaf=2)
    clf_winner.fit(X_train, y_train)

    reg_home_goals = RandomForestRegressor(n_estimators=180, random_state=42, min_samples_leaf=2)
    reg_home_goals.fit(X_basic, y_home_goals)

    reg_away_goals = RandomForestRegressor(n_estimators=180, random_state=42, min_samples_leaf=2)
    reg_away_goals.fit(X_basic, y_away_goals)

    reg_home_cards = RandomForestRegressor(n_estimators=140, random_state=42, min_samples_leaf=3)
    reg_home_cards.fit(X_basic, y_home_cards)

    reg_away_cards = RandomForestRegressor(n_estimators=140, random_state=42, min_samples_leaf=3)
    reg_away_cards.fit(X_basic, y_away_cards)

    clf_home_penalty = RandomForestClassifier(n_estimators=160, random_state=42, min_samples_leaf=3)
    clf_home_penalty.fit(X_penalty, y_home_penalty)

    clf_away_penalty = RandomForestClassifier(n_estimators=160, random_state=42, min_samples_leaf=3)
    clf_away_penalty.fit(X_penalty, y_away_penalty)

    model_bundle = {
        "winner": clf_winner,
        "home_goals": reg_home_goals,
        "away_goals": reg_away_goals,
        "home_cards": reg_home_cards,
        "away_cards": reg_away_cards,
        "home_penalty": clf_home_penalty,
        "away_penalty": clf_away_penalty,
    }

    for target, model in model_bundle.items():
        model_path = os.path.join(ML_DIR, f"model_{sport_key}_{target}.pkl")
        joblib.dump(model, model_path)

    # Store power db per sport for traceability/debug
    power_map = compute_team_power(df_hist)
    power_rows = [{"sport": sport_key, "team": team, "power": pw} for team, pw in power_map.items()]
    power_df = pd.DataFrame(power_rows)
    power_path = os.path.join(ML_DIR, f"team_power_{sport_key}.csv")
    power_df.to_csv(power_path, index=False)

    score = clf_winner.score(X_test, y_test)
    summary = (
        f"{sport_key}: {len(df_hist)} jogos válidos, "
        f"{len(df_train)} amostras de treino, winner_score={score:.3f}"
    )
    return True, summary


def train_all_sports(pages_per_sport: int = 15) -> None:
    load_env()

    if not os.getenv("BETSAPI_TOKEN"):
        raise RuntimeError("BETSAPI_TOKEN não encontrado no ambiente. Configure no .env antes do treino.")

    print("Iniciando treino multi-esporte: basketball, esports, tennis")
    summaries = []
    failures = []

    for sport_key in ("basketball", "esports", "tennis"):
        try:
            ok, msg = train_for_sport(sport_key, pages=pages_per_sport)
            if ok:
                summaries.append(msg)
            else:
                failures.append(msg)
        except Exception as exc:
            failures.append(f"{sport_key}: erro durante treino -> {exc}")

    print("\n=== RESUMO ===")
    for line in summaries:
        print(f"OK: {line}")
    for line in failures:
        print(f"FALHA: {line}")


if __name__ == "__main__":
    train_all_sports(pages_per_sport=16)
