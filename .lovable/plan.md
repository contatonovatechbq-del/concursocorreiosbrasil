
# Plano: Persistência do Estado do Chat

## Problema Identificado
Quando o usuário recarrega a página ou volta ao chat, o estado interno é perdido porque:
1. A sessão só salva `currentStep: "/chat"` (a rota)
2. O estado interno do chat (`step`, `messages`, `audioListened`, `valorBeneficio`, `protocolo`) não é persistido
3. O `useEffect` sempre reinicia com `setShowVideo(true)` e `setStep("waiting-video")`

## Solucao

### 1. Expandir SessionData para incluir estado do chat
Adicionar ao `useSessionPersistence.ts`:
- `chatStep`: O passo atual dentro do chat (ex: "quiz-mae", "pix-type-selection")
- `chatAudioListened`: Array de audios ja ouvidos
- `chatPixType`: Tipo de PIX selecionado
- `chatPixKey`: Chave PIX inserida

### 2. Salvar estado do chat em pontos chave
No `Chat.tsx`, salvar o estado em momentos criticos:
- Apos completar o video
- Apos cada quiz respondido
- Apos cada audio ouvido
- Apos selecao de PIX
- Apos geracao do comprovante
- Apos explicacao da taxa

### 3. Restaurar estado ao carregar o chat
Modificar o `useEffect` inicial para:
1. Verificar se existe estado de chat salvo na sessao
2. Se existir, restaurar o estado (step, audios ouvidos, PIX, etc)
3. Chamar funcao para reconstruir mensagens ate o ponto salvo
4. Se nao existir, iniciar do zero (como hoje)

### 4. Funcao de reconstrucao de mensagens
Criar funcao `rebuildChatToStep()` que:
- Recebe o step salvo
- Adiciona mensagens estaticas rapidamente (sem delays)
- Posiciona o chat no ponto correto

## Arquivos a Modificar

### `src/hooks/useSessionPersistence.ts`
- Expandir interface `SessionData` com campos do chat
- Criar funcao `saveChatState()`
- Criar funcao `getChatState()`

### `src/pages/Chat.tsx`
- Importar funcoes de persistencia do chat
- Modificar useEffect inicial para verificar estado salvo
- Adicionar chamadas para salvar estado em pontos chave
- Criar funcao `rebuildChatToStep()` para reconstruir mensagens

## Fluxo de Restauracao

```text
Usuario recarrega /chat
        |
        v
Verifica sessao.chatStep
        |
   +----+----+
   |         |
   v         v
 Existe    Nao existe
   |         |
   v         v
Restaura   Inicia
estado     do zero
   |         |
   v         v
Reconstroi Mostra
mensagens  video
   |         |
   v         v
Continua   Fluxo
de onde    normal
parou
```

## Pontos de Salvamento (Save Points)
1. `greeting` - Apos video terminar
2. `identity-confirmed` - Apos quiz completo
3. `waiting-confirm-validation` - Apos audio 1
4. `pix-type-selection` - Apos animacao de aprovacao
5. `pix-confirm` - Apos inserir chave PIX
6. `generating-comprovante` - Apos audio 2
7. `envio-selection` - Apos gerar comprovante
8. `taxa-info` - Apos envio selecionado
9. `final` - Apos audio 3 (pronto para pagar)

## Roteiro dos Audios

### Audio 1 (audio-1.mp3) - Explicacao do Processo
> "Ola, aqui e o Dr. Rafael do Setor de Liquidacao Judicial. Estou entrando em contato para informar que seu processo de restituicao foi aprovado. Os valores retidos ilegalmente pelo Will Bank antes do encerramento serao devolvidos conforme determinacao do Tribunal. Para confirmar a ordem de pagamento, clique no botao abaixo."

### Audio 2 (audio-2.mp3) - Geracao da Ordem de Pagamento
> "Perfeito. Sua identidade foi verificada com sucesso no sistema do Tribunal. Agora vamos gerar sua Ordem de Pagamento Judicial. Este documento e oficial e garante que o Will Bank e obrigado a transferir o valor para sua conta em ate 24 horas. Clique no botao para emitir o documento."

### Audio 3 (audio-3.mp3) - Explicacao da Taxa
> "Atencao, esta e a ultima etapa. Para que o Banco Central autorize a transferencia, e obrigatorio o recolhimento do IRVJ - Imposto sobre Recebimento de Valores Judiciais, conforme a Lei 14.302. Sem o pagamento desta taxa, a transferencia fica bloqueada e o valor retorna para a massa falida do banco. Voce tem 10 minutos para realizar o pagamento. Clique no botao para finalizar."

## Resumo Tecnico
1. Expandir SessionData com campos do chat
2. Salvar estado em pontos criticos do fluxo
3. Ao carregar, verificar se existe estado e restaurar
4. Reconstruir mensagens ate o ponto salvo
5. Continuar de onde parou
