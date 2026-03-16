

# Fix: UTMs não chegando na primeira venda para alguns usuários

## Problema identificado

Nos logs do edge function, vemos que **KAMILLY** tem tracking todo null, enquanto **IZAIAS** tem UTMs do Facebook. O problema está em dois pontos:

1. **`captureUtmParams()` tem um filtro restritivo** — só captura se a URL tiver `utm_source`, `utm_campaign` ou `src`. Se o Facebook mandar outros params (como `utm_medium`, `utm_term`, `fbclid`) sem `utm_source`, a captura é ignorada.

2. **Possível race condition** — `UtmCapture` e `Pagamento`/`Saque` montam ao mesmo tempo. Se o efeito do checkout rodar antes do `UtmCapture`, os UTMs ainda não estão no localStorage.

## Alterações

### 1. `src/hooks/useUtmTracking.ts` — Tornar captura mais robusta
- Remover o filtro `hasUtms` restritivo. Em vez de checar apenas `utm_source`/`utm_campaign`/`src`, checar **qualquer** parâmetro UTM na URL
- Adicionar captura de `fbclid` (click ID do Facebook) para rastreamento extra

### 2. `src/pages/Pagamento.tsx` — Chamar `captureUtmParams()` antes de ler
- Adicionar `captureUtmParams()` direto antes de `getStoredUtmParams()` na geração do PIX, como safety net (não depende só do `UtmCapture`)

### 3. `src/pages/Saque.tsx` — Mesmo tratamento
- Adicionar `captureUtmParams()` antes de `getStoredUtmParams()` na geração do PIX

Isso garante que mesmo que `UtmCapture` não tenha rodado ainda, o checkout captura os UTMs antes de gerar o PIX.

