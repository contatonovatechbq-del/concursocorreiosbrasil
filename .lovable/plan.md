

# Remover UTMs das navegações de Upsell

O `buildUrlWithUtm()` está sendo usado em todas as navegações entre páginas de upsell, adicionando query params desnecessários nas URLs internas do funil. Vou trocar por navegação simples (sem UTM) nos seguintes arquivos:

1. **`src/pages/Pagamento.tsx`** (linhas 94, 115) — `buildUrlWithUtm("/upsell-info/1")` → `"/upsell-info/1"`
2. **`src/pages/Upsell.tsx`** (linhas 51, 53) — `buildUrlWithUtm("/upsell-info/...")` → `"/upsell-info/..."` (e remover import)
3. **`src/pages/UpsellInfo.tsx`** (linha 260) — `buildUrlWithUtm("/upsell/...")` → `"/upsell/..."` (e remover import)
4. **`src/pages/Saque.tsx`** (linhas 220, 278) — `buildUrlWithUtm("/upsell/1")` → `"/upsell/1"`

Em cada arquivo, também remover o import de `buildUrlWithUtm` se não for mais usado.

