import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
  cumulativePercentage: number;
}

interface FunnelTableProps {
  steps: FunnelStep[];
}

const getDropoffVariant = (dropoff: number): "default" | "secondary" | "destructive" => {
  if (dropoff < 10) return "default";
  if (dropoff < 20) return "secondary";
  return "destructive";
};

const getDropoffTextColor = (dropoff: number): string => {
  if (dropoff < 10) return "text-green-600";
  if (dropoff < 20) return "text-yellow-600";
  return "text-red-600";
};

const FunnelTable = ({ steps }: FunnelTableProps) => {
  if (!steps.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dado disponível para o período selecionado
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">#</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead className="text-right">Usuários</TableHead>
            <TableHead className="text-right">% do Total</TableHead>
            <TableHead className="text-right">Drop-off</TableHead>
            <TableHead className="text-right">Perda Absoluta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map((step, index) => {
            const isFirst = index === 0;
            const prevCount = isFirst ? step.count : steps[index - 1].count;
            const absoluteLoss = prevCount - step.count;

            return (
              <TableRow key={step.name}>
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">{step.name}</TableCell>
                <TableCell className="text-right font-semibold">
                  {step.count.toLocaleString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                  {step.cumulativePercentage.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {isFirst ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`${getDropoffTextColor(step.dropoff)} border-current`}
                    >
                      -{step.dropoff.toFixed(1)}%
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isFirst ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <span className="text-red-500">
                      -{absoluteLoss.toLocaleString("pt-BR")}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default FunnelTable;
