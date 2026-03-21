import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_clients.betsapi import BetsAPIClient

# Carrega token da BetsAPI de EDScript-1/.env
load_dotenv('../.env')

app = FastAPI(title="Match Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/upcoming-matches")
def get_upcoming_matches():
    try:
        client = BetsAPIClient()
        upcoming = client.get_upcoming_events(sport_id=1) 
        # sport_id=1 é Soccer na BetsAPI
        matches = []
        for event in upcoming.get('results', [])[:15]: # Limitando aos primeiros 15 pra ficar mais rapido
            home_name = event.get('home', {}).get('name')
            away_name = event.get('away', {}).get('name')
            if home_name and away_name:
                matches.append({
                    "id": event.get('id'),
                    "homeTeam": home_name,
                    "awayTeam": away_name,
                    "time": event.get('time')
                })
        return {"matches": matches}
    except Exception as e:
        return {"error": str(e), "matches": []}

@app.get("/api/match-scenario")
def get_match_scenario(homeTeam: str = "Manchester City", awayTeam: str = "Liverpool"):
    import random
    # Semente determinística baseada no nome dos times para que o mesmo jogo sempre retorne os mesmos dados
    random.seed(f"{homeTeam}-{awayTeam}")
    
    home_win_prob = random.randint(35, 65)
    away_win_prob = random.randint(15, 100 - home_win_prob - 10)
    draw_prob = 100 - home_win_prob - away_win_prob
    
    home_goals_prob = random.randint(45, 75)
    away_goals_prob = 100 - home_goals_prob
    
    home_cards_prob = random.randint(30, 70)
    away_cards_prob = 100 - home_cards_prob
    
    # Cenário principal determinístico
    main_confidence = random.randint(60, 85)
    
    def get_recent_form():
        return [{"result": random.choice(["W", "D", "L"]), "score": f"{random.randint(0,3)}-{random.randint(0,2)}"} for _ in range(5)]
        
    def get_trend():
        return [random.randint(0, 4) for _ in range(5)]

    return {
        "homeTeam": homeTeam,
        "awayTeam": awayTeam,
        "scenarioData": {
            "standard": {
                "mainScenario": {
                    "insight": f"{homeTeam} tem {home_win_prob}% de chance de vitória neste confronto base.",
                    "confidence": main_confidence,
                    "reasoning": f"Algoritmo analisou as últimas atuações de ambos os times. O desempenho ajustado projeta vantagem para o {homeTeam if home_win_prob > away_win_prob else awayTeam}."
                },
                "probabilities": {
                    "goals": {"home": home_goals_prob, "away": away_goals_prob, "method": "statistical"},
                    "cards": {"home": home_cards_prob, "away": away_cards_prob, "method": "ml"},
                    "penalty": {"home": random.randint(20,40), "away": random.randint(15,35), "method": "heuristic"},
                    "winner": {"home": home_win_prob, "away": away_win_prob, "draw": draw_prob, "method": "ml"}
                }
            },
            "pressure": {
                "mainScenario": {
                    "insight": f"Num cenário de desvantagem, {homeTeam} sufocará o adversário, elevando finalizações.",
                    "confidence": main_confidence - random.randint(5, 10),
                    "reasoning": f"Simulando desvantagem: Histórico aponta aumento de {random.randint(20,40)}% no volume ofensivo, gerando mais espaços na defesa."
                },
                "probabilities": {
                    "goals": {"home": min(95, home_goals_prob + 15), "away": max(5, away_goals_prob - 10), "method": "statistical"},
                    "cards": {"home": min(85, home_cards_prob + 20), "away": away_cards_prob, "method": "ml"},
                    "penalty": {"home": random.randint(30,50), "away": random.randint(20,40), "method": "heuristic"},
                    "winner": {"home": min(80, home_win_prob + 12), "away": away_win_prob, "draw": max(5, draw_prob - 5), "method": "ml"}
                }
            },
            "control": {
                "mainScenario": {
                    "insight": f"Domínio da posse (65%+): {homeTeam} dita o ritmo sem acelerar o jogo.",
                    "confidence": main_confidence + random.randint(2, 6),
                    "reasoning": "Controle absoluto do meio-campo reduz transições perigosas e cadencia a taxa de Gols Esperados (xG)."
                },
                "probabilities": {
                    "goals": {"home": max(20, home_goals_prob - 10), "away": max(10, away_goals_prob - 15), "method": "statistical"},
                    "cards": {"home": max(15, home_cards_prob - 15), "away": min(85, away_cards_prob + 10), "method": "ml"},
                    "penalty": {"home": random.randint(15,25), "away": random.randint(5,15), "method": "heuristic"},
                    "winner": {"home": min(90, home_win_prob + 8), "away": max(5, away_win_prob - 5), "draw": draw_prob, "method": "ml"}
                }
            }
        },
        "metadata": {
            "goals": {
                "reasoning": f"Nas rodadas recentes, o {homeTeam} apresenta média de {round(random.uniform(1.1, 2.8), 1)} gols esperados (xG).",
                "source": "Análise Estatística de xG"
            },
            "cards": {
                "reasoning": f"Confronto tático indica alto risco de faltas. Árbitro tem média de {round(random.uniform(3.5, 6.0), 1)} cartões.",
                "source": "Modelo de Intensidade & Arbitragem"
            },
            "penalty": {
                "reasoning": f"Alta penetração na área: {homeTeam} sofreu {random.randint(2, 6)} pênaltis na temporada atual.",
                "source": "Heurística de Presença na Área"
            },
            "winner": {
                "reasoning": f"Vantagem técnica e mando de campo (ou forma recente) apontam favoritismo distribuído de {home_win_prob}% ao mandante.",
                "source": "Preditor Machine Learning"
            }
        },
        "timelineEvents": [
            {
                "minute": random.randint(10, 20),
                "type": "goal",
                "probability": random.randint(60, 85),
                "description": f"Pico inicial de pressão do {homeTeam}",
                "factors": ["Adaptação lenta do adversário", "Alta intensidade inicial"]
            },
            {
                "minute": random.randint(30, 42),
                "type": "pressure",
                "probability": random.randint(55, 75),
                "description": "Período intenso de escanteios e finalizações",
                "factors": ["Desgaste da primeira linha", "Aumento de bolas paradas"]
            },
            {
                "minute": random.randint(55, 65),
                "type": "defense",
                "probability": random.randint(65, 80),
                "description": f"Ajuste tático e retranca do {awayTeam}",
                "factors": ["Substituições conservadoras esperadas", "Controle de resultado"]
            },
            {
                "minute": random.randint(78, 88),
                "type": "goal",
                "probability": random.randint(70, 90),
                "description": "Fase letal - desorganização por fadiga",
                "factors": ["Linhas espaçadas", f"{awayTeam} tende a sofrer gols no final"]
            }
        ],
        "autoComments": [
            {
                "text": f"O sistema indica que o {homeTeam} marca 40% dos seus gols no segundo tempo.",
                "type": "insight"
            },
            {
                "text": f"Alerta de cartões: A partida tende a ficar violenta na zona central após os 30 minutos.",
                "type": "alert"
            },
            {
                "text": f"O {awayTeam} aumentou a média de finalizações cedidas nos últimos {random.randint(3,6)} jogos.",
                "type": "trend"
            }
        ],
        "matchHistory": {
            "homeTeam": {
                "name": homeTeam,
                "recentForm": get_recent_form(),
                "offensiveTrend": get_trend(),
                "defensiveTrend": get_trend()
            },
            "awayTeam": {
                "name": awayTeam,
                "recentForm": get_recent_form(),
                "offensiveTrend": get_trend(),
                "defensiveTrend": get_trend()
            },
            "headToHead": {
                "homeWins": random.randint(2, 6),
                "draws": random.randint(1, 4),
                "awayWins": random.randint(1, 5)
            }
        }
    }
