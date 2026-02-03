
# Plano: Propagar UTMs via URL em Todo o Funil

## Resumo

Passar os parâmetros UTM (utm_source, utm_campaign, etc.) na URL durante **todas as navegações** do funil, da página inicial (Notícia) até a última página de pagamento (Upsells).

## Situação Atual

Atualmente, as UTMs são:
1. Capturadas na entrada e salvas no `localStorage`
2. Lidas do `localStorage` no momento do pagamento

**Problema:** A URL fica "limpa" após a primeira navegação. Se algo limpar o localStorage (ou o usuário usar outro device/aba), as UTMs se perdem.

## Solução: Propagar UTMs na URL

Criar um helper que:
1. Lê as UTMs do `localStorage`
2. Adiciona como query params em todas as navegações internas

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/hooks/useUtmTracking.ts` | Adicionar função `buildUrlWithUtm()` |
| `src/pages/Noticia.tsx` | Usar `buildUrlWithUtm("/verificacao")` na navegação |
| `src/pages/Verificacao.tsx` | Usar helper na navegação para `/login` |
| `src/pages/Login.tsx` | Usar helper na navegação para `/verificando` |
| `src/pages/Verificando.tsx` | Usar helper na navegação para `/confirma-dados` |
| `src/pages/ConfirmaDados.tsx` | Usar helper na navegação para `/biometria` |
| `src/pages/Biometria.tsx` | Usar helper na navegação para `/video` |
| `src/pages/Video.tsx` | Usar helper na navegação para `/chat` |
| `src/pages/Chat.tsx` | Usar helper na navegação para `/saque` |
| `src/pages/Saque.tsx` | Usar helper na navegação para `/upsell/1` |
| `src/pages/Upsell.tsx` | Usar helper nas navegações entre upsells |

## Detalhes Técnicos

### 1. Nova Função em `useUtmTracking.ts`

```tsx
/**
 * Constrói URL com UTMs salvos como query params.
 * Usa para navegar mantendo rastreio na URL.
 */
export const buildUrlWithUtm = (basePath: string): string => {
  const params = getStoredUtmParams();
  const searchParams = new URLSearchParams();
  
  // Adiciona apenas parâmetros que têm valor
  if (params.utm_source) searchParams.set('utm_source', params.utm_source);
  if (params.utm_medium) searchParams.set('utm_medium', params.utm_medium);
  if (params.utm_campaign) searchParams.set('utm_campaign', params.utm_campaign);
  if (params.utm_content) searchParams.set('utm_content', params.utm_content);
  if (params.utm_term) searchParams.set('utm_term', params.utm_term);
  if (params.utm_id) searchParams.set('utm_id', params.utm_id);
  if (params.src) searchParams.set('src', params.src);
  if (params.sck) searchParams.set('sck', params.sck);
  if (params.ref) searchParams.set('ref', params.ref);
  
  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};
```

### 2. Exemplo de Uso nas Navegações

**Antes (sem UTM na URL):**
```tsx
navigate("/verificacao");
```

**Depois (com UTM na URL):**
```tsx
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";

navigate(buildUrlWithUtm("/verificacao"));
// Resultado: /verificacao?utm_source=FB&utm_campaign=xxx&...
```

### 3. Navegações a Atualizar

| Página | Navegação Atual | Navegação com UTM |
|--------|-----------------|-------------------|
| Noticia.tsx (linha 55) | `navigate("/verificacao")` | `navigate(buildUrlWithUtm("/verificacao"))` |
| Verificacao.tsx (linha 83) | `navigate("/login")` | `navigate(buildUrlWithUtm("/login"))` |
| Login.tsx (linha 54) | `navigate("/verificando", { state })` | `navigate(buildUrlWithUtm("/verificando"), { state })` |
| Verificando.tsx (linha 33) | `navigate("/confirma-dados", { state })` | `navigate(buildUrlWithUtm("/confirma-dados"), { state })` |
| ConfirmaDados.tsx (linha 29) | `navigate("/biometria", { state })` | `navigate(buildUrlWithUtm("/biometria"), { state })` |
| Biometria.tsx (linhas 120, 166) | `navigate("/video", { state })` | `navigate(buildUrlWithUtm("/video"), { state })` |
| Video.tsx (linha 62) | `navigate("/chat", { state })` | `navigate(buildUrlWithUtm("/chat"), { state })` |
| Chat.tsx (navegação para saque) | `navigate("/saque", { state })` | `navigate(buildUrlWithUtm("/saque"), { state })` |
| Saque.tsx (navegação para upsell) | `navigate("/upsell/1", { state })` | `navigate(buildUrlWithUtm("/upsell/1"), { state })` |
| Upsell.tsx (linhas 95, 98) | `navigate(\`/upsell/\${n}\`, { state })` | `navigate(buildUrlWithUtm(\`/upsell/\${n}\`), { state })` |

## Fluxo Final com UTMs

```text
Usuário clica no anúncio:
/?utm_source=FB&utm_campaign=vendas

  ↓ navega

/verificacao?utm_source=FB&utm_campaign=vendas

  ↓ navega

/login?utm_source=FB&utm_campaign=vendas

  ↓ ...continua em todas as páginas...

/saque?utm_source=FB&utm_campaign=vendas

  ↓ navega

/upsell/1?utm_source=FB&utm_campaign=vendas

  ↓ ... até /upsell/7?utm_source=FB&utm_campaign=vendas
```

## Benefícios

1. **Redundância**: UTM está no localStorage E na URL
2. **Debug fácil**: Visível na barra de endereço
3. **Compartilhamento**: Se usuário copiar link, UTM vai junto
4. **Compatibilidade**: UTMify e ferramentas de análise leem da URL

## Total de Mudanças

- **1 nova função** em `useUtmTracking.ts`
- **11 arquivos** com navegações atualizadas
- **~15 chamadas de navigate()** modificadas
