import pandas as pd
import numpy as np
import random
import hashlib
import os

def get_team_power(team_name):
    val = int(hashlib.md5(team_name.encode()).hexdigest(), 16)
    return 40 + (val % 50) 

def generate_dataset(num_samples=5000):
    teams = [f"Team_{i}" for i in range(1, 100)] + ["Manchester City", "Liverpool", "Real Madrid", "Barcelona", "Pennarossa", "SS Murata"]
    
    data = []
    for _ in range(num_samples):
        home = random.choice(teams)
        away = random.choice([t for t in teams if t != home])
        
        home_power = get_team_power(home)
        away_power = get_team_power(away)
        
        power_diff = home_power - away_power + 5 # Home advantage
        
        if power_diff > 20:   home_goals = np.random.poisson(2.5); away_goals = np.random.poisson(0.5)
        elif power_diff > 10: home_goals = np.random.poisson(1.8); away_goals = np.random.poisson(0.8)
        elif power_diff > 0:  home_goals = np.random.poisson(1.4); away_goals = np.random.poisson(1.0)
        elif power_diff > -10:home_goals = np.random.poisson(1.0); away_goals = np.random.poisson(1.4)
        else:                 home_goals = np.random.poisson(0.5); away_goals = np.random.poisson(2.0)
            
        home_cards = np.random.poisson(1.5)
        away_cards = np.random.poisson(1.8)
        
        result = "H" if home_goals > away_goals else ("A" if away_goals > home_goals else "D")
        
        data.append({
            "home_team": home,
            "away_team": away,
            "home_power": home_power,
            "away_power": away_power,
            "home_goals": home_goals,
            "away_goals": away_goals,
            "home_cards": home_cards,
            "away_cards": away_cards,
            "result": result
        })
        
    df = pd.DataFrame(data)
    csv_path = os.path.join(os.path.dirname(__file__), "matches_dataset.csv")
    df.to_csv(csv_path, index=False)
    print(f"Dataset generated at {csv_path}")

if __name__ == "__main__":
    generate_dataset(5000)
