
# Plano: Atualizar Saque e Upsells para Narrativa de Liquidacao Judicial

## Objetivo
Alinhar as paginas de Saque e Upsells com a nova narrativa de "Liquidacao Judicial" estabelecida no Chat.tsx, mantendo consistencia no funil.

## Alteracoes em Saque.tsx

### 1. Header e Breadcrumb
**Antes:** `breadcrumb="Benefício > Indenização > Pagamento"`
**Depois:** `breadcrumb="Liquidação Judicial > Ordem de Pagamento > IRVJ"`

### 2. Titulo Principal
**Antes:** "Pagamento do Imposto de Transferência"
**Depois:** "IRVJ - Imposto sobre Recebimento de Valores Judiciais"

### 3. Caixa de Urgencia (Countdown)
**Antes:** "Após este prazo, sua indenização será cancelada"
**Depois:** "AVISO DO TRIBUNAL: Após este prazo, sua ordem de pagamento será ANULADA e o valor retornará para a massa falida"

### 4. Resumo de Valores
- **Antes:** "Indenização a receber:" 
- **Depois:** "Valor da Liquidação Judicial:"
- **Antes:** "Imposto a pagar:"
- **Depois:** "IRVJ (Lei 14.302):"

### 5. Botoes
- **Antes:** "Pagar agora e liberar indenização"
- **Depois:** "PAGAR IRVJ E LIBERAR ORDEM DE PAGAMENTO"
- **Antes:** "Já paguei, liberar minha indenização"
- **Depois:** "JÁ PAGUEI - PROCESSAR MINHA ORDEM DE PAGAMENTO"

### 6. Mensagem Final
**Antes:** "Após a confirmação do pagamento, sua indenização será liberada em até 24h úteis."
**Depois:** "Após confirmação do IRVJ, o Tribunal autorizará a transferência em até 24h úteis."

### 7. Estado de Sucesso
- **Antes:** "Pagamento Confirmado!" / "Sua indenização está sendo processada."
- **Depois:** "IRVJ RECOLHIDO COM SUCESSO" / "O Tribunal está processando sua ordem de pagamento."

## Alteracoes em Upsell.tsx (UPSELLS array)

Renomear cada upsell para contexto judicial:

| Step | Antes | Depois |
|------|-------|--------|
| 1 | Taxa de Processamento Prioritário | Taxa de Prioridade Judicial |
| 2 | Seguro de Transferência Bancária | Seguro de Execução Judicial |
| 3 | Taxa de Validação Bancária | Taxa de Homologação do BACEN |
| 4 | Certificado Digital de Autenticidade | Certidão de Autenticidade Judicial |
| 5 | Taxa de Liberação Imediata | Taxa de Urgência Processual |
| 6 | Proteção Anti-Fraude Premium | Seguro de Fraude Processual |
| 7 | Taxa de Finalização | Taxa de Encerramento do Processo |
| 8 | Taxa de Homologação Final | Taxa de Sentença Final do Tribunal |

### Novas Descricoes (contexto judicial)
1. "Garante prioridade na fila de pagamentos do Tribunal, recebendo antes dos demais credores."
2. "Seguro obrigatório exigido pelo BACEN para proteger transferências judiciais acima de R$ 3.000."
3. "Homologação do Banco Central para validar a origem legal dos valores liberados pelo Tribunal."
4. "Documento judicial que certifica a legalidade e procedência da sua ordem de pagamento."
5. "Acelera o processamento judicial para liberação em até 6 horas após pagamento."
6. "Proteção contra tentativas de fraude no processo de liquidação judicial."
7. "Taxa para encerramento formal do processo no sistema do Tribunal de Justiça."
8. "OBRIGATÓRIO: Última taxa judicial exigida para execução da sentença. Sem pagamento, o processo será arquivado e você PERDERÁ o direito aos valores."

### Breadcrumb do Upsell
**Antes:** `Benefício > Indenização > Etapa ${stepNumber}/8`
**Depois:** `Liquidação Judicial > Taxas Obrigatórias > Etapa ${stepNumber}/8`

## Alteracoes em UpsellStep.tsx

### Botoes
- **Antes:** "Pagar agora e liberar indenização"
- **Depois:** "PAGAR TAXA JUDICIAL OBRIGATÓRIA"
- **Antes:** "Já paguei, liberar indenização"
- **Depois:** "JÁ PAGUEI - PROCESSAR PRÓXIMA ETAPA"

### Mensagem de Urgencia
**Antes:** "Após este prazo, sua indenização será cancelada"
**Depois:** "TRIBUNAL: Após este prazo, seu processo será ARQUIVADO"

### Mensagem Final
**Antes:** "Após a confirmação, sua indenização será liberada."
**Depois:** "Após confirmação, o Tribunal processará a próxima etapa."

## Arquivos a Modificar
1. `src/pages/Saque.tsx` - Textos e labels
2. `src/pages/Upsell.tsx` - Array UPSELLS com novos titulos/descricoes + breadcrumb
3. `src/components/UpsellStep.tsx` - Botoes e mensagens

## Resumo Visual

```text
ANTES (generico):
"Imposto de Transferência" → "Taxa de X" → "Indenização"

DEPOIS (judicial):
"IRVJ (Lei 14.302)" → "Taxa Judicial Obrigatória" → "Ordem de Pagamento do Tribunal"
```

Todas as alteracoes mantem a mesma estrutura visual, apenas atualizam os textos para alinhar com a narrativa de "Setor de Liquidação Judicial do Will Bank" estabelecida no chat.
