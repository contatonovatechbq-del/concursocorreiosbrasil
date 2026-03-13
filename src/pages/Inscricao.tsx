import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CPFInput } from "@/components/CPFInput";
import { validateCPF, unformatCPF, consultarCPF } from "@/lib/cpf";
import { ShieldCheck, Loader2, AlertTriangle, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import CorreiosCard from "@/components/CorreiosCard";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const Inscricao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cepData = location.state?.cepData;

  useEffect(() => {
    trackFunnelEvent('inscricao-cpf');
    window.scrollTo(0, 0);
  }, []);

  const handleConsultar = async () => {
    setError("");
    const cpfNumbers = unformatCPF(cpf);

    if (cpfNumbers.length !== 11) {
      setError("Digite um CPF completo com 11 dígitos");
      return;
    }
    if (!validateCPF(cpf)) {
      setError("CPF inválido. Verifique os números digitados.");
      return;
    }

    setLoading(true);
    try {
      const data = await consultarCPF(cpf);
      navigate(buildUrlWithUtm("/confirma-dados"), { state: { cpfData: data, cepData } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao consultar CPF";
      toast({ title: "Erro na consulta", description: message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Agente de Correios > Inscrição > CPF" />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <CorreiosCard className="w-full max-w-md">
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full gradient-correios flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Verificação do Candidato
              </h1>
              <p className="text-sm text-muted-foreground">
                Informe seu CPF para verificar elegibilidade e prosseguir com a inscrição no concurso
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CPF do Candidato</label>
              <CPFInput value={cpf} onChange={setCpf} disabled={loading} error={!!error} />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 p-2.5 rounded-lg">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleConsultar}
              disabled={loading || unformatCPF(cpf).length < 11}
              className="w-full h-12 text-sm font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verificando elegibilidade...
                </>
              ) : (
                "Verificar e Continuar"
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Dados protegidos conforme LGPD</span>
            </div>
          </div>
        </CorreiosCard>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default Inscricao;
