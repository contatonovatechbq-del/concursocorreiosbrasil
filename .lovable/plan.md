
Objetivo
- Garantir que os parâmetros do anúncio (utm_source, utm_campaign, utm_medium, utm_content, utm_term etc.) cheguem SEMPRE no momento de gerar o PIX e sejam enviados ao gateway/UTMify.
- Conseguir provar isso com evidência (log/inspeção) e não só “achar que está”.

Diagnóstico do que já temos (com base no código atual)
- O frontend já envia tracking no create-pix (Saque.tsx e UpsellStep.tsx) usando getStoredUtmParams().
- A captura atual roda em src/App.tsx via captureUtmParams() no topo do módulo.
- Porém, os logs do backend (função create-pix) mostram tracking chegando tudo null. Isso prova que, na prática, o localStorage não está contendo UTMs na hora do pagamento (ou não está sendo lido).

Hipóteses mais prováveis (ordem de chance)
1) As UTMs não estão sendo capturadas no “primeiro load real” do usuário (ex.: algum redirect/variação de URL, ou o app iniciando sem as UTMs já em window.location.search).
2) O usuário está pagando com uma sessão onde o localStorage não persistiu (WebView/in-app browser com política estranha) ou foi limpo entre etapas.
3) A captura no topo do App.tsx não é o lugar mais robusto (executa fora de lifecycle React; em alguns cenários de bundling/hydration pode não rodar quando você imagina).
4) O usuário não publicou a versão nova (está testando no site publicado com build antigo). Precisa confirmar com a URL final do anúncio e se o publicado contém os logs “[UTM] Captured and saved”.

Plano de correção (robusto) + prova de funcionamento

Fase 1 — Instrumentação para provar onde quebra (sem depender do “gateway”)
1) Adicionar um “debug de UTM” visível só em DEV (ou via query ?debug=1)
   - Em / (Noticia) e também em /saque:
     - Mostrar na tela:
       - window.location.href
       - Conteúdo atual do localStorage[willbank_utm]
     - Botão “Copiar debug” (copia JSON + URL para mandar pra você).
   - Isso permite você testar em qualquer dispositivo e mandar o resultado sem abrir DevTools.

2) Logar explicitamente, antes de invocar create-pix:
   - Em Saque.tsx e UpsellStep.tsx:
     - console.log “[UTM] Sending to create-pix”, utmParams e o tracking final (sanitizado).
   - Assim, se no gateway chega vazio, a gente sabe se saiu vazio do cliente ou se foi perdido no caminho.

3) No backend (create-pix), reforçar o log:
   - Além de logar o body recebido (já loga), logar também o payload FINAL que ele envia para a BuckPay (tracking já normalizado).
   - Motivo: se o cliente mandar “FB”, mas o backend transformar errado, a gente pega.

Fase 2 — Tornar a captura “à prova de bala”
4) Captura de UTM no earliest possible point (index.html)
   - Adicionar um script pequeno em index.html (antes do bundle) que:
     - Lê window.location.search no instante zero
     - Se tiver utm_* / src / sck / ref, salva no localStorage “willbank_utm”
     - Não sobrescreve se não tiver UTMs na URL
   - Por que isso resolve: mesmo que o React ainda não tenha montado (ou haja algum comportamento de navegação), a UTM já fica gravada no storage cedo.

5) Captura reativa por mudança de rota (App)
   - Trocar o captureUtmParams() “no topo do arquivo” por uma captura dentro de um componente React:
     - Criar um componente tipo <UtmCapture /> que usa useLocation()
     - Em um useEffect que roda quando location.search muda, chama captureUtmParams()
   - Assim, se o usuário cair direto em /verificacao?utm... (ou qualquer rota), captura acontece com a search correta e ainda re-captura se tiver alguma navegação com parâmetros.

6) Merge inteligente (não apagar nada)
   - Ajustar captureUtmParams() para:
     - Ler o que já está salvo
     - Mesclar: se vier um novo valor não-nulo, sobrescreve; se vier nulo, mantém o antigo
   - Isso evita gravar null em campos que já tinham valor por algum motivo.

Fase 3 — Garantir que o PIX não “reuse” um PIX antigo sem UTM
7) Invalidação do PIX persistido quando UTM muda
   - Hoje, se existir PIX salvo (usePixPersistence), a tela pode reaproveitar aquele PIX por 10 minutos.
   - Se esse PIX foi gerado antes de capturar UTM (ou com UTM vazia), ele vai continuar “vazio” e você vai achar que a correção não funcionou.
   - Ajuste:
     - Salvar junto do pixData um snapshot do tracking usado (utm_source/utm_campaign/etc).
     - Ao restaurar um PIX salvo, comparar com tracking atual:
       - Se o PIX salvo não tem tracking mas o atual tem, não reutiliza; gera um novo PIX.
   - Resultado: teste fica confiável e produção atribui corretamente.

Checklist de teste (o que eu vou validar quando você colar a URL completa do anúncio)
- Abrir exatamente a URL do anúncio em aba anônima com cache limpo
- Confirmar na tela/debug que willbank_utm foi salvo com:
  - utm_source = FB
  - utm_campaign = “nome|id”
  - utm_medium = “adset|id”
  - utm_content = “ad|id”
  - utm_term = placement
- Andar no funil até /saque
- Confirmar antes de gerar PIX que o tracking “Sending to create-pix” tem os valores
- Confirmar nos logs do backend create-pix que tracking chegou preenchido
- Confirmar no payload enviado para BuckPay que tracking vai preenchido
- Confirmar no gateway/UTMify que atribuiu

O que eu preciso de você (para fechar 100%)
- Você marcou que vai colar a URL completa do anúncio: assim que você mandar, eu valido se:
  - tem algum caracter que precisa URL-encode (por exemplo “|”)
  - tem redirecionamento que remove query
  - a landing final é “/” ou outra rota

Arquivos que serão alterados (quando aprovado)
- index.html (adicionar captura early de UTM)
- src/hooks/useUtmTracking.ts (merge inteligente + helper de leitura + logs melhores)
- src/App.tsx (mudar captura para componente com useLocation)
- src/pages/Noticia.tsx (debug panel opcional e/ou captura redundante)
- src/pages/Saque.tsx (logs + validação de PIX salvo vs tracking atual)
- src/components/UpsellStep.tsx (logs + validação de PIX salvo vs tracking atual)

Riscos/observações
- Se você estiver testando no site publicado e não publicou a versão nova, vai continuar quebrado. Com o debug panel, isso fica óbvio porque ele mostra se capturou ou não.
- Se o usuário paga reaproveitando PIX já salvo, isso mascara o teste; por isso a etapa 7 é importante.
