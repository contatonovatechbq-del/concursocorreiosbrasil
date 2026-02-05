import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CPFData } from "@/lib/cpf";

const SESSION_KEY = "willbank_session";

// Chat step type
export type ChatStep = "waiting-video" | "greeting" | "quiz-mae" | "quiz-nascimento" | "identity-confirmed" | "audio-3-validation" | "waiting-confirm-validation" | "show-approval-animation" | "pix-type-selection" | "pix-cpf-input" | "pix-email-input" | "pix-confirm" | "audio-2-comprovante" | "generating-comprovante" | "envio-selection" | "sms-input" | "email-input" | "audio-1-taxas" | "taxa-info" | "processing" | "final";

// Chat state that needs to be persisted
export interface ChatState {
  chatStep: ChatStep;
  chatAudioListened: string[]; // Array of audio URLs that have been listened
  chatPixType: "telefone" | "cpf" | "email" | null;
  chatPixKey: string;
  chatVideoWatched: boolean;
}

interface SessionData {
  cpfData: CPFData;
  currentStep: string;
  valorBeneficio?: number;
  protocolo?: string;
  timestamp: number;
  // Chat-specific state
  chatState?: ChatState;
}

// Order of steps in the funnel
const FUNNEL_STEPS = [
  "/",
  "/verificando",
  "/confirma-dados",
  "/biometria",
  "/video",
  "/chat",
  "/saque",
  "/upsell/1",
  "/upsell/2",
  "/upsell/3",
  "/upsell/4",
  "/upsell/5",
  "/upsell/6",
  "/upsell/7",
];

// Get step index (higher = further in funnel)
const getStepIndex = (path: string): number => {
  const index = FUNNEL_STEPS.indexOf(path);
  return index === -1 ? 0 : index;
};

// Save session to localStorage
export const saveSession = (data: Partial<SessionData> & { cpfData: CPFData; currentStep: string }) => {
  const existingSession = getSession();
  const sessionData: SessionData = {
    ...existingSession,
    ...data,
    timestamp: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

// Save chat state specifically
export const saveChatState = (chatState: ChatState) => {
  const existingSession = getSession();
  if (!existingSession) return;
  
  const sessionData: SessionData = {
    ...existingSession,
    chatState,
    timestamp: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

// Get chat state from session
export const getChatState = (): ChatState | null => {
  const session = getSession();
  return session?.chatState || null;
};

// Get session from localStorage
export const getSession = (): SessionData | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    
    const session: SessionData = JSON.parse(data);
    
    // Check if session is expired (24 hours)
    const expireTime = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - session.timestamp > expireTime) {
      clearSession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
};

// Clear session
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// Hook to check and restore session on app load
export const useSessionRestore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const session = getSession();
    
    // If we're on the login page and there's a saved session
    if (location.pathname === "/" && session?.cpfData && session?.currentStep) {
      const savedStepIndex = getStepIndex(session.currentStep);
      
      // Only redirect if saved step is beyond login
      if (savedStepIndex > 0) {
        // Navigate to the saved step with the saved data
        navigate(session.currentStep, {
          state: {
            cpfData: session.cpfData,
            valorBeneficio: session.valorBeneficio,
            protocolo: session.protocolo,
          },
          replace: true,
        });
      }
    }
  }, [location.pathname, navigate]);
};

// Hook to save current step
export const useSaveStep = (currentStep: string, cpfData?: CPFData, extraData?: { valorBeneficio?: number; protocolo?: string }) => {
  useEffect(() => {
    if (cpfData) {
      saveSession({
        cpfData,
        currentStep,
        ...extraData,
      });
    }
  }, [currentStep, cpfData, extraData?.valorBeneficio, extraData?.protocolo]);
};
