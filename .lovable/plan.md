

## Plano: Proteger o funil — impedir que o usuario volte para etapas anteriores

### Problema
Quando o usuario esta no upsell (ex: `/upsell/5`), se ele atualiza a pagina ou volta manualmente para `/resultado`, `/pagamento`, etc., ele consegue ver essas paginas antigas em vez de ser redirecionado para o upsell atual.

A restauracao de sessao so funciona na rota `/` (Index.tsx). As outras paginas do funil nao verificam se o usuario ja esta mais adiante.

### Solucao

Criar um hook `useFunnelGuard` que verifica em cada pagina do funil se o usuario ja passou daquela etapa. Se sim, redireciona para o step salvo na sessao.

### Alteracoes

**1. `src/hooks/useSessionPersistence.ts`** — Adicionar funcao `useFunnelGuard(currentPath)`
- Compara o index do `currentPath` com o index do `session.currentStep`
- Se o step salvo esta mais adiante no funil, redireciona para o step salvo
- Nao faz nada se nao ha sessao ou se o step salvo e anterior/igual

**2. Paginas do funil** — Adicionar `useFunnelGuard` em cada uma:
- `src/pages/Resultado.tsx` — `useFunnelGuard("/resultado")`
- `src/pages/Inscricao.tsx` — `useFunnelGuard("/inscricao")`
- `src/pages/ConfirmaDados.tsx` — `useFunnelGuard("/confirma-dados")`
- `src/pages/DetalhesInscricao.tsx` — `useFunnelGuard("/detalhes-inscricao")`
- `src/pages/Pagamento.tsx` — `useFunnelGuard("/pagamento")`
- `src/pages/UpsellInfo.tsx` — `useFunnelGuard("/upsell-info/X")` (usando o step atual)

**3. `src/pages/Upsell.tsx`** — Ja salva o step correto na sessao. Sem alteracao.

### Logica do hook

```text
useFunnelGuard(currentPath):
  session = getSession()
  if (!session || !session.currentStep) return  // sem sessao, deixa passar
  
  savedIndex = getStepIndex(session.currentStep)
  currentIndex = getStepIndex(currentPath)
  
  if (savedIndex > currentIndex):
    navigate(session.currentStep, { state: { cpfData, valorBeneficio, protocolo }, replace: true })
```

Isso garante que se o usuario esta no upsell 5 e tenta voltar para `/pagamento` ou `/resultado`, ele e redirecionado de volta para `/upsell/5`.

