const UTM_STORAGE_KEY = "willbank_utm";

interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  utm_id: string | null;
  src: string | null;
  sck: string | null;
  ref: string | null;
}

/**
 * Captura UTMs da URL e salva no localStorage.
 * Deve ser chamado uma vez no App.tsx na inicialização.
 * Só sobrescreve se a URL tiver novos UTMs.
 */
export const captureUtmParams = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Só salva se tiver novos UTMs na URL
  const hasUtms = urlParams.has('utm_source') || 
                  urlParams.has('utm_campaign') || 
                  urlParams.has('src');
  
  if (hasUtms) {
    const utmData: UtmParams = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_content: urlParams.get('utm_content'),
      utm_term: urlParams.get('utm_term'),
      utm_id: urlParams.get('utm_id'),
      src: urlParams.get('src'),
      sck: urlParams.get('sck'),
      ref: urlParams.get('ref'),
    };
    
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
    console.log('[UTM] Captured and saved:', utmData);
  }
};

/**
 * Recupera UTMs salvos do localStorage.
 * Usar no checkout (Saque.tsx e UpsellStep.tsx) para enviar ao BuckPay/UTMify.
 */
export const getStoredUtmParams = (): UtmParams => {
  try {
    const data = localStorage.getItem(UTM_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[UTM] Error reading from storage:', error);
  }
  
  return {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    utm_id: null,
    src: null,
    sck: null,
    ref: null,
  };
};
