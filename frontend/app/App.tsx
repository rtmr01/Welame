import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { MatchScenarioCard } from './components/MatchScenarioCard';
import { ProbabilityBar } from './components/ProbabilityBar';
import { ProbabilityCarousel } from './components/ProbabilityCarousel';
import { EventTimeline } from './components/EventTimeline';
import { AutoComments } from './components/AutoComments';
import { MatchHistory } from './components/MatchHistory';
import { ScenarioSelector, ScenarioType } from './components/ScenarioSelector';
import { SquadDetails } from './components/SquadDetails';
import { PlayerStats } from './components/PlayerStats';
import { Goal, AlertTriangle, Flag, Trophy, Timer, Swords, Zap } from 'lucide-react';

const SPORT_IDS: Record<string, number> = {
  futebol: 1,
  football: 1,
  basquete: 18,
  basketball: 18,
  nba: 18,
  esports: 151,
  tenis: 13,
  tennis: 13,
  'tênis': 13,
};

const SPORT_KEYS: Record<string, 'futebol' | 'basquete' | 'esports' | 'tenis'> = {
  futebol: 'futebol',
  football: 'futebol',
  soccer: 'futebol',
  basquete: 'basquete',
  basketball: 'basquete',
  nba: 'basquete',
  esports: 'esports',
  'e-sports': 'esports',
  tenis: 'tenis',
  tennis: 'tenis',
  'tênis': 'tenis',
};

const SPORT_METRICS = {
  futebol: [
    { key: 'goals', label: 'Chance de Gol', icon: Goal, color: 'goal' as const },
    { key: 'cards', label: 'Risco de Cartão Amarelo', icon: AlertTriangle, color: 'card' as const },
    { key: 'penalty', label: 'Chance de Pênalti', icon: Flag, color: 'penalty' as const },
  ],
  basquete: [
    { key: 'goals', label: 'Projeção de Pontos', icon: Goal, color: 'goal' as const },
    { key: 'cards', label: 'Intensidade de Faltas', icon: AlertTriangle, color: 'card' as const },
    { key: 'penalty', label: 'Lance Livre Decisivo', icon: Flag, color: 'penalty' as const },
  ],
  tenis: [
    { key: 'goals', label: 'Projeção de Games', icon: Timer, color: 'goal' as const },
    { key: 'cards', label: 'Pressão dos Rallies', icon: Swords, color: 'card' as const },
    { key: 'penalty', label: 'Quebra Decisiva', icon: Zap, color: 'penalty' as const },
  ],
  esports: [
    { key: 'goals', label: 'Projeção de Rounds', icon: Timer, color: 'goal' as const },
    { key: 'cards', label: 'Intensidade da Partida', icon: Swords, color: 'card' as const },
    { key: 'penalty', label: 'Chance de Virada', icon: Zap, color: 'penalty' as const },
  ],
};

interface MatchItem {
  id: string | number;
  homeTeam: string;
  awayTeam: string;
}

