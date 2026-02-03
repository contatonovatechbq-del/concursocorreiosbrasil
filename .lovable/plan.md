

# Plano: Ajustar Vídeos - Reportagem na Notícia e VSL no Chat

## Resumo

Trocar os vídeos de lugar: colocar o vídeo da "reportagem" (video_consulta.mp4) na página de notícia com visual limpo de reportagem, e restaurar o vídeo VSL (vsl_1.mp4) no chat como estava antes.

## O que vai mudar

### 1. Página de Notícia (/) - Visual de Reportagem

**Antes:**
- Vídeo: vsl_1.mp4
- Título: "VÍDEO EXPLICATIVO" + "Entenda como receber sua indenização"
- Barra de progresso com "X% assistido"
- Mensagem "Assista o vídeo para liberar" antes do botão

**Depois:**
- Vídeo: video_consulta.mp4
- Título: "REPORTAGEM OFICIAL" (vermelho, simples)
- Sem barra de progresso
- Sem mensagem de "assista para liberar"
- Quando o vídeo terminar, aparece o botão "CONSULTAR MEU CPF AGORA"

### 2. Página de Chat (/chat) - Restaurar VSL

O chat já usa o vídeo vsl_1.mp4 corretamente no início. Não precisa de alteração.

## Detalhes Técnicos

### Arquivo: `src/pages/Noticia.tsx`

Mudanças na seção de vídeo (linhas 148-205):

1. **Trocar o vídeo**: De `/video/vsl_1.mp4` para `/video/video_consulta.mp4`

2. **Simplificar título**:
   - Manter: "REPORTAGEM OFICIAL" (vermelho, bold)
   - Remover subtítulo "Assista ao vídeo completo para liberar..."

3. **Remover barra de progresso**: Eliminar o bloco inteiro com a barra e o texto "X% assistido"

4. **Remover estados desnecessários**: `videoProgress` e `onTimeUpdate` não serão mais usados

5. **Simplificar botão**:
   - Quando `videoEnded === false`: Nada aparece (só o vídeo)
   - Quando `videoEnded === true`: Aparece o botão vermelho "CONSULTAR MEU CPF AGORA"

### Visual Final da Seção de Vídeo

```
┌─────────────────────────────────────────┐
│ ▌ REPORTAGEM OFICIAL                    │
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

### Código a ser alterado

**Remover:**
- Estado `videoProgress`
- Função `onTimeUpdate` do vídeo
- Bloco da barra de progresso (linhas 179-189)
- Bloco do botão desabilitado "Assista o vídeo para liberar" (linhas 200-204)

**Modificar:**
- Fonte do vídeo: `vsl_1.mp4` → `video_consulta.mp4`
- Título: "VÍDEO EXPLICATIVO" → "REPORTAGEM OFICIAL"
- Remover subtítulo

**Manter:**
- Estado `videoEnded` para controlar quando mostrar o botão
- Botão "CONSULTAR MEU CPF AGORA" quando `videoEnded === true`

