

## Plano: Migrar API de pagamento PIX de BuckPay para Fruitfy

### Resumo

Trocar toda a integração de pagamento PIX da API BuckPay (realtechdev.com.br) para a API Fruitfy (api.fruitfy.io). A Fruitfy exige headers diferentes (`Authorization: Bearer`, `Store-Id`), body diferente (campos top-level: `name`, `email`, `cpf`, `phone`, `items[]`, `utm`) e consulta de pedido via `GET /api/order/{uuid}`.

### Pré-requisito: Secrets

Você vai precisar fornecer 2 secrets:
- **FRUITFY_API_TOKEN** — Token Bearer gerado em Integrações > API Tokens no painel Fruitfy
- **FRUITFY_STORE_ID** — UUID da loja no painel Fruitfy
- **FRUITFY_PRODUCT_ID** — ID do produto na Fruitfy (encontrado em Produtos > Visualizar > Configurações)

Os secrets antigos (BUCKPAY_API_KEY, BUCKPAY_USER_AGENT) podem ser removidos depois.

### Alterações

#### 1. Reescrever `supabase/functions/create-pix/index.ts`

Mudar de BuckPay para Fruitfy:
- URL: `https://api.fruitfy.io/api/pix/charge` (POST)
- Headers: `Authorization: Bearer {FRUITFY_API_TOKEN}`, `Store-Id: {FRUITFY_STORE_ID}`, `Content-Type: application/json`, `Accept: application/json`
- Body muda completamente — campos top-level:
  - `name` (string), `email` (string), `phone` (string), `cpf` (string — 11 dígitos)
  - `items` (array de `{id, value, quantity}`) — usa FRUITFY_PRODUCT_ID como id do item, valor em centavos
  - `utm` (objeto com `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`)
- Resposta: `{ success: true, data: { ... } }` — precisa extrair o QR code PIX e order_uuid da resposta

#### 2. Reescrever `supabase/functions/check-pix-status/index.ts`

Mudar de BuckPay para Fruitfy:
- URL: `GET https://api.fruitfy.io/api/order/{order_uuid}`
- Headers: mesmos (`Authorization`, `Store-Id`, `Accept`)
- Resposta: `{ success: true, data: { status: "paid"|"waiting_payment"|... } }`
- O status `paid` continua sendo a condição de sucesso
- Mudar o parâmetro de `external_id` para `order_uuid` (o UUID retornado na criação)

#### 3. Atualizar frontend — Pagamento.tsx, UpsellStep.tsx, Saque.tsx

- Ajustar parsing da resposta do `create-pix` para o novo formato Fruitfy
- Ao invés de guardar `external_id` para check, guardar `order_uuid` retornado pela Fruitfy
- O `check-pix-status` agora recebe `order_uuid` em vez de `external_id`
- Os parâmetros UTM do Facebook continuam sendo passados via `tracking` no body — mapeados para o campo `utm` da Fruitfy

#### 4. Atualizar `usePixPersistence.ts`

- O campo `external_id` no StoredPixData pode ser renomeado ou manter compatível, mas o valor armazenado passa a ser o `order_uuid` da Fruitfy

### Detalhes Técnicos

```text
ANTES (BuckPay):
  POST https://api.realtechdev.com.br/v1/transactions
  Headers: Authorization: Bearer {BUCKPAY_API_KEY}
  Body: { external_id, payment_method: "pix", amount, buyer: {name, email, document, phone}, tracking: {...} }
  Check: GET https://api.realtechdev.com.br/v1/transactions/external_id/{id}

DEPOIS (Fruitfy):
  POST https://api.fruitfy.io/api/pix/charge
  Headers: Authorization: Bearer {FRUITFY_API_TOKEN}, Store-Id: {FRUITFY_STORE_ID}
  Body: { name, email, phone, cpf, items: [{id, value, quantity}], utm: {utm_source, utm_medium, utm_campaign, utm_content, utm_term} }
  Check: GET https://api.fruitfy.io/api/order/{order_uuid}
  Headers: mesmos
```

### Fluxo UTM (Facebook → Fruitfy)

O fluxo atual já captura UTMs do Facebook via `useUtmTracking.ts` e passa para o edge function. A única mudança é o mapeamento do campo `tracking` para o campo `utm` da Fruitfy:
- `utm_source` → `utm.utm_source`
- `utm_medium` → `utm.utm_medium`
- `utm_campaign` → `utm.utm_campaign`
- `utm_content` → `utm.utm_content`
- `utm_term` → `utm.utm_term`

