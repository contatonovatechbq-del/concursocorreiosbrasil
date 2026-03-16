import { supabase } from "@/integrations/supabase/client";
import { captureUtmParams, getStoredUtmParams } from "@/hooks/useUtmTracking";

// Get or create session ID
const getSessionId = (): string => {
  const key = "funnel_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

// Simple hash function for CPF (anonymization)
const hashCPF = async (cpf: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(cpf.replace(/\D/g, ''));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
};

export interface TrackEventData {
  cpf?: string;
  [key: string]: unknown;
}

export const trackFunnelEvent = async (
  step: string,
  data?: TrackEventData
): Promise<void> => {
  try {
    const sessionId = getSessionId();
    const utmParams = getStoredUtmParams();
    
    // Hash CPF if provided
    let cpfHash: string | undefined;
    if (data?.cpf) {
      cpfHash = await hashCPF(data.cpf);
    }
    
    // Remove cpf from data to not send it unhashed
    const { cpf, ...stepData } = data || {};
    
    await supabase.functions.invoke('track-funnel', {
      body: {
        session_id: sessionId,
        step,
        cpf_hash: cpfHash,
        step_data: stepData,
        user_agent: navigator.userAgent,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_term: utmParams.utm_term,
        utm_content: utmParams.utm_content,
      },
    });
    
    console.log('[FunnelTracking] Event tracked:', step);
  } catch (error) {
    // Silent fail - don't break user experience for tracking
    console.error('[FunnelTracking] Error tracking event:', error);
  }
};

// Hook for tracking on component mount
export const useTrackFunnelStep = (step: string, data?: TrackEventData) => {
  // We don't use useEffect here to avoid re-tracking on every render
  // Instead, we expose the function for manual tracking
  return {
    track: () => trackFunnelEvent(step, data),
  };
};
