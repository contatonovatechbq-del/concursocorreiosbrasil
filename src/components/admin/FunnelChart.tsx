import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
  cumulativePercentage: number;
}

interface FunnelChartProps {
  steps: FunnelStep[];
}

const getDropoffColor = (dropoff: number): string => {
  if (dropoff < 10) return "bg-green-500";
  if (dropoff < 20) return "bg-yellow-500";
  return "bg-red-500";
};

const getDropoffTextColor = (dropoff: number): string => {
  if (dropoff < 10) return "text-green-600";
  if (dropoff < 20) return "text-yellow-600";
  return "text-red-600";
};

const getBarColor = (dropoff: number): string => {
  if (dropoff < 10) return "from-green-500/80 to-green-400/60";
  if (dropoff < 20) return "from-yellow-500/80 to-yellow-400/60";
  return "from-red-500/80 to-red-400/60";
};

const FunnelChart = ({ steps }: FunnelChartProps) => {
  if (!steps.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dado disponível para o período selecionado
      </div>
    );
  }

  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const barWidth = (step.count / maxCount) * 100;
          const isFirst = index === 0;

          return (
            <Tooltip key={step.name}>
              <TooltipTrigger asChild>
                <div className="group relative flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  {/* Bar container */}
                  <div className="relative flex-1 min-w-0">
                    {/* Background bar (gray reference) */}
                    <div className="absolute inset-0 h-10 bg-muted/30 rounded" />
                    
                    {/* Actual bar */}
                    <div
                      className={`relative h-10 rounded bg-gradient-to-r ${
                        isFirst
                          ? "from-primary to-primary/70"
                          : getBarColor(step.dropoff)
                      } transition-all duration-500 ease-out`}
                      style={{ width: `${barWidth}%`, minWidth: "2rem" }}
                    >
                      {/* Step name inside bar */}
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="font-medium text-white text-sm truncate drop-shadow-sm">
                          {step.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Count */}
                    <span className="text-lg font-bold w-16 text-right">
                      {step.count.toLocaleString("pt-BR")}
                    </span>

                    {/* Cumulative percentage */}
                    <span className="text-sm text-muted-foreground w-14 text-right">
                      ({step.cumulativePercentage.toFixed(1)}%)
                    </span>

                    {/* Drop-off badge */}
                    {!isFirst && (
                      <Badge
                        variant="outline"
                        className={`w-16 justify-center ${getDropoffTextColor(
                          step.dropoff
                        )} border-current`}
                      >
                        -{step.dropoff.toFixed(1)}%
                      </Badge>
                    )}
                    {isFirst && <div className="w-16" />}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">{step.name}</p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Usuários:</span>{" "}
                    {step.count.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">
                      % desde o início:
                    </span>{" "}
                    {step.cumulativePercentage.toFixed(1)}%
                  </p>
                  {!isFirst && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">
                        Perda da etapa anterior:
                      </span>{" "}
                      <span className={getDropoffTextColor(step.dropoff)}>
                        {step.dropoff.toFixed(1)}%
                      </span>
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Drop-off &lt; 10%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Drop-off 10-20%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Drop-off &gt; 20%</span>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default FunnelChart;
