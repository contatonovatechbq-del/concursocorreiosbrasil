const UTM_STORAGE_KEY = "willbank_utm";

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
 * Só sobrescreve campos que vieram preenchidos na URL.
 * Pode ser chamado várias vezes (no App e em mudanças de rota).
 */
export const captureUtmParams = (): void => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Checa se QUALQUER parâmetro UTM está na URL (não só utm_source/utm_campaign/src)
    const hasAnyUtm = UTM_KEYS.some(key => urlParams.has(key));
    
    if (!hasAnyUtm) {
      console.log('[UTM] No UTM params in current URL, keeping existing');
      return;
    }

    // Ler o que já está salvo
    const existing = getStoredUtmParams();

    // Merge inteligente: novo valor não-nulo sobrescreve, nulo mantém antigo
    const merged = {} as UtmParams;
    for (const key of UTM_KEYS) {
      merged[key] = urlParams.get(key) ?? existing[key];
    }
    
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
    console.log('[UTM] Captured and merged:', merged);
  } catch (error) {
    console.error('[UTM] Error capturing:', error);
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
      const parsed = JSON.parse(data);
      console.log('[UTM] Retrieved from storage:', parsed);
      return { ...emptyUtmParams, ...parsed };
    }
  } catch (error) {
    console.error('[UTM] Error reading from storage:', error);
  }
  
  console.log('[UTM] No data in storage, returning empty');
  return { ...emptyUtmParams };
};

/**
 * Gera uma "assinatura" do tracking atual para comparação.
 * Usado para invalidar PIX salvo quando UTM muda.
 */
export const getUtmSignature = (): string => {
  const params = getStoredUtmParams();
  // Usa apenas os campos principais para a assinatura
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
 * Usa para navegar mantendo rastreio na URL.
 */
export const buildUrlWithUtm = (basePath: string): string => {
  const params = getStoredUtmParams();
  const searchParams = new URLSearchParams();
  
  // Adiciona apenas parâmetros que têm valor
  for (const key of UTM_KEYS) {
    if (params[key]) searchParams.set(key, params[key]!);
  }
  
  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};
