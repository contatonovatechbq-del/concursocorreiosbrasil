export type CargoId = "atendente-comercial" | "carteiro";

export interface Cargo {
  id: CargoId;
  nome: string;
  nomeCompleto: string;
  vagas: string;
  remuneracao: string;
  remuneracaoCurta: string;
  cargaHoraria: string;
  escolaridade: string;
  banca: string;
  regime: string;
  descricao: string;
}

export const CARGOS: Record<CargoId, Cargo> = {
  "atendente-comercial": {
    id: "atendente-comercial",
    nome: "Atendente Comercial",
    nomeCompleto: "Atendente Comercial — Nível Médio",
    vagas: "12.874",
    remuneracao: "R$ 4.724,23 + Benefícios (VA, VT, Plano de Saúde)",
    remuneracaoCurta: "R$ 4.724,23 + Benefícios",
    cargaHoraria: "30 horas semanais",
    escolaridade: "Nível Médio Completo",
    banca: "IBFC — Instituto Brasileiro de Formação e Capacitação",
    regime: "CLT — Empregado Público",
    descricao: "Atendimento ao público nas agências, venda de produtos e serviços postais e financeiros.",
  },
  carteiro: {
    id: "carteiro",
    nome: "Carteiro",
    nomeCompleto: "Agente de Correios — Carteiro — Nível Médio",
    vagas: "8.416",
    remuneracao: "R$ 7.437,80 + Benefícios (VA, VT, Plano de Saúde)",
    remuneracaoCurta: "R$ 7.437,80 + Benefícios",
    cargaHoraria: "44 horas semanais",
    escolaridade: "Nível Médio Completo",
    banca: "IBFC — Instituto Brasileiro de Formação e Capacitação",
    regime: "CLT — Empregado Público",
    descricao: "Coleta, triagem e entrega de correspondências e encomendas na área de atuação.",
  },
};

const KEY = "cargo_selecionado";

export const setCargo = (id: CargoId) => {
  try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
};

export const getCargo = (): Cargo => {
  try {
    const id = localStorage.getItem(KEY) as CargoId | null;
    if (id && CARGOS[id]) return CARGOS[id];
  } catch { /* ignore */ }
  return CARGOS["atendente-comercial"];
};
