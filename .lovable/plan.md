

# Plano: Mostrar dados do CEP no UP2 + deixar tudo mais agressivo

## Problema do CEP no UP2
O código lê `cepData` da sessão (linha 228), mas se o lead passou pelo funil antes da atualização do código, a sessão não tem `cepData`. Além disso, `Inscricao.tsx` não faz fallback pra sessão — só lê de `location.state`. Vou adicionar fallback em todos os pontos.

## Mudanças

### 1. `src/pages/Inscricao.tsx`
- Adicionar fallback: `const cepData = location.state?.cepData || getSession()?.cepData`
- Salvar `cepData` na sessão no `useEffect`

### 2. `src/pages/UpsellInfo.tsx` — CEP + Agressividade

**Tabela do Local (UP2)**: Já existe no código (linhas 264-274) mas precisa de fallback caso `cepData` não exista — mostrar mensagem de "local sendo processado" em vez de esconder.

**Deixar TUDO mais agressivo em todos os upsells:**
- Headlines com CAPS e urgência extrema (ex: "⚠ ATENÇÃO: SUA INSCRIÇÃO SERÁ CANCELADA")
- Explicações com linguagem de perda ("você VAI perder", "NÃO tem como reverter")
- Consequências mais duras e diretas
- Notas finais com tom de ultimato
- Adicionar frase de urgência tipo "XX pessoas finalizando agora" antes do botão
- Botão com texto mais agressivo: "PAGAR AGORA — NÃO PERDER MINHA VAGA"
- Aviso final em vermelho bold mais forte

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/Inscricao.tsx` | Fallback cepData da sessão |
| `src/pages/UpsellInfo.tsx` | Fix exibição CEP + reescrever todo conteúdo mais agressivo + UI mais urgente |

