

# Plano: Botão Vermelho de Play no Vídeo da Reportagem

## Resumo

Adicionar um botão vermelho grande e chamativo em cima do vídeo da reportagem oficial. O vídeo começa pausado com o botão de play visível. Quando a pessoa clica, o vídeo começa a tocar com volume no máximo.

## Como vai ficar

### Antes (atual)
```
[Vídeo com controles nativos do navegador]
```

### Depois
```
[Thumbnail/Vídeo pausado]
     [ ▶ ]  ← Botão vermelho grande no centro
```

Quando clica:
- Botão some
- Vídeo começa a tocar
- Volume no máximo (1.0)

## Visual do Botão

- Círculo vermelho (#cc0000) grande
- Ícone de play branco no centro
- Efeito de hover (fica um pouco mais escuro)
- Centralizado em cima do vídeo

## Detalhes Técnicos

### Arquivo: `src/pages/Noticia.tsx`

**Adicionar import:**
```tsx
import { Play } from "lucide-react";
```

**Adicionar estado:**
```tsx
const [isPlaying, setIsPlaying] = useState(false);
```

**Função de play:**
```tsx
const handlePlay = () => {
  if (videoRef.current) {
    videoRef.current.volume = 1.0; // Volume no máximo
    videoRef.current.play();
    setIsPlaying(true);
  }
};
```

**Modificar o vídeo (linhas 156-166):**

Remover `controls` do vídeo e adicionar overlay com botão:

```tsx
<div className="relative rounded-lg overflow-hidden bg-black">
  <video
    ref={videoRef}
    className="w-full aspect-video"
    playsInline
    controls={isPlaying} // Só mostra controles depois de dar play
    onEnded={() => setVideoEnded(true)}
  >
    <source src="/video/video_consulta.mp4" type="video/mp4" />
  </video>
  
  {/* Overlay com botão de play */}
  {!isPlaying && (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
      onClick={handlePlay}
    >
      <button className="w-20 h-20 bg-[#cc0000] hover:bg-[#aa0000] rounded-full flex items-center justify-center transition-colors shadow-lg">
        <Play className="w-10 h-10 text-white ml-1" fill="white" />
      </button>
    </div>
  )}
</div>
```

## Fluxo

1. Usuário vê o vídeo pausado com botão vermelho grande no centro
2. Clica no botão (ou em qualquer lugar do overlay)
3. Vídeo começa a tocar com volume 100%
4. Controles nativos aparecem (pause, seekbar, etc.)
5. Quando termina → aparece o CTA "CONSULTAR MEU CPF AGORA"

