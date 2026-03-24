

## Plano: Corrigir passagem de UTMs do Facebook no pagamento inicial

### Situação atual

O código já está correto em termos de estrutura:

- **Pagamento.tsx** (linha 71-77): Passa `utmParams.utm_source`, `utmParams.utm_campaign`, etc. do Facebook para o `create-pix`
- **UpsellStep.tsx** (linha 75-81): Passa `utm_source: storedUtms.utm_source || "up"` e `utm_campaign: "up{stepNumber}"`
- **create-pix edge function** (linha 94-99): Só inclui campos UTM se forem truthy (`if (body.tracking?.utm_source)`)

### Problema real

No **Pagamento.tsx**, os UTMs do Facebook podem estar chegando como `null` do `getStoredUtmParams()` se o `captureUtmParams()` na linha 63 não encontrou parâmetros na URL naquele momento (o usuário já navegou internamente e a URL não tem mais os query params). O `captureUtmParams` só salva se encontrar UTMs na URL atual — se já foram salvos antes (pelo `UtmCapture` component no App), eles já estão no localStorage e o `getStoredUtmParams` deveria retorná-los.

O fluxo parece correto. O problema pode ser que o `captureUtmParams()` está sendo chamado **depois** da navegação interna, quando a URL já não tem os params, e como ele só faz merge quando encontra params na URL, ele não apaga os existentes — então `getStoredUtmParams` deveria funcionar.

### Verificação necessária

Preciso confirmar se há um bug real ou se é apenas questão de os UTMs não estarem sendo passados na URL inicial. Vou fazer uma mudança defensiva:

### Alteração

**`src/pages/Pagamento.tsx`** — Adicionar fallback no tracking para garantir que se não há UTMs do Facebook, pelo menos passe `utm_source: "direct"` e `utm_campaign: "front"` para que nunca vá `null`:

```typescript
tracking: {
  utm_source: utmParams.utm_source || 'direct',
  utm_medium: utmParams.utm_medium || null,
  utm_campaign: utmParams.utm_campaign || 'front',
  utm_content: utmParams.utm_content || null,
  utm_term: utmParams.utm_term || null,
},
```

**`src/components/UpsellStep.tsx`** — Já está correto com `utm_source: storedUtms.utm_source || "up"` e `utm_campaign: "up${stepNumber}"`. Sem alteração.

### Resumo do fluxo final

| Etapa | utm_source | utm_campaign |
|-------|-----------|-------------|
| Pagamento (R$67) | Do Facebook (ex: `fb_ads`) ou `direct` | Do Facebook (ex: `campanha_bb`) ou `front` |
| Upsell 1 | Do Facebook ou `up` | `up1` |
| Upsell 2 | Do Facebook ou `up` | `up2` |
| Upsell N | Do Facebook ou `up` | `upN` |

