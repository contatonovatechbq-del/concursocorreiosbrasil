
# Plano: Funil de Conversao Melhorado

## Problemas Atuais
- Grafico de barras horizontal basico sem contexto visual de "funil"
- Nao mostra taxa de drop-off entre etapas
- Nao diferencia etapas principais de upsells
- Cores nao indicam performance (bom/ruim)

## Melhorias Propostas

### 1. Visualizacao em Formato de Funil Real
Substituir o grafico de barras por um funil visual com barras decrescentes que mostram claramente a perda entre etapas:

```
Login           ████████████████████████████████  1.234  (100%)
Verificando     ███████████████████████████       1.100  (89.1%)  -10.9%
Confirma Dados  ████████████████████████          980    (79.4%)  -10.9%
Biometria       ██████████████████████            850    (68.9%)  -13.3%
Video           ████████████████████              720    (58.3%)  -15.3%
Chat            ██████████████████                620    (50.2%)  -13.9%
Saque           ████████████████                  500    (40.5%)  -19.4%
PIX Gerado      ██████████████                    380    (30.8%)  -24.0%
Pagamento       ████████████                      280    (22.7%)  -26.3%
```

### 2. Indicadores de Performance por Etapa
- **Verde**: Drop-off < 10% (bom)
- **Amarelo**: Drop-off 10-20% (atencao)
- **Vermelho**: Drop-off > 20% (critico)

### 3. Separacao Funil Principal vs Upsells
- Card separado para upsells com metricas proprias
- Taxa de aceitacao de cada upsell

### 4. Metricas Adicionais
- Conversao acumulada (% desde o inicio)
- Tempo medio entre etapas (se disponivel)
- Tooltip com detalhes ao passar o mouse

### 5. Modo Tabela Alternativo
Toggle para ver dados em formato de tabela com todas as metricas numericas

## Componentes a Criar/Modificar

### `src/components/admin/FunnelChart.tsx` (novo)
Componente dedicado para o funil visual com:
- Barras proporcionais ao total
- Cores baseadas em performance
- Animacao de entrada
- Tooltip com detalhes

### `src/components/admin/UpsellMetrics.tsx` (novo)
Card separado mostrando:
- Taxa de aceitacao de cada upsell
- Receita estimada por upsell
- Comparativo entre upsells

### `src/pages/Admin.tsx` (modificar)
- Importar novos componentes
- Adicionar toggle tabela/grafico
- Melhorar layout geral

## Implementacao Visual

### Funil Principal
```tsx
// Cada etapa mostra:
// [Barra proporcional] [Nome] [Count] [% Total] [Drop-off badge]

<div className="space-y-2">
  {steps.map((step, i) => (
    <div className="flex items-center gap-3">
      <div 
        className="h-10 rounded bg-gradient-to-r from-primary to-primary/60"
        style={{ width: `${(step.count / maxCount) * 100}%` }}
      />
      <span className="font-medium w-32">{step.name}</span>
      <span className="text-lg font-bold">{step.count}</span>
      <span className="text-muted-foreground">({step.percentage}%)</span>
      <Badge variant={getDropoffVariant(step.dropoff)}>
        -{step.dropoff}%
      </Badge>
    </div>
  ))}
</div>
```

### Cores do Drop-off
```tsx
const getDropoffColor = (dropoff: number) => {
  if (dropoff < 10) return 'bg-green-500';
  if (dropoff < 20) return 'bg-yellow-500';
  return 'bg-red-500';
};
```

### Card de Upsells
```tsx
// Grid mostrando cada upsell
<div className="grid grid-cols-4 gap-2">
  {upsells.map(upsell => (
    <div className="p-3 rounded-lg border text-center">
      <p className="text-xs text-muted-foreground">Upsell {upsell.number}</p>
      <p className="text-2xl font-bold">{upsell.count}</p>
      <p className="text-xs text-green-500">{upsell.rate}% taxa</p>
    </div>
  ))}
</div>
```

## Arquivos a Modificar

1. `src/pages/Admin.tsx` - Integrar novos componentes
2. `src/components/admin/FunnelChart.tsx` - Criar componente do funil
3. `src/components/admin/UpsellMetrics.tsx` - Criar card de upsells
4. `src/components/admin/FunnelTable.tsx` - Criar visualizacao em tabela

## Resultado Final

Dashboard com:
- Funil visual profissional com barras proporcionais
- Badges coloridos indicando saude de cada etapa
- Secao separada para metricas de upsell
- Toggle para alternar entre grafico e tabela
- Melhor UX com tooltips e animacoes
