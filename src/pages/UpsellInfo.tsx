import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FileCheck, FileText, Shield, MapPin, CreditCard, Fingerprint, BookOpen, CheckSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const UPSELL_INFO = [
  { title: "Taxa de Homologação da Inscrição", valor: 47, icon: FileCheck, headline: "HOMOLOGAÇÃO OBRIGATÓRIA DA INSCRIÇÃO", items: ["Validação de todos os documentos apresentados", "Verificação de elegibilidade no sistema federal", "Sincronização com base de dados do Ministério da Gestão", "Emissão do número de homologação definitivo", "Registro no sistema integrado da banca IBFC"], nota: "Sem a homologação, a inscrição será automaticamente CANCELADA em 24 horas." },
  { title: "Taxa de Processamento do Edital", valor: 37, icon: FileText, headline: "PROCESSAMENTO EXIGIDO PELO EDITAL", items: ["Processamento digital da inscrição no sistema federal", "Geração do número de protocolo definitivo", "Vinculação ao banco de dados oficial da banca", "Registro no sistema eletrônico dos Correios"], nota: "Inscrições sem processamento ficam com status PENDENTE e podem ser indeferidas." },
  { title: "Seguro Obrigatório do Candidato", valor: 39, icon: Shield, headline: "SEGURO OBRIGATÓRIO — EXIGIDO PELO EDITAL", items: ["Reembolso integral em caso de cancelamento do concurso", "Cobertura por adiamento superior a 60 dias", "Proteção contra indeferimento por falha do sistema", "Assistência jurídica para recurso administrativo"], nota: "Conforme item 8.3 do edital, o seguro é condição para efetivação da inscrição." },
  { title: "Taxa de Alocação de Local de Prova", valor: 27, icon: MapPin, headline: "ALOCAÇÃO DO LOCAL DE PROVA", items: ["Reserva de vaga no local mais próximo da sua residência", "Garantia de sala com infraestrutura adequada", "Alocação prioritária por ordem de pagamento", "Confirmação do endereço por e-mail e SMS"], nota: "Candidatos sem alocação serão direcionados para locais com vagas remanescentes." },
  { title: "Taxa de Emissão do Cartão de Confirmação", valor: 33, icon: CreditCard, headline: "CARTÃO DE CONFIRMAÇÃO — ACESSO À PROVA", items: ["Documento obrigatório para entrada no local de prova", "Contém QR Code de validação biométrica", "Dados do candidato, local, sala e horário", "Versão digital disponível no sistema"], nota: "ATENÇÃO: Sem o Cartão de Confirmação, o candidato será IMPEDIDO de realizar a prova." },
  { title: "Taxa de Autenticação Digital", valor: 24, icon: Fingerprint, headline: "AUTENTICAÇÃO DIGITAL ICP-BRASIL", items: ["Assinatura eletrônica com certificado ICP-Brasil", "Validação jurídica da inscrição", "Registro com carimbo de tempo oficial", "Conformidade com a legislação de documentos digitais"], nota: "Autenticação exigida pela Instrução Normativa nº 65/2024 do Governo Federal." },
  { title: "Taxa de Registro no Diário Oficial", valor: 19, icon: BookOpen, headline: "PUBLICAÇÃO NO DIÁRIO OFICIAL ELETRÔNICO", items: ["Registro oficial da inscrição no DOU", "Publicação do nome na lista de inscritos", "Comprovante com número de publicação", "Validade jurídica perante órgãos públicos"], nota: "Publicação obrigatória conforme Art. 37 da Constituição Federal." },
  { title: "Taxa de Protocolo Final", valor: 15, icon: CheckSquare, headline: "ENCERRAMENTO DO PROTOCOLO DE INSCRIÇÃO", items: ["Homologação definitiva de todos os dados", "Geração do protocolo final de inscrição", "Inclusão na lista oficial de candidatos aptos", "Encerramento do processo no sistema"], nota: "Após o pagamento, o protocolo será encerrado e a inscrição será DEFINITIVA." },
  { title: "Garantia de Vaga na Região", valor: 97, icon: Star, headline: "GARANTIA DE VAGA — ÚLTIMA ETAPA", items: ["Prioridade absoluta na escolha da agência de lotação", "Garantia de vaga na região metropolitana selecionada", "Preferência na alocação geográfica após aprovação", "Acompanhamento prioritário de todo o processo seletivo"], nota: "ATENÇÃO: Esta é a última taxa. Após o pagamento, sua inscrição estará 100% CONCLUÍDA." },
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
      <CorreiosHeader breadcrumb="Concursos > Inscrição > Taxas" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg">{info.headline}</h1>

          {/* Items table */}
          <table className="tabela-zebra">
            <thead>
              <tr><th>Detalhamento da Taxa</th></tr>
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
            <p className="font-semibold text-destructive">⚠ IMPORTANTE:</p>
            <p>• {info.nota}</p>
            <p>• Pagamento via PIX com confirmação instantânea.</p>
          </div>

          {/* Valor */}
          <div className="rounded border-2 border-destructive bg-destructive/10 p-4 text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">Valor da Taxa</p>
            <p className="text-3xl font-black text-primary">
              R$ {valorComCentavos.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <Button onClick={handlePagar} className="w-full h-12 text-sm font-bold">
            PAGAR TAXA AGORA
          </Button>

          <p className="text-[10px] text-center text-destructive font-semibold">
            O não pagamento desta taxa pode resultar no cancelamento da inscrição.
          </p>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default UpsellInfo;
