

# Plano: Trocar UP1/UP2 e mostrar dados do CEP no upsell do local

## Problema
O `cepData` (dados do CEP que o lead digitou no início) é passado por `location.state` mas **nunca é salvo na sessão**. Quando chega nos upsells, já se perdeu. Preciso salvar na sessão pra poder usar.

## Mudanças

### 1. Salvar `cepData` na sessão (`src/hooks/useSessionPersistence.ts`)
- Adicionar campo `cepData` na interface `SessionData`
- Criar tipo `CepData` (cep, logradouro, bairro, localidade, uf)

### 2. Passar `cepData` pra sessão nas páginas do funil
- `src/pages/Resultado.tsx`, `src/pages/Inscricao.tsx`, `src/pages/ConfirmaDados.tsx`, `src/pages/DetalhesInscricao.tsx`, `src/pages/Pagamento.tsx` — incluir `cepData` no `saveSession`

### 3. Trocar posições no array (`src/pages/UpsellInfo.tsx` e `src/pages/Upsell.tsx`)
- **Posição 1**: "Confirmação da Inscrição" (R$ 47) — volta pra primeiro
- **Posição 2**: "Confirmação do Local da Prova" (R$ 37) — renomeado, agora mostra dados dinâmicos do CEP

### 4. Upsell 2 dinâmico com dados do CEP (`src/pages/UpsellInfo.tsx`)
- Ler `cepData` da sessão
- Gerar nome da agência e endereço (mesma lógica do `Resultado.tsx`)
- Mostrar na explicação e nos items: "Sua prova será na Agência X — Rua Y, Cidade/UF"
- Headline: "CONFIRME O LOCAL DA SUA PROVA"

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/hooks/useSessionPersistence.ts` | Adicionar `cepData` ao tipo e persistência |
| `src/pages/Resultado.tsx` | Salvar `cepData` na sessão |
| `src/pages/Inscricao.tsx` | Passar `cepData` na sessão |
| `src/pages/ConfirmaDados.tsx` | Passar `cepData` na sessão |
| `src/pages/DetalhesInscricao.tsx` | Passar `cepData` na sessão |
| `src/pages/Pagamento.tsx` | Passar `cepData` na sessão |
| `src/pages/UpsellInfo.tsx` | Trocar posições 1↔2, renomear pra "Confirmação do Local da Prova", mostrar dados do CEP dinamicamente |
| `src/pages/Upsell.tsx` | Trocar posições 1↔2, atualizar título |

