

## Plano: Ajustar fallback de endereço e esconder conteúdo enquanto carrega

### Problema 1: Endereço no fallback
Quando a busca de escola falha, o fallback mostra `localidade/uf` no campo "Endereço". O pedido é: quando falhar, mostrar só a cidade e remover a linha de endereço.

### Problema 2: Conteúdo aparece antes de carregar
O "Resumo do Cargo", "Observações" e o botão "REALIZAR INSCRIÇÃO" aparecem mesmo enquanto a escola ainda está carregando. Devem ficar ocultos até o loading terminar.

### Alterações em `src/pages/Resultado.tsx`

#### 1. Fallback sem endereço
No `generateFallbackAgency`, remover o campo `endereco` (ou deixar vazio) para que no render a linha de endereço não apareça quando for fallback:

```typescript
const generateFallbackAgency = (cepData: CepData) => ({
  name: `${SCHOOL_PREFIXES[...]} ${SCHOOL_SUFFIXES[...]}`,
  endereco: '', // vazio = não mostrar linha de endereço
  cidade: `${cepData.localidade}/${cepData.uf}`,
});
```

Na tabela, condicionar a linha de endereço:
```typescript
{agency.endereco && (
  <tr><td className="font-semibold">Endereço</td><td>{agency.endereco}</td></tr>
)}
```

#### 2. Esconder conteúdo durante loading
Envolver o "Resumo do Cargo", "Observações" e o botão dentro de `{!loading && (...)}` para que só apareçam depois que a escola carregou.

