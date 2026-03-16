

# Redirecionar desktop para Google

Trocar a URL de redirecionamento de desktop de `g1.globo.com/...` para `https://www.google.com` em 3 arquivos:

1. **`src/components/DeviceGuard.tsx`** (linha 28) — alterar URL para `https://www.google.com`
2. **`src/pages/Verificacao.tsx`** (linha 36) — alterar URL para `https://www.google.com`
3. **`src/pages/Noticia.tsx`** (linha 30) — alterar URL para `https://www.google.com`

Alteração simples de string em cada arquivo, sem mudança de lógica.

