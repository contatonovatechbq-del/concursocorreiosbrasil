

# Plano: Reescrever textos dos upsells para linguagem clara e direta ao candidato

O problema atual: os textos usam jargao tecnico/burocratico que o publico-alvo nao entende ("ICP-Brasil", "Diario Oficial", "homologacao"). Precisa falar na linguagem do candidato que acabou de pagar a inscricao.

## Nova copy — focada no candidato

| # | Titulo | Valor | Headline | Descricao curta | Nota urgente |
|---|--------|-------|----------|-----------------|--------------|
| 1 | Confirmacao da Inscricao | 47 | SUA INSCRICAO PRECISA SER CONFIRMADA | "Voce fez a inscricao, mas ela ainda nao foi confirmada no sistema. Sem a confirmacao, sua vaga nao fica reservada." | Items: Confirmacao do seu nome na lista oficial, Reserva da sua vaga no concurso, Geracao do comprovante de inscricao, Envio da confirmacao por e-mail |
| 2 | Escolha do Local de Prova | 37 | ESCOLHA ONDE VOCE VAI FAZER A PROVA | "Pague esta taxa para garantir que voce faca a prova no local mais perto da sua casa. Quem nao paga, vai pra onde sobrar vaga." | Items: Prova no local mais proximo de voce, Sala com acessibilidade garantida, Voce recebe o endereco por e-mail e SMS, Prioridade na escolha |
| 3 | Cartao de Acesso a Prova | 39 | VOCE PRECISA DO CARTAO PRA ENTRAR NA PROVA | "Este cartao e o documento que voce apresenta no dia da prova. Sem ele, voce nao entra na sala." | Items: Documento com seu nome/foto e local da prova, QR Code pra entrada rapida, Versao digital no celular, Dados da sua sala e horario |
| 4 | Seguro do Candidato | 27 | PROTEJA SEU DINHEIRO — SEGURO DO CANDIDATO | "Se o concurso for cancelado ou adiado, voce recebe todo o dinheiro de volta. Sem o seguro, voce perde tudo que pagou." | Items: Reembolso de 100% se o concurso cancelar, Cobertura se a prova for adiada, Protecao contra erro no sistema, Suporte juridico se precisar |
| 5 | Apostila Digital Oficial | 33 | MATERIAL DE ESTUDO OFICIAL DO CONCURSO | "Apostila completa com todo o conteudo que cai na prova, feita pela banca organizadora. Quem estuda com material oficial tem mais chance de passar." | Items: Conteudo completo de todas as materias, Questoes comentadas de provas anteriores, Resumos e mapas mentais, Acesso imediato apos pagamento |
| 6 | Simulado Online da Banca | 24 | SIMULADO IDENTICO A PROVA REAL | "Faca um simulado no mesmo formato da prova real. Voce vai saber exatamente como vai ser no dia e nao vai ter surpresa." | Items: Mesmo tempo e formato da prova, Correcao automatica com gabarito, Ranking com outros candidatos, Pode refazer quantas vezes quiser |
| 7 | Certificado de Pre-Aprovacao | 19 | COMPROVE QUE VOCE ESTA APTO A FAZER A PROVA | "Documento que comprova que voce cumpriu todos os requisitos. Pode usar como comprovante no trabalho pra pedir folga no dia da prova." | Items: Certificado com seus dados e protocolo, Pode usar pra justificar falta no trabalho, Comprova que voce e candidato oficial, Valido como documento |
| 8 | Acompanhamento por SMS e E-mail | 15 | RECEBA TODOS OS AVISOS DO CONCURSO | "Fique sabendo de tudo: mudanca de data, local, gabarito, resultado. Quem nao se cadastra, perde prazo e perde vaga." | Items: Alerta de mudanca de data ou local, Gabarito no dia da prova, Resultado antes de todo mundo, Avisos importantes por SMS |
| 9 | Garantia de Vaga na Regiao | 97 | ULTIMA ETAPA — GARANTA SUA VAGA | "Essa e a ultima taxa. Com ela, voce garante que se passar, vai trabalhar na agencia mais perto da sua casa. Sem essa garantia, voce pode ser mandado pra qualquer lugar." | Items: Trabalhe na agencia mais perto de voce, Prioridade total na escolha da cidade, Acompanhamento VIP do processo, Inscricao 100% concluida |

## Arquivos a modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/UpsellInfo.tsx` | Trocar array UPSELL_INFO com novos titulos, headlines, items e notas |
| `src/pages/Upsell.tsx` | Sincronizar array UPSELLS com novos titulos e descricoes |

Logica, navegacao e tracking permanecem iguais. So muda o texto.

