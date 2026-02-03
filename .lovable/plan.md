
# Plano: Vídeo Integrado na Página de Notícia

## Resumo

Vou integrar o vídeo diretamente na página de notícia do G1 para aumentar a credibilidade. O vídeo terá um título em vermelho destacado, e um botão só aparecerá depois que o usuário assistir o vídeo completo.

## O que vai mudar

### Experiência do Usuário

1. **Na página de notícia (/):**
   - Adicionar uma seção de vídeo com o título em vermelho: **"Entenda como receber sua indenização"**
   - Subtítulo: "Veja o vídeo explicativo antes de consultar"
   - O vídeo será exibido no estilo G1 (mesma estética da notícia)
   - **Botão "CONSULTAR AGORA"** aparece APENAS depois de assistir o vídeo completo
   - Enquanto o vídeo não terminar, mostra uma mensagem tipo "Assista o vídeo para liberar a consulta"

2. **Simplificação do Fluxo:**
   - A página de vídeo separada (/video) não será mais usada no fluxo principal
   - O vídeo já fica na própria notícia, gerando mais credibilidade

### Posicionamento do Vídeo

O vídeo será inserido logo após a imagem principal da notícia, antes do corpo do artigo. Isso garante que o usuário veja o vídeo antes de ler os detalhes.

## Detalhes Técnicos

### Arquivo a ser modificado:
- `src/pages/Noticia.tsx`

### Mudanças no código:

1. **Adicionar estados para controle do vídeo:**
   - `videoEnded` - para saber quando o vídeo terminou
   - `videoProgress` - para mostrar progresso (opcional)
   - `videoRef` - referência ao elemento de vídeo

2. **Adicionar seção de vídeo com estilo G1:**
   ```
   - Título vermelho: "VÍDEO EXPLICATIVO"
   - Subtítulo: "Entenda como receber sua indenização"
   - Player de vídeo usando /video/vsl_1.mp4 ou /video/video_consulta.mp4
   - Barra de progresso
   ```

3. **Lógica do botão:**
   - Botão fica desabilitado/oculto até `videoEnded === true`
   - Quando o vídeo termina, aparece o botão: "CONSULTAR MEU CPF AGORA"
   - Clicar no botão leva para `/verificacao`

4. **Remover os CTAs atuais que aparecem antes do vídeo:**
   - Os botões de consulta só aparecem depois do vídeo

### Estilo Visual (seguindo padrão G1):
- Fundo cinza claro para destacar a seção de vídeo
- Título em vermelho (#cc0000) com fonte bold
- Borda vermelha à esquerda (igual aos boxes de CTA atuais)
- Player de vídeo com cantos arredondados
- Botão vermelho grande quando liberado

## Fluxo Atualizado

```
Notícia (/) → Assiste vídeo → Botão liberado → Clica
    ↓
Verificação (/verificacao) → Login → ... resto do funil
```
