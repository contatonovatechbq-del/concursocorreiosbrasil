
Objetivo
- Parar o erro 400 (“Product and offer must be provided together…”) e, ao mesmo tempo, voltar a conseguir identificar no painel:
  - Saque: “API”
  - Upsells: “UP1…UP8” (sem espaço)

Diagnóstico (o que está acontecendo)
- A API de pagamento está validando o corpo e reclamando que:
  - Se você mandar product, tem que mandar offer também (ou não mandar nenhum dos dois).
- Hoje o frontend envia product (API / UP1 etc.).
- Quando tentamos repassar product na função do backend, a API devolveu 400 porque offer não foi enviado junto.

Solução proposta (compatível com a regra da API)
1) Ajustar o contrato do backend (função create-pix) para aceitar “offer” também
- Arquivo: supabase/functions/create-pix/index.ts
- Alterações:
  - Expandir a interface CreatePixRequest para incluir:
    - offer?: { id: string | null; name: string | null }
  - Montar o requestBody para a API de pagamento assim:
    - Só incluir product e offer quando os dois vierem preenchidos.
    - Se vier apenas um deles (por bug/versão antiga), remover ambos para não quebrar.
  - Logar explicitamente se product/offer estão sendo enviados ou omitidos (para debug rápido).

Pseudo-lógica:
- const hasProduct = !!body.product?.id || !!body.product?.name
- const hasOffer = !!body.offer?.id || !!body.offer?.name
- if (hasProduct && hasOffer) incluir ambos no requestBody
- else não incluir nenhum (para não disparar o 400)

2) Atualizar o frontend para sempre mandar product + offer juntos
A) Saque
- Arquivo: src/pages/Saque.tsx
- Hoje já manda:
  - product: { id: 'api-front', name: 'API' }
- Vamos adicionar:
  - offer: { id: 'api-front', name: 'API' }
(ou, se a API exigir ids diferentes, ajustamos depois; mas a regra do erro é “juntos”, então primeiro destravamos o 400.)

B) Upsells
- Arquivo: src/components/UpsellStep.tsx
- Hoje manda:
  - product: { id: `upsell-${stepNumber}`, name: `UP${stepNumber}` }
- Vamos adicionar:
  - offer: { id: `upsell-${stepNumber}`, name: `UP${stepNumber}` }

3) Evitar “erro persistente” por PIX salvo no navegador (importante)
- Seu app guarda o PIX por ~10 minutos no localStorage.
- Se a pessoa gerou PIX num estado antigo (sem offer) e a página restaura esse PIX, ela pode continuar “presa” numa tentativa ruim ou confusa.
- Ajuste recomendado (leve e seguro):
  - Ao detectar pixError 400 vindo do create-pix, limpar o PIX salvo daquele step (“saque” ou “upsell stepNumber”) e tentar gerar novamente 1 vez.
  - Alternativa mais simples: ao publicar a correção, você testa abrindo em aba anônima / limpando localStorage para validar.

4) Testes que eu vou fazer após implementar (para confirmar que resolveu de verdade)
- Teste 1: /saque
  - Abrir /saque em aba anônima
  - Confirmar que “Gerando código PIX…” conclui e aparece QR Code ao clicar para mostrar o PIX
  - Confirmar que não aparece mais “Edge function returned 400”
- Teste 2: Upsell 1
  - Simular navegação para /upsell/1 e gerar PIX
  - Verificar que a criação não dá 400
- Teste 3 (observabilidade):
  - Checar logs do backend function create-pix e confirmar que requestBody agora contém:
    - product + offer juntos
    - tracking permanece igual
- Resultado esperado:
  - A API de pagamento para de rejeitar o body
  - O painel passa a separar corretamente por “API” e “UP1..UP8” (desde que o painel realmente exiba esses campos; caso o painel ignore product/offer e mostre apenas um “nome padrão”, teremos plano B abaixo)

Plano B (caso o painel não use product/offer para “nome”)
- Se mesmo com product+offer o painel continuar mostrando “API” para tudo, então o “nome” que você vê no painel provavelmente vem de outro campo (ex: description, item name, metadata, ou até external_id).
- Aí a estratégia muda para:
  - Colocar “API / UP1…” num campo que o painel realmente exibe (por exemplo external_id prefixado, ou um campo de metadata se existir).
- Só vou partir para isso se, com product+offer juntos, não resolver o “nome no painel”.

Arquivos que serão modificados
- supabase/functions/create-pix/index.ts
- src/pages/Saque.tsx
- src/components/UpsellStep.tsx

Risco/impacto
- Baixo: é mudança pequena, controlada e com fallback (se product/offer vier incompleto, omitimos ambos para evitar 400).
- Não altera fluxo de pagamento além da validação do body e do “nome” enviado.

Checklist de pronto
- /saque gera PIX sem erro
- upsell gera PIX sem erro
- logs confirmam product+offer juntos quando enviados
- painel separa “API” vs “UP1…”
