
Objetivo: garantir que a campanha do Facebook seja puxada em 100% dos pagamentos (front + upsells), sem perder no meio do funil, e mantendo no link como você pediu.

1) Diagnóstico do que está falhando hoje
- A captura de UTM existe e funciona (`UtmCapture` + `localStorage`), mas ainda há transições sem `buildUrlWithUtm`, então a query pode sumir da barra em partes do fluxo.
- Pontos críticos sem UTM na URL hoje:
  - `src/pages/Index.tsx` (restore de sessão via `navigate(session.currentStep, ...)`)
  - `src/hooks/useSessionPersistence.ts` (`useFunnelGuard` redireciona sem query)
  - `src/pages/Pagamento.tsx` (vai para `/upsell/1` sem query)
  - `src/pages/Upsell.tsx` (troca `/upsell/n` sem query)
  - `src/pages/UpsellInfo.tsx` (vai para `/upsell/:step` sem query)

2) Correção de base (tracking “first touch”)
- Em `src/hooks/useUtmTracking.ts`:
  - Criar leitura normalizada da campanha base (prioridade: `utm_campaign`, depois `utm_id`, `src`, `ref`).
  - Congelar campanha de origem (first-touch) para não ser sobrescrita por navegação interna.
  - Expor helper único para consumo no PIX (ex.: `getEffectiveTracking()`), evitando fallback inconsistente por página.

3) Garantir UTM no link em todo o funil
- Trocar todos os `navigate("/...")` do fluxo principal para `navigate(buildUrlWithUtm("/..."))` nos arquivos acima.
- Aplicar também nos redirects automáticos de guard/restore para manter a query no domínio durante o funil.

4) Garantir campanha correta no pagamento
- `src/pages/Pagamento.tsx`:
  - Usar tracking normalizado (campanha base) no `create-pix`.
  - Manter fallback técnico só como último recurso (não como caminho principal).
- `src/components/UpsellStep.tsx`:
  - Sempre enviar `utm_campaign` como `CAMPANHA_BASE UP{N}` (UP1…UP19).
  - Exemplo final: `C1 UP1`, `C1 UP2`, ..., `C1 UP19`.

5) Validação prática (implementação)
- Fluxo de teste que vou rodar após aplicar:
  - Entrar com `?utm_source=facebook&utm_campaign=C1`
  - Ir até pagamento front e confirmar payload do `create-pix`
  - Avançar para upsell 1 e upsell 2, recarregar página, sair e voltar
  - Confirmar que campanha segue `C1 UP1`, `C1 UP2` sem trocar para `front/up`
  - Verificar logs no frontend e no backend de pagamento para confirmar envio real

Resultado esperado
- Campanha sempre marcada no front e em todos os upsells.
- Query UTM visível no link durante o funil.
- Atribuição final na Fruitfy no formato correto para você identificar origem + etapa.
