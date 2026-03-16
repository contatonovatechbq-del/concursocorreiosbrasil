

# Substituir UTMs reais por tracking fixo nos Upsells

O problema: `UpsellStep.tsx` e `Saque.tsx` estão enviando os UTMs originais do usuário (utm_source=FB, utm_campaign=C11...) no campo `tracking` do `create-pix`. Em vez disso, devem enviar valores fixos identificando que é um upsell.

## Alterações

### 1. `src/components/UpsellStep.tsx` (linhas 55-62)
- Remover `getStoredUtmParams()` e substituir o objeto `tracking` por valores fixos:
  - `utm_source: "up"`
  - `utm_campaign: "up{stepNumber}"` (ex: `up1`, `up2`, etc.)
  - Demais campos: `null`
- Remover import de `getStoredUtmParams` (manter `getUtmSignature` que é usado para persistência do PIX)

### 2. `src/pages/Saque.tsx` (linhas 104-131)
- Mesmo tratamento: substituir `getStoredUtmParams()` no tracking por valores fixos:
  - `utm_source: "up"`  
  - `utm_campaign: "up1"` (Saque é o primeiro checkout, antes dos upsells)
- Remover import de `getStoredUtmParams` se não for mais usado

Isso garante que no BuckPay/UTMify os upsells apareçam como campanha "up1", "up2", etc., separados do tráfego original.

