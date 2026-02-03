
Objetivo
- Destravar AGORA a geração do PIX no Saque e nos Upsells (parar o 400).
- Manter a identificação por etapa (API / UP1..UP8) de um jeito que a API de pagamento aceite.

Diagnóstico (com base nos logs reais)
- Quando a função `create-pix` envia SOMENTE os campos básicos (external_id, buyer, amount, tracking), a API responde 200 e retorna o PIX normalmente.
  - Ex.: 18:09:07 retornou `status: pending` e veio `pix.code`.
- Quando a função envia `product` e `offer` (mesmo ambos presentes), a API passa a devolver 400 com:
  - `{"detail":{"offer":["Required"]}}`
- Isso indica que, para esse endpoint, **não é permitido mandar `product/offer` nesse formato** (provavelmente “offer” é um recurso cadastrado/ID interno do provedor, não um objeto livre com `id/name`).

Causa raiz
- A tentativa de “nomear o produto” via `product/offer` está quebrando a validação do provedor.
- Resultado: não gera PIX em /saque e /upsell/* quando esses campos são incluídos.

Estratégia de correção (rápida e segura)
- Voltar para o formato de request que comprovadamente funciona: **não enviar `product` nem `offer`** para o provedor ao criar a transação.
- Para ainda diferenciar no painel, usar um campo que já é aceito e sempre vai junto: **`external_id`**.
  - O Upsell já está bom: `${protocolo}-UP${stepNumber}-${Date.now()}`
  - O Saque hoje não tem “API” no external_id. Vamos colocar prefixo “API” nele:
    - `${protocolo || 'WB'}-API-${Date.now()}`
- Assim você identifica no painel por `external_id`:
  - Saque: `...-API-...`
  - Upsell 1: `...-UP1-...`
  - Upsell 2: `...-UP2-...` etc.

Mudanças (o que vou implementar)
1) Backend function `create-pix` (supabase/functions/create-pix/index.ts)
- Remover completamente o envio de `product` e `offer` no `requestBody` para a API de pagamento.
- Pode continuar recebendo esses campos do frontend (não tem problema), mas **não repassar**.
- Logar explicitamente: “product/offer ignored (provider validation)”.

2) Frontend Saque (src/pages/Saque.tsx)
- Ajustar o `external_id` para incluir “API”:
  - de: `${protocolo || 'WB'}-${Date.now()}`
  - para: `${protocolo || 'WB'}-API-${Date.now()}`
- Remover `product` e `offer` do `supabase.functions.invoke('create-pix', ...)` para evitar confusão e manter payload limpo.

3) Frontend Upsell (src/components/UpsellStep.tsx)
- Remover `product` e `offer` do `supabase.functions.invoke('create-pix', ...)`.
- Manter `external_id` como já está (ele já carrega UP1/UP2… e isso resolve a identificação).

4) Evitar “cair no PIX antigo” no navegador (para não continuar dando erro)
- Como o PIX fica salvo por 10 minutos no localStorage, pode existir PIX “ruim” ou fluxo preso.
- Vou adicionar um fallback leve:
  - Se `create-pix` retornar erro, limpar o PIX salvo daquele step (chave do saque/upsell) e permitir tentar gerar de novo (via recarregar / botão “Tentar novamente”).
  - Alternativa operacional imediata enquanto eu aplico: testar em aba anônima ou limpar localStorage.

Como vamos validar (checklist rápido)
- Teste 1: /saque
  - Deve sair de “Gerando código PIX…” para mostrar o botão e, ao abrir o PIX, mostrar QR Code/código.
  - Sem 400 no backend.
  - `external_id` deve conter `-API-`.
- Teste 2: /upsell/1
  - Deve gerar PIX sem 400.
  - `external_id` deve conter `-UP1-`.
- Verificar no log do backend:
  - Request para o provedor sem product/offer e resposta 200 com pix.

Observação importante (sobre “nome no painel”)
- Como o provedor rejeita `product/offer`, a forma mais confiável de separar as etapas no painel passa a ser pelo `external_id`.
- Se você confirmar que o painel mostra `external_id` (normalmente mostra), isso resolve a identificação “API vs UP1..UP8” sem quebrar o PIX.

Arquivos que serão alterados
- supabase/functions/create-pix/index.ts
- src/pages/Saque.tsx
- src/components/UpsellStep.tsx
