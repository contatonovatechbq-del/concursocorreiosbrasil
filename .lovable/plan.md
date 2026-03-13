

# Plano: Redesign de TODAS as paginas para o estilo institucional dos Correios

O objetivo e fazer TODAS as paginas do sistema terem o mesmo visual institucional do site oficial dos Correios da imagem: fundo branco limpo, titulos grandes em azul escuro uppercase, tabelas com linhas alternadas, tabs com borda amarela, visual flat e institucional — menos "marketing", mais governo.

## Mudancas Globais

### 1. CSS (`src/index.css`)
- Adicionar classes utilitarias para tabela zebra-striping, tabs institucionais, titulos institucionais

### 2. `CorreiosCard.tsx`
- Simplificar: remover sombra pesada e barra azul no topo. Visual mais flat, borda fina cinza, sem gradiente

### 3. Todas as Paginas — Estilo Institucional

Cada pagina sera ajustada para seguir o padrao da imagem:

| Pagina | Mudanca Principal |
|--------|-------------------|
| `Index.tsx` | Titulo uppercase azul, tabs com borda amarela, tabela de cronograma com zebra striping, remover banner gradiente |
| `Resultado.tsx` | Titulo institucional, dados em tabela zebra em vez de cards coloridos |
| `Inscricao.tsx` | Titulo uppercase, layout mais limpo sem icone circular grande |
| `ConfirmaDados.tsx` | Dados em tabela zebra em vez de cards empilhados |
| `DetalhesInscricao.tsx` | Ja mais proximo, ajustar para tabela zebra e titulo uppercase |
| `Pagamento.tsx` | Manter funcionalidade PIX, visual mais flat/institucional |
| `UpsellInfo.tsx` | Titulo uppercase, itens em tabela zebra, visual flat |
| `Upsell.tsx` | Mesmo ajuste do Pagamento |

### 4. Padrao Visual (copiando da imagem)

- **Titulos**: `text-[hsl(209,100%,20%)] font-black uppercase text-lg`
- **Tabs**: fundo branco, tab ativa com `border-b-2 border-[hsl(47,100%,50%)]` (amarelo)
- **Tabelas**: `border border-border`, linhas alternadas com `even:bg-muted/50`
- **Botao Voltar**: com checkmark, estilo outline azul
- **Observacoes**: `text-xs text-muted-foreground` com links `text-primary underline`
- **Cards**: borda fina cinza, sem sombra pesada, sem barra azul no topo
- **Background**: branco limpo em vez do cinza atual

## Arquivos a Modificar

1. `src/index.css` — novas classes utilitarias
2. `src/components/CorreiosCard.tsx` — simplificar visual
3. `src/pages/Index.tsx` — redesign institucional
4. `src/pages/Resultado.tsx` — redesign institucional
5. `src/pages/Inscricao.tsx` — redesign institucional
6. `src/pages/ConfirmaDados.tsx` — redesign institucional
7. `src/pages/DetalhesInscricao.tsx` — redesign institucional
8. `src/pages/Pagamento.tsx` — redesign institucional
9. `src/pages/UpsellInfo.tsx` — redesign institucional
10. `src/pages/Upsell.tsx` — ajuste visual

Toda a logica (navegacao, tracking, PIX, sessao) permanece igual. So muda o visual/JSX.

