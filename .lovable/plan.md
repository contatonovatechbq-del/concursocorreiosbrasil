

## Plano: Corrigir UTMs nos upsells + valores variados por step

### Problemas identificados

1. **UTMs chegando `null` na Fruitfy** — Nos network requests, `utm_campaign`, `utm_source` etc. estao todos `null` no pedido. O UpsellStep envia `tracking: { utm_source: "up", utm_campaign: "up1" }` mas o `create-pix` edge function so popula o objeto `utm` quando o valor e truthy. O problema e que o front esta mandando corretamente, entao o bug esta provavelmente no fato de que o primeiro pagamento (Pagamento.tsx) nao esta passando UTMs quando nao ha UTMs do Facebook — e o pedido que vemos nos requests e o do Pagamento.tsx (valor 6717 = R$67,17), nao de upsell.

2. **Valores dos upsells iguais** — O `valorComCentavos` e calculado com `useState(() => ...)` que gera centavos aleatorios, MAS como o componente Upsell usa `key={stepNumber}` no UpsellStep, ele recria o componente a cada step. O problema real e que o `Upsell.tsx` calcula `valorComCentavos` no estado do componente pai, e quando o step muda via `useParams`, o componente Upsell NAO e remontado (mesma rota `/upsell/:step`), entao o `useState` mantem o valor do primeiro step.

3. **PIX bugando / nao gerando mais vezes** — O PIX fica cacheado no localStorage via `usePixPersistence`. Se o usuario ja gerou um PIX para aquele step, ele reutiliza o antigo mesmo apos expirar o contexto.

### Correções

#### 1. Valores variados por step (Upsell.tsx)
O `useState(() => ...)` so roda na montagem. Quando o step muda (mesma rota), o estado nao reseta. Corrigir usando `useMemo` baseado no `stepNumber` e no `currentUpsell.valor`:

```typescript
const valorComCentavos = useMemo(() => {
  return currentUpsell.valor + (Math.floor(Math.random() * 99) + 1) / 100;
}, [stepNumber]);
```

#### 2. UTMs nos upsells marcando up1, up2, up3... (UpsellStep.tsx)
Ja esta correto no codigo (`utm_source: "up", utm_campaign: \`up${stepNumber}\``). O problema e que a resposta do Fruitfy nos network requests mostra o pedido do Pagamento.tsx (nao do upsell). Vou garantir que o Pagamento.tsx tambem passe UTMs mesmo quando nao ha Facebook UTMs (fallback para os valores originais).

#### 3. PIX nao bugar (UpsellStep.tsx)
- Adicionar retry automatico quando `pixError` ocorre
- Limpar PIX expirado do localStorage antes de gerar novo
- Adicionar fallback: se a resposta nao tem `pix.code`, tentar `pix_code` no top-level

### Arquivos a alterar

**`src/pages/Upsell.tsx`**
- Trocar `useState` por `useMemo` para `valorComCentavos` baseado no `stepNumber`

**`src/components/UpsellStep.tsx`**
- Adicionar retry automatico em caso de erro (botao + auto-retry apos 3s)
- Limpar PIX expirado antes de gerar novo
- Log melhorado para debug

**`src/pages/Pagamento.tsx`**
- Garantir que UTMs sempre tenham fallback (se nao ha UTM do Facebook, nao enviar objeto vazio — manter o comportamento atual que ja funciona)

### Detalhes tecnicos

```text
Upsell.tsx:
  ANTES: const [valorComCentavos] = useState(() => currentUpsell.valor + random)
  DEPOIS: const valorComCentavos = useMemo(() => currentUpsell.valor + random, [stepNumber])

UpsellStep.tsx tracking:
  tracking: { utm_source: "up", utm_campaign: `up${stepNumber}` }
  (ja esta correto, sem mudanca)

Retry PIX:
  Se pixError, mostrar botao "Tentar novamente" que limpa o cache e regenera
```

