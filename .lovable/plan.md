

# Plano: Pagina de Detalhes da Inscricao (entre ConfirmaDados e Pagamento)

## O que fazer

Criar uma nova pagina `/detalhes-inscricao` que aparece **depois** de confirmar os dados e **antes** do pagamento PIX. Essa pagina vai:

1. Explicar o concurso e o que estudar antes da prova
2. Mostrar o valor da inscricao (R$67.XX)
3. Ter um botao para prosseguir ao pagamento

## Conteudo da Pagina

- Secao "Sobre o Concurso" (cargo, salario, vagas)
- Secao "O que priorizar nos estudos":
  - Portugues e Matematica
  - Provas anteriores dos Correios (estilo IBFC)
  - Raciocinio Logico, Atendimento ao Cliente, Legislacao Postal
  - Simulados regulares
- Secao "Taxa de Inscricao" com valor R$67.XX em destaque
- Resumo do candidato (nome, CPF)
- Botao "PAGAR TAXA DE INSCRICAO" → /pagamento

## Fluxo Atualizado

```text
/confirma-dados → /detalhes-inscricao (NOVA) → /pagamento
```

## Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/DetalhesInscricao.tsx` | Criar pagina nova |
| `src/App.tsx` | Adicionar rota `/detalhes-inscricao` |
| `src/pages/ConfirmaDados.tsx` | Mudar navegacao de `/pagamento` para `/detalhes-inscricao` |
| `src/hooks/useSessionPersistence.ts` | Adicionar step no FUNNEL_STEPS |

## Visual

Usa os mesmos componentes `CorreiosHeader`, `CorreiosFooter`, `CorreiosCard`. Secoes com icones (BookOpen, Target, GraduationCap). Card de valor em destaque com fundo amarelo Correios. Tracking de funil: `detalhes-inscricao`.

