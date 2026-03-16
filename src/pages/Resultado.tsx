import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";
import { saveSession, getSession, CepData } from "@/hooks/useSessionPersistence";
import { supabase } from "@/integrations/supabase/client";

const getProvaDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 45);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const generateFallbackAgency = (cepData: CepData) => {
  const commonStreets = [
    "Av. Brasil", "Rua Sete de Setembro", "Av. Presidente Vargas",
    "Rua XV de Novembro", "Av. Getúlio Vargas", "Rua Marechal Deodoro",
    "Av. Rio Branco", "Rua Santos Dumont"
  ].filter(s => !cepData.logradouro?.includes(s));
  const agencyStreet = commonStreets[Math.floor(Math.random() * commonStreets.length)];
  const agencyNum = Math.floor(Math.random() * 900) + 100;
  return {
    name: `AC ${cepData.localidade} — Centro`,
    endereco: `${agencyStreet}, ${agencyNum} — Centro, ${cepData.localidade}/${cepData.uf}`,
  };
};

interface AgencyInfo {
  name: string;
  endereco: string;
  distanceKm?: number;
}

const Resultado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cepData: CepData | undefined = location.state?.cepData || getSession()?.cepData;
  const [agency, setAgency] = useState<AgencyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cepData) { navigate("/"); return; }
    saveSession({ cpfData: { cpf: '', nome: '', dataNascimento: '', nomeMae: '', sexo: '' }, currentStep: "/resultado", cepData });
    trackFunnelEvent('resultado-cep');
    window.scrollTo(0, 0);

    // Fetch nearest real agency
    const fetchAgency = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('find-agency', {
          body: { cep: cepData.cep, localidade: cepData.localidade, uf: cepData.uf },
        });

        if (!error && data?.found && data.agency?.endereco) {
          setAgency({
            name: data.agency.name,
            endereco: data.agency.endereco,
            distanceKm: data.agency.distanceKm,
          });
        } else {
          setAgency(generateFallbackAgency(cepData));
        }
      } catch {
        setAgency(generateFallbackAgency(cepData));
      } finally {
        setLoading(false);
      }
    };

    fetchAgency();
  }, [cepData, navigate]);

  if (!cepData) return null;

  const vagasRegiao = Math.floor(Math.random() * 40) + 30;
  const provaDate = getProvaDate();

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
              <span className="text-sm">Buscando agência mais próxima...</span>
            </div>
          ) : agency && (
            <table className="tabela-zebra">
              <thead><tr><th colSpan={2}>Informações do Local de Prova</th></tr></thead>
              <tbody>
                <tr><td className="font-semibold w-1/3">Agência</td><td>{agency.name}</td></tr>
                <tr><td className="font-semibold">Endereço</td><td>{agency.endereco}</td></tr>
                {agency.distanceKm !== undefined && (
                  <tr><td className="font-semibold">Distância</td><td>{agency.distanceKm} km do CEP informado</td></tr>
                )}
                <tr><td className="font-semibold">Data da Prova</td><td>{provaDate}</td></tr>
                <tr><td className="font-semibold">Vagas na Região</td><td className="font-bold text-primary">{vagasRegiao}</td></tr>
              </tbody>
            </table>
          )}

          {/* Cargo */}
          <table className="tabela-zebra">
            <thead><tr><th colSpan={2}>Resumo do Cargo</th></tr></thead>
            <tbody>
              <tr><td className="font-semibold w-1/3">Cargo</td><td>Atendente Comercial</td></tr>
              <tr><td className="font-semibold">Nível</td><td>Médio Completo</td></tr>
              <tr><td className="font-semibold">Salário</td><td>R$ 2.429,26 + Benefícios</td></tr>
              <tr><td className="font-semibold">Carga Horária</td><td>40h semanais</td></tr>
              <tr><td className="font-semibold">Vagas (Nacional)</td><td>15.153</td></tr>
            </tbody>
          </table>

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Observações:</p>
            <p>• Prova aplicada na agência ou escola mais próxima do endereço informado.</p>
            <p>• Duração: 4 horas. Portões abrem às 12h, fecham às 13h.</p>
            <p>• Levar documento com foto e caneta esferográfica preta.</p>
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
        </div>
      </main>

      <CorreiosFooter />
    </div>
  );
};

export default Resultado;
