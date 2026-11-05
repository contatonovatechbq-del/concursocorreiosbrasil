import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureUtmParams, getStoredUtmParams } from "@/hooks/useUtmTracking";

/**
 * Captura UTMs a cada troca de página e garante que elas fiquem na URL
 * da primeira até a última página do funil.
 */
const UtmCapture = () => {
  const location = useLocation();

  useEffect(() => {
    captureUtmParams();
    try {
      const stored = getStoredUtmParams() as unknown as Record<string, string | null>;
      const url = new URL(window.location.href);
      let changed = false;
      for (const [k, v] of Object.entries(stored)) {
        if (v && !url.searchParams.has(k)) { url.searchParams.set(k, v); changed = true; }
      }
      if (changed) window.history.replaceState(window.history.state, "", url.toString());
    } catch {}
  }, [location.pathname, location.search]);

  return null;
};

export default UtmCapture;
