

## Plano: Remodelar funil inteiro para Concurso dos Correios 2026

### Resumo
Trocar todas as referencias do Banco do Brasil para Empresa Brasileira de Correios e Telegrafos. Cargo: Atendente Comercial. Banca: IBFC. Vagas: 12.874. Remuneracao: R$ 4.724,23. Carga: 30h. Escolaridade: Nivel Medio.

### 1. Cores e identidade visual (`src/index.css`)

Trocar o tema BB (azul escuro + amarelo) para tema Correios:
- **Primary**: Amarelo Correios `48 100% 50%` (amarelo forte)
- **Accent**: Azul Correios `220 80% 35%` (azul escuro)
- **Primary-foreground**: texto escuro sobre amarelo
- **Accent-foreground**: branco sobre azul
- Gradientes `gradient-bb` e `gradient-bb-accent` renomeados para `gradient-correios` e ajustados
- Comentario CSS: "Correios Design System"

### 2. Logo e Header (`src/components/CorreiosHeader.tsx`)

- Trocar `bb-logo-top.png` por `logo-ect.svg` (ja existe no projeto)
- Alt text: "Correios"
- Breadcrumb default: "Concursos > Atendente Comercial > Inscricao"
- Top bar e header ajustados para cores Correios

### 3. Footer (`src/components/CorreiosFooter.tsx`)

- Logo: `logo-ect.svg`
- Texto: "2026 Empresa Brasileira de Correios e Telegrafos"
- CNPJ: 34.028.316/0001-03
- Colunas: Institucional, Concursos, Atendimento (SAC Correios 0800 725 7282), Acesso Rapido
- Remover GOV.BR badge ou manter se quiser

### 4. Pagina Index (`src/pages/Index.tsx`)

- Titulo: "CONCURSO NACIONAL — CORREIOS 2026"
- Edital: "Edital No 001/2026 — Atendente Comercial | Nivel Medio"
- Tabela "Sobre":
  - Instituicao: Empresa Brasileira de Correios e Telegrafos
  - Cargo: Atendente Comercial
  - Vagas: 12.874 em todo o Brasil
  - Remuneracao: R$ 4.724,23 + Beneficios (VA, VT, Plano de Saude)
  - Carga Horaria: 30 horas semanais
  - Remover "Vale-Alimentacao", "Previdencia Complementar Previ" (sao do BB)
  - Banca: IBFC
- Tab Cargos: "Atendente Comercial" com 12.874 vagas

### 5. Pagina Resultado (`src/pages/Resultado.tsx`)

- Breadcrumb: "Concursos > Atendente Comercial > Local de Prova"
- Tabela Resumo do Cargo: dados Correios
- Remover "Previdencia Previ", "Cassi"
- Edital: "No 001/2026 — Correios/IBFC"

### 6. Pagina Inscricao (`src/pages/Inscricao.tsx`)

- Texto: "Concurso Nacional Correios 2026 (Edital No 001/2026)"
- Breadcrumb atualizado

### 7. Pagina ConfirmaDados (`src/pages/ConfirmaDados.tsx`)

- Cargo: "Atendente Comercial — Nivel Medio"
- Edital: "No 001/2026 — Correios"
- Banca: "IBFC"

### 8. Pagina DetalhesInscricao (`src/pages/DetalhesInscricao.tsx`)

- Titulo: "DETALHES DA INSCRICAO — CONCURSO CORREIOS 2026"
- Protocolo prefix: "ECT-" em vez de "BB-"
- Informacoes do Concurso: dados Correios
- Remover Cassi, Previ, PLR
- Regime: CLT — ECT

### 9. Pagina Pagamento (`src/pages/Pagamento.tsx`)

- fbEvents content_name: "Taxa de Inscricao Correios"
- Breadcrumb atualizado

### 10. Upsells — `src/pages/Upsell.tsx`

- Breadcrumb: "Concursos > Atendente Comercial > Taxas"
- Protocolo fallback: `ECT${Date.now()}`

### 11. UpsellInfo (`src/pages/UpsellInfo.tsx`)

- Breadcrumb: "Concursos > Atendente Comercial > Confirmacoes de Etapa"
- Tabela "Beneficios do Cargo" atualizada para Correios:
  - Remuneracao: R$ 4.724,23 + Beneficios
  - Jornada: 30h semanais
  - VA, VT, Plano de Saude (generico, nao Cassi)
  - Remover Previ
- Upsell 9: "agencia do Banco do Brasil" → "unidade dos Correios"
- Todas as mencoes a BB/Banco do Brasil nas descricoes dos 19 upsells trocadas para Correios/ECT

### 12. UpsellStep (`src/components/UpsellStep.tsx`)

- Classe `gradient-bb-accent` → `gradient-correios` (ou atualizar o nome da classe no CSS)

### 13. Session key (`src/hooks/useSessionPersistence.ts`)

- `bb_session` → `correios_session`
- Atualizar tambem a referencia hardcoded no UpsellStep.tsx (linha 59)

### Arquivos alterados (13 arquivos)

1. `src/index.css` — cores e gradientes
2. `src/components/CorreiosHeader.tsx` — logo + breadcrumb
3. `src/components/CorreiosFooter.tsx` — logo + textos
4. `src/pages/Index.tsx` — dados do concurso
5. `src/pages/Resultado.tsx` — dados do cargo
6. `src/pages/Inscricao.tsx` — textos
7. `src/pages/ConfirmaDados.tsx` — cargo/edital/banca
8. `src/pages/DetalhesInscricao.tsx` — dados concurso + protocolo
9. `src/pages/Pagamento.tsx` — content_name FB
10. `src/pages/Upsell.tsx` — breadcrumb + protocolo
11. `src/pages/UpsellInfo.tsx` — beneficios + descricoes upsells
12. `src/components/UpsellStep.tsx` — gradient class + session key
13. `src/hooks/useSessionPersistence.ts` — session key

