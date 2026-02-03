

# Plano: Trocar CTA Grande por Link Discreto

## Resumo

Remover o botão grandão cinza do meio do artigo e substituir por um link discreto e elegante, mais no estilo de notícia do G1.

## O que vai mudar

### Situação Atual
```
[Como resgatar seu dinheiro?]
[Passos 1, 2, 3, 4...]
[Parágrafo sobre próximos saques]

[BOX CINZA GRANDE]           ← REMOVER
[CONSULTAR MEU CPF]
[Consulta gratuita...]

[ÚLTIMO AVISO...]
```

### Como vai ficar
```
[O banco FECHOU. Você tem dinheiro preso lá?]
[Lista de quem tem direito...]
[Parágrafo sobre CPF...]

→ Consulte agora seu CPF     ← LINK DISCRETO (antes de "Quanto você tem a receber")

[Quanto você tem a receber?]
[Tabela de valores...]

[ÚLTIMO AVISO...]
[BOX CINZA GRANDE - FINAL]   ← MANTÉM
```

## Visual do Link Discreto

Um texto simples azul com setinha, parecendo um link de notícia:

```
→ Consulte agora seu CPF
```

Estilo: texto azul (#0669de), com hover sublinhado, discreto como um link inline de artigo.

## Detalhes Técnicos

### Arquivo: `src/pages/Noticia.tsx`

**Mudança 1** - Remover o CTA grandão do meio (linhas 262-276):

Deletar todo o bloco:
```tsx
{/* CTA sempre visível - Meio do artigo */}
<div className="bg-[#eee] p-6 rounded my-8 text-center">
  ...
</div>
```

**Mudança 2** - Adicionar link discreto antes de "Quanto você tem a receber?" (após linha 207):

```tsx
<p className="my-4">
  <button 
    onClick={handleConsultar}
    className="text-[#0669de] hover:underline font-medium"
  >
    → Consulte agora seu CPF
  </button>
</p>
```

## Posição Final dos CTAs

| Elemento | Posição | Estilo |
|----------|---------|--------|
| Link discreto | Antes de "Quanto você tem a receber?" | Texto azul simples |
| Botão do vídeo | Logo após o vídeo terminar | Botão vermelho grande |
| CTA final | Após "ÚLTIMO AVISO" | Box cinza com botão |

