

# Corrigir tracking: Saque passa UTM real do Facebook

**Problema:** O `Saque.tsx` está mandando `utm_source: "up"` e `utm_campaign: "up1"` — mas ele é o primeiro checkout, deveria passar as UTMs reais do Facebook (como o `Pagamento.tsx` já faz). Só os upsells (UpsellStep) devem usar "up" + número.

**Situação atual:**
- `Pagamento.tsx` → passa UTMs reais do Facebook ✅
- `Saque.tsx` → passa "up1" ❌ (deveria passar UTMs reais)
- `UpsellStep.tsx` → passa "up2", "up3"... ✅

## Alteração

### `src/pages/Saque.tsx`
1. Adicionar import de `getStoredUtmParams`
2. Substituir o tracking hardcoded por `getStoredUtmParams()` — igual ao Pagamento.tsx faz

```typescript
// DE:
tracking: { utm_source: "up", utm_campaign: "up1", ... }

// PARA:
const utmParams = getStoredUtmParams();
tracking: {
  utm_source: utmParams.utm_source,
  utm_campaign: utmParams.utm_campaign,
  utm_medium: utmParams.utm_medium,
  utm_content: utmParams.utm_content,
  utm_term: utmParams.utm_term,
  utm_id: utmParams.utm_id,
  src: utmParams.src,
  sck: utmParams.sck,
  ref: utmParams.ref,
}
```

Só 1 arquivo alterado. Os upsells continuam com "up2", "up3", etc.

