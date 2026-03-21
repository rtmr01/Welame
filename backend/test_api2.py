import json
from dotenv import load_dotenv
from api_clients.betsapi import BetsAPIClient

load_dotenv('../.env')

client = BetsAPIClient()
upcoming = client.get_upcoming_events(sport_id=1)
if upcoming['results']:
    match_id = upcoming['results'][0]['id']
    view = client.get_event_view(str(match_id))
    if 'results' in view and len(view['results']) > 0:
        print(json.dumps(view['results'][0], indent=2)[:800])
    else:
        print("Empty results from BetsAPI")
else:
    print("No upcoming matches")
