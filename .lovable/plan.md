

# Plano: Paginas Info antes de cada Upsell + Ajuste de valores

## Mudanças nos Upsells

O UP1 passa a ser **Material para o dia da prova** com valor **R$34 + centavos**. Os demais (UP2-9) são todos **taxas**. Valores atualizados:

| Step | Título | Valor | Tipo |
|------|--------|-------|------|
| 1 | Material para Dia da Prova | R$34.XX | Material |
| 2 | Taxa de Processamento Digital | R$29.XX | Taxa |
| 3 | Seguro de Inscrição | R$34.XX | Taxa |
| 4 | Taxa de Confirmação de Vaga | R$19.XX | Taxa |
| 5 | Kit Preparatório Express | R$42.XX | Taxa |
| 6 | Taxa de Emissão de Comprovante | R$15.XX | Taxa |
| 7 | Certificado de Inscrição Digital | R$22.XX | Taxa |
| 8 | Taxa de Finalização | R$12.XX | Taxa |
| 9 | Garantia de Vaga Prioritária | R$89.XX | Taxa |

## Nova Página: `UpsellInfo.tsx`

Página `/upsell-info/:step` que aparece **antes** do PIX de cada upsell:

- **UP1 (Material)**: Explica o que vem no material — caderno de questões, folha de respostas, caneta especial, etc. Conteúdo diferenciado pois é sobre material físico para o dia da prova.
- **UP2-9 (Taxas)**: Explica brevemente o que é a taxa, por que é necessária, com visual institucional. Cada uma com sua descrição específica.

Todas têm botão "PAGAR AGORA" → `/upsell/:step`

## Fluxo

```text
/pagamento (pago) → /upsell-info/1 → /upsell/1 (PIX)
                   → /upsell-info/2 → /upsell/2 (PIX)
                   → ... até 9
```

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/UpsellInfo.tsx` | Criar — página info dinâmica por step |
| `src/pages/Upsell.tsx` | Atualizar UPSELLS array (UP1 = R$34, material prova) |
| `src/App.tsx` | Adicionar rota `/upsell-info/:step` |
| `src/pages/Pagamento.tsx` | Navegar para `/upsell-info/1` após pagamento |
| `src/hooks/useSessionPersistence.ts` | Adicionar steps upsell-info no FUNNEL_STEPS |

