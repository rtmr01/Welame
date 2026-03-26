import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def predict_player_stat(player_name, opponent_team):
    # 1. Carregar modelos e dados
    models = {
        'shots_on': joblib.load(os.path.join(BASE_DIR, "model_player_shots_on.pkl")),
        'goals': joblib.load(os.path.join(BASE_DIR, "model_player_goals.pkl")),
        'cards': joblib.load(os.path.join(BASE_DIR, "model_player_cards.pkl"))
    }
    player_history = joblib.load(os.path.join(BASE_DIR, "player_history_avgs.pkl"))
    df_teams = pd.read_csv(os.path.join(BASE_DIR, "epl_team_power.csv"))
    power_dict = dict(zip(df_teams['Squad'], df_teams['squad_power']))

    # 2. Buscar média do jogador
    p_data = player_history[player_history['player_name'] == player_name]
    if p_data.empty:
        print(f"Jogador {player_name} não encontrado no histórico.")
        return

    avg_shots_on = p_data['avg_shots_on'].values[0]
    avg_shots_off = p_data['avg_shots_off'].values[0]
    opp_power = power_dict.get(opponent_team, 0.15) * 100 # Escalar para o modelo

    # 3. Preparar entrada
    X = pd.DataFrame([[avg_shots_on, avg_shots_off, opp_power]], 
                     columns=['avg_shots_on', 'avg_shots_off', 'opponent_power'])

    # 4. Predizer
    print(f"\n--- Predição para {player_name} vs {opponent_team} ---")
    for stat, model in models.items():
        pred = model.predict(X)[0]
        print(f"Expectativa de {stat}: {round(pred, 2)}")

if __name__ == "__main__":
    # Testar com alguns que mineramos
    predict_player_stat("Richarlison", "Liverpool") # Ele teve 4 chutes no jogo real contra Liverpool
    predict_player_stat("Beto", "Chelsea")        # Ele foi bem contra Chelsea
    predict_player_stat("Erling Haaland", "Arsenal")
