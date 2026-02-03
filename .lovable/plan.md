

# Plano: Adicionar Imagens na Secao "Veja Tambem"

## Resumo

Adicionar as duas imagens enviadas pelo usuario na secao "Veja tambem" da pagina de noticia:

1. **Banco Central** - imagem da fachada do Banco Central do Brasil
2. **Justica** - imagem do martelo de juiz (gavel)

## Mudancas

### Arquivos de Imagem

Copiar as imagens para a pasta `public/images/`:

| Origem | Destino |
|--------|---------|
| `user-uploads://image-40.png` | `public/images/banco-central.png` |
| `user-uploads://image-41.png` | `public/images/justica.png` |

### Atualizacao do Noticia.tsx

Substituir os placeholders cinzas por tags `<img>` com as imagens:

**Antes (linhas 240-257):**
```jsx
<div className="flex gap-3 pb-3 border-b border-gray-100">
  <div className="w-20 h-14 bg-gray-200 rounded flex-shrink-0"></div>
  <div>
    <p className="text-sm font-medium text-[#333] line-clamp-2">
      Banco Central anuncia novas regras para bancos digitais
    </p>
    <span className="text-xs text-[#999]">há 2 horas</span>
  </div>
</div>
<div className="flex gap-3 pb-3 border-b border-gray-100">
  <div className="w-20 h-14 bg-gray-200 rounded flex-shrink-0"></div>
  ...
```

**Depois:**
```jsx
<div className="flex gap-3 pb-3 border-b border-gray-100">
  <img 
    src="/images/banco-central.png" 
    alt="Banco Central do Brasil" 
    className="w-20 h-14 object-cover rounded flex-shrink-0"
  />
  <div>
    <p className="text-sm font-medium text-[#333] line-clamp-2">
      Banco Central anuncia novas regras para bancos digitais
    </p>
    <span className="text-xs text-[#999]">há 2 horas</span>
  </div>
</div>
<div className="flex gap-3 pb-3 border-b border-gray-100">
  <img 
    src="/images/justica.png" 
    alt="Martelo de juiz" 
    className="w-20 h-14 object-cover rounded flex-shrink-0"
  />
  ...
```

---

## Secao Tecnica

### Arquivo a Modificar
- `src/pages/Noticia.tsx` - Substituir divs placeholder por tags img

### Arquivos a Criar
- `public/images/banco-central.png` - Copiar imagem do Banco Central
- `public/images/justica.png` - Copiar imagem do martelo de justica

