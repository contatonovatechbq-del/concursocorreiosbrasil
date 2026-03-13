import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CEPInput, unformatCEP } from "@/components/CEPInput";
import { Search, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { getSession } from "@/hooks/useSessionPersistence";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

const getContestDates = () => {
  const now = new Date();
  const inscStart = new Date(now); inscStart.setDate(inscStart.getDate() - 5);
  const inscEnd = new Date(now); inscEnd.setDate(inscEnd.getDate() + 15);
  const prova = new Date(now); prova.setDate(prova.getDate() + 45);
  const gabarito = new Date(prova); gabarito.setDate(gabarito.getDate() + 3);
  const resultado = new Date(prova); resultado.setDate(resultado.getDate() + 30);
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return { inscStart: fmt(inscStart), inscEnd: fmt(inscEnd), prova: fmt(prova), gabarito: fmt(gabarito), resultado: fmt(resultado) };
};

const Index = () => {
  const navigate = useNavigate();
  const [cep, setCep] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"sobre" | "cronograma" | "cargos">("sobre");
  const dates = getContestDates();

  useEffect(() => {
    const session = getSession();
    if (session?.cpfData && session?.currentStep && session.currentStep !== "/") {
      navigate(session.currentStep, { state: { cpfData: session.cpfData, valorBeneficio: session.valorBeneficio, protocolo: session.protocolo }, replace: true });
    } else {
      trackFunnelEvent('landing');
    }
  }, [navigate]);

  const handleConsultarCEP = async () => {
    setError("");
    const cepNumbers = unformatCEP(cep);
    if (cepNumbers.length !== 8) { setError("Digite um CEP válido com 8 dígitos"); return; }
    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await response.json();
      if (data.erro) { setError("CEP não encontrado. Verifique e tente novamente."); setLoading(false); return; }
      navigate("/resultado", { state: { cepData: { cep: data.cep, logradouro: data.logradouro, bairro: data.bairro, localidade: data.localidade, uf: data.uf } } });
    } catch { setError("Erro ao consultar CEP. Tente novamente."); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Institutional Title */}
          <div>
            <h1 className="titulo-institucional text-lg sm:text-xl">
              CONCURSO PÚBLICO NACIONAL UNIFICADO — CORREIOS 2026
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Edital Nº 001/2026 — Agente de Correios — Atendente Comercial | Nível Médio
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-border flex">
            <button onClick={() => setActiveTab("sobre")} className={`tab-institucional ${activeTab === "sobre" ? "tab-institucional-active" : "tab-institucional-inactive"}`}>
              Sobre o Concurso
            </button>
            <button onClick={() => setActiveTab("cronograma")} className={`tab-institucional ${activeTab === "cronograma" ? "tab-institucional-active" : "tab-institucional-inactive"}`}>
              Cronograma
            </button>
            <button onClick={() => setActiveTab("cargos")} className={`tab-institucional ${activeTab === "cargos" ? "tab-institucional-active" : "tab-institucional-inactive"}`}>
              Cargos
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "sobre" && (
            <div className="space-y-4">
              <table className="tabela-zebra">
                <tbody>
                  <tr><td className="font-semibold text-foreground w-1/3">Órgão</td><td>Empresa Brasileira de Correios e Telégrafos</td></tr>
                  <tr><td className="font-semibold text-foreground">Cargo</td><td>Atendente Comercial</td></tr>
                  <tr><td className="font-semibold text-foreground">Escolaridade</td><td>Nível Médio Completo</td></tr>
                  <tr><td className="font-semibold text-foreground">Vagas</td><td>15.153 em todo o Brasil</td></tr>
                  <tr><td className="font-semibold text-foreground">Remuneração</td><td>R$ 2.429,26 + Benefícios (VA, VT, Plano de Saúde)</td></tr>
                  <tr><td className="font-semibold text-foreground">Carga Horária</td><td>40 horas semanais</td></tr>
                  <tr><td className="font-semibold text-foreground">Banca</td><td>IBFC — Instituto Brasileiro de Formação e Capacitação</td></tr>
                  <tr><td className="font-semibold text-foreground">Taxa de Inscrição</td><td>R$ 39,80</td></tr>
                </tbody>
              </table>

              <div className="text-xs text-muted-foreground space-y-1 mt-3">
                <p className="font-semibold text-foreground">Observações:</p>
                <p>• As inscrições estão abertas até {dates.inscEnd}.</p>
                <p>• Para mais informações, consulte o <span className="text-primary underline cursor-pointer">edital completo</span>.</p>
                <p>• Dúvidas podem ser enviadas pelo <span className="text-primary underline cursor-pointer">Fale Conosco</span>.</p>
              </div>
            </div>
          )}

          {activeTab === "cronograma" && (
            <table className="tabela-zebra">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Data</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Período de Inscrições</td>
                  <td>{dates.inscStart} a {dates.inscEnd}</td>
                  <td><span className="text-xs font-bold text-success">Em andamento</span></td>
                </tr>
                <tr>
                  <td className="font-medium">Aplicação das Provas</td>
                  <td>{dates.prova}</td>
                  <td><span className="text-xs text-muted-foreground">Aguardando</span></td>
                </tr>
                <tr>
                  <td className="font-medium">Divulgação do Gabarito</td>
                  <td>{dates.gabarito}</td>
                  <td><span className="text-xs text-muted-foreground">Aguardando</span></td>
                </tr>
                <tr>
                  <td className="font-medium">Resultado Final</td>
                  <td>{dates.resultado}</td>
                  <td><span className="text-xs text-muted-foreground">Aguardando</span></td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === "cargos" && (
            <table className="tabela-zebra">
              <thead>
                <tr>
                  <th>Cargo</th>
                  <th>Vagas</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Atendente Comercial</td>
                  <td>15.153</td>
                  <td><span className="text-xs font-bold text-success">Inscrições abertas</span></td>
                </tr>
                <tr>
                  <td className="font-medium">Carteiro</td>
                  <td>—</td>
                  <td><span className="text-xs text-muted-foreground">Edital separado</span></td>
                </tr>
                <tr>
                  <td className="font-medium">Operador de Triagem</td>
                  <td>—</td>
                  <td><span className="text-xs text-muted-foreground">Edital separado</span></td>
                </tr>
              </tbody>
            </table>
          )}

          {/* CEP Search */}
          <div className="border border-border rounded bg-card p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="titulo-institucional text-base">CONSULTAR LOCAL DE PROVA</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Digite seu CEP para encontrar a agência mais próxima e ver as vagas disponíveis na sua região.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Seu CEP</label>
              <CEPInput value={cep} onChange={setCep} disabled={loading} error={!!error} />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 p-2.5 rounded">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleConsultarCEP}
              disabled={loading || unformatCEP(cep).length < 8}
              className="w-full h-12 text-sm font-bold"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" />Consultando...</>
              ) : (
                <><Search className="w-5 h-5 mr-2" />Consultar vagas na minha região</>
              )}
            </Button>

            <p className="text-[10px] text-muted-foreground text-center">Consulta segura — Dados protegidos conforme LGPD</p>
          </div>

        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default Index;
