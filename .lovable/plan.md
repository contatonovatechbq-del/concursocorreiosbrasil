

## Plano: Mudar data da prova para hoje + 10 dias

Atualmente `getProvaDate()` soma **45 dias**. Precisa trocar para **10 dias**.

### Arquivos alterados

1. **`src/pages/Resultado.tsx`** — linha 14: `d.setDate(d.getDate() + 45)` → `d.setDate(d.getDate() + 10)`
2. **`src/pages/DetalhesInscricao.tsx`** — linha 13: `d.setDate(d.getDate() + 45)` → `d.setDate(d.getDate() + 10)`

Mudança de 1 linha em cada arquivo.

