

## Plano: Corrigir "Resposta inválida" + preços variados nos upsells + UTM up1/up2/up3

### Problema 1: "Resposta inválida do servidor"

A API Fruitfy retorna `pix.code` como string vazia `""`. O código faz `if (pixCode && orderUuid)` — como `""` e falsy, a condição falha. O PIX foi criado com sucesso (aparece no gateway), mas o frontend rejeita a resposta.

**Correção**: Mudar a condição para checar apenas `orderUuid` (o QR code base64 ja basta para mostrar o PIX). A condição passa a ser `if (orderUuid)`. Aplicar em 3 arquivos: `Pagamento.tsx`, `UpsellStep.tsx`, `Saque.tsx`.

### Problema 2: Preços iguais em todos os upsells

O `valorComCentavos` usa `useState(() => ...)` que so executa na primeira montagem. Como o componente `Upsell` nao remonta ao trocar de step (so muda o param), o preco fica travado no primeiro valor.

**Correção**: Usar `useMemo` com `stepNumber` como dependencia em `Upsell.tsx`.

### Problema 3: Remover fbEvents dos upsells (gateway ja faz)

Remover `fbEvents.purchase()` e `fbEvents.serverPurchase()` de `UpsellStep.tsx` (linhas 110-111 e 132-133). O gateway Fruitfy ja dispara os eventos.

### Problema 4: Guard contra PIX duplicado

Adicionar `useRef` guard no `useEffect` de geracao do PIX no `UpsellStep.tsx` para evitar chamadas multiplas.

### Arquivos alterados

1. **`src/pages/Upsell.tsx`** — `useMemo` para `valorComCentavos`
2. **`src/components/UpsellStep.tsx`** — Condição `orderUuid` apenas, guard ref, remover fbEvents
3. **`src/pages/Pagamento.tsx`** — Condição `orderUuid` apenas
4. **`src/pages/Saque.tsx`** — Condição `orderUuid` apenas

