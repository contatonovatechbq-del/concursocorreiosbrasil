
# Plano: Atualizar Pagina de Noticia e Adicionar Verificacao de Seguranca

## Resumo das Mudancas

O usuario pediu 3 coisas:
1. Adicionar a imagem do Will Bank na area "Imagem ilustrativa" da noticia
2. O botao "CONSULTAR MEU BENEFICIO" esta fazendo scroll em vez de navegar
3. Criar uma pagina de verificacao de seguranca ENTRE a noticia e a pagina de login

## Problema Identificado

Atualmente o fluxo eh:
```text
Noticia (/) --> Login (/login) --> Verificando (/verificando) --> ...
```

O DeviceGuard ja faz a verificacao de seguranca, mas ele esta envolvendo TODAS as rotas. O usuario quer que a verificacao apareca DEPOIS da pagina de noticia, nao antes.

## Novo Fluxo Proposto

```text
Noticia (/) --> Verificacao (/verificacao) --> Login (/login) --> ...
```

A pagina de noticia NAO tera verificacao de seguranca (para bots do Facebook poderem ver a preview). A verificacao acontece quando o usuario clica para consultar.

---

## Mudanca 1: Adicionar Imagem na Noticia

Copiar a imagem enviada para `public/images/will-bank-hero.png` e substituir o placeholder na pagina de noticia.

**Antes (linhas 119-125):**
```jsx
<div className="bg-gray-200 aspect-video rounded-lg mb-4 flex items-center justify-center">
  <div className="text-center text-gray-500">
    <div className="text-4xl mb-2">📰</div>
    <span className="text-sm">Imagem ilustrativa</span>
  </div>
</div>
```

**Depois:**
```jsx
<img 
  src="/images/will-bank-hero.png" 
  alt="Cliente usando app Will Bank" 
  className="w-full aspect-video object-cover rounded-lg mb-4"
/>
```

---

## Mudanca 2: Criar Pagina de Verificacao

Criar nova pagina `src/pages/Verificacao.tsx` com a mesma logica do DeviceGuard, mas como pagina standalone:

- Verificacao de desktop (redireciona para YouTube)
- Verificacao de bot (bloqueia acesso)
- Animacao de loading com passos de verificacao
- Apos validacao, redireciona automaticamente para /login

---

## Mudanca 3: Atualizar Rotas e Navegacao

**App.tsx:**
- Adicionar nova rota `/verificacao`
- Manter DeviceGuard apenas para rotas internas (opcional)

**Noticia.tsx:**
- Mudar `handleConsultar` de `/login` para `/verificacao`

---

## Mudanca 4: Imagens do "Veja Tambem"

O usuario mencionou que vai enviar as imagens depois. Por enquanto deixarei os placeholders, mas a estrutura ja estara pronta para receber as imagens.

---

## Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/Noticia.tsx` | Adicionar imagem hero, mudar navegacao para /verificacao |
| `src/pages/Verificacao.tsx` | **CRIAR** - pagina de verificacao de seguranca |
| `src/App.tsx` | Adicionar rota /verificacao |
| `public/images/will-bank-hero.png` | **CRIAR** - copiar imagem enviada |

---

## Secao Tecnica

### Nova Rota em App.tsx
```jsx
<Route path="/verificacao" element={<Verificacao />} />
```

### Logica da Verificacao.tsx

A pagina tera a mesma logica do DeviceGuard:

1. Verifica se eh desktop -> redireciona para YouTube
2. Verifica se eh bot -> bloqueia
3. Mostra animacao de verificacao (2.5s)
4. Redireciona para /login

### Fluxo Completo

```text
[Usuario clica no anuncio]
         |
         v
[Noticia /] -- sem verificacao, bots podem ver preview
         |
         v
[Clica CONSULTAR MEU BENEFICIO]
         |
         v
[Verificacao /verificacao] -- bloqueia bots e desktop aqui
         |
         v
[Login /login] -- usuario digita CPF
         |
         v
[Resto do funil...]
```

### Consideracoes

- A pagina de Noticia NAO tera DeviceGuard para que bots de preview do Facebook possam renderizar a pagina
- A verificacao acontece APENAS quando o usuario tenta entrar no funil
- Isso eh mais eficiente pois nao bloqueia a visualizacao da noticia
