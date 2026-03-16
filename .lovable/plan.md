

# Corrigir busca de agência mais próxima

## Problema raiz

Os logs mostram dois erros críticos que impedem a busca real:

1. **Photon API retorna 400** — o parâmetro `lang: "pt"` não é suportado (só aceita `default, de, en, fr`)
2. **Nominatim retorna 429** — rate limit sendo atingido porque o intervalo de 1100ms não é suficiente

Quando ambos falham, o código usa `generateFallbackAgency` que **inventa um endereço aleatório** — por isso o endereço não corresponde à agência real.

## Mudanças

### 1. Edge Function `find-agency/index.ts`
- **Remover `lang: "pt"`** do Photon — usar sem parâmetro de idioma ou `"default"`
- **Aumentar intervalo de rate limit** de 1100ms para 1500ms
- **Adicionar geocoding via ViaCEP** como primeiro passo: chamar `https://viacep.com.br/ws/{cep}/json/` para pegar localidade/uf antes de geocodificar (redundância com o que já vem do frontend, mas garante dados)
- **Melhorar User-Agent** com email de contato para Nominatim (reduz chance de 429)

### 2. Frontend `Resultado.tsx` — fallback "só cidade"
- Quando a edge function retorna `found: false` ou erro, em vez de inventar endereço, mostrar apenas:
  - Agência: `Agência dos Correios — {localidade}/{uf}`
  - Endereço: `{localidade}/{uf}` (sem rua fictícia)
- Remover a função `generateFallbackAgency` que inventa rua aleatória

### Detalhes técnicos

**Photon fix (linha 189):**
```typescript
// Remover lang: "pt" que causa erro 400
const params = new URLSearchParams({
  q: query,
  limit: "1",
});
```

**Rate limit (linha 12):**
```typescript
const MIN_REQUEST_INTERVAL_MS = 1500;
```

**Fallback no frontend:** substituir `generateFallbackAgency` por versão que mostra só cidade/UF sem inventar rua.

