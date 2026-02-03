

# Plano: Persistir UTM Tracking do Anúncio até o Pagamento

## Problema

Quando o usuário clica no anúncio do Facebook com os parâmetros:
```
?utm_source=FB&utm_campaign={{campaign.name}}|{{campaign.id}}&utm_medium={{adset.name}}|{{adset.id}}&utm_content={{ad.name}}|{{ad.id}}&utm_term={{placement}}
```

Os UTMs são perdidos durante a navegação pelo funil porque:
1. Usuário entra: `/?utm_source=FB&utm_campaign=...`
2. Navega para `/verificacao` (sem UTMs)
3. Navega para `/saque` (sem UTMs)
4. Checkout tenta ler `window.location.search` = **VAZIO**
5. BuckPay/UTMify recebe dados vazios

## Solução

Capturar os UTMs na **entrada** e salvar no **localStorage**. Depois usar esses dados salvos no checkout.

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/hooks/useUtmTracking.ts` | CRIAR - funções de captura e leitura |
| `src/App.tsx` | EDITAR - capturar UTMs na inicialização |
| `src/pages/Saque.tsx` | EDITAR - ler UTMs do localStorage |
| `src/components/UpsellStep.tsx` | EDITAR - ler UTMs do localStorage |

## Implementação

### 1. Criar Hook de UTM (novo arquivo)

**`src/hooks/useUtmTracking.ts`**

```tsx
const UTM_STORAGE_KEY = "willbank_utm";

interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  utm_id: string | null;
  src: string | null;
  sck: string | null;
  ref: string | null;
}

// Captura UTMs da URL e salva (chamar uma vez no App)
export const captureUtmParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Só salva se tiver novos UTMs na URL
  const hasUtms = urlParams.has('utm_source') || 
                  urlParams.has('utm_campaign') || 
                  urlParams.has('src');
  
  if (hasUtms) {
    const utmData: UtmParams = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_content: urlParams.get('utm_content'),
      utm_term: urlParams.get('utm_term'),
      utm_id: urlParams.get('utm_id'),
      src: urlParams.get('src'),
      sck: urlParams.get('sck'),
      ref: urlParams.get('ref'),
    };
    
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
  }
};

// Recupera UTMs salvos (usar no checkout)
export const getStoredUtmParams = (): UtmParams => {
  try {
    const data = localStorage.getItem(UTM_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    utm_id: null,
    src: null,
    sck: null,
    ref: null,
  };
};
```

### 2. Capturar UTMs no App.tsx

Adicionar chamada na inicialização:

```tsx
import { captureUtmParams } from "@/hooks/useUtmTracking";

// Captura UTMs imediatamente
captureUtmParams();

const App = () => (
  // ...resto do código
);
```

### 3. Atualizar Saque.tsx

Substituir leitura da URL pela leitura do localStorage:

```tsx
// ANTES (linha 89):
const urlParams = new URLSearchParams(window.location.search);
tracking: {
  utm_source: urlParams.get('utm_source'),
  // ...
}

// DEPOIS:
import { getStoredUtmParams } from "@/hooks/useUtmTracking";

const utmParams = getStoredUtmParams();
tracking: {
  utm_source: utmParams.utm_source,
  utm_medium: utmParams.utm_medium,
  utm_campaign: utmParams.utm_campaign,
  utm_content: utmParams.utm_content,
  utm_term: utmParams.utm_term,
  utm_id: utmParams.utm_id,
  src: utmParams.src,
  sck: utmParams.sck,
  ref: utmParams.ref,
}
```

### 4. Atualizar UpsellStep.tsx

Mesma mudança (linha 76):

```tsx
import { getStoredUtmParams } from "@/hooks/useUtmTracking";

const utmParams = getStoredUtmParams();
tracking: {
  utm_source: utmParams.utm_source,
  // ... mesmo padrão
}
```

## Fluxo Corrigido

```text
1. Usuário clica no anúncio:
   /?utm_source=FB&utm_campaign=CampanhaTeste|123456&utm_medium=...

2. App.tsx executa captureUtmParams()
   → Salva no localStorage: { utm_source: "FB", utm_campaign: "CampanhaTeste|123456", ... }

3. Usuário navega: /verificacao → /login → /saque
   → URLs sem UTMs, mas dados estão salvos

4. Checkout em /saque chama getStoredUtmParams()
   → Recupera: { utm_source: "FB", utm_campaign: "CampanhaTeste|123456", ... }

5. BuckPay recebe UTMs corretos
   → UTMify marca a campanha corretamente
```

## Resultado

Os parâmetros do anúncio:
- `utm_source=FB`
- `utm_campaign={{campaign.name}}|{{campaign.id}}`
- `utm_medium={{adset.name}}|{{adset.id}}`
- `utm_content={{ad.name}}|{{ad.id}}`
- `utm_term={{placement}}`

Serão preservados e enviados corretamente para BuckPay e UTMify em **todos** os pagamentos (Saque + 7 Upsells).

