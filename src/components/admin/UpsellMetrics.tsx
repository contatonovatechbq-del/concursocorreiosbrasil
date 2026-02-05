import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface UpsellData {
  number: number;
  count: number;
  rate: number;
}

interface UpsellMetricsProps {
  upsells: UpsellData[];
  baseCount: number; // Count from "Saque" step to calculate rate
}

const UpsellMetrics = ({ upsells, baseCount }: UpsellMetricsProps) => {
  if (!upsells.length) {
    return null;
  }

  const totalUpsells = upsells.reduce((sum, u) => sum + u.count, 0);
  const avgRate = baseCount > 0 ? (totalUpsells / (baseCount * upsells.length)) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Métricas de Upsell</CardTitle>
        <CardDescription>
          Taxa de aceitação por upsell (base: {baseCount.toLocaleString("pt-BR")} saques)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {upsells.map((upsell) => {
            const isGood = upsell.rate >= avgRate;
            
            return (
              <div
                key={upsell.number}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-center"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  Upsell {upsell.number}
                </p>
                <p className="text-2xl font-bold">{upsell.count}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {isGood ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isGood ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {upsell.rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Total de upsells:</span>{" "}
            <span className="font-semibold">{totalUpsells.toLocaleString("pt-BR")}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Taxa média:</span>{" "}
            <span className="font-semibold">{avgRate.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpsellMetrics;
