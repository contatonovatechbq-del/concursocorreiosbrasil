import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureUtmParams } from "@/hooks/useUtmTracking";

/**
 * Componente invisível que captura UTMs sempre que a rota muda.
 * Isso garante que se o usuário cair direto em /verificacao?utm..., a captura acontece.
 */
const UtmCapture = () => {
  const location = useLocation();

  useEffect(() => {
    // Captura UTMs sempre que location.search muda
    if (location.search) {
      console.log('[UtmCapture] Route changed with params:', location.pathname + location.search);
      captureUtmParams();
    }
  }, [location.search, location.pathname]);

  // Captura inicial no mount
  useEffect(() => {
    console.log('[UtmCapture] Initial capture on mount');
    captureUtmParams();
  }, []);

  return null; // Componente invisível
};

export default UtmCapture;
