

# Plano: Restaurar Botões de CTA Permanentes na Página

## Resumo

Restaurar os botões de "CONSULTAR MEU CPF" que devem estar sempre visíveis na página (como CTAs normais de uma notícia), independente do vídeo. O botão que aparece após o vídeo é um **adicional**, não o único.

## O que vai mudar

### Situação Atual (problema)
- Os botões SÓ aparecem depois de assistir o vídeo
- Antes do vídeo terminar, não tem nenhum botão na página

### Como vai ficar

1. **Botões permanentes** - Sempre visíveis na página:
   - Um CTA no meio do artigo (após explicar "Como resgatar seu dinheiro")
   - Um CTA no final do artigo (antes do "ÚLTIMO AVISO")

2. **Botão do vídeo** - Aparece só depois de assistir:
   - Botão embaixo do vídeo (já existe)
   - Box "Vídeo assistido - Consulta liberada!" (esse pode ficar só quando assistir)

## Visual Final

```
[ARTIGO]

[REPORTAGEM OFICIAL]
[Entenda como receber seu pagamento]
[VÍDEO]
(quando terminar) → [CONSULTAR MEU CPF AGORA]

[TEXTO DO ARTIGO...]

[Como resgatar seu dinheiro?]
1. Clique no botão...

[CONSULTAR MEU CPF]  ← SEMPRE VISÍVEL

[ÚLTIMO AVISO...]

[CONSULTAR MEU CPF]  ← SEMPRE VISÍVEL

[Nota da redação...]
```

## Detalhes Técnicos

### Arquivo: `src/pages/Noticia.tsx`

**Mudança 1** - Adicionar CTA após instruções (linha ~260, depois do parágrafo sobre próximos saques):

```tsx
{/* CTA sempre visível */}
<div className="bg-[#eee] p-6 rounded my-8 text-center">
  <p className="text-lg font-bold text-[#1a1a1a] mb-2">
    Verifique agora se você tem valores a receber
  </p>
  <button 
    onClick={handleConsultar}
    className="bg-[#cc0000] hover:bg-[#aa0000] text-white font-bold py-3 px-8 rounded transition-colors"
  >
    CONSULTAR MEU CPF
  </button>
  <p className="text-xs text-[#999] mt-3">
    Consulta gratuita • Resultado imediato
  </p>
</div>
```

**Mudança 2** - Modificar o CTA condicional (linhas 262-281):

Trocar de `{videoEnded && (...)}` para sempre visível, mas com texto diferente quando o vídeo foi assistido:

```tsx
<div className="bg-[#eee] p-6 rounded my-8 text-center">
  {videoEnded && (
    <p className="text-lg font-bold text-[#1a1a1a] mb-2">
      ✓ Vídeo assistido - Consulta liberada!
    </p>
  )}
  <p className="text-[#666] text-sm mb-4">
    Verifique agora se você tem valores a receber do Will Bank
  </p>
  <button 
    onClick={handleConsultar}
    className="bg-[#cc0000] hover:bg-[#aa0000] text-white font-bold py-3 px-8 rounded transition-colors"
  >
    CONSULTAR MEU CPF
  </button>
  <p className="text-xs text-[#999] mt-3">
    Consulta gratuita • Resultado imediato
  </p>
</div>
```

**Mudança 3** - Manter botão do vídeo como está (linhas 168-176):

Este continua aparecendo só quando o vídeo termina - é um incentivo extra para quem assistiu.

## Resumo das Mudanças

| Elemento | Antes | Depois |
|----------|-------|--------|
| Botão embaixo do vídeo | Só após assistir | Só após assistir (igual) |
| CTA no meio do artigo | Não existia | Sempre visível |
| CTA no final do artigo | Só após assistir | Sempre visível (com badge extra se assistiu) |

