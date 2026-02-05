
# Plano: Deploy de Edge Functions e Tracking Completo

## Problema Principal
A edge function `track-funnel` **não está deployada** (retorna 404), por isso a tabela `funnel_events` está vazia e o dashboard admin mostra zeros em todos os indicadores.

## O Que Está Funcionando
- Login do admin (sessões sendo criadas na tabela `admin_sessions`)
- Edge functions `admin-login`, `admin-verify` e `admin-analytics` estão deployadas
- A tabela `funnel_events` existe e tem a estrutura correta
- O código de tracking está implementado em quase todas as páginas

## Ações Necessárias

### 1. Deploy da Edge Function `track-funnel`
Deployar a função que está faltando para que os eventos comecem a ser registrados.

### 2. Adicionar Tracking nas Páginas Faltantes
Duas páginas não têm tracking implementado:

**`src/pages/Noticia.tsx`** - Primeiro passo do funil:
```typescript
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

useEffect(() => {
  // Track apenas em mobile
  if (isMobile) {
    trackFunnelEvent('noticia');
  }
}, []);
```

**`src/pages/Verificacao.tsx`** - Segundo passo do funil:
```typescript
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

useEffect(() => {
  trackFunnelEvent('verificacao');
}, []);
```

### 3. Testar o Fluxo Completo
Após o deploy:
1. Acessar o funil pelo celular desde a página inicial
2. Verificar se eventos são registrados no banco
3. Acessar `/admin/login` → fazer login → ver métricas

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Noticia.tsx` | Adicionar import e chamada do trackFunnelEvent |
| `src/pages/Verificacao.tsx` | Adicionar import e chamada do trackFunnelEvent |

## Resultado Esperado
Após as alterações:
- **Total de Sessões**: Contará sessões únicas
- **Taxa de Conversão**: Login → Payment Confirmed (%)
- **Pagamentos Confirmados**: Contagem real de pagamentos
- **Funil de Conversão**: Barras mostrando drop-off entre etapas
- **Eventos Recentes**: Lista dos últimos 20 eventos
- **Fontes UTM**: Performance por fonte de tráfego

## Credenciais Admin
- **Email**: admin@willbank.com
- **Senha**: admin123
