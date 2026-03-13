import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Calendar, CheckCircle, Building2, ArrowRight } from "lucide-react";
import CorreiosHeader from "@/components/CorreiosHeader";
import CorreiosFooter from "@/components/CorreiosFooter";
import CorreiosCard from "@/components/CorreiosCard";
import { buildUrlWithUtm } from "@/hooks/useUtmTracking";
import { trackFunnelEvent } from "@/hooks/useFunnelTracking";
import { saveSession } from "@/hooks/useSessionPersistence";

interface CepData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

const getProvaDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 45);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const Resultado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cepData: CepData | undefined = location.state?.cepData;

  useEffect(() => {
    if (!cepData) {
      navigate("/");
      return;
    }
    trackFunnelEvent('resultado-cep');
    window.scrollTo(0, 0);
  }, [cepData, navigate]);

  if (!cepData) return null;

  const vagasRegiao = 64;
  const provaDate = getProvaDate();
  const agenciaNome = `AC ${cepData.localidade}`;
  const agenciaEndereco = cepData.logradouro
    ? `${cepData.logradouro}, ${cepData.bairro} — ${cepData.localidade}/${cepData.uf}`
    : `Centro — ${cepData.localidade}/${cepData.uf}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorreiosHeader breadcrumb="Concursos > Agente de Correios > Local de Prova" />

      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-lg mx-auto space-y-5">

          {/* Success Banner */}
          <div className="bg-[hsl(142,72%,40%)]/10 border border-[hsl(142,72%,40%)]/30 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground text-sm">Local de prova encontrado!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Identificamos a agência mais próxima do seu CEP ({cepData.cep})
              </p>
            </div>
          </div>

          {/* Agency Card */}
          <CorreiosCard>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg gradient-correios flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">{agenciaNome}</h2>
                  <p className="text-sm text-muted-foreground">{agenciaEndereco}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-xl font-black text-primary">{vagasRegiao}</p>
                  <p className="text-[10px] text-muted-foreground">vagas nesta região</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-black text-primary">{provaDate}</p>
                  <p className="text-[10px] text-muted-foreground">data da prova</p>
                </div>
              </div>

              <div className="bg-[hsl(47,100%,50%)]/10 border border-[hsl(47,100%,50%)]/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-[hsl(209,100%,26%)]" />
                  <span className="text-xs font-bold text-foreground">Informações do Local</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6">
                  <li>• Prova aplicada na agência ou escola mais próxima</li>
                  <li>• Duração: 4 horas</li>
                  <li>• Levar documento com foto e caneta preta</li>
                  <li>• Portões abrem às 12h, fecham às 13h</li>
                </ul>
              </div>
            </div>
          </CorreiosCard>

          {/* Cargo Resume */}
          <CorreiosCard>
            <h3 className="font-bold text-foreground mb-3 text-sm">Resumo do Cargo</h3>
            <div className="divide-y divide-border text-sm">
              {[
                { l: "Cargo", v: "Atendente Comercial" },
                { l: "Nível", v: "Médio Completo" },
                { l: "Salário", v: "R$ 2.429,26 + Benefícios" },
                { l: "Carga Horária", v: "40h semanais" },
                { l: "Vagas (Nacional)", v: "15.153" },
                { l: "Vagas (Sua Região)", v: String(vagasRegiao) },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2">
                  <span className="text-muted-foreground">{item.l}</span>
                  <span className="font-bold text-foreground">{item.v}</span>
                </div>
              ))}
            </div>
          </CorreiosCard>

          {/* CTA */}
          <Button
            onClick={() => navigate(buildUrlWithUtm("/inscricao"), { state: { cepData } })}
            className="w-full h-14 text-base font-black gradient-correios-accent text-[hsl(209,100%,20%)] rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            REALIZAR INSCRIÇÃO
            <ArrowRight className="w-5 h-5 ml-2" />
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
