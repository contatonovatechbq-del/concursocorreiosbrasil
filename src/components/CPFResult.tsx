import { CPFData } from "@/lib/cpf";
import { User, Calendar, Users, UserCircle } from "lucide-react";

interface CPFResultProps {
  data: CPFData;
}

export function CPFResult({ data }: CPFResultProps) {
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
          <Users className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <span className="text-xs text-muted-foreground block">Nome da Mãe</span>
            <span className="font-medium text-foreground">{data.nomeMae}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <UserCircle className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <span className="text-xs text-muted-foreground block">Sexo</span>
            <span className="font-medium text-foreground">{data.sexo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
