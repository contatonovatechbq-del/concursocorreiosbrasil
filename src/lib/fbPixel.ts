import { supabase } from "@/integrations/supabase/client";

// Facebook Pixel helper for client-side events
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

// Get Facebook cookies for better attribution
function getFbCookies() {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return {
    fbc: cookies._fbc || null,
    fbp: cookies._fbp || null,
  };
}

// Track client-side event
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
}

// Track custom event
export function trackCustomEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
}

// Send server-side conversion event (for more accurate tracking)
export async function sendConversionEvent(data: {
  event_name: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  cpf?: string;
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
}) {
  try {
    const { fbc, fbp } = getFbCookies();

    const response = await supabase.functions.invoke('fb-conversion', {
      body: {
        ...data,
        event_source_url: window.location.href,
        fbc,
        fbp,
      },
    });

    if (response.error) {
      console.error('Error sending FB conversion:', response.error);
      return { success: false, error: response.error };
    }

    console.log('FB conversion sent:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending FB conversion:', error);
    return { success: false, error };
  }
}

// Pre-defined events
export const fbEvents = {
  // Standard events
  pageView: () => trackEvent('PageView'),
  viewContent: (params?: { content_name?: string; value?: number; currency?: string }) => 
    trackEvent('ViewContent', params),
  lead: (params?: { content_name?: string; value?: number; currency?: string }) => 
    trackEvent('Lead', params),
  completeRegistration: (params?: { content_name?: string; value?: number; currency?: string }) => 
    trackEvent('CompleteRegistration', params),
  initiateCheckout: (params?: { value?: number; currency?: string; content_name?: string }) => 
    trackEvent('InitiateCheckout', params),
  purchase: (params: { value: number; currency: string; content_name?: string }) => 
    trackEvent('Purchase', params),

  // Server-side events (more accurate for conversions)
  serverLead: (data: { first_name?: string; cpf?: string; value?: number }) =>
    sendConversionEvent({ event_name: 'Lead', ...data }),
  serverPurchase: (data: { first_name?: string; cpf?: string; value: number; content_name?: string }) =>
    sendConversionEvent({ event_name: 'Purchase', currency: 'BRL', ...data }),
  serverInitiateCheckout: (data: { first_name?: string; cpf?: string; value?: number; content_name?: string }) =>
    sendConversionEvent({ event_name: 'InitiateCheckout', currency: 'BRL', ...data }),
};
