
# Plano: Substituir os 3 Áudios do Chat

## Objetivo
Substituir os arquivos de áudio atuais do funil do chat pelos novos arquivos enviados.

## Arquivos Atuais (em `public/audio/`)
- `audio-1.mp3` - Explicação do Dr. Rafael sobre a restituição
- `audio-2.mp3` - Instruções para emissão da Ordem de Pagamento
- `audio-3.mp3` - Explicação sobre a obrigatoriedade do imposto IRVJ

## Arquivos Enviados
- `user-uploads://audio_1-2.mp3` → será copiado para `public/audio/audio-1.mp3`
- `user-uploads://audio_2-2.mp3` → será copiado para `public/audio/audio-2.mp3`
- `user-uploads://audio3-2.mp3` → será copiado para `public/audio/audio-3.mp3`

## Ações
1. Copiar `user-uploads://audio_1-2.mp3` para `public/audio/audio-1.mp3`
2. Copiar `user-uploads://audio_2-2.mp3` para `public/audio/audio-2.mp3`
3. Copiar `user-uploads://audio3-2.mp3` para `public/audio/audio-3.mp3`

## Resultado
O chat continuará funcionando normalmente, mas agora com os novos áudios. Nenhuma alteração de código é necessária, pois os caminhos dos arquivos permanecem os mesmos.
