

## Plano: Trocar posições dos upsells 7↔8 e 9↔10

### O que muda

Trocar a ordem nos arrays `UPSELLS` (Upsell.tsx) e `buildUpsellInfo` (UpsellInfo.tsx):

| Posição | Antes | Depois |
|---------|-------|--------|
| UP 7 | Certificado de Pré-Aprovação (R$19) | Acompanhamento por SMS e E-mail (R$15) |
| UP 8 | Acompanhamento por SMS e E-mail (R$15) | Certificado de Pré-Aprovação (R$19) |
| UP 9 | Garantia de Vaga na Região (R$24) | Taxa de Homologação Documental (R$19) |
| UP 10 | Taxa de Homologação Documental (R$19) | Garantia de Vaga na Região (R$24) |

### Arquivos alterados

1. **`src/pages/Upsell.tsx`** — Trocar linhas 19↔20 e 21↔22 no array UPSELLS
2. **`src/pages/UpsellInfo.tsx`** — Trocar os blocos correspondentes (posições 7/8 e 9/10) no array de objetos

Apenas reordenação, sem alterar conteúdo.

