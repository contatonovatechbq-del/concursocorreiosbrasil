

# Duas correções: buscar agência real + renomear "Agente de Correios" → "Atendente Comercial"

## 1. Buscar agência real mais próxima do CEP

A edge function `find-agency` já existe e já usa Nominatim + Overpass API para buscar agências reais. O frontend em `Resultado.tsx` já chama essa function e exibe o resultado. **Isso já está implementado.**

Vou verificar se está funcionando corretamente — se houver erro, debugar via console/network logs.

## 2. Renomear "Agente de Correios" → "Atendente Comercial" em todos os lugares

Trocar todas as ocorrências de "Agente de Correios" por "Atendente Comercial" nos breadcrumbs e textos:

### Arquivos a editar:

- **`src/pages/Index.tsx` (linha 66)**: `Agente de Correios — Atendente Comercial` → `Atendente Comercial`
- **`src/pages/Resultado.tsx` (linha 84)**: breadcrumb `Agente de Correios` → `Atendente Comercial`
- **`src/pages/Inscricao.tsx` (linha 50)**: breadcrumb `Agente de Correios` → `Atendente Comercial`
- **`src/pages/ConfirmaDados.tsx` (linha 34)**: breadcrumb `Agente de Correios` → `Atendente Comercial`
- **`src/pages/DetalhesInscricao.tsx` (linha 36)**: breadcrumb `Agente de Correios` → `Atendente Comercial`
- **`src/pages/Pagamento.tsx` (linha 128)**: breadcrumb `Agente de Correios` → `Atendente Comercial`
- **`src/components/CorreiosHeader.tsx` (linha 8)**: default breadcrumb `Agente de Correios` → `Atendente Comercial`

### Subtítulo do Index (linha 66)
Mudar de:
`Edital Nº 001/2026 — Agente de Correios — Atendente Comercial | Nível Médio`

Para:
`Edital Nº 001/2026 — Atendente Comercial | Nível Médio`

