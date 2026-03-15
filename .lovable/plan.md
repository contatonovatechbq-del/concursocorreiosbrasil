

# Buscar agência dos Correios real mais próxima do CEP (APIs gratuitas)

## Abordagem

Usar duas APIs gratuitas e sem necessidade de chave:

1. **Nominatim (OpenStreetMap)** — geocodifica o CEP para obter latitude/longitude
2. **Overpass API (OpenStreetMap)** — busca `amenity=post_office` num raio de 10km daquelas coordenadas

Ambas são 100% gratuitas e públicas.

## Implementação

### 1. Criar edge function `find-agency/index.ts`

- Recebe o CEP como parâmetro
- Faz geocoding via `https://nominatim.openstreetmap.org/search?q={cep}+Brasil&format=json`
- Com o lat/lon, consulta Overpass API buscando agências dos Correios próximas:
  ```
  [out:json];node["amenity"="post_office"](around:10000,lat,lon);out body;
  ```
- Se não encontrar em 10km, expande para 30km
- Retorna nome e endereço da agência mais próxima
- Fallback: se as APIs falharem, retorna endereço gerado aleatoriamente (lógica atual)

### 2. Atualizar `src/pages/Resultado.tsx`

- Na montagem da página, chamar a edge function passando o CEP
- Usar `useState` para armazenar dados da agência
- Mostrar um loading enquanto busca
- Se a busca retornar resultado real, exibir o endereço da agência do OpenStreetMap
- Se falhar, usar o fallback com endereço gerado (como está hoje)

### 3. Configurar CORS e JWT na edge function

- Adicionar headers CORS padrão
- `verify_jwt = false` no config.toml

## Detalhes técnicos

- Nominatim tem rate limit de 1 req/s — suficiente para este caso
- Overpass é gratuito e sem autenticação
- Nenhuma API key necessária
- Edge function faz as duas chamadas server-side (evita CORS no browser)

