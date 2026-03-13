import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CEPInput, unformatCEP } from "@/components/CEPInput";
import { Search, MapPin, Calendar, Users, FileText, Briefcase, AlertTriangle, Loader2, ChevronRight, Clock, CheckCircle, Award } from "lucide-react";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import CorreiosCard from "@/components/CorreiosCard";
import { getSession } from "@/hooks/useSessionPersistence";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";

// Calculate dates ~1.5 months from now
const getContestDates = () => {
  const now = new Date();
  const inscStart = new Date(now);
  inscStart.setDate(inscStart.getDate() - 5);
  const inscEnd = new Date(now);
  inscEnd.setDate(inscEnd.getDate() + 15);
  const prova = new Date(now);
  prova.setDate(prova.getDate() + 45);
  const gabarito = new Date(prova);
  gabarito.setDate(gabarito.getDate() + 3);
  const resultado = new Date(prova);
  resultado.setDate(resultado.getDate() + 30);

  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return {
    inscStart: fmt(inscStart),
    inscEnd: fmt(inscEnd),
    prova: fmt(prova),
    gabarito: fmt(gabarito),
    resultado: fmt(resultado),
  };
};

const Index = () => {
  const navigate = useNavigate();
  const [cep, setCep] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cargos" | "editais">("cargos");
  const dates = getContestDates();

  useEffect(() => {
    const session = getSession();
    if (session?.cpfData && session?.currentStep && session.currentStep !== "/") {
      navigate(session.currentStep, {
        state: {
          cpfData: session.cpfData,
          valorBeneficio: session.valorBeneficio,
          protocolo: session.protocolo,
        },
        replace: true,
      });
    } else {
      trackFunnelEvent('landing');
    }
  }, [navigate]);

  const handleConsultarCEP = async () => {
    setError("");
    const cepNumbers = unformatCEP(cep);

    if (cepNumbers.length !== 8) {
      setError("Digite um CEP válido com 8 dígitos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError("CEP não encontrado. Verifique e tente novamente.");
        setLoading(false);
        return;
      }

      navigate("/resultado", {
        state: {
          cepData: {
            cep: data.cep,
            logradouro: data.logradouro,
            bairro: data.bairro,
            localidade: data.localidade,
            uf: data.uf,
          },
        },
      });
    } catch {
      setError("Erro ao consultar CEP. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader />

      {/* Banner */}
      <div className="gradient-correios text-white px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium mb-2">
            <span className="w-2 h-2 bg-[hsl(47,100%,50%)] rounded-full animate-pulse" />
            INSCRIÇÕES ABERTAS
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            CONCURSO PÚBLICO NACIONAL
          </h1>
          <p className="text-sm sm:text-lg font-bold text-[hsl(47,100%,50%)]">
            CORREIOS 2026 — EDITAL Nº 001/2026
          </p>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto">
            Agente de Correios — Atendente Comercial | Nível Médio
          </p>
        </div>
      </div>

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4 text-center">
              <Users className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-black text-primary">15.153</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Vagas no Brasil</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4 text-center">
              <Briefcase className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-black text-primary">R$ 2.429</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Salário Inicial</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4 text-center">
              <Award className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-black text-primary">40h</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Carga Semanal</p>
            </div>
          </div>

          {/* Cargo Card */}
          <CorreiosCard>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg gradient-correios flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-base sm:text-lg text-foreground">Agente de Correios — Atendente Comercial</h2>
                  <p className="text-sm text-muted-foreground mt-1">Atendimento direto ao público nas agências dos Correios em todo o Brasil.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Escolaridade</p>
                  <p className="font-bold text-foreground">Nível Médio</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Remuneração</p>
                  <p className="font-bold text-foreground">R$ 2.429,26</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Benefícios</p>
                  <p className="font-bold text-foreground">VA + VT + Plano</p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Taxa de Inscrição</p>
                  <p className="font-bold text-foreground">R$ 39,80</p>
                </div>
              </div>
            </div>
          </CorreiosCard>

          {/* Tabs */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("cargos")}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-colors ${activeTab === "cargos" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                Cargos e Localidades
              </button>
              <button
                onClick={() => setActiveTab("editais")}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-colors ${activeTab === "editais" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                Editais e Arquivos
              </button>
            </div>
            <div className="p-4">
              {activeTab === "cargos" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border text-sm">
                    <span className="font-medium">Atendente Comercial</span>
                    <span className="text-primary font-bold">15.153 vagas</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border text-sm">
                    <span className="font-medium">Carteiro</span>
                    <span className="text-muted-foreground">Edital separado</span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-sm">
                    <span className="font-medium">Operador de Triagem</span>
                    <span className="text-muted-foreground">Edital separado</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    * As vagas são distribuídas por todas as regiões do Brasil. Consulte seu CEP abaixo para ver as vagas na sua região.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2 border-b border-border text-sm">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Edital Nº 001/2026 — Atendente Comercial</p>
                      <p className="text-xs text-muted-foreground">Publicado em {dates.inscStart}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-border text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Conteúdo Programático</p>
                      <p className="text-xs text-muted-foreground">Disciplinas e temas da prova</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3 py-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Manual do Candidato</p>
                      <p className="text-xs text-muted-foreground">Orientações para inscrição e prova</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cronograma */}
          <CorreiosCard>
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Cronograma do Concurso
            </h3>
            <div className="space-y-3">
              {[
                { label: "Inscrições", date: `${dates.inscStart} a ${dates.inscEnd}`, status: "active" },
                { label: "Aplicação das Provas", date: dates.prova, status: "pending" },
                { label: "Divulgação do Gabarito", date: dates.gabarito, status: "pending" },
                { label: "Resultado Final", date: dates.resultado, status: "pending" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  {item.status === "active" ? (
                    <div className="w-6 h-6 rounded-full bg-[hsl(47,100%,50%)] flex items-center justify-center">
                      <Clock className="w-3 h-3 text-[hsl(209,100%,20%)]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground font-bold">{i + 1}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${item.status === "active" ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</p>
                  </div>
                  <span className={`text-xs font-mono ${item.status === "active" ? "text-primary font-bold" : "text-muted-foreground"}`}>{item.date}</span>
                </div>
              ))}
            </div>
          </CorreiosCard>

          {/* CEP Search */}
          <CorreiosCard>
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <MapPin className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-bold text-lg text-foreground">Consultar Local de Prova</h3>
                <p className="text-sm text-muted-foreground">
                  Digite seu CEP para encontrar a agência mais próxima e ver as vagas na sua região
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Seu CEP</label>
                <CEPInput value={cep} onChange={setCep} disabled={loading} error={!!error} />
                {error && (
                  <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 p-2.5 rounded-lg">
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
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Consultar vagas na minha região
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 pt-2">
                <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Consulta segura — dados protegidos</span>
              </div>
            </div>
          </CorreiosCard>

        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default Index;
