

## Plano: Remover Buckpay + Corrigir UTM campaign nos upsells

### 1. Remover tudo do Buckpay

**Arquivos afetados:**
- **`supabase/functions/find-agency/index.ts`** — Linha 8: trocar `Deno.env.get("BUCKPAY_USER_AGENT")` por um user-agent fixo hardcoded (ex: `"Concorreios/1.0"`)
- **`src/hooks/useUtmTracking.ts`** — Linha 69: remover comentário que menciona "BuckPay"
- **Secrets**: Deletar `BUCKPAY_API_KEY` e `BUCKPAY_USER_AGENT` do projeto

### 2. Corrigir UTM campaign nos upsells

**Problema atual:** O upsell envia `utm_campaign: "up1"`, perdendo a informação de qual campanha do Facebook o usuário veio.

**Solução:** Concatenar a campanha original do Facebook com o número do upsell.

**Arquivo: `src/components/UpsellStep.tsx`** (linha 77):
```
// ANTES:
utm_campaign: `up${stepNumber}`,

// DEPOIS:
utm_campaign: storedUtms.utm_campaign 
  ? `${storedUtms.utm_campaign} UP${stepNumber}` 
  : `UP${stepNumber}`,
```

**Resultado final dos UTMs:**

| Etapa | utm_source | utm_campaign |
|-------|-----------|-------------|
| Pagamento R$67 | `facebook` (do FB) ou `direct` | `campanha_bb` (do FB) ou `front` |
| Upsell 1 | `facebook` (do FB) ou `up` | `campanha_bb UP1` ou `UP1` |
| Upsell 2 | `facebook` (do FB) ou `up` | `campanha_bb UP2` ou `UP2` |
| Upsell N | `facebook` (do FB) ou `up` | `campanha_bb UPN` ou `UPN` |

Assim você sabe exatamente de qual campanha veio cada upsell pago.

### Arquivos alterados
1. `supabase/functions/find-agency/index.ts` — remover referência Buckpay
2. `src/hooks/useUtmTracking.ts` — remover menção Buckpay
3. `src/components/UpsellStep.tsx` — concatenar campaign original + UP{N}
4. Deletar secrets `BUCKPAY_API_KEY` e `BUCKPAY_USER_AGENT`

