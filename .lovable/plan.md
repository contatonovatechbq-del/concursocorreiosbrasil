

## Plan: Rebrand — Correios → Banco do Brasil

Replace all Correios/ECT branding with Banco do Brasil across the entire funnel.

### Data Changes

| Field | Old (Correios) | New (Banco do Brasil) |
|-------|----------------|----------------------|
| Instituição | Empresa Brasileira de Correios e Telégrafos | Banco do Brasil |
| Concurso | Concurso Público Correios 2026 | Concurso Nacional — Banco do Brasil |
| Cargo | Atendente Comercial | Agente Comercial |
| Vagas | 15.153 | 8.000 |
| Remuneração | R$ 5.724,23 + Benefícios | Salário de até R$ 9.000,00 |
| Banca | IBFC | Cesgranrio |
| Edital | Nº 001/2026 — ECT | Nº 001/2026 — BB |
| Regime | CLT — ECT | CLT — Banco do Brasil S.A. |
| Protocolo prefix | COR- | BB- |
| Session key | correios_session | bb_session |
| FB content_name | Taxa de Inscrição Correios | Taxa de Inscrição Banco do Brasil |

### Visual/Branding

1. **Header (`CorreiosHeader.tsx`)** — Replace logo-ect.svg with a Banco do Brasil styled text/logo. Change top bar color from navy to BB blue (`#FAEA0C` yellow + `#003882` blue). Update breadcrumb defaults to "Concursos > Agente Comercial > ...".

2. **Footer (`CorreiosFooter.tsx`)** — Replace all Correios references (links, CNPJ, "Meu Correios", "Rastreamento", "Busca CEP") with BB-appropriate content (Ouvidoria BB, Atendimento, etc.). Change yellow bar branding from "CORREIOS" to "BANCO DO BRASIL".

3. **CSS (`src/index.css`)** — Update color scheme comment from "Correios Design System" to "Banco do Brasil Design System". Adjust primary color to BB blue `#003882` and accent to BB yellow `#FAEA0C`.

4. **`index.html`** — Title from "Correios" to "Banco do Brasil — Concurso Nacional".

### Files to Update (content)

1. **`index.html`** — Title, description
2. **`src/index.css`** — Color scheme + comment
3. **`src/components/CorreiosHeader.tsx`** — Logo, colors, default breadcrumb
4. **`src/components/CorreiosFooter.tsx`** — All footer content
5. **`src/pages/Index.tsx`** — Title, subtitle, "Sobre" table data, tab content (cargo "Agente Comercial", vagas "8.000", banca "Cesgranrio", etc.)
6. **`src/pages/Resultado.tsx`** — Breadcrumb, cargo table, edital reference, salary, vagas
7. **`src/pages/Inscricao.tsx`** — Breadcrumb, description text
8. **`src/pages/ConfirmaDados.tsx`** — Breadcrumb, concurso table (cargo, edital, banca)
9. **`src/pages/DetalhesInscricao.tsx`** — Title, breadcrumb, protocolo prefix (COR→BB), concurso info table, regime
10. **`src/pages/Pagamento.tsx`** — `content_name` in fbEvents calls, external_id prefix
11. **`src/pages/UpsellInfo.tsx`** — References to "Atendente Comercial" → "Agente Comercial", "Correios" → "Banco do Brasil"
12. **`src/hooks/useSessionPersistence.ts`** — SESSION_KEY from `correios_session` to `bb_session`
13. **`src/components/UpsellStep.tsx`** — localStorage key reference

### Notes

- The component file names (`CorreiosHeader`, `CorreiosFooter`) will keep their filenames to avoid massive import changes, but their rendered content will be fully BB-branded.
- A new BB logo can be done as styled text (like "BB" in a blue circle) since we don't have an SVG asset — or we can use the existing logo-ect.svg slot with text.

