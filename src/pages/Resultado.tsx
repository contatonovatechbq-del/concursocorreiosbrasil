import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";
import { saveSession, getSession, CepData, useFunnelGuard } from "@/hooks/useSessionPersistence";
import { supabase } from "@/integrations/supabase/client";
import { getCargo } from "@/lib/cargo";

const getProvaDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 10);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const SCHOOL_PREFIXES = ["Escola Municipal", "Escola Estadual", "Centro Educacional", "Colégio Estadual"];
const SCHOOL_SUFFIXES = ["São José", "Dom Pedro II", "Tiradentes", "Castro Alves", "Santos Dumont", "Rui Barbosa"];

const generateFallbackAgency = (cepData: CepData) => ({
  name: `${SCHOOL_PREFIXES[Math.floor(Math.random() * SCHOOL_PREFIXES.length)]} ${SCHOOL_SUFFIXES[Math.floor(Math.random() * SCHOOL_SUFFIXES.length)]}`,
  endereco: '',
  cidade: `${cepData.localidade}/${cepData.uf}`,
});


interface AgencyInfo {
  name: string;
  endereco: string;
  cidade?: string;
}

const Resultado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useFunnelGuard("/resultado");
  const cepData: CepData | undefined = location.state?.cepData || getSession()?.cepData;
  const cepDataRef = useRef(cepData);
  const hasFetched = useRef(false);
  const [agency, setAgency] = useState<AgencyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [vagasRegiao] = useState(() => Math.floor(Math.random() * 6) + 2);
  const [provaDate] = useState(getProvaDate);

  useEffect(() => {
    const cd = cepDataRef.current;
    if (!cd) { navigate("/"); return; }
    if (hasFetched.current) return;
    hasFetched.current = true;

    const existingSession = getSession();
    const preservedCpf = existingSession?.cpfData || { cpf: '', nome: '', dataNascimento: '', nomeMae: '', sexo: '' };
    saveSession({ cpfData: preservedCpf, currentStep: "/resultado", cepData: cd });
    trackFunnelEvent('resultado-cep');
    window.scrollTo(0, 0);

    const fetchAgency = async () => {
      try {
        const fetchPromise = supabase.functions.invoke('find-agency', {
          body: { cep: cd.cep, localidade: cd.localidade, uf: cd.uf },
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 25000)
        );
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

        let agencyResult: AgencyInfo;
        if (!error && data?.found && data.agency?.name) {
          agencyResult = {
            name: data.agency.name,
            endereco: data.agency.endereco || `${cd.localidade}/${cd.uf}`,
            cidade: data.agency.cidade || `${cd.localidade}/${cd.uf}`,
          };
        } else {
          agencyResult = generateFallbackAgency(cd);
        }

        setAgency(agencyResult);
        const s1 = getSession();
        saveSession({ cpfData: s1?.cpfData || { cpf: '', nome: '', dataNascimento: '', nomeMae: '', sexo: '' }, currentStep: "/resultado", cepData: cd, agencyData: agencyResult });
      } catch {
        const fallback = generateFallbackAgency(cd);
        setAgency(fallback);
        const s2 = getSession();
        saveSession({ cpfData: s2?.cpfData || { cpf: '', nome: '', dataNascimento: '', nomeMae: '', sexo: '' }, currentStep: "/resultado", cepData: cd, agencyData: fallback });
      } finally {
        setLoading(false);
      }
    };

    fetchAgency();
  }, [cepData?.cep]);

  if (!cepData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Atendente Comercial > Local de Prova" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          <h1 className="titulo-institucional text-lg">RESULTADO DA CONSULTA — LOCAL DE PROVA</h1>

          {/* Success */}
          <div className="bg-success/10 border border-success/30 rounded p-3 text-sm text-foreground">
            <span className="font-bold">Local de prova encontrado</span> para o CEP {cepData.cep}.
          </div>

          {/* Agency table */}
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Buscando escola mais próxima...</span>
            </div>
          ) : agency && (
            <table className="tabela-zebra">
              <thead><tr><th colSpan={2}>Informações do Local de Prova</th></tr></thead>
              <tbody>
                <tr><td className="font-semibold w-1/3">Escola</td><td>{agency.name}</td></tr>
                {agency.endereco && <tr><td className="font-semibold">Endereço</td><td>{agency.endereco}</td></tr>}
                <tr><td className="font-semibold">Cidade</td><td>{agency.cidade || agency.endereco}</td></tr>
                <tr><td className="font-semibold">Data da Prova</td><td>{provaDate}</td></tr>
                <tr><td className="font-semibold">Vagas na Região</td><td className="font-bold text-accent">{vagasRegiao}</td></tr>
                <tr><td className="font-semibold">Inscrições na Região</td><td className="font-bold text-destructive">1</td></tr>
              </tbody>
            </table>
          )}

          {!loading && (
            <>
              {/* Cargo */}
              <table className="tabela-zebra">
                <thead><tr><th colSpan={2}>Resumo do Cargo</th></tr></thead>
                <tbody>
                  <tr><td className="font-semibold w-1/3">Cargo</td><td>{getCargo().nome}</td></tr>
                  <tr><td className="font-semibold">Nível</td><td>Médio Completo</td></tr>
                  <tr><td className="font-semibold">Remuneração</td><td>{getCargo().remuneracao}</td></tr>
                  <tr><td className="font-semibold">Carga Horária</td><td>{getCargo().cargaHoraria}</td></tr>
                  <tr><td className="font-semibold">Vagas (Nacional)</td><td>{getCargo().vagas}</td></tr>
                  <tr><td className="font-semibold">Banca</td><td>IBFC</td></tr>
                </tbody>
              </table>

              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Observações:</p>
                <p>• A prova será aplicada na escola designada acima, conforme disponibilidade de salas.</p>
                <p>• Duração: 4 horas. Portões abrem às 12h, fecham às 13h.</p>
                <p>• Levar documento oficial com foto e caneta esferográfica de tinta preta em material transparente.</p>
                <p>• Não será permitida a entrada de candidatos após o fechamento dos portões.</p>
                <p>• Conforme Edital Nº 001/2026 — Correios/IBFC.</p>
              </div>

              <Button
                onClick={() => navigate(buildUrlWithUtm("/inscricao"), { state: { cepData } })}
                className="w-full h-12 text-sm font-bold"
              >
                REALIZAR INSCRIÇÃO
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                Inscrições abertas até {new Date(Date.now() + 15 * 86400000).toLocaleDateString('pt-BR')}. Vagas limitadas.
              </p>
            </>
          )}
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default Resultado;
