

# Corrigir cronograma e "Banca" duplicada

## Problemas encontrados
1. **Linha 94-95**: "Banca" aparece 2 vezes — linha duplicada
2. **Cronograma**: datas muito próximas e o texto "XX/XX/XXXX a XX/XX/XXXX" fica apertado em 390px
3. **Datas**: prova em +45 dias, gabarito +3 dias depois — muito perto

## Mudanças

### `src/pages/Index.tsx`

**Remover "Banca" duplicada** (linha 95): deletar a segunda `<tr>` de Banca.

**Ajustar `getContestDates`** (linhas 12-21):
- Inscrições: manter início -5, fim +25 dias (em vez de +15)
- Prova: +75 dias (em vez de +45)
- Gabarito: +10 dias após prova (em vez de +3)
- Resultado: +45 dias após prova (manter)

**Cronograma — separar período de inscrições** em 2 linhas para não sobrepor:
- "Início das Inscrições" → data início
- "Encerramento" → data fim

Adicionar `whitespace-nowrap text-xs` nas células de data para evitar quebra.

