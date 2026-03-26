

## Plano: Corrigir geração múltipla de PIX e passagem correta de UTM

### Problema 1: 3 PIX gerados ao invés de 1
O `useEffect` que gera o PIX tem `cpfData` (um objeto) nas dependências. Como objetos criam nova referência a cada render, o efeito dispara várias vezes. Os logs confirmam 3 chamadas simultâneas à API Fruitfy.

### Problema 2: UTM da campanha não está chegando
A captura de UTM (`captureUtmParams()`) é chamada dentro do `generatePix`, mas nesse ponto a URL pode já ter perdido os query params. A UTM precisa ser capturada antes, no mount da página.

### Correções

**Arquivo: `src/pages/Pagamento.tsx`**

1. Adicionar um `useRef` (`pixGeneratedRef`) para garantir que `generatePix` só execute **uma única vez**, mesmo que o useEffect re-execute.
2. Mover `captureUtmParams()` para fora do `generatePix` — chamá-lo no início do useEffect (ou no mount) para que os UTMs da URL sejam capturados antes de gerar o PIX.
3. Trocar as dependências do useEffect principal para evitar re-execuções desnecessárias (usar refs para cpfData/valorBeneficio ao invés de valores diretos).

### Detalhes técnicos

```typescript
// Adicionar ref de controle
const pixGeneratedRef = useRef(false);

// No useEffect principal, antes de tudo:
captureUtmParams(); // captura UTMs da URL atual

// Antes de chamar generatePix:
if (pixGeneratedRef.current) return;
pixGeneratedRef.current = true;
```

Isso garante exatamente 1 chamada à API e que os UTMs da URL (utm_campaign, etc.) sejam capturados e passados corretamente ao Fruitfy.

