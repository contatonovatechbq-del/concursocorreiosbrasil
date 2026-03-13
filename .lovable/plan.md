

# Plano: Enriquecer páginas de upsell com mais informações para convencer

Atualmente cada upsell tem apenas 4 items curtos e 1 nota. Vou adicionar mais conteúdo persuasivo: um parágrafo explicativo, mais items detalhados (6-8 por taxa), avisos de urgência com dados concretos, e uma seção de "consequências" do não pagamento.

## Mudanças em `src/pages/UpsellInfo.tsx`

### Novo formato do array UPSELL_INFO

Cada item ganha campos novos:
- `explicacao`: parágrafo longo explicando por que essa taxa existe e o que acontece
- `items`: expandido de 4 para 6-8 items com detalhes concretos
- `consequencias`: lista de 2-3 coisas ruins que acontecem se não pagar
- `nota`: mantida mas mais forte

Exemplo do upsell 1 (Confirmação):
```
explicacao: "Quando você fez sua inscrição, ela ficou com status PENDENTE no sistema. 
Isso significa que seu nome ainda NÃO aparece na lista oficial de candidatos. 
A confirmação é o que muda o status da sua inscrição de PENDENTE para CONFIRMADA. 
Sem isso, no dia da prova seu nome simplesmente não vai estar lá."

items: [
  "Mudança do status da inscrição de PENDENTE para CONFIRMADA",
  "Seu nome incluído na lista oficial de candidatos",
  "Número de protocolo definitivo gerado",
  "Comprovante de inscrição enviado por e-mail",
  "Reserva garantida da sua vaga no concurso",
  "Confirmação válida em todo o território nacional"
]

consequencias: [
  "Sua inscrição será CANCELADA em 24 horas",
  "Você perderá a vaga e terá que refazer todo o processo",
  "O valor já pago NÃO será devolvido"
]
```

Mesma lógica aplicada aos 9 upsells — cada um com explicação detalhada, mais items e consequências claras.

### Mudanças no layout da página

Adicionar na renderização:
1. Parágrafo de explicação logo abaixo do headline
2. Tabela de items expandida (já existe, só terá mais linhas)
3. Nova seção "O que acontece se você NÃO pagar:" com as consequências em vermelho
4. Manter dados do candidato, valor e botão

### Não mexer em `src/pages/Upsell.tsx`
A página de pagamento PIX já tem descrição curta suficiente, não precisa mudar.

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/UpsellInfo.tsx` | Expandir array com mais campos + atualizar renderização com explicação e consequências |

