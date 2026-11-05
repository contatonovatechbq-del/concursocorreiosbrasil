import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Mail, Store } from "lucide-react";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { getSession } from "@/hooks/useSessionPersistence";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { CARGOS, CargoId, setCargo } from "@/lib/cargo";

const opcoes: { id: CargoId; icon: typeof Mail }[] = [
  { id: "atendente-comercial", icon: Store },
  { id: "carteiro", icon: Mail },
];

const SelecionarCargo = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session?.cpfData && session?.currentStep && session.currentStep !== "/") {
      navigate(buildUrlWithUtm(session.currentStep), { state: { cpfData: session.cpfData, valorBeneficio: session.valorBeneficio, protocolo: session.protocolo }, replace: true });
    } else {
      trackFunnelEvent("landing");
    }
  }, [navigate]);

  const escolher = (id: CargoId) => {
    setCargo(id);
    navigate(buildUrlWithUtm(`/${id}`));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Correios 2026" />
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="titulo-institucional text-lg sm:text-xl">CONCURSO NACIONAL — CORREIOS 2026</h1>
            <p className="text-sm text-muted-foreground mt-1">Edital Nº 001/2026 — Nível Médio | Selecione o cargo desejado</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {opcoes.map(({ id, icon: Icon }) => {
              const c = CARGOS[id];
              return (
                <button
                  key={id}
                  onClick={() => escolher(id)}
                  className="text-left border border-border rounded bg-card p-5 hover:border-primary transition-colors space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/15 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">{c.nome}</h2>
                      <p className="text-xs text-muted-foreground">{c.escolaridade}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.descricao}</p>
                  <div className="text-xs space-y-1">
                    <p><span className="font-semibold">Vagas:</span> {c.vagas}</p>
                    <p><span className="font-semibold">Remuneração:</span> {c.remuneracaoCurta}</p>
                    <p><span className="font-semibold">Carga horária:</span> {c.cargaHoraria}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs font-bold text-success">Inscrições abertas</span>
                    <span className="text-sm font-bold text-accent flex items-center">Ver cargo <ChevronRight className="w-4 h-4" /></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
      <CorreiosFooter />
    </div>
  );
};

export default SelecionarCargo;
