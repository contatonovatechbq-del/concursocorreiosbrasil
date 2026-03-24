import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Clock, Loader2 } from "lucide-react";
import CorreiosCard from "@/components/CorreiosCard";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPixStorageKey, savePixData, getStoredPixData, getPixRemainingTime } from "@/hooks/usePixPersistence";
import { fbEvents } from "@/lib/fbPixel";
import { getUtmSignature, getStoredUtmParams } from "@/hooks/useUtmTracking";
import { normalizeBuyer } from "@/lib/pixBuyer";

interface UpsellStepProps {
  title: string;
  description: string;
  valor: number;
  cpfData: { nome: string; cpf: string };
  protocolo: string;
  onPaymentConfirmed: () => void;
  stepNumber: number;
  totalSteps: number;
}

interface PixData {
  code: string;
  qrcode_base64: string;
  transaction_id: string;
  order_uuid: string;
}

const UpsellStep = ({ title, description, valor, cpfData, protocolo, onPaymentConfirmed, stepNumber }: UpsellStepProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isLoadingPix, setIsLoadingPix] = useState(true);
  const [pixError, setPixError] = useState<string | null>(null);
  const [showPix, setShowPix] = useState(true);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pixStorageKey = getPixStorageKey("upsell", stepNumber);

  useEffect(() => {
    const currentUtmSignature = getUtmSignature();
    const storedPix = getStoredPixData(pixStorageKey, currentUtmSignature);
    if (storedPix) {
      setPixData({ code: storedPix.code, qrcode_base64: storedPix.qrcode_base64, transaction_id: storedPix.transaction_id, order_uuid: storedPix.external_id });
      setCountdown(getPixRemainingTime(pixStorageKey));
      setIsLoadingPix(false);
      startPaymentCheck(storedPix.external_id);
      return;
    }

    const generatePix = async () => {
      try {
        setIsLoadingPix(true); setPixError(null);
        const amountInCents = Math.round(valor * 100);
        const utmSignature = getUtmSignature();

        const sessionCpfData = (() => {
          try {
            const session = JSON.parse(localStorage.getItem("bb_session") || "{}");
            return session?.cpfData ?? null;
          } catch {
            return null;
          }
        })();

        const rawName = cpfData.nome?.trim() || sessionCpfData?.nome?.trim() || null;
        const rawDoc = cpfData.cpf || sessionCpfData?.cpf || null;
        const buyer = normalizeBuyer(rawName, rawDoc);

        const response = await supabase.functions.invoke("create-pix", {
          body: {
            amount: amountInCents,
            buyer: { name: buyer.name, email: buyer.email, document: buyer.document },
            tracking: {
              utm_source: storedUtms.utm_source || "up",
              utm_campaign: `up${stepNumber}`,
              utm_medium: storedUtms.utm_medium || null,
              utm_content: storedUtms.utm_content || null,
              utm_term: storedUtms.utm_term || null,
            },
          },
        });

        if (response.error) { setPixError('Erro ao gerar PIX. Tente novamente.'); return; }
        const data = response.data;
        console.log('[Upsell] Fruitfy response:', data);
        const pixCode = data?.data?.pix?.code || data?.data?.pix_code;
        const pixQrBase64 = data?.data?.pix?.qr_code_base64 || data?.data?.pix?.qrcode_base64 || '';
        const orderUuid = data?.data?.order_id || data?.data?.order_uuid || '';
        if ((pixCode || pixQrBase64) && orderUuid) {
          const newPixData: PixData = { code: pixCode, qrcode_base64: pixQrBase64, transaction_id: orderUuid, order_uuid: orderUuid };
          setPixData(newPixData);
          savePixData(pixStorageKey, { code: pixCode, qrcode_base64: pixQrBase64, transaction_id: orderUuid, external_id: orderUuid }, utmSignature);
          startPaymentCheck(orderUuid);
        } else { 
          console.error('[Upsell] Could not extract PIX data:', data);
          setPixError('Resposta inválida do servidor.'); 
        }
      } catch { setPixError('Erro ao gerar PIX. Tente novamente.'); } finally { setIsLoadingPix(false); }
    };
    generatePix();
    return () => { if (checkIntervalRef.current) clearInterval(checkIntervalRef.current); };
  }, [valor, cpfData, protocolo, stepNumber, title, pixStorageKey]);

  useEffect(() => {
    const timer = setInterval(() => { setCountdown(prev => { if (prev <= 0) { clearInterval(timer); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(timer);
  }, []);

  const startPaymentCheck = (orderUuid: string) => {
    checkIntervalRef.current = setInterval(async () => {
      try {
        const response = await supabase.functions.invoke('check-pix-status', { body: { order_uuid: orderUuid } });
        if (response.data?.data?.status === 'paid') {
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          fbEvents.purchase({ value: valor, currency: 'BRL', content_name: title });
          fbEvents.serverPurchase({ first_name: cpfData.nome.split(' ')[0], cpf: cpfData.cpf, value: valor, content_name: title });
          toast({ title: "Pagamento confirmado!", description: "Processando próxima etapa..." });
          onPaymentConfirmed();
        }
      } catch {}
    }, 15000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleCopiarPix = () => {
    if (pixData?.code) { navigator.clipboard.writeText(pixData.code); toast({ title: "Código PIX copiado! ✓", description: "Cole no seu app bancário" }); }
  };

  const handleConfirmarPagamento = async () => {
    setIsProcessing(true);
    if (pixData?.order_uuid) {
      try {
        const response = await supabase.functions.invoke('check-pix-status', { body: { order_uuid: pixData.order_uuid } });
        if (response.data?.data?.status === 'paid') {
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          fbEvents.purchase({ value: valor, currency: 'BRL', content_name: title });
          fbEvents.serverPurchase({ first_name: cpfData.nome.split(' ')[0], cpf: cpfData.cpf, value: valor, content_name: title });
          toast({ title: "Pagamento confirmado!", description: "Processando próxima etapa..." });
          onPaymentConfirmed();
        } else {
          toast({ title: "Aguardando pagamento", description: "Ainda não identificamos. Tente em alguns segundos.", variant: "destructive" });
        }
      } catch { toast({ title: "Erro ao verificar", description: "Tente novamente.", variant: "destructive" }); }
    }
    setIsProcessing(false);
  };

  if (pixError) {
    return (
      <CorreiosCard className="w-full max-w-lg">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-destructive font-medium text-center">{pixError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Tentar novamente</Button>
        </div>
      </CorreiosCard>
    );
  }

  return (
    <CorreiosCard className="w-full max-w-lg">
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-lg sm:text-xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-destructive">
            <Clock className="w-4 h-4" />
            <span className="font-semibold text-sm">Tempo restante:</span>
          </div>
          <p className="text-3xl font-black text-destructive font-mono mt-1">{formatTime(countdown)}</p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Valor a pagar:</span>
            <span className="font-black text-lg text-primary">R$ {valor.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {!showPix ? (
          <Button onClick={() => setShowPix(true)} disabled={isLoadingPix} className="w-full h-14 text-sm font-black gradient-bb-accent text-accent-foreground">
            {isLoadingPix ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Preparando...</>) : "PAGAR AGORA"}
          </Button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-muted-foreground font-medium text-center">Escaneie o QR Code ou copie o código PIX:</p>
            <div className="w-44 h-44 mx-auto bg-card rounded-lg border-2 border-primary p-2">
              {pixData?.qrcode_base64 ? (
                <img src={pixData.qrcode_base64.startsWith('data:') ? pixData.qrcode_base64 : `data:image/png;base64,${pixData.qrcode_base64}`} alt="QR Code PIX" className="w-full h-full rounded" />
              ) : (
                <div className="w-full h-full bg-muted/30 rounded flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <Button variant="outline" onClick={handleCopiarPix} disabled={!pixData?.code} className="w-full h-12 border-2 border-primary text-primary font-bold text-sm">
              <Copy className="w-4 h-4 mr-2" /> Copiar código PIX
            </Button>
            <Button onClick={handleConfirmarPagamento} disabled={isProcessing || !pixData} className="w-full h-14 text-sm font-black gradient-bb-accent text-accent-foreground">
              {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Verificando...</>) : "JÁ PAGUEI — PRÓXIMA ETAPA"}
            </Button>
          </div>
        )}
      </div>
    </CorreiosCard>
  );
};

export default UpsellStep;
