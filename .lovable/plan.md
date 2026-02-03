
# Plano: Corrigir Bug dos Áudios no Chat

## Problema Identificado

A lógica de verificação dos áudios está **invertida** em dois lugares, causando o bug de "clicar duas vezes" e mensagens não aparecendo corretamente.

### Mapeamento Atual (INCORRETO)

| Etapa | Áudio Tocado | Áudio Verificado |
|-------|--------------|------------------|
| `audio-3-validation` | audio-1.mp3 | audio-3.mp3 |
| `audio-2-comprovante` | audio-2.mp3 | audio-2.mp3 |
| `final` | audio-3.mp3 | audio-1.mp3 |

### Mapeamento Correto

| Etapa | Áudio Tocado | Áudio que Deve Verificar |
|-------|--------------|--------------------------|
| `audio-3-validation` | audio-1.mp3 | audio-1.mp3 |
| `audio-2-comprovante` | audio-2.mp3 | audio-2.mp3 |
| `final` | audio-3.mp3 | audio-3.mp3 |

## Correções Necessarias

### 1. Corrigir Verificacao na Etapa audio-3-validation (Linhas 695-699)

**Antes:**
```javascript
{step === "audio-3-validation" && (waitingForAudio === null || audioListened.has("/audio/audio-3.mp3")) && ...}
{step === "audio-3-validation" && waitingForAudio === "/audio/audio-3.mp3" && !audioListened.has("/audio/audio-3.mp3") && ...}
```

**Depois:**
```javascript
{step === "audio-3-validation" && (waitingForAudio === null || audioListened.has("/audio/audio-1.mp3")) && ...}
{step === "audio-3-validation" && waitingForAudio === "/audio/audio-1.mp3" && !audioListened.has("/audio/audio-1.mp3") && ...}
```

### 2. Corrigir Verificacao na Etapa final (Linhas 738-742)

**Antes:**
```javascript
{step === "final" && (waitingForAudio === null || audioListened.has("/audio/audio-1.mp3")) && ...}
{step === "final" && waitingForAudio === "/audio/audio-1.mp3" && !audioListened.has("/audio/audio-1.mp3") && ...}
```

**Depois:**
```javascript
{step === "final" && (waitingForAudio === null || audioListened.has("/audio/audio-3.mp3")) && ...}
{step === "final" && waitingForAudio === "/audio/audio-3.mp3" && !audioListened.has("/audio/audio-3.mp3") && ...}
```

## Fluxo Correto Apos Correcoes

1. Usuario ouve audio-1.mp3 (validacao)
2. Botao "CONFIRMAR VALIDACAO" aparece
3. Usuario confirma PIX
4. Usuario ouve audio-2.mp3 (comprovante)
5. Botao "CONFIRMAR" aparece
6. Usuario escolhe SMS/Email
7. Usuario ouve audio-3.mp3 (taxas)
8. Botao "Concluir pagamento" aparece

---

## Secao Tecnica

### Arquivos Modificados
- `src/pages/Chat.tsx`

### Linhas Afetadas
- Linha 695: Trocar `audio-3.mp3` por `audio-1.mp3`
- Linha 699: Trocar `audio-3.mp3` por `audio-1.mp3`
- Linha 738: Trocar `audio-1.mp3` por `audio-3.mp3`
- Linha 742: Trocar `audio-1.mp3` por `audio-3.mp3`

### Risco
Baixo - apenas corrige referencias incorretas de strings.
