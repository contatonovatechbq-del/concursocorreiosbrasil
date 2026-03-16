

# Ajustar escassez: 1 inscrição já feita para o CEP

## Mudanças em `src/pages/Resultado.tsx`

1. **Vagas**: Manter 2-7 (já aprovado)
2. **Inscrição feita**: Mostrar "1 inscrição realizada para o CEP {cep}" — fixo em 1, vinculado ao CEP do usuário
3. **Alerta**: Warning amarelo/vermelho tipo "⚠️ 1 pessoa já se inscreveu para este CEP. Vagas limitadas!"

### Detalhes:
- Nova row na tabela "Informações do Local de Prova": `Inscrições p/ este CEP` → `1`
- Alerta de escassez logo abaixo da tabela, antes do botão
- Sem estado novo necessário — é valor fixo (1)

