

# Plano: Corrigir Logica de Datas na Pagina de Noticia

## Problema Identificado

A logica atual tem dois problemas:

1. **Data de publicacao incorreta**: Quando subtrai 3 horas de 02:00 da manha, deveria mostrar 23:00 do dia ANTERIOR, mas esta mostrando a mesma data (03/02)

2. **Logica confusa**: Se agora eh 02:00 e a noticia foi "publicada" as 23:00, deveria ser do dia anterior

## Solucao Proposta

Mudar a logica para que a data de publicacao seja sempre COERENTE:

- Usar a data correta do `publishDate` (que ja calcula corretamente o dia anterior quando cruza meia-noite)
- Formatar tanto a data quanto o horario do `publishDate`

## Mudancas Tecnicas

### Arquivo: src/pages/Noticia.tsx (linhas 20-25)

**Antes:**
```javascript
// Data de "publicação" (algumas horas atrás)
const publishDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const publishTime = publishDate.toLocaleTimeString("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});
```

**Depois:**
```javascript
// Data de "publicação" (algumas horas atrás)
const publishDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const publishDateFormatted = publishDate.toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const publishTime = publishDate.toLocaleTimeString("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});
```

### Atualizar exibicao (linha ~97)

**Antes:**
```jsx
<span>{formattedDate} às {publishTime}</span>
```

**Depois:**
```jsx
<span>{publishDateFormatted} às {publishTime}</span>
```

## Resultado

- Se agora eh 03/02 as 02:00, a publicacao mostrara 02/02 as 23:00 (correto!)
- Se agora eh 03/02 as 15:00, a publicacao mostrara 03/02 as 12:00 (correto!)

## Arquivo a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Noticia.tsx` | Usar data formatada do publishDate em vez de formattedDate |

