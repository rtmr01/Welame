import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def train_player_models():
    print("Carregando datasets...")
    df_players = pd.read_csv(os.path.join(BASE_DIR, "players_dataset.csv"))
    df_teams = pd.read_csv(os.path.join(BASE_DIR, "epl_team_power.csv"))
    
    # 1. Feature Engineering Simples
    # Criar dict de força dos times
    power_dict = dict(zip(df_teams['Squad'], df_teams['squad_power']))
    
    # Adicionar força do oponente para cada linha
    # Precisamos saber quem era o oponente. No CSV de jogadores temos match_id e team.
    # Vamos carregar o historic matches para saber quem jogou contra quem.
    df_matches = pd.read_csv(os.path.join(BASE_DIR, "epl_historic_matches.csv"))
    
    # Mapear Match ID -> (Home Team, Away Team)
    match_map = {}
    for _, row in df_matches.iterrows():
        match_map[str(row['id'])] = (row['home_team'], row['away_team'])
    
    def get_opponent_power(row):
        teams = match_map.get(str(row['match_id']))
        if not teams: return 50
        home, away = teams
        opponent = away if row['team'] == home else home
        return power_dict.get(opponent, 50)

    df_players['opponent_power'] = df_players.apply(get_opponent_power, axis=1)
    
    # Média histórica do jogador (global no dataset por enquanto)
    player_avgs = df_players.groupby('player_name')[['shots_on', 'shots_off', 'goals']].mean().reset_index()
    player_avgs.columns = ['player_name', 'avg_shots_on', 'avg_shots_off', 'avg_goals']
    
    df_final = df_players.merge(player_avgs, on='player_name')
    
    # Features: [Média de chutes on, Média de chutes off, Força do Oponente]
    X = df_final[['avg_shots_on', 'avg_shots_off', 'opponent_power']]
    
    # Modelos para prever performance específica no próximo jogo
    targets = ['shots_on', 'goals', 'cards']
    
    for target in targets:
        print(f"Treinando modelo para: {target}...")
        y = df_final[target]
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)
        
        model_path = os.path.join(BASE_DIR, f"model_player_{target}.pkl")
        joblib.dump(model, model_path)
        print(f"Modelo salvo em {model_path}")

    # Salvar as médicas dos jogadores para uso no predictor
    joblib.dump(player_avgs, os.path.join(BASE_DIR, "player_history_avgs.pkl"))
    print("Processo concluído com sucesso!")

if __name__ == "__main__":
    train_player_models()
