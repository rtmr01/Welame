import { Layers, Zap, Shield } from 'lucide-react';

export type ScenarioType = 'standard' | 'pressure' | 'control';

interface ScenarioSelectorProps {
  activeScenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
}

export function ScenarioSelector({ activeScenario, onScenarioChange }: ScenarioSelectorProps) {
  const scenarios = [
    {
      id: 'standard' as ScenarioType,
      label: 'Cenário Padrão',
      description: 'Visão geral da partida',
      icon: Layers,
      color: 'base'
    },
    {
      id: 'pressure' as ScenarioType,
      label: 'Sob Pressão',
      description: 'Time perdendo cedo',
      icon: Zap,
      color: 'highlight'
    },
    {
      id: 'control' as ScenarioType,
      label: 'Controle de Jogo',
      description: 'Alta posse de bola',
      icon: Shield,
      color: 'teal'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      base: {
        bg: isActive ? 'bg-[#1C1F5A]' : 'bg-white hover:bg-[#1C1F5A]/5',
        text: isActive ? 'text-white' : 'text-[#1C1F5A]',
        border: isActive ? 'border-[#1C1F5A]' : 'border-[#1C1F5A]/20 hover:border-[#1C1F5A]/35',
        iconBg: isActive ? 'bg-[#3241a4]' : 'bg-[#1C1F5A]/10'
      },
      highlight: {
        bg: isActive ? 'bg-[#00D26A]' : 'bg-white hover:bg-[#00D26A]/8',
        text: isActive ? 'text-[#0a2f1f]' : 'text-[#0f8a4a]',
        border: isActive ? 'border-[#00D26A]' : 'border-[#00D26A]/35 hover:border-[#00D26A]/55',
        iconBg: isActive ? 'bg-[#00b95d]' : 'bg-[#00D26A]/15'
      },
      teal: {
        bg: isActive ? 'bg-[#1a7e90]' : 'bg-white hover:bg-[#1a7e90]/8',
        text: isActive ? 'text-white' : 'text-[#1a7e90]',
        border: isActive ? 'border-[#1a7e90]' : 'border-[#1a7e90]/30 hover:border-[#1a7e90]/45',
        iconBg: isActive ? 'bg-[#116474]' : 'bg-[#1a7e90]/15'
      }
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Layers className="w-4 h-4 text-[#1C1F5A]" />
        <h3 className="text-[#1C1F5A]">Explorar Cenários</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {scenarios.map((scenario) => {
          const isActive = activeScenario === scenario.id;
          const Icon = scenario.icon;
          const colors = getColorClasses(scenario.color, isActive);

          return (
            <button
              key={scenario.id}
              onClick={() => onScenarioChange(scenario.id)}
              className={`${colors.bg} ${colors.border} border rounded-xl p-4 transition-all duration-200 ${
                isActive ? 'shadow-lg scale-105' : 'shadow-sm hover:shadow-md'
              } text-left`}
            >
              <div className="flex items-start gap-3">
                <div className={`${colors.iconBg} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium mb-1 ${colors.text}`}>{scenario.label}</h4>
                  <p className={`text-xs ${isActive ? 'text-white/90' : 'text-slate-600'}`}>
                    {scenario.description}
                  </p>
                </div>
              </div>

              {isActive && (
                <div className="mt-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-xs text-white/90">Ativo</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white/80 border border-[#1C1F5A]/20 rounded-lg p-3">
        <p className="text-xs text-[#1C1F5A] leading-relaxed">
          💡 Alterne entre cenários para ver como as probabilidades mudam em diferentes situações de jogo
        </p>
      </div>
    </div>
  );
}
