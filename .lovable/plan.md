

# Plano: Adicionar Subtítulo na Seção de Vídeo

## Resumo

Adicionar um subtítulo explicativo abaixo de "REPORTAGEM OFICIAL" para dar mais contexto ao vídeo. Os botões de CTA que já existem na página continuam funcionando normalmente.

## O que vai mudar

### Seção do Vídeo (única mudança)

**Antes:**
```
REPORTAGEM OFICIAL

[VÍDEO]
```

**Depois:**
```
REPORTAGEM OFICIAL
Entenda como receber seu pagamento

[VÍDEO]
```

## O que já está funcionando e vai continuar igual

- Botão "CONSULTAR MEU CPF AGORA" aparece logo abaixo do vídeo quando termina
- CTA no final do artigo ("Vídeo assistido - Consulta liberada!") aparece quando termina o vídeo
- Todos os outros elementos da página continuam iguais

## Detalhes Técnicos

### Arquivo: `src/pages/Noticia.tsx`

**Linha 149-151** - Adicionar subtítulo após o título:

```tsx
// ANTES:
<p className="text-[#cc0000] font-bold text-lg mb-4">
  REPORTAGEM OFICIAL
</p>

// DEPOIS:
<p className="text-[#cc0000] font-bold text-lg mb-1">
  REPORTAGEM OFICIAL
</p>
<p className="text-[#1a1a1a] font-bold text-xl mb-4">
  Entenda como receber seu pagamento
</p>
```

### Visual Final

```text
┌─────────────────────────────────────────┐
│ ▌ REPORTAGEM OFICIAL                    │
│   Entenda como receber seu pagamento    │
├─────────────────────────────────────────┤
│                                         │
│           [VIDEO PLAYER]                │
│        video_consulta.mp4               │
│                                         │
├─────────────────────────────────────────┤
│  (Após vídeo terminar)                  │
│  [  CONSULTAR MEU CPF AGORA  ]          │
└─────────────────────────────────────────┘
```

