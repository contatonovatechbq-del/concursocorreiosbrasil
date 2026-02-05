
# Plano: Corrigir Áudios, Remover Mensagem e Resolver PIX

## Problemas Identificados

### 1. Áudios Trocados Incorretamente
Os arquivos de áudio foram copiados mas podem não ter sido corretamente aplicados. Vou recopiar os 3 arquivos:
- `audio_1-2.mp3` → `public/audio/audio-1.mp3`
- `audio_2-2.mp3` → `public/audio/audio-2.mp3` 
- `audio3-2.mp3` → `public/audio/audio-3.mp3`

### 2. Mensagem "38 pessoas estão finalizando"
Localizada em `src/pages/Chat.tsx` nas linhas 938-941 e 1040-1043. Será removida completamente.

### 3. PIX Dando Erro
- A edge function `create-pix` estava offline/não implantada
- Já reimplantei e confirmei que está funcionando
- Preciso também reimplantar `check-pix-status` e `track-funnel`

## Arquivos a Modificar

### `src/pages/Chat.tsx`
- Remover linha 63: `const [onlineUsers] = useState(...)` 
- Remover todas referências a `onlineUsers` e mensagem de pessoas finalizando

### `public/audio/`
- Recopiar audio-1.mp3, audio-2.mp3, audio-3.mp3 dos uploads

### Edge Functions
- Reimplantar `check-pix-status`
- Reimplantar `track-funnel`

## Resultado
- Chat sem a mensagem fake de "X pessoas"
- Todos os 3 áudios novos funcionando
- PIX gerando corretamente