export default function App() {
  const { sport, id } = useParams<{ sport: string; id: string }>();
  const sportInput = (sport || 'futebol').toLowerCase();
  const normalizedSport = SPORT_KEYS[sportInput] || 'futebol';
  const location = useLocation();
  const routeState = location.state as { match?: MatchItem } | null;

  const [activeScenario, setActiveScenario] = useState<ScenarioType>('standard');
  const [apiData, setApiData] = useState<any>(null);

  const [upcomingMatches, setUpcomingMatches] = useState<MatchItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  const [homeTeamInput, setHomeTeamInput] = useState('');
  const [awayTeamInput, setAwayTeamInput] = useState('');
  const [triggerFetch, setTriggerFetch] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  // Inicialmente busca as partidas da API BetsAPI para o esporte da rota.
  useEffect(() => {
    const sportId = SPORT_IDS[sportInput] || SPORT_IDS[normalizedSport] || 1;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/upcoming-matches?sport_id=${sportId}`)
      .then(res => res.json())
      .then(data => {
        const matches = Array.isArray(data.matches) ? data.matches : [];
        setUpcomingMatches(matches);

        const routedMatch = routeState?.match;
        const matchFromId = matches.find((m: MatchItem) => String(m.id) === String(id));
        const preferredMatch = routedMatch || matchFromId || matches[0];

        if (preferredMatch) {
          setSelectedMatchId(String(preferredMatch.id));
          setHomeTeamInput(preferredMatch.homeTeam);
          setAwayTeamInput(preferredMatch.awayTeam);
          setTriggerFetch(prev => prev + 1);
        }

        setIsLoadingMatches(false);
      })
      .catch(err => {
        console.error("Erro puxando proximas partidas:", err);
        setApiError('Nao foi possivel carregar as partidas deste esporte no momento.');
        setIsLoadingMatches(false);
      });
  }, [sportInput, normalizedSport, id, routeState]);

  // Busca os insights da partida específica selecionada.
  useEffect(() => {
    if (!homeTeamInput || !awayTeamInput) return;

    setApiError(null);
    setApiData(null);
    const params = new URLSearchParams({
      sport: normalizedSport,
      homeTeam: homeTeamInput,
      awayTeam: awayTeamInput,
    });
    if (selectedMatchId) {
      params.set('matchId', selectedMatchId);
    }

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8001'}/api/match-scenario?${params.toString()}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok || data?.error || !data?.scenarioData) {
          const msg = data?.detail?.[0]?.msg || data?.error || 'Nao foi possivel carregar esta analise.';
          throw new Error(msg);
        }
        setApiData(data);
      })
      .catch(err => {
        console.error("Erro ao puxar dados da API:", err);
        setApiError(err?.message || 'Nao foi possivel carregar esta analise.');
      });
  }, [triggerFetch, homeTeamInput, awayTeamInput, selectedMatchId, normalizedSport]);

  const handleMatchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const matchId = e.target.value;
    const match = upcomingMatches.find(m => String(m.id) === String(matchId));
    if (match) {
      setSelectedMatchId(String(match.id));
      setHomeTeamInput(match.homeTeam);
      setAwayTeamInput(match.awayTeam);
      setTriggerFetch(prev => prev + 1);
    }
  };

  const accuracyCards = apiData?.accuracy
    ? [
        { key: 'player', label: 'Acurácia Jogador', value: apiData.accuracy.player },
        { key: 'standard', label: 'Acurácia Padrão', value: apiData.accuracy.standard },
        { key: 'pressure', label: 'Acurácia Pressão', value: apiData.accuracy.pressure },
        { key: 'control', label: 'Acurácia Controle', value: apiData.accuracy.control },
      ]
    : [];
  const metricsForSport = SPORT_METRICS[normalizedSport] || SPORT_METRICS.futebol;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f6ff] via-[#e9eefc] to-[#eff9f4] p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-[#1C1F5A] text-3xl font-bold">Assistente de Partida (Com Apostas Ao Vivo)</h1>

          {apiData && (
            <p className="text-sm text-[#1C1F5A]/70 mt-2">Partidas vindas da BetsAPI • Insights Preditivos</p>
          )}

          {accuracyCards.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl mx-auto pt-2">
              {accuracyCards.map(card => (
                <div
                  key={card.key}
                  className="rounded-xl border border-[#1C1F5A]/15 bg-white/80 backdrop-blur-sm px-3 py-2 text-left shadow-sm"
                >
                  <p className="text-[10px] uppercase tracking-wider text-[#1C1F5A]/70 font-semibold">{card.label}</p>
                  <p className="text-lg font-black text-[#1C1F5A]">
                    <span className="text-[#00D26A]">{card.value}</span>%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {!apiData ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 border-4 border-[#1C1F5A] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#1C1F5A]/70 animate-pulse">{apiError || 'Analisando dados da partida e calculando probabilidades...'}</p>
          </div>
        ) : (
          <>
            {/* Main Scenario Card */}
            <MatchScenarioCard
              mainInsight={apiData.scenarioData[activeScenario].mainScenario.insight}
              confidence={apiData.scenarioData[activeScenario].mainScenario.confidence}
              reasoning={apiData.scenarioData[activeScenario].mainScenario.reasoning}
            />

            {/* EPL Premium Insight */}
            {apiData.isEPL && apiData.eplAnalysis && (
              <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500 p-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <Trophy className="text-emerald-950 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-emerald-400 font-black uppercase tracking-widest text-xs">Análise Premium EPL</h2>
                    <p className="text-emerald-100/60 text-[10px] font-medium">Dataset 2025/26 + Histórico desde 2020</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {apiData.eplAnalysis.insights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/10">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <p className="text-emerald-50 text-sm leading-relaxed font-medium">{insight}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {Object.entries(apiData.eplAnalysis.probabilities).map(([key, val]: any) => (
                    <div key={key} className="bg-black/20 p-3 rounded-xl border border-emerald-500/5 text-center">
                      <p className="text-[10px] text-emerald-400/60 font-bold uppercase">{key === 'H' ? 'Casa' : key === 'A' ? 'Fora' : 'Empate'}</p>
                      <p className="text-xl font-black text-emerald-50">{val}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scenario Selector */}
            <ScenarioSelector
              activeScenario={activeScenario}
              onScenarioChange={setActiveScenario}
            />

            {/* Probabilities Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1C1F5A]/30 to-transparent" />
                <span className="text-xs uppercase tracking-wider text-[#1C1F5A]/75 font-medium">Probabilidades Contextuais</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1C1F5A]/30 to-transparent" />
              </div>

              <ProbabilityCarousel>
                <ProbabilityBar
                  icon={Trophy}
                  label="Vencedor da Partida"
                  homeTeam={apiData.homeTeam}
                  awayTeam={apiData.awayTeam}
                  homeProbability={apiData.scenarioData[activeScenario].probabilities.winner.home}
                  awayProbability={apiData.scenarioData[activeScenario].probabilities.winner.away}
                  drawProbability={apiData.scenarioData[activeScenario].probabilities.winner.draw}
                  color="winner"
                  reasoning={apiData.metadata.winner.reasoning}
                  source={apiData.metadata.winner.source}
                  methodType={apiData.scenarioData[activeScenario].probabilities.winner.method}
                />

                {metricsForSport.map(metric => {
                  const prob = apiData.scenarioData[activeScenario].probabilities[metric.key];
                  const meta = apiData.metadata[metric.key];
                  if (!prob || !meta) return null;

                  return (
                    <ProbabilityBar
                      key={metric.key}
                      icon={metric.icon}
                      label={metric.label}
                      homeTeam={apiData.homeTeam}
                      awayTeam={apiData.awayTeam}
                      homeProbability={prob.home}
                      awayProbability={prob.away}
                      color={metric.color}
                      reasoning={meta.reasoning}
                      source={meta.source}
                      methodType={prob.method}
                    />
                  );
                })}
              </ProbabilityCarousel>
            </div>

            {/* Event Timeline */}
            <EventTimeline events={apiData.timelineEvents} />

            {/* Auto Comments */}
            <AutoComments comments={apiData.autoComments} />

            {/* Match History */}
            <MatchHistory
              homeTeam={apiData.matchHistory.homeTeam}
              awayTeam={apiData.matchHistory.awayTeam}
              headToHead={apiData.matchHistory.headToHead}
            />

            {/* Player Stats */}
            <PlayerStats
              homeTeam={apiData.homeTeam}
              awayTeam={apiData.awayTeam}
              matchId={selectedMatchId}
            />

            {/* Squad Details */}
            <SquadDetails
              homeTeamName={apiData.homeTeam}
              awayTeamName={apiData.awayTeam}
              homeSquad={apiData.squads.home}
              awaySquad={apiData.squads.away}
            />

            {/* Help Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-[#1C1F5A]/15 p-6">
              <h3 className="text-[#1C1F5A] mb-3 font-semibold">Como Interpretar</h3>
              <div className="space-y-2 text-sm text-[#1C1F5A]/75">
                <p>• Este relatório agora é puxado com jogos reais advindos do BetsAPI</p>
                <p>• A confiança é calculada com base na consistência dos dados históricos</p>
                <p>• Cada previsão indica de forma simples a origem e o contexto da análise</p>
                <p>• Use o seletor de cenários para explorar como as probabilidades mudam em diferentes situações</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}