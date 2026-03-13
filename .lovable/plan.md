

# Plano: Trocar ordem dos upsells

## Mudanças

### 1. Trocar Upsell 1 e 2 (nos dois arquivos)
- **Posição 1** passa a ser "Escolha do Local de Prova" (R$ 37) — puxa o CEP da sessão e mostra a agência mais perto
- **Posição 2** passa a ser "Confirmação da Inscrição" (R$ 47)

Na UpsellInfo, o upsell "Escolha do Local de Prova" (agora posição 1) vai ler o `cepData` da sessão e exibir dinamicamente o endereço da agência mais próxima na explicação e nos items, igual já é feito na página de Resultado.

### 2. Trocar Upsell 7 e 8 (nos dois arquivos)
- **Posição 7** passa a ser "Acompanhamento por SMS e E-mail" (R$ 15)
- **Posição 8** passa a ser "Certificado de Pré-Aprovação" (R$ 19)

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/UpsellInfo.tsx` | Trocar posições dos objetos no array + adicionar lógica de CEP no upsell 1 |
| `src/pages/Upsell.tsx` | Trocar posições dos objetos no array UPSELLS |

Navegação e tracking não mudam — já usam index dinâmico.

