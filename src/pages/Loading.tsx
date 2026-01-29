import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Shield, Search, CheckCircle, Database } from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";

const loadingSteps = [
  { icon: Search, text: "Buscando dados no sistema..." },
  { icon: Database, text: "Consultando base de benefícios..." },
  { icon: Shield, text: "Verificando elegibilidade..." },
  { icon: CheckCircle, text: "Finalizando análise..." },
];

const Loading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const cpfData = location.state?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate("/resultado", { state: { cpfData } });
    }, 4500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(redirectTimer);
    };
  }, [cpfData, navigate]);

  const CurrentIcon = loadingSteps[currentStep].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <img src={willbankLogo} alt="Will Bank" className="h-10 object-contain" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Animated Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative flex items-center justify-center w-24 h-24 bg-primary rounded-full">
              <CurrentIcon className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Analisando seu CPF
            </h1>
            <p className="text-muted-foreground animate-pulse">
              {loadingSteps[currentStep].text}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground">{progress}% concluído</p>
          </div>

          {/* Steps Indicator */}
          <div className="flex justify-center gap-2">
            {loadingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground px-6 py-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm opacity-80">
            Seus dados estão protegidos e seguros
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Loading;
