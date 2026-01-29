import { CPFData } from "@/lib/cpf";
import { User, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface CPFResultProps {
  data: CPFData;
}

export function CPFResult({ data }: CPFResultProps) {
  const isRegular = data.situacao.toLowerCase().includes('regular');
  const isPendente = data.situacao.toLowerCase().includes('pendente');

  const getStatusIcon = () => {
    if (isRegular) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (isPendente) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = () => {
    if (isRegular) return 'bg-green-100 text-green-800 border-green-200';
    if (isPendente) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div className="text-center mb-6">
        <span className="text-sm text-muted-foreground">CPF Consultado</span>
        <p className="text-xl font-semibold text-foreground">{data.cpf}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <User className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <span className="text-xs text-muted-foreground block">Nome Completo</span>
            <span className="font-medium text-foreground">{data.nome}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Calendar className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <span className="text-xs text-muted-foreground block">Data de Nascimento</span>
            <span className="font-medium text-foreground">{data.dataNascimento}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          {getStatusIcon()}
          <div className="flex-1">
            <span className="text-xs text-muted-foreground block">Situação Cadastral</span>
            <span className={`inline-flex px-2 py-0.5 rounded text-sm font-medium border ${getStatusColor()}`}>
              {data.situacao}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
