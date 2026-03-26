const UTM_STORAGE_KEY = "willbank_utm";
const FIRST_TOUCH_KEY = "willbank_utm_first";

export interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  utm_id: string | null;
  src: string | null;
  sck: string | null;
  ref: string | null;
  fbclid: string | null;
}

const emptyUtmParams: UtmParams = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  utm_id: null,
  src: null,
  sck: null,
  ref: null,
  fbclid: null,
};

const UTM_KEYS: (keyof UtmParams)[] = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
  'utm_term', 'utm_id', 'src', 'sck', 'ref', 'fbclid',
];

/**
 * Captura UTMs da URL e faz MERGE com o que já existe no localStorage.
 * Na PRIMEIRA captura, congela os valores como "first touch".
 */
export const captureUtmParams = (): void => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAnyUtm = UTM_KEYS.some(key => urlParams.has(key));
    
    if (!hasAnyUtm) {
      console.log('[UTM] No UTM params in current URL, keeping existing');
      return;
    }

    const existing = getStoredUtmParams();
    const merged = {} as UtmParams;
    for (const key of UTM_KEYS) {
      merged[key] = urlParams.get(key) ?? existing[key];
    }
    
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
    console.log('[UTM] Captured and merged:', merged);

    // Freeze first-touch: only save if not already saved
    if (!localStorage.getItem(FIRST_TOUCH_KEY)) {
      localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(merged));
      console.log('[UTM] First-touch frozen:', merged);
    }
  } catch (error) {
    console.error('[UTM] Error capturing:', error);
  }
};

/**
 * Recupera UTMs salvos do localStorage.
 */
export const getStoredUtmParams = (): UtmParams => {
  try {
    const data = localStorage.getItem(UTM_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return { ...emptyUtmParams, ...parsed };
    }
  } catch (error) {
    console.error('[UTM] Error reading from storage:', error);
  }
  return { ...emptyUtmParams };
};

/**
 * Retorna os UTMs de first-touch (congelados na primeira visita).
 * Usa como fallback os UTMs atuais se first-touch não existir.
 */
export const getFirstTouchUtm = (): UtmParams => {
  try {
    const data = localStorage.getItem(FIRST_TOUCH_KEY);
    if (data) {
      return { ...emptyUtmParams, ...JSON.parse(data) };
    }
  } catch {}
  return getStoredUtmParams();
};

/**
 * Retorna a campanha base normalizada (first-touch).
 * Prioridade: utm_campaign > utm_id > src > ref
 */
export const getBaseCampaign = (): string => {
  const ft = getFirstTouchUtm();
  return ft.utm_campaign || ft.utm_id || ft.src || ft.ref || '';
};

/**
 * Helper para pagamento: retorna tracking completo com campanha de first-touch.
 * Para upsells, passe stepNumber para adicionar sufixo UP{N}.
 */
export const getEffectiveTracking = (stepNumber?: number) => {
  const ft = getFirstTouchUtm();
  const baseCampaign = ft.utm_campaign || ft.utm_id || ft.src || ft.ref || '';

  let campaign: string;
  if (stepNumber) {
    campaign = `(UP${stepNumber})`;
  } else {
    campaign = baseCampaign || 'front';
  }

  return {
    utm_source: ft.utm_source || 'direct',
    utm_medium: ft.utm_medium || null,
    utm_campaign: campaign,
    utm_content: ft.utm_content || null,
    utm_term: ft.utm_term || null,
  };
};

/**
 * Gera assinatura do tracking para comparação.
 */
export const getUtmSignature = (): string => {
  const params = getStoredUtmParams();
  return [
    params.utm_source || '',
    params.utm_campaign || '',
    params.utm_medium || '',
  ].join('|');
};

/**
 * Verifica se o tracking atual tem pelo menos uma UTM preenchida.
 */
export const hasValidTracking = (): boolean => {
  const params = getStoredUtmParams();
  return !!(params.utm_source || params.utm_campaign || params.src);
};

/**
 * Constrói URL com UTMs salvos como query params.
 */
export const buildUrlWithUtm = (basePath: string): string => {
  const params = getStoredUtmParams();
  const searchParams = new URLSearchParams();
  
  for (const key of UTM_KEYS) {
    if (params[key]) searchParams.set(key, params[key]!);
  }
  
  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};
