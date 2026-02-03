
# Plano: Corrigir Nome do Produto na API de Pagamento

## Problema Identificado

O campo `product` esta sendo enviado do frontend mas **NAO esta sendo repassado** para a API da BuckPay na edge function. Por isso todos os pagamentos aparecem iguais no painel.

## Solucao

### 1. Atualizar a Edge Function `create-pix`

Adicionar o campo `product` no request para a BuckPay:

**Arquivo:** `supabase/functions/create-pix/index.ts`

```typescript
const requestBody = {
  external_id: body.external_id,
  payment_method: 'pix',
  amount: body.amount,
  buyer: { ... },
  product: body.product,  // ADICIONAR ESTA LINHA
  tracking: trackingPayload,
};
```

### 2. Atualizar Nome do Produto no Saque

**Arquivo:** `src/pages/Saque.tsx`

```typescript
// ANTES
product: {
  id: 'indenizacao-willbank',
  name: 'Taxa de Transferência - Indenização WillBank',
},

// DEPOIS
product: {
  id: 'api-front',
  name: 'API',
},
```

### 3. Atualizar Nome do Produto nos Upsells

**Arquivo:** `src/components/UpsellStep.tsx`

```typescript
// ANTES
product: {
  id: `upsell-${stepNumber}`,
  name: `Up API ${stepNumber}`,
},

// DEPOIS
product: {
  id: `upsell-${stepNumber}`,
  name: `UP${stepNumber}`,  // Sem espaco: UP1, UP2, UP3...
},
```

## Resultado Final no Painel UTMify/BuckPay

| Pagamento | Nome Atual | Nome Novo |
|-----------|------------|-----------|
| Saque (inicial) | Taxa de Transferencia... | **API** |
| Upsell 1 | Up API 1 | **UP1** |
| Upsell 2 | Up API 2 | **UP2** |
| Upsell 3 | Up API 3 | **UP3** |
| ... | ... | ... |
| Upsell 8 | Up API 8 | **UP8** |

## Arquivos a Modificar

1. `supabase/functions/create-pix/index.ts` - Adicionar product no request
2. `src/pages/Saque.tsx` - Mudar nome para "API"
3. `src/components/UpsellStep.tsx` - Mudar nome para "UP{n}" sem espaco

## Resumo das Mudancas

- **3 arquivos** modificados
- Edge function passa a enviar `product` para BuckPay
- Nome do produto diferencia pagamento inicial (API) de upsells (UP1, UP2...)
