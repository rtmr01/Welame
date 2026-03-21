import { useState } from 'react';
import { MatchScenarioCard } from './components/MatchScenarioCard';
import { ProbabilityBar, MethodType } from './components/ProbabilityBar';
import { ProbabilityCarousel } from './components/ProbabilityCarousel';
import { EventTimeline } from './components/EventTimeline';
import { AutoComments } from './components/AutoComments';
import { MatchHistory } from './components/MatchHistory';
import { ScenarioSelector, ScenarioType } from './components/ScenarioSelector';
import { Goal, AlertTriangle, Flag, Trophy } from 'lucide-react';

export default function App() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('standard');
  const scenarioData = {
    standard: {
      mainScenario: {
        insight: 'Manchester City é favorito com 58% de chance de vitória',
        confidence: 73,
        reasoning: 'Baseado no desempenho recente em casa (8 vitórias nos últimos 10 jogos) e no histórico de confrontos diretos nesta temporada'
      },
      probabilities: {
        goals: { home: 68, away: 45, method: 'statistical' as MethodType },
        cards: { home: 42, away: 55, method: 'ml' as MethodType },
        penalty: { home: 28, away: 22, method: 'heuristic' as MethodType },
        winner: { home: 58, away: 25, draw: 17, method: 'ml' as MethodType }
      }
    },
    pressure: {
      mainScenario: {
        insight: 'Sob pressão, Manchester City ataca mais mas Liverpool pode contra-atacar',
        confidence: 68,
        reasoning: 'Simulando cenário onde Man City está perdendo. Historicamente aumenta finalizações em 35% mas concede mais espaço'
      },
      probabilities: {
        goals: { home: 75, away: 52, method: 'statistical' as MethodType },
        cards: { home: 58, away: 62, method: 'ml' as MethodType },
        penalty: { home: 35, away: 28, method: 'heuristic' as MethodType },
        winner: { home: 52, away: 32, draw: 16, method: 'ml' as MethodType }
      }
    },
    control: {
      mainScenario: {
        insight: 'Com alta posse, Manchester City domina mas pode ter dificuldade para finalizar',
        confidence: 71,
        reasoning: 'Com 65%+ de posse, Man City cria mais chances mas Liverpool defende bem recuado (apenas 1.2 gols sofridos em média)'
      },
      probabilities: {
        goals: { home: 62, away: 38, method: 'statistical' as MethodType },
        cards: { home: 35, away: 48, method: 'ml' as MethodType },
        penalty: { home: 32, away: 18, method: 'heuristic' as MethodType },
        winner: { home: 64, away: 20, draw: 16, method: 'ml' as MethodType }
      }
    }
  };

  const matchData = {
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    ...scenarioData[activeScenario],
    metadata: {
      goals: {
        reasoning: 'Últimos cinco jogos do Man City em casa tiveram média de 2.8 gols marcados. Liverpool sofreu gols em 4 dos últimos 5 jogos fora de casa',
        source: 'baseado nos últimos 5 jogos'
      },
      cards: {
        reasoning: 'Liverpool tem histórico de jogo físico em confrontos diretos, com média de 3.2 cartões amarelos nos últimos 3 encontros',
        source: 'modelo de intensidade de jogo'
      },
      penalty: {
        reasoning: 'Últimos três confrontos entre estas equipes tiveram dois pênaltis. Man City pressiona muito na área adversária',
        source: 'baseado em confrontos diretos'
      },
      winner: {
        reasoning: 'Man City venceu 7 dos últimos 10 confrontos em casa. Liverpool está com 3 jogadores importantes lesionados',
        source: 'modelo de forma e condição do elenco'
      }
    }
  };

  const timelineEvents = [
    {
      minute: 12,
      type: 'goal' as const,
      probability: 72,
      description: 'Alta chance de gol do Manchester City',
      factors: [
        'Período de maior pressão ofensiva baseado em padrões históricos',
        'Liverpool geralmente leva 15min para se adaptar ao ritmo do Man City',
        'Média de 0.8 gols marcados pelo Man City entre 10-15 minutos'
      ]
    },
    {
      minute: 28,
      type: 'pressure' as const,
      probability: 65,
      description: 'Período de pressão intensa',
      factors: [
        'Pico de finalizações do Man City ocorre entre 25-35 minutos',
        'Liverpool tende a recuar neste período do jogo',
        'Maior número de escanteios e cruzamentos esperados'
      ]
    },
    {
      minute: 44,
      type: 'goal' as const,
      probability: 58,
      description: 'Janela de oportunidade antes do intervalo',
      factors: [
        'Times ficam mais vulneráveis nos últimos minutos do tempo',
        'Man City tem histórico de gols nos acréscimos do 1º tempo',
        'Pressão psicológica para pontuar antes do intervalo'
      ]
    },
    {
      minute: 67,
      type: 'defense' as const,
      probability: 55,
      description: 'Liverpool fortalece defesa após substituições',
      factors: [
        'Período típico de substituições defensivas',
        'Redução de 25% em gols sofridos após mudanças táticas',
        'Foco em segurar resultado ou buscar contra-ataque'
      ]
    },
    {
      minute: 82,
      type: 'goal' as const,
      probability: 68,
      description: 'Momento crítico - cansaço físico aumenta chances',
      factors: [
        'Defesas ficam mais vulneráveis após 80 minutos',
        '40% dos gols do Man City ocorrem nos últimos 15 minutos',
        'Espaços maiores devido ao desgaste físico'
      ]
    }
  ];

  const autoComments = [
    {
      text: 'O Manchester City tem 30% mais finalizações no primeiro tempo em jogos em casa. Fique de olho no início da partida.',
      type: 'insight' as const
    },
    {
      text: 'Liverpool está em tendência de queda defensiva, sofrendo gols em 4 dos últimos 5 jogos fora de casa.',
      type: 'trend' as const
    },
    {
      text: 'Atenção: Árbitro Antônio Miguel tem média de 4.2 cartões amarelos por jogo nesta temporada, acima da média da liga.',
      type: 'alert' as const
    }
  ];

  const matchHistory = {
    homeTeam: {
      name: 'Manchester City',
      recentForm: [
        { result: 'W' as const, score: '3-1' },
        { result: 'W' as const, score: '2-0' },
        { result: 'D' as const, score: '1-1' },
        { result: 'W' as const, score: '4-1' },
        { result: 'W' as const, score: '2-1' }
      ],
      offensiveTrend: [2, 3, 1, 4, 2],
      defensiveTrend: [1, 1, 1, 1, 0]
    },
    awayTeam: {
      name: 'Liverpool',
      recentForm: [
        { result: 'W' as const, score: '2-1' },
        { result: 'L' as const, score: '0-2' },
        { result: 'D' as const, score: '2-2' },
        { result: 'W' as const, score: '3-0' },
        { result: 'L' as const, score: '1-3' }
      ],
      offensiveTrend: [2, 0, 2, 3, 1],
      defensiveTrend: [1, 2, 2, 0, 3]
    },
    headToHead: {
      homeWins: 6,
      draws: 2,
      awayWins: 2
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-slate-900">Assistente de Partida</h1>
          <p className="text-slate-600">{matchData.homeTeam} vs {matchData.awayTeam}</p>
          <p className="text-sm text-slate-500">Premier League • Etihad Stadium • Hoje, 16:00</p>
        </div>

        {/* Main Scenario Card */}
        <MatchScenarioCard
          mainInsight={matchData.mainScenario.insight}
          confidence={matchData.mainScenario.confidence}
          reasoning={matchData.mainScenario.reasoning}
        />

        {/* Scenario Selector */}
        <ScenarioSelector
          activeScenario={activeScenario}
          onScenarioChange={setActiveScenario}
        />

        {/* Probabilities Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            <span className="text-xs uppercase tracking-wider text-slate-500">Probabilidades Contextuais</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          </div>

          <ProbabilityCarousel>
            <ProbabilityBar
              icon={Trophy}
              label="Vencedor da Partida"
              homeTeam={matchData.homeTeam}
              awayTeam={matchData.awayTeam}
              homeProbability={matchData.probabilities.winner.home}
              awayProbability={matchData.probabilities.winner.away}
              drawProbability={matchData.probabilities.winner.draw}
              color="winner"
              reasoning={matchData.metadata.winner.reasoning}
              source={matchData.metadata.winner.source}
              methodType={matchData.probabilities.winner.method}
            />

            <ProbabilityBar
              icon={Goal}
              label="Chance de Gol"
              homeTeam={matchData.homeTeam}
              awayTeam={matchData.awayTeam}
              homeProbability={matchData.probabilities.goals.home}
              awayProbability={matchData.probabilities.goals.away}
              color="goal"
              reasoning={matchData.metadata.goals.reasoning}
              source={matchData.metadata.goals.source}
              methodType={matchData.probabilities.goals.method}
            />

            <ProbabilityBar
              icon={AlertTriangle}
              label="Risco de Cartão Amarelo"
              homeTeam={matchData.homeTeam}
              awayTeam={matchData.awayTeam}
              homeProbability={matchData.probabilities.cards.home}
              awayProbability={matchData.probabilities.cards.away}
              color="card"
              reasoning={matchData.metadata.cards.reasoning}
              source={matchData.metadata.cards.source}
              methodType={matchData.probabilities.cards.method}
            />

            <ProbabilityBar
              icon={Flag}
              label="Chance de Pênalti"
              homeTeam={matchData.homeTeam}
              awayTeam={matchData.awayTeam}
              homeProbability={matchData.probabilities.penalty.home}
              awayProbability={matchData.probabilities.penalty.away}
              color="penalty"
              reasoning={matchData.metadata.penalty.reasoning}
              source={matchData.metadata.penalty.source}
              methodType={matchData.probabilities.penalty.method}
            />
          </ProbabilityCarousel>
        </div>

        {/* Event Timeline */}
        <EventTimeline events={timelineEvents} />

        {/* Auto Comments */}
        <AutoComments comments={autoComments} />

        {/* Match History */}
        <MatchHistory
          homeTeam={matchHistory.homeTeam}
          awayTeam={matchHistory.awayTeam}
          headToHead={matchHistory.headToHead}
        />

        {/* Help Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 p-6">
          <h3 className="text-slate-900 mb-3">Como Interpretar</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>• Passe o mouse sobre cada probabilidade para ver o racional detalhado</p>
            <p>• A confiança é calculada com base na consistência dos dados históricos</p>
            <p>• Cada previsão mostra o tipo de modelo usado (Estatístico, ML ou Heurístico)</p>
            <p>• Use o seletor de cenários para explorar como as probabilidades mudam em diferentes situações</p>
            <p>• Clique nos eventos da linha do tempo para ver detalhes dos momentos previstos</p>
          </div>
        </div>
      </div>
    </div>
  );
}