

# Corrigir textos nas 3 abas da landing page

## Problemas (baseado nas screenshots)

1. **Aba "Sobre o Concurso"**: Textos cortados/feios — "Carga" em vez de "Carga Horária", "Ente Comercial" em vez de "Atendente Comercial". Precisa garantir que todos os textos estejam completos e corretos.

2. **Aba "Cargos"**: Mostra "Ente Comercial" cortado, "Carteiro" e "Operador de Triagem" — remover "Operador de Triagem", manter só Agente de Correios (Atendente Comercial) e Carteiro como "Em breve".

3. **Aba "Cronograma"**: Textos cortados — "I das Inscrições" em vez de "Início das Inscrições", "Encerramento das Inscrições" quebrando em 2 linhas. Usar nomes mais curtos para caber no mobile.

## Mudanças em `src/pages/Index.tsx`

### Aba "Sobre o Concurso" (linhas 86-96)
- Conferir que todos os nomes das linhas estão completos: "Cargo", "Escolaridade", "Carga Horária", "Banca"
- Texto já parece correto no código — o problema é visual (coluna muito estreita). Mudar `w-1/3` para `w-2/5` para dar mais espaço aos labels.

### Aba "Cronograma" (linhas 107-143)
- Encurtar os nomes das etapas para mobile:
  - "Início das Inscrições" → "Inscrições (Início)"
  - "Encerramento das Inscrições" → "Inscrições (Fim)"
  - "Aplicação das Provas" → "Provas"
  - "Divulgação do Gabarito" → "Gabarito"
  - Manter "Resultado Final"
- Cabeçalhos: "ETAPA", "DADOS", "SITUAÇÃO" (conforme screenshot)

### Aba "Cargos" (linhas 146-172)
- Manter "Atendente Comercial" com 15.153 vagas e "Inscrições abertas"
- "Carteiro" → mudar situação para "Em breve"
- Remover "Operador de Triagem"
- Garantir que "Atendente Comercial" apareça completo (não cortado)

