

# Corrigir numeração dos upsells: up1, up2, up3...

**Situação atual:**
- Saque (R$67) → UTMs reais do Facebook ✅
- UpsellStep → `up${stepNumber + 1}` = up2, up3, up4... ❌

**Problema:** Os upsells estão começando em up2. Deveriam ser up1, up2, up3...

**Correção:** Em `src/components/UpsellStep.tsx` linha 61, trocar `up${stepNumber + 1}` por `up${stepNumber}`.

Resultado final:
- Saque → UTMs reais do Facebook
- Upsell 1 → up1
- Upsell 2 → up2
- ...

