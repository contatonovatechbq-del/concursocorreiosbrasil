

## Plano: Corrigir geração múltipla de PIX nos Upsells + Verificar fluxo de UTM

### Diagnóstico

O fluxo de UTM no código está correto:
- **Front**: `getEffectiveTracking()` → manda a campanha do Facebook (ex: `C1`) como `utm_campaign`
- **Upsells**: `getEffectiveTracking(stepNumber)` → manda `C1 UP1`, `C1 UP2`, etc.
- **Centavos aleatórios**: já funcionam no front (`valorBeneficio`) e nos upsells (`valorComCentavos`)
- **Navegação com UTMs**: `buildUrlWithUtm()` é usado em todas as navegações

O log mostrando `utm_campaign: "front"` é porque o teste foi feito sem UTMs na URL (acesso direto). Quando vier do Facebook com `?utm_campaign=C1`, vai funcionar.

### Problema encontrado: UpsellStep gera PIX múltiplos

O mesmo bug que corrigimos no `Pagamento.tsx` existe no `UpsellStep.tsx` — não tem guarda `pixGeneratedRef`. O `useEffect` pode disparar mais de uma vez e gerar PIX duplicados nos upsells.

### Correção

**Arquivo: `src/components/UpsellStep.tsx`**

1. Adicionar `useRef` (`pixGeneratedRef`) para garantir que `generatePix` só execute **uma vez** por step
2. Marcar `pixGeneratedRef.current = true` antes de chamar a API
3. Resetar o ref quando `stepNumber` muda (já que o componente usa `key={stepNumber}`, o ref reseta naturalmente no remount)

### Resumo do fluxo completo (já funcionando)

```text
Facebook (utm_campaign=C1) → Landing → ... → Pagamento
  → PIX com utm_campaign="C1" ✓
  → Paga → navega /upsell/1 com UTMs na URL

Upsell 1 → PIX com utm_campaign="C1 UP1" ✓
Upsell 2 → PIX com utm_campaign="C1 UP2" ✓
...
Upsell 19 → PIX com utm_campaign="C1 UP19" ✓
```

Cada PIX tem centavos aleatórios (ex: R$ 47,73, R$ 37,42).

