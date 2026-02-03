const PIX_STORAGE_PREFIX = "willbank_pix_";
const PIX_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export interface StoredPixData {
  code: string;
  qrcode_base64: string;
  transaction_id: string;
  external_id: string;
  createdAt: number;
  utmSignature?: string; // Snapshot do tracking usado na geração
}

/**
 * Get a unique key for storing PIX data based on page and step
 */
export const getPixStorageKey = (pageType: "saque" | "upsell", step?: number): string => {
  if (pageType === "upsell" && step !== undefined) {
    return `${PIX_STORAGE_PREFIX}upsell_${step}`;
  }
  return `${PIX_STORAGE_PREFIX}${pageType}`;
};

/**
 * Save PIX data to localStorage with timestamp and UTM signature
 */
export const savePixData = (key: string, pixData: Omit<StoredPixData, "createdAt">, utmSignature?: string): void => {
  const dataToStore: StoredPixData = {
    ...pixData,
    createdAt: Date.now(),
    utmSignature: utmSignature || '',
  };
  localStorage.setItem(key, JSON.stringify(dataToStore));
  console.log('[PIX] Saved with UTM signature:', utmSignature);
};

/**
 * Get stored PIX data if it exists and is not expired (within 10 minutes)
 * Returns null if UTM signature doesn't match (forces new PIX generation)
 */
export const getStoredPixData = (key: string, currentUtmSignature?: string): StoredPixData | null => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data: StoredPixData = JSON.parse(stored);
    const elapsed = Date.now() - data.createdAt;

    // Check if PIX is still valid (within 10 minutes)
    if (elapsed >= PIX_EXPIRY_MS) {
      console.log('[PIX] Expired, removing');
      localStorage.removeItem(key);
      return null;
    }

    // Check UTM signature match (if provided)
    if (currentUtmSignature !== undefined) {
      const storedSignature = data.utmSignature || '';
      
      // Se PIX foi gerado sem UTM mas agora temos UTM, invalida
      if (!storedSignature && currentUtmSignature) {
        console.log('[PIX] Stored without UTM but now have UTM, invalidating');
        localStorage.removeItem(key);
        return null;
      }
      
      // Se as assinaturas são diferentes, invalida
      if (storedSignature !== currentUtmSignature) {
        console.log('[PIX] UTM signature changed, invalidating. Old:', storedSignature, 'New:', currentUtmSignature);
        localStorage.removeItem(key);
        return null;
      }
    }

    console.log('[PIX] Restored valid PIX with signature:', data.utmSignature);
    return data;
  } catch {
    return null;
  }
};

/**
 * Get remaining time in seconds for a stored PIX
 */
export const getPixRemainingTime = (key: string): number => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return 600; // Default 10 minutes

    const data: StoredPixData = JSON.parse(stored);
    const elapsed = Date.now() - data.createdAt;
    const remaining = Math.max(0, PIX_EXPIRY_MS - elapsed);

    return Math.floor(remaining / 1000);
  } catch {
    return 600;
  }
};

/**
 * Clear stored PIX data
 */
export const clearPixData = (key: string): void => {
  localStorage.removeItem(key);
};

/**
 * Clear all stored PIX data (for cleanup)
 */
export const clearAllPixData = (): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PIX_STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};
