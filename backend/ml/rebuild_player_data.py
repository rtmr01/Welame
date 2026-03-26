"""
Reconstrói os dados de jogadores a partir do CSV rico (players_data-2025_2026.csv)
e retreina os modelos player_shots_on, player_goals e player_cards.
Isso resolve o problema de 0.0 para todos os jogadores exceto Evanilson.
"""
import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_CSV = os.path.join(BASE_DIR, '..', 'data', 'raw', 'players_data-2025_2026.csv')
TEAM_POWER_CSV = os.path.join(BASE_DIR, 'epl_team_power.csv')

def main():
    print("Carregando players_data-2025_2026.csv...")
    df_raw = pd.read_csv(RAW_CSV)

    # Filtrar apenas Premier League
    df_epl = df_raw[df_raw['Comp'].str.contains('Premier', case=False, na=False)].copy()
    print(f"Jogadores EPL encontrados: {len(df_epl)}")

    # As colunas que precisamos: Player, Squad, Gls, Sh, SoT, CrdY
    # 90s = número de partidas completas como referência
    required = ['Player', 'Squad', 'Gls', 'Sh', 'SoT', 'CrdY']
    for col in required:
        if col not in df_epl.columns:
            raise ValueError(f"Coluna '{col}' não encontrada. Colunas disponíveis: {df_epl.columns.tolist()}")

    # Pegar número de partidas (90s = tempo equivalente a 90 minutos jogados)
    ninety_col = '90s' if '90s' in df_epl.columns else None

    df_epl = df_epl[required + ([ninety_col] if ninety_col else [])].copy()
    df_epl = df_epl.rename(columns={
        'Player': 'player_name',
        'Squad': 'team',
        'Gls': 'total_goals',
        'Sh': 'total_shots',
        'SoT': 'total_shots_on',
        'CrdY': 'total_cards',
    })
    if ninety_col:
        df_epl = df_epl.rename(columns={ninety_col: 'nineties'})
        df_epl['nineties'] = pd.to_numeric(df_epl['nineties'], errors='coerce').fillna(1.0)
        df_epl['nineties'] = df_epl['nineties'].clip(lower=0.5)  # mínimo 0.5 para não dividir por 0
    else:
        df_epl['nineties'] = 1.0

    # Converter para numérico
    for col in ['total_goals', 'total_shots', 'total_shots_on', 'total_cards']:
        df_epl[col] = pd.to_numeric(df_epl[col], errors='coerce').fillna(0.0)

    # Calcular médias por 90 minutos (por partida equivalente)
    df_epl['avg_shots_on'] = (df_epl['total_shots_on'] / df_epl['nineties']).round(4)
    df_epl['avg_shots_off'] = ((df_epl['total_shots'] - df_epl['total_shots_on']) / df_epl['nineties']).clip(lower=0).round(4)
    df_epl['avg_goals'] = (df_epl['total_goals'] / df_epl['nineties']).round(4)
    df_epl['avg_cards'] = (df_epl['total_cards'] / df_epl['nineties']).round(4)

    print("\nAmostra das médias calculadas:")
    sample = df_epl[df_epl['avg_shots_on'] > 0].head(10)
    print(sample[['player_name', 'team', 'avg_shots_on', 'avg_shots_off', 'avg_goals', 'avg_cards']].to_string())

    # Carregar força dos times
    print("\nCarregando epl_team_power.csv...")
    df_teams = pd.read_csv(TEAM_POWER_CSV)
    power_dict = dict(zip(df_teams['Squad'], df_teams['squad_power']))

    def get_team_power(team_name):
        # Exact match primeiro
        p = power_dict.get(team_name)
        if p: return float(p)
        # Fuzzy match
        for k, v in power_dict.items():
            if team_name.lower() in k.lower() or k.lower() in team_name.lower():
                return float(v)
        return 0.15  # default médio

    # Para treino: usar força do oponente médio (0.15) pois não temos dados por jogo
    # O modelo aprenderá a correlação entre médias do jogador e performance prevista
    df_epl['opponent_power'] = 0.15 * 100  # Valor normalizado padrão

    # Criar player_history_avgs para o predictor runtime
    player_avgs = df_epl[['player_name', 'avg_shots_on', 'avg_shots_off', 'avg_goals', 'avg_cards']].copy()
    player_avgs = player_avgs.drop_duplicates('player_name').reset_index(drop=True)

    print(f"\nTotal jogadores no player_history_avgs: {len(player_avgs)}")
    print(f"Jogadores com avg_goals > 0: {len(player_avgs[player_avgs['avg_goals'] > 0])}")
    print(f"Jogadores com avg_shots_on > 0: {len(player_avgs[player_avgs['avg_shots_on'] > 0])}")

    # Salvar player_history_avgs
    avgs_path = os.path.join(BASE_DIR, 'player_history_avgs.pkl')
    joblib.dump(player_avgs, avgs_path)
    print(f"\nSalvo: {avgs_path}")

    # Salvar novo players_dataset.csv (com uma linha por jogador)
    players_ds_path = os.path.join(BASE_DIR, 'players_dataset.csv')
    # Manter estrutura compatível com o código existente
    df_save = df_epl[['player_name', 'team', 'avg_shots_on', 'avg_shots_off', 'avg_goals', 'avg_cards']].copy()
    df_save.columns = ['player_name', 'team', 'shots_on', 'shots_off', 'goals', 'cards']
    df_save.to_csv(players_ds_path, index=False)
    print(f"Salvo: {players_ds_path}")

    # --- Retreinar modelos ---
    print("\n=== Retreinando modelos ===")

    X = df_epl[['avg_shots_on', 'avg_shots_off', 'opponent_power']].values
    targets = {
        'shots_on': df_epl['avg_shots_on'].values,
        'goals': df_epl['avg_goals'].values,
        'cards': df_epl['avg_cards'].values,
    }

    for target_name, y in targets.items():
        print(f"Treinando modelo para: {target_name}...")
        model = RandomForestRegressor(n_estimators=150, random_state=42, min_samples_leaf=2)
        model.fit(X, y)
        model_path = os.path.join(BASE_DIR, f'model_player_{target_name}.pkl')
        joblib.dump(model, model_path)
        print(f"  Salvo: {model_path}")

    print("\n✅ Concluído! Todos os modelos retreinados com dados reais da temporada 25/26.")

    # Teste rápido com um jogador conhecido
    print("\n=== Teste rápido ===")
    erling = player_avgs[player_avgs['player_name'].str.contains('Haaland', case=False)]
    if not erling.empty:
        row = erling.iloc[0]
        X_test = pd.DataFrame([[row['avg_shots_on'], row['avg_shots_off'], 15.0]],
                               columns=['avg_shots_on', 'avg_shots_off', 'opponent_power'])
        model_shots = joblib.load(os.path.join(BASE_DIR, 'model_player_shots_on.pkl'))
        model_goals = joblib.load(os.path.join(BASE_DIR, 'model_player_goals.pkl'))
        print(f"Haaland - avg_shots_on: {row['avg_shots_on']:.3f}, avg_goals: {row['avg_goals']:.3f}")
        print(f"Predição shots_on: {model_shots.predict(X_test)[0]:.3f}")
        print(f"Predição goals: {model_goals.predict(X_test)[0]:.3f}")

if __name__ == "__main__":
    main()
