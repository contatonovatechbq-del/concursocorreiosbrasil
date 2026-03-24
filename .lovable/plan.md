

## Problema

A resposta da API Fruitfy retorna os campos com nomes diferentes do que o frontend espera:

- API retorna `order_id` → código procura `order_uuid` (não encontra)
- API retorna `qr_code_base64` → código procura `qrcode_base64` (não encontra)
- Como `orderUuid` fica vazio, a condição `pixCode && orderUuid` falha → "Resposta inválida do servidor"

Resposta real da Fruitfy:
```json
{
  "data": {
    "order_id": "a159d397-...",
    "pix": {
      "code": "000201...",
      "qr_code_base64": "data:image/svg+xml;base64,..."
    }
  }
}
```

## Correção

Adicionar `order_id` e `qr_code_base64` aos fallbacks de parsing em 3 arquivos:

### 1. `src/pages/Pagamento.tsx` (linhas 84-86)
```typescript
const pixCode = data?.data?.pix?.code || data?.data?.pix_code;
const pixQrBase64 = data?.data?.pix?.qr_code_base64 || data?.data?.pix?.qrcode_base64 || '';
const orderUuid = data?.data?.order_id || data?.data?.order_uuid || '';
```

### 2. `src/components/UpsellStep.tsx` (linhas 81-83)
Mesma correção.

### 3. `src/pages/Saque.tsx` (linhas 136-138)
Mesma correção.

Mudança mínima: apenas ajustar os nomes dos campos para bater com a resposta real da Fruitfy.

