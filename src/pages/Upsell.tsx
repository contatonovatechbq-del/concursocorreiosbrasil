import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankFooter from "@/components/WillBankFooter";
import UpsellStep from "@/components/UpsellStep";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

// Define the 8 upsells with judicial context
const UPSELLS = [
  {
    valor: 14.21,
    title: "Taxa de Prioridade Judicial",
    description: "Garante prioridade na fila de pagamentos do Tribunal, recebendo antes dos demais credores.",
  },
  {
    valor: 32.98,
    title: "Seguro de Execução Judicial",
    description: "Seguro obrigatório exigido pelo BACEN para proteger transferências judiciais acima de R$ 3.000.",
  },
  {
    valor: 21.30,
    title: "Taxa de Homologação do BACEN",
    description: "Homologação do Banco Central para validar a origem legal dos valores liberados pelo Tribunal.",
  },
  {
    valor: 28.83,
    title: "Certidão de Autenticidade Judicial",
    description: "Documento judicial que certifica a legalidade e procedência da sua ordem de pagamento.",
  },
  {
    valor: 13.23,
    title: "Taxa de Urgência Processual",
    description: "Acelera o processamento judicial para liberação em até 6 horas após pagamento.",
  },
  {
    valor: 11.00,
    title: "Seguro de Fraude Processual",
    description: "Proteção contra tentativas de fraude no processo de liquidação judicial.",
  },
  {
    valor: 8.83,
    title: "Taxa de Encerramento do Processo",
    description: "Taxa para encerramento formal do processo no sistema do Tribunal de Justiça.",
  },
  {
    valor: 142.00,
    title: "Taxa de Sentença Final do Tribunal",
    description: "OBRIGATÓRIO: Última taxa judicial exigida para execução da sentença. Sem pagamento, o processo será arquivado e você PERDERÁ o direito aos valores.",
  },
];

const Upsell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();
  
  // Parse step number (1-7), default to 1. Handle NaN case.
  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 8);
  const currentIndex = stepNumber - 1;
  const currentUpsell = UPSELLS[currentIndex];

  // Try to get data from location state or session
  const session = getSession();
  const cpfData: CPFData | undefined = location.state?.cpfData || session?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio || session?.valorBeneficio;
  const protocolo: string | undefined = location.state?.protocolo || session?.protocolo;

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stepNumber]);

  // Redirect if no data
  useEffect(() => {
    if (!cpfData || !valorBeneficio) {
      navigate("/");
      return;
    }

    // Save session with current upsell step
    saveSession({ 
      cpfData, 
      currentStep: `/upsell/${stepNumber}`, 
      valorBeneficio, 
      protocolo 
    });
    
    // Track funnel event
    trackFunnelEvent(`upsell-${stepNumber}`, { cpf: cpfData.cpf });
  }, [cpfData, valorBeneficio, protocolo, navigate, stepNumber]);

  const handlePaymentConfirmed = () => {
    const stateData = {
      cpfData,
      valorBeneficio,
      protocolo,
    };

    if (stepNumber < 8) {
      // Navigate to next upsell page
      navigate(buildUrlWithUtm(`/upsell/${stepNumber + 1}`), { state: stateData });
    } else {
      // After upsell 8, go back to upsell 1
      navigate(buildUrlWithUtm("/upsell/1"), { state: stateData });
    }
  };

  if (!cpfData || !valorBeneficio) return null;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <WillBankHeader 
        userName={cpfData.nome.split(' ')[0].toUpperCase()} 
        breadcrumb={`Liquidação Judicial > Taxas Obrigatórias > Etapa ${stepNumber}/8`}
      />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <UpsellStep
          key={stepNumber}
          title={currentUpsell.title}
          description={currentUpsell.description}
          valor={currentUpsell.valor}
          cpfData={cpfData}
          protocolo={protocolo || `WB${Date.now()}`}
          onPaymentConfirmed={handlePaymentConfirmed}
          stepNumber={stepNumber}
          totalSteps={8}
        />
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Upsell;
