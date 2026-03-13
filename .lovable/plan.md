

# Plano: Site Completo de Inscricao do Concurso dos Correios

## Visao Geral

Transformar todo o frontend do projeto de "Will Bank" para um site identico a uma pagina oficial de inscricao do Concurso dos Correios 2026 - Agente de Correios (Atendente Comercial). Manter intactas as APIs de PIX (BuckPay) e CPF, tracking UTM, funnel tracking, e dashboard admin.

## Novo Fluxo do Funil

```text
/ (Landing - info do concurso + CEP)
  → /resultado (agencia proxima + vagas + botao inscrever)
    → /inscricao (CPF input → consulta API)
      → /confirma-dados (confirma dados do candidato)
        → /pagamento (PIX R$67.XX - taxa inscricao)
          → /upsell/1 (Material R$78.XX)
            → /upsell/2..9 (taxas diversas)
```

## Tema Visual

Mudar CSS de amarelo Will Bank para Correios oficial:
- **Primary**: `#004B87` (azul Correios)
- **Accent/Ring**: `#FFCD00` (amarelo Correios)  
- **Background**: `#F5F7FA` (cinza claro institucional)
- **Header**: Azul escuro com logo Correios + nav (Enviar, Receber, Comprar, etc.)
- **Footer**: Amarelo Correios (#FFCD00) com logos Correios + Governo do Brasil

## Paginas a Criar/Reescrever

### 1. `Index.tsx` - Landing Page do Concurso
- Header estilo correios.com.br (azul, logo, navegacao)
- Banner: "CONCURSO PUBLICO NACIONAL - CORREIOS 2026"
- Card do cargo: Atendente Comercial, Nivel Medio, R$2.400-R$3.000
- Info: 15.153 vagas em todo Brasil
- Cronograma (inscricoes, provas em ~1.5 mes, gabaritos, resultado)
- Tabs: "Cargos e Localidades" | "Editais e Arquivos"
- Campo CEP para "Consultar local de prova mais proximo"
- API ViaCEP: `https://viacep.com.br/ws/{cep}/json/`

### 2. `Resultado.tsx` - Resultado do CEP  
- Mostra agencia Correios na cidade do lead
- "AC [Cidade] - [Logradouro]" como local de prova
- 64 vagas disponiveis nesta regiao
- Data da prova: 27/04/2026
- Botao "REALIZAR INSCRICAO" → /inscricao

### 3. `Inscricao.tsx` (novo) - CPF Input
- Campo CPF para "verificar elegibilidade"
- Consulta API de CPF existente (consultarCPF)
- Navega para /confirma-dados com dados

### 4. `ConfirmaDados.tsx` - Reescrever visual
- Trocar WillBank por Correios branding
- Mesma logica: mostra nome, CPF, nascimento, mae
- Confirmar → /pagamento

### 5. `Pagamento.tsx` (renomear Saque.tsx)
- Valor: R$67 + centavos aleatorios (0.01-0.99)
- Titulo: "Taxa de Inscricao - Concurso Correios 2026"
- Mesma logica PIX via BuckPay
- Apos pagamento → /upsell/1

### 6. `Upsell.tsx` - Adaptar para 9 upsells
- UP1: R$78.XX - "Material Completo de Estudos"
- UP2: R$29.XX - "Taxa de Processamento Digital"
- UP3: R$34.XX - "Seguro de Inscricao"
- UP4: R$19.XX - "Taxa de Confirmacao de Vaga"
- UP5: R$42.XX - "Kit Preparatorio Express"
- UP6: R$15.XX - "Taxa de Emissao de Comprovante"
- UP7: R$22.XX - "Certificado de Inscricao Digital"
- UP8: R$12.XX - "Taxa de Finalizacao"
- UP9: R$89.XX - "Garantia de Vaga Prioritaria"

## Componentes Novos

| Componente | Descricao |
|-----------|-----------|
| `CorreiosHeader.tsx` | Header azul Correios com logo, nav (Enviar, Receber, Comprar, Atendimento), breadcrumb |
| `CorreiosFooter.tsx` | Footer amarelo com logos Correios + Gov Brasil, links, CNPJ |
| `CEPInput.tsx` | Campo CEP com mascara 00000-000 |
| `CorreiosCard.tsx` | Card com borda azul Correios (substituir WillBankCard) |

## Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/index.css` | Trocar tema de amarelo para azul/amarelo Correios |
| `src/App.tsx` | Novas rotas: /, /resultado, /inscricao, /confirma-dados, /pagamento, /upsell/:step |
| `src/pages/Index.tsx` | Reescrever: landing page concurso com CEP |
| `src/pages/Resultado.tsx` | Reescrever: resultado CEP + agencia + vagas |
| `src/pages/ConfirmaDados.tsx` | Adaptar visual para Correios |
| `src/pages/Saque.tsx` | Renomear logica para Pagamento, trocar textos |
| `src/pages/Upsell.tsx` | 9 upsells com textos de concurso |
| `src/components/UpsellStep.tsx` | Trocar branding para Correios |
| `src/hooks/useSessionPersistence.ts` | Atualizar FUNNEL_STEPS |
| `supabase/functions/admin-analytics/index.ts` | Atualizar funnel steps |

## Arquivos que NAO serao alterados

- `src/lib/cpf.ts` - API CPF intacta
- `supabase/functions/create-pix/` - API PIX intacta  
- `supabase/functions/check-pix-status/` - Verificacao PIX intacta
- `supabase/functions/track-funnel/` - Tracking intacto
- `supabase/functions/fb-conversion/` - FB Pixel intacto
- `src/hooks/useUtmTracking.ts` - UTM intacto
- `src/hooks/useFunnelTracking.ts` - Funnel tracking intacto
- `src/hooks/usePixPersistence.ts` - PIX persistence intacto
- `src/pages/Admin.tsx` + admin components - Dashboard intacto
- `src/pages/AdminLogin.tsx` - Admin login intacto

## Paginas a Remover do Fluxo

- `Login.tsx` → substituido por Index.tsx
- `Verificando.tsx` → nao precisa (loading fake)
- `Biometria.tsx` → nao precisa
- `Video.tsx` → nao precisa
- `Chat.tsx` → nao precisa
- `Loading.tsx` → nao precisa

