import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import joblib
from dataset_generator import generate_dataset

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def train_models():
    print("Loading dataset...")
    dataset_path = os.path.join(BASE_DIR, "matches_dataset.csv")
    if not os.path.exists(dataset_path):
        print("Dataset não encontrado. Gerando base sintética...")
        generate_dataset(5000)

    df = pd.read_csv(dataset_path)
    
    X = df[["home_power", "away_power"]]
    y_result = df["result"]
    y_home_goals = df["home_goals"]
    y_away_goals = df["away_goals"]
    y_home_cards = df["home_cards"]
    y_away_cards = df["away_cards"]
    y_home_penalty = df["home_penalty_awarded"]
    y_away_penalty = df["away_penalty_awarded"]

    X_penalty = df[["home_power", "away_power", "home_box_fouls_won", "away_box_fouls_won"]]
    
    # Model 1: Winner Classifier
    clf_winner = RandomForestClassifier(n_estimators=100, random_state=42)
    clf_winner.fit(X, y_result)
    joblib.dump(clf_winner, os.path.join(BASE_DIR, "model_winner.pkl"))
    
    # Model 2 & 3: Goals Regressor
    reg_home_goals = RandomForestRegressor(n_estimators=50, random_state=42)
    reg_home_goals.fit(X, y_home_goals)
    joblib.dump(reg_home_goals, os.path.join(BASE_DIR, "model_home_goals.pkl"))
    
    reg_away_goals = RandomForestRegressor(n_estimators=50, random_state=42)
    reg_away_goals.fit(X, y_away_goals)
    joblib.dump(reg_away_goals, os.path.join(BASE_DIR, "model_away_goals.pkl"))
    
    # Model 4 & 5: Cards Regressor
    reg_home_cards = RandomForestRegressor(n_estimators=50, random_state=42)
    reg_home_cards.fit(X, y_home_cards)
    joblib.dump(reg_home_cards, os.path.join(BASE_DIR, "model_home_cards.pkl"))
    
    reg_away_cards = RandomForestRegressor(n_estimators=50, random_state=42)
    reg_away_cards.fit(X, y_away_cards)
    joblib.dump(reg_away_cards, os.path.join(BASE_DIR, "model_away_cards.pkl"))

    # Model 6 & 7: Penalty probability classifier from fouls in box history
    clf_home_penalty = RandomForestClassifier(n_estimators=120, random_state=42, min_samples_leaf=3)
    clf_home_penalty.fit(X_penalty, y_home_penalty)
    joblib.dump(clf_home_penalty, os.path.join(BASE_DIR, "model_home_penalty.pkl"))

    clf_away_penalty = RandomForestClassifier(n_estimators=120, random_state=42, min_samples_leaf=3)
    clf_away_penalty.fit(X_penalty, y_away_penalty)
    joblib.dump(clf_away_penalty, os.path.join(BASE_DIR, "model_away_penalty.pkl"))
    
    print("Models trained and saved successfully.")

if __name__ == "__main__":
    train_models()
