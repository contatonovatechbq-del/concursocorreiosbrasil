
# Plano: Dashboard Admin Completaco com Dados Limpos e Tempo Real

## Problema Atual
- **7.116 eventos de "saque" duplicados** causados pelo bug de loop infinito (ja corrigido)
- Eventos antigos de "noticia" e "verificacao" que nao existem mais no funil
- Falta refresh automatico para ver em tempo real
- UTMs nao estao bem destacados (Facebook vs Direto)
- Falta mais metricas visuais

## Solucao Completa

### 1. Limpar Dados Antigos (Zerar o Painel)

Vou deletar todos os eventos antigos para comecar do zero:
- Remover os 7116 eventos de "saque" duplicados
- Remover eventos de "noticia" e "verificacao" (etapas removidas)
- Resultado: painel limpo para rastrear novos usuarios

### 2. Adicionar Refresh Automatico (Tempo Real)

```typescript
// Auto-refresh a cada 30 segundos
useEffect(() => {
  const interval = setInterval(() => {
    verifyAndFetchData(false); // refresh silencioso
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

Indicador visual mostrando "Atualizado ha X segundos"

### 3. Melhorar Exibicao das Fontes de Trafego

**Card de destaque por fonte:**
```text
┌────────────────────────────────────────────────────────┐
│ TRAFEGO EM TEMPO REAL                                  │
├──────────────┬──────────────┬──────────────────────────┤
│ 📘 Facebook  │ 📱 Direto    │ 📊 Google                │
│ 45 visitas   │ 12 visitas   │ 8 visitas                │
│ 62.3%        │ 16.7%        │ 11.1%                    │
└──────────────┴──────────────┴──────────────────────────┘
```

Cores distintas:
- Facebook = Azul (#1877F2)
- Direto = Cinza
- Google = Verde
- Instagram = Rosa/Roxo
- TikTok = Preto
- Outros = Neutro

### 4. Eventos Recentes Melhorados

Mostrar mais detalhes em cada evento:
```text
┌─────────────────────────────────────────────────────────┐
│ EVENTOS EM TEMPO REAL (ultimos 50)           🔴 AO VIVO │
├─────────────────────────────────────────────────────────┤
│ 🟢 Login (CPF)     📘 facebook    agora mesmo          │
│ 🟢 Verificando     📘 facebook    ha 5 seg             │
│ 🟢 Biometria       📱 direto      ha 32 seg            │
│ 🟡 Chat            📘 facebook    ha 1 min             │
│ 🔵 Saque           📘 facebook    ha 2 min             │
│ ✅ Pagamento       📱 direto      ha 5 min             │
└─────────────────────────────────────────────────────────┘
```

Cores por etapa do funil:
- Verde = Inicio (login, verificando, confirma-dados)
- Amarelo = Meio (biometria, video, chat)
- Azul = Fim (saque, pix-generated)
- Verde Check = Pagamento confirmado

### 5. Cards de Metricas Adicionais

Novos cards no topo:
- **PIX Gerados** - quantos chegaram na tela de PIX
- **Taxa de Pagamento do PIX** - pix-generated -> payment-confirmed
- **Tempo Medio no Funil** (se possivel calcular)

### 6. Funil por Fonte de Trafego

Filtro para ver o funil separado por UTM:
- "Todos"
- "Facebook"
- "Direto"
- "Google"
- etc.

Isso ajuda a ver qual fonte converte melhor!

## Alteracoes Tecnicas

### Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Admin.tsx` | Auto-refresh, cards de UTM, eventos melhorados, filtro por fonte |
| `supabase/functions/admin-analytics/index.ts` | Retornar mais dados (ultimos 50 eventos, breakdown por UTM+step) |

### Migracao de Banco

Limpar eventos antigos:
```sql
DELETE FROM funnel_events 
WHERE step IN ('noticia', 'verificacao') 
   OR created_at < '2026-02-06T09:00:00Z';
```

## Layout Final do Dashboard

```text
┌─────────────────────────────────────────────────────────────┐
│ Dashboard Admin                     🔄 10s [Hoje][7d][30d]  │
├─────────────────────────────────────────────────────────────┤
│ METRICAS PRINCIPAIS                                         │
├────────────┬────────────┬────────────┬──────────────────────┤
│ Sessoes    │ Conversao  │ Pagamentos │ PIX Gerados          │
│ 👥 142     │ 📈 8.2%    │ ✅ 12      │ 💸 52                │
├────────────┼────────────┼────────────┼──────────────────────┤
│ Login→Chat │ Chat→Saque │ Saque→Pag  │ PIX→Pagamento        │
│ 💬 45.3%   │ ➡️ 78.2%   │ 💰 23.1%   │ 💳 23.1%             │
├────────────┴────────────┴────────────┴──────────────────────┤
│ TRAFEGO POR FONTE                                           │
├───────────────┬───────────────┬─────────────────────────────┤
│ 📘 Facebook   │ 📱 Direto     │ 📊 Google                   │
│ 89 (62.7%)    │ 38 (26.8%)    │ 15 (10.5%)                  │
├───────────────┴───────────────┴─────────────────────────────┤
│ FUNIL DE CONVERSAO                       [Grafico] [Tabela] │
│ Filtrar: [Todos ▼] [Facebook] [Direto] [Google]             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Login (CPF)       ████████████████████ 142  100.0%      │ │
│ │ Verificando       ███████████████████  138  97.2%   -3% │ │
│ │ Confirma Dados    ██████████████████   125  88.0%  -10% │ │
│ │ Biometria         █████████████████    118  83.1%   -6% │ │
│ │ Video             ██████████████       98   69.0%  -17% │ │
│ │ Chat              █████████████        89   62.7%   -9% │ │
│ │ Saque             ██████████           64   45.1%  -28% │ │
│ │ PIX Gerado        ████████             52   36.6%  -19% │ │
│ │ Pagamento ✅      ████                 12   8.5%   -77% │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ UPSELLS (base: 64 saques)                                   │
│ [UP1: 8 (12.5%)] [UP2: 5 (7.8%)] [UP3: 3 (4.7%)]           │
├─────────────────────────────┬───────────────────────────────┤
│ EVENTOS EM TEMPO REAL 🔴    │ RESUMO POR FONTE              │
│ 🟢 Login    📘 fb   agora   │ 📘 Facebook  ████████ 62.7%   │
│ 🟢 Verif.   📘 fb   5s      │ 📱 Direto    █████    26.8%   │
│ 🟡 Chat     📱 dir  32s     │ 📊 Google    ███      10.5%   │
│ 🔵 Saque    📘 fb   1min    │                               │
│ ✅ Pagam.   📱 dir  5min    │                               │
└─────────────────────────────┴───────────────────────────────┘
```

## Resultado Esperado

1. **Dados limpos** - sem eventos duplicados ou obsoletos
2. **Tempo real** - auto-refresh a cada 30s com indicador visual
3. **UTMs destacados** - cores distintas para Facebook, Direto, Google
4. **Mais metricas** - PIX gerados, taxa de pagamento do PIX
5. **Filtro por fonte** - ver funil apenas de Facebook, ou apenas Direto
6. **Eventos ao vivo** - lista com cores por etapa e fonte
