import pandas as pd
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

def train_epl():
    data_path = os.path.join(os.path.dirname(__file__), 'epl_historic_matches.csv')
    power_path = os.path.join(os.path.dirname(__file__), 'epl_team_power.csv')
    
    if not os.path.exists(data_path):
        print("Histórico não encontrado. Aguarde a extração.")
        return

    df = pd.read_csv(data_path)
    # Remove duplicatas para evitar acurária irreal
    initial_count = len(df)
    df = df.drop_duplicates(subset=['id'])
    if len(df) < initial_count:
        print(f"DEBUG: Removidas {initial_count - len(df)} partidas duplicadas.")
    
    df_power = pd.read_csv(power_path)
    
    # Criar dict de power
    power_dict = dict(zip(df_power['Squad'], df_power['squad_power']))
    
    def get_p(team):
        # Tenta mapear nomes as vezes ligeiramente diferentes (ex: Manchester Utd vs Manchester United)
        p = power_dict.get(team)
        if p: return p
        # Busca parcial simples
        for k, v in power_dict.items():
            if team in k or k in team:
                return v
        return 0.1 # Default
        
    df['home_power'] = df['home_team'].apply(get_p)
    df['away_power'] = df['away_team'].apply(get_p)
    
    # Features: Diferença de power
    df['power_diff'] = df['home_power'] - df['away_power']
    
    # Target encoding
    le = LabelEncoder()
    df['target'] = le.fit_transform(df['result']) # H=2, D=1, A=0 (depende da ordem alfabetica)
    
    X = df[['home_power', 'away_power', 'power_diff']]
    y = df['target']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Salva modelo
    model_path = os.path.join(os.path.dirname(__file__), 'epl_winner_model.pkl')
    joblib.dump(model, model_path)
    joblib.dump(le, os.path.join(os.path.dirname(__file__), 'epl_label_encoder.pkl'))
    
    print(f"Modelo EPL treinado com sucesso! Acurácia no teste: {model.score(X_test, y_test):.2f}")

if __name__ == "__main__":
    train_epl()
