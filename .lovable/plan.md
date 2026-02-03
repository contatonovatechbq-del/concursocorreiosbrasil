
# Plano: Renomear Produto dos Upsells na API

## Resumo

Alterar o nome do produto enviado para a API de pagamento nos upsells para incluir o prefixo **"Up API"**, facilitando a identificação no painel da UTMify/BuckPay.

## Situacao Atual

Quando o PIX e criado no upsell, o produto e enviado assim:

```tsx
product: {
  id: `upsell-${stepNumber}`,
  name: title,  // Ex: "Taxa de Processamento Prioritario"
},
```

## Alteracao Proposta

Mudar o nome do produto para incluir o prefixo "Up API":

```tsx
product: {
  id: `upsell-${stepNumber}`,
  name: `Up API ${stepNumber}`,  // Ex: "Up API 1", "Up API 2", etc.
},
```

## Arquivo a Modificar

`src/components/UpsellStep.tsx` - linhas 100-103

## Mudanca

```tsx
// ANTES (linha 100-103)
product: {
  id: `upsell-${stepNumber}`,
  name: title,
},

// DEPOIS
product: {
  id: `upsell-${stepNumber}`,
  name: `Up API ${stepNumber}`,
},
```

## Resultado no Painel

| Pagamento | Nome no Painel |
|-----------|----------------|
| Saque (inicial) | API |
| Upsell 1 | **Up API 1** |
| Upsell 2 | **Up API 2** |
| Upsell 3 | **Up API 3** |
| ... | ... |
| Upsell 8 | **Up API 8** |

## Alternativas

Se preferir outro formato, posso usar:

| Opcao | Exemplo |
|-------|---------|
| `Up API ${stepNumber}` | Up API 1, Up API 2, ... |
| `Up API` | Up API (igual pra todos) |
| `UP${stepNumber}` | UP1, UP2, UP3, ... |

A opcao padrao sera `Up API ${stepNumber}` para identificar qual upsell especifico foi pago.
