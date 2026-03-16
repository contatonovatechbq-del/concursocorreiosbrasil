

# Fix: Agência ficando trocando toda hora

## Problema

Duas causas:

1. **`useEffect` com `cepData` na dependência** — `cepData` é um objeto novo a cada render (vem de `location.state` ou `getSession()`), então o efeito re-executa infinitamente, chamando a API toda hora.

2. **`vagasRegiao` com `Math.random()` no corpo do render** — muda a cada re-render.

## Solução

### 1. Estabilizar o `useEffect` — usar `cepData.cep` como dependência
Trocar `[cepData, navigate]` por `[cepData?.cep]` (string primitiva, não muda). Guardar `cepData` em um `useRef` para uso dentro do efeito.

### 2. Mover `vagasRegiao` para `useMemo` ou `useState`
Calcular uma vez só na montagem, usando `useState` com valor inicial randomizado.

### 3. Adicionar guard para não re-fetch se já tem agency
Checar `if (agency) return` no início do efeito, ou usar uma ref `hasFetched`.

### Arquivo: `src/pages/Resultado.tsx`
- Adicionar `useRef` para controlar se já buscou (`hasFetched`)
- Mudar dependência do `useEffect` para `[cepData?.cep]`
- Mover `vagasRegiao` para `useState(() => Math.floor(Math.random() * 40) + 30)`
- Mover `provaDate` para `useState(getProvaDate)`

