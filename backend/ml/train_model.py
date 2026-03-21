import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def train_models():
    print("Loading dataset...")
    df = pd.read_csv(os.path.join(BASE_DIR, "matches_dataset.csv"))
    
    X = df[["home_power", "away_power"]]
    y_result = df["result"]
    y_home_goals = df["home_goals"]
    y_away_goals = df["away_goals"]
    y_home_cards = df["home_cards"]
    y_away_cards = df["away_cards"]
    
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
    
    print("Models trained and saved successfully.")

if __name__ == "__main__":
    train_models()
