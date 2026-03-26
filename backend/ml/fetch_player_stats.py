import os
import sys
import pandas as pd
import json
import re
import time
from dotenv import load_dotenv

# Setup paths and env
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, '..'))
sys.path.append(backend_dir)
load_dotenv(os.path.join(backend_dir, '.env'))

from api_clients.betsapi import BetsAPIClient

class PlayerStatsMiner:
    def __init__(self):
        self.client = BetsAPIClient()
        self.re_shot_on = re.compile(r"Shot On Target - (.*?) \(")
        self.re_shot_off = re.compile(r"Shot Off Target - (.*?) \(")
        self.re_goal = re.compile(r"Goal - (.*?) \(")
        self.re_card = re.compile(r"Yellow Card ~ (.*?) ~")
        self.re_assist = re.compile(r"Assist - (.*?) \(")

    def parse_match_events(self, event_ids):
        all_player_data = []

        for eid in event_ids:
            print(f"Processando partida {eid}...")
            try:
                # 1. Fetch data
                view = self.client.get_event_view(eid)
                lineup = self.client.get_event_lineup(eid)
                
                results = view.get('results', [])
                if not results: continue
                match_info = results[0]
                events = match_info.get('events', [])
                
                # 2. Map players from lineup
                # lineup structure: results['home']['startinglineup'] ...
                players = {} # name -> {id, team, side}
                l_res = lineup.get('results', {})
                for side in ['home', 'away']:
                    team_name = match_info.get(side, {}).get('name')
                    for group in ['startinglineup', 'substitutes']:
                        for entry in l_res.get(side, {}).get(group, []):
                            p_info = entry.get('player', {})
                            p_name = p_info.get('name')
                            if p_name:
                                players[p_name] = {
                                    "id": p_info.get('id'),
                                    "team": team_name,
                                    "side": side,
                                    "shots_on": 0,
                                    "shots_off": 0,
                                    "goals": 0,
                                    "cards": 0,
                                    "assists": 0
                                }

                # 3. Parse events
                for ev in events:
                    txt = ev.get('text', '')
                    
                    # Fuzzy/Simple match for player names in text
                    for p_name in players:
                        if p_name in txt:
                            if "Shot On Target" in txt: players[p_name]["shots_on"] += 1
                            elif "Shot Off Target" in txt: players[p_name]["shots_off"] += 1
                            elif "Goal" in txt and "Race to" not in txt: players[p_name]["goals"] += 1
                            elif "Yellow Card" in txt: players[p_name]["cards"] += 1
                            elif "Assist" in txt: players[p_name]["assists"] += 1

                # 4. Save to list
                for p_name, p_stats in players.items():
                    all_player_data.append({
                        "match_id": eid,
                        "player_id": p_stats["id"],
                        "player_name": p_name,
                        "team": p_stats["team"],
                        "side": p_stats["side"],
                        "shots_on": p_stats["shots_on"],
                        "shots_off": p_stats["shots_off"],
                        "goals": p_stats["goals"],
                        "cards": p_stats["cards"],
                        "assists": p_stats["assists"]
                    })
                
                time.sleep(1) # API limit
            except Exception as e:
                print(f"Erro no evento {eid}: {e}")

        return all_player_data

def migrate_data():
    # Carregar IDs das partidas históricas
    csv_path = os.path.join(current_dir, "epl_historic_matches.csv")
    if not os.path.exists(csv_path):
        print("CSV de histórico não encontrado.")
        return
    
    df_matches = pd.read_csv(csv_path)
    # Pegar os últimos 20 jogos para teste inicial (para não gastar toda a API)
    sample_ids = df_matches['id'].unique()[:20].astype(str)
    
    miner = PlayerStatsMiner()
    data = miner.parse_match_events(sample_ids)
    
    if data:
        df_players = pd.DataFrame(data)
        out_path = os.path.join(current_dir, "players_dataset.csv")
        df_players.to_csv(out_path, index=False)
        print(f"Sucesso! Gerado {out_path} com {len(df_players)} registros de performance.")
    else:
        print("Nenhum dado de jogador extraído.")

if __name__ == "__main__":
    migrate_data()
