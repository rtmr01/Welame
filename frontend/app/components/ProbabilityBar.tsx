import { LucideIcon, BarChart3, Brain, Settings } from 'lucide-react';
import { useState } from 'react';

export type MethodType = 'statistical' | 'ml' | 'heuristic';

interface ProbabilityBarProps {
  icon: LucideIcon;
  label: string;
  homeTeam: string;
  awayTeam: string;
  homeProbability: number;
  awayProbability: number;
  drawProbability?: number;
  color: 'goal' | 'card' | 'penalty' | 'winner';
  reasoning: string;
  source: string;
  methodType?: MethodType;
}

export function ProbabilityBar({
  icon: Icon,
  label,
  homeTeam,
  awayTeam,
  homeProbability,
  awayProbability,
  drawProbability,
  color,
  reasoning,
  source,
  methodType = 'statistical'
}: ProbabilityBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getMethodBadge = (type: MethodType) => {
    const badges = {
      statistical: {
        icon: BarChart3,
        label: 'Base histórica',
        color: 'bg-[#1C1F5A]/10 text-[#1C1F5A] border-[#1C1F5A]/20'
      },
      ml: {
        icon: Brain,
        label: 'Leitura avançada',
        color: 'bg-[#00D26A]/10 text-[#0f8a4a] border-[#00D26A]/30'
      },
      heuristic: {
        icon: Settings,
        label: 'Ajuste de contexto',
        color: 'bg-slate-100 text-slate-700 border-slate-200'
      }
    };
    return badges[type];
  };

  const methodBadge = getMethodBadge(methodType);
  const MethodIcon = methodBadge.icon;

  const getColorClasses = (type: typeof color, isHome: boolean) => {
    const colorMap = {
      goal: isHome ? 'bg-gradient-to-r from-[#1C1F5A] to-indigo-600' : 'bg-gradient-to-r from-[#32409a] to-[#1C1F5A]',
      card: 'bg-gradient-to-r from-[#f59e0b] to-[#d97706]',
      penalty: 'bg-gradient-to-r from-[#ef4444] to-[#be123c]',
      winner: isHome ? 'bg-gradient-to-r from-[#00D26A] to-emerald-500' : 'bg-gradient-to-r from-[#1C1F5A] to-[#3140a3]'
    };
    return colorMap[type];
  };

  const total = homeProbability + awayProbability + (drawProbability || 0);
  const homeWidth = (homeProbability / total) * 100;
  const drawWidth = drawProbability ? (drawProbability / total) * 100 : 0;
  const awayWidth = (awayProbability / total) * 100;

  return (
    <div className="relative group">
      <div
        className="bg-white rounded-xl border border-[#1C1F5A]/15 p-4 transition-all duration-200 hover:shadow-md hover:border-[#1C1F5A]/30 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-[#1C1F5A]/10">
            <Icon className="w-5 h-5 text-[#1C1F5A]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[#1C1F5A]">{label}</h3>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${methodBadge.color}`}>
                <MethodIcon className="w-3 h-3" />
                <span>{methodBadge.label}</span>
              </div>
            </div>
            <p className="text-xs text-[#1C1F5A]/65">{source}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#1C1F5A]/75">{homeTeam}</span>
            <span className="text-[#1C1F5A]">{homeProbability}%</span>
          </div>

          <div className="h-3 bg-[#1C1F5A]/10 rounded-full overflow-hidden flex">
            <div
              className={`${getColorClasses(color, true)} transition-all duration-500 ease-out`}
              style={{ width: `${homeWidth}%` }}
            />
            {drawProbability && drawProbability > 0 && (
              <div
                className="bg-gradient-to-r from-slate-300 to-slate-400 transition-all duration-500 ease-out"
                style={{ width: `${drawWidth}%` }}
              />
            )}
            <div
              className={`${getColorClasses(color, false)} transition-all duration-500 ease-out`}
              style={{ width: `${awayWidth}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#1C1F5A]/75">{awayTeam}</span>
            <span className="text-[#1C1F5A]">{awayProbability}%</span>
          </div>

          {drawProbability && drawProbability > 0 && (
            <div className="flex items-center justify-center text-xs text-[#1C1F5A]/65 pt-1 border-t border-[#1C1F5A]/10">
              Empate: {drawProbability}%
            </div>
          )}
        </div>
      </div>

      {showTooltip && (
        <div className="absolute z-50 left-0 right-0 -bottom-2 translate-y-full">
          <div className="bg-[#1C1F5A] text-white text-sm rounded-lg p-3 shadow-xl max-w-sm mx-auto">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-[#00D26A] mt-1.5 flex-shrink-0" />
              <p className="leading-relaxed">{reasoning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
