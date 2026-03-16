
Objetivo
- Quando ocorrer erro de CPF inválido no PIX, não travar o usuário: preencher automaticamente com nome/CPF válidos e continuar a geração do PIX.

Diagnóstico (com base no código + logs)
1) O erro 400 vem do provedor porque `buyer.document` está vazio ou inválido (`""` e antes `00000000000`).
2) Em `UpsellStep.tsx`, existe bloqueio local que mostra “CPF/CNPJ inválido...” e interrompe o fluxo.
3) Em `Resultado.tsx`, o `saveSession` está sobrescrevendo `cpfData` com campos vazios (`cpf: ''`, `nome: ''`), o que contamina etapas seguintes após reload/retomada.
4) `create-pix` (backend function) hoje apenas repassa os dados; não tem fallback defensivo.

Plano de implementação
1) Corrigir a origem do dado vazio na sessão
- Arquivo: `src/pages/Resultado.tsx`
- Ajustar os `saveSession(...)` para NÃO gravar `cpfData` vazio.
- Preservar `cpfData` já existente da sessão quando a página de resultado salvar CEP/agência.

2) Criar normalizador único de buyer no frontend
- Novo util (ex.: `src/lib/pixBuyer.ts`) com:
  - sanitização de nome (apenas letras/espaço/hífen/apóstrofo, mínimo 3 chars; fallback: `"Usuario Pagador"`).
  - sanitização de documento (somente números).
  - validação de CPF/CNPJ e, se inválido/vazio, gerar CPF válido automaticamente (não usar `00000000000`).
  - email válido derivado do nome com fallback seguro.
- Retorno: `{ name, email, document }` sempre pronto para envio.

3) Aplicar o normalizador onde cria PIX
- `src/components/UpsellStep.tsx`: remover bloqueio que interrompe em CPF inválido e usar buyer normalizado.
- `src/pages/Pagamento.tsx` e `src/pages/Saque.tsx`: usar o mesmo normalizador para padronizar todo o funil.
- Resultado: nunca mais enviar `document: ""` no cliente.

4) Blindagem no backend (garantia final)
- Arquivo: `supabase/functions/create-pix/index.ts`
- Antes de montar `requestBody`, validar/sanitizar `body.buyer`.
- Se nome/email/document vierem ruins, substituir por fallback válido no servidor.
- Assim, mesmo que algum cliente antigo envie payload ruim, o backend corrige antes de chamar o provedor.

5) Mensagens de erro e UX
- No upsell, evitar mensagem fatal de CPF inválido para esse caso; mostrar erro apenas se a criação do PIX realmente falhar após fallback.

Detalhes técnicos (resumo)
- Não haverá mudança de banco/RLS/auth.
- A correção principal é de robustez de payload (frontend + backend).
- CPF fallback será “qualquer CPF”, mas matematicamente válido, para evitar novo 400 do provedor.
- Manteremos `utm_source: "up"` e `utm_campaign: up{N}` como já está.

Validação (E2E)
1) Fluxo normal: consulta CPF válida → pagamento → upsell 1/2.
2) Reload direto em `/upsell/2` com sessão parcial: PIX deve gerar sem erro de CPF.
3) Conferir logs da function `create-pix`: `buyer.document` nunca vazio/não-numérico.
4) Confirmar que tracking de upsell continua marcando `up1`, `up2`, `up3`...
5) Verificar visualmente que não aparece mais “CPF inválido...” bloqueando quando fallback for aplicado.

Critério de aceite
- Sem 400 por buyer inválido em upsell/pagamento/saque.
- Usuário não fica travado por CPF/nome ausente.
- PIX é gerado de forma consistente em todas as etapas.
