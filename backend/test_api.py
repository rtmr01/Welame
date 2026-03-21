import os
from dotenv import load_dotenv
from api_clients.betsapi import BetsAPIClient

load_dotenv('../.env')

try:
    client = BetsAPIClient()
    # Pega uma partida qualquer pra ter ID
    upcoming = client.get_upcoming_events(sport_id=1)
    results = upcoming.get('results', [])
    if results:
        match_id = results[0]['id']
        print(f"Buscando view do match: {match_id}")
        view = client.get_event_view(str(match_id))
        print("Success!")
        print(list(view.keys())) # Ver as chaves principais
    else:
        print("No results")
except Exception as e:
    print("Error:", e)
