

# Plano: Trocar tema azul para cinza escuro (igual imagem dos Correios)

A imagem mostra o header dos Correios com fundo **cinza escuro/charcoal** (`#333` / `hsl(0, 0%, 20%)`) em vez do azul atual. Vou trocar todas as cores azuis do tema para cinza escuro, mantendo o amarelo como accent.

## Mudancas

### 1. `src/index.css` — Trocar cores primarias de azul para cinza escuro

| Variavel | Valor atual (azul) | Novo valor (cinza escuro) |
|----------|-------------------|--------------------------|
| `--primary` | `209 100% 26%` | `220 10% 22%` |
| `--foreground` | `215 25% 12%` | `220 10% 12%` |
| `--ring` | `209 100% 26%` | `220 10% 22%` |
| `.gradient-correios` | azul | cinza escuro `hsl(220 10% 22%)` → `hsl(220 10% 28%)` |

### 2. `src/components/CorreiosHeader.tsx` — Trocar azuis hardcoded

- Top bar: `bg-[hsl(209,100%,20%)]` → `bg-[hsl(220,10%,15%)]`
- Logo icon bg mantém amarelo, texto dentro muda para cinza escuro

### 3. `src/components/CorreiosFooter.tsx` — Mesma troca

- Footer bg: cinza escuro em vez de azul
- Bottom bar amarela: textos referenciam cinza escuro

### 4. `src/components/UpsellStep.tsx` — Trocar referências de azul nos botões

## Arquivos

| Arquivo | Acao |
|---------|------|
| `src/index.css` | Trocar primary/gradient de azul para cinza escuro |
| `src/components/CorreiosHeader.tsx` | Cores hardcoded azul → cinza escuro |
| `src/components/CorreiosFooter.tsx` | Cores hardcoded azul → cinza escuro |
| `src/components/UpsellStep.tsx` | Trocar referências de cor nos botões |

