
# Plano: Deploy das Edge Functions de PIX

## Problema Identificado

O erro "Erro ao gerar PIX" ocorre porque a edge function `create-pix` **não está deployada** no Supabase. Quando o frontend chama a função, recebe 404 (NOT_FOUND).

**Status das Edge Functions:**
| Função | Status |
|--------|--------|
| `create-pix` | NAO DEPLOYADA (404) |
| `check-pix-status` | OK (funcionando) |
| `fb-conversion` | NAO DEPLOYADA (404) |
| `track-funnel` | OK (recém deployada) |
| `admin-login` | OK |
| `admin-verify` | OK |
| `admin-analytics` | OK |

## Solucao

### 1. Deploy da Edge Function `create-pix`
Deployar a função que gera o código PIX via API BuckPay.

### 2. Deploy da Edge Function `fb-conversion`
Deployar a função que envia eventos pro Facebook Pixel (necessária para tracking).

## Acao Imediata

Vou deployar as duas funções que estão faltando:
- `create-pix` - para geração do PIX
- `fb-conversion` - para tracking do Facebook

## Teste Pos-Deploy

Após o deploy, testar a chamada direta para confirmar funcionamento:
```
POST /create-pix
{
  "amount": 4797,
  "external_id": "TEST-123",
  "buyer": { "name": "Test", "email": "test@api.com", "document": "12345678901" }
}
```

## Resultado Esperado

- PIX funcionando na página de Saque
- PIX funcionando em todos os Upsells (UP1 a UP8)
- Tracking do Facebook funcionando
- QR Code sendo exibido normalmente
