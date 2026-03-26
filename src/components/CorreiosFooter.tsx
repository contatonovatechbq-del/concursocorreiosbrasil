import logoEct from "@/assets/logo-ect.svg";

const CorreiosFooter = () => {
  return (
    <footer className="mt-auto">
      {/* Main Footer */}
      <div className="bg-accent text-accent-foreground px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-bold mb-3 text-primary">Institucional</h4>
              <ul className="space-y-1.5 text-accent-foreground/70 text-xs">
                <li>Sobre os Correios</li>
                <li>Governança Corporativa</li>
                <li>Sustentabilidade</li>
                <li>Relações com Investidores</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-primary">Concursos</h4>
              <ul className="space-y-1.5 text-accent-foreground/70 text-xs">
                <li>Editais Abertos</li>
                <li>Resultados</li>
                <li>Convocações</li>
                <li>Dúvidas Frequentes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-primary">Atendimento</h4>
              <ul className="space-y-1.5 text-accent-foreground/70 text-xs">
                <li>SAC: 0800 725 7282</li>
                <li>Ouvidoria Correios</li>
                <li>Fale Conosco</li>
                <li>Agências</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-primary">Acesso Rápido</h4>
              <ul className="space-y-1.5 text-accent-foreground/70 text-xs">
                <li>Rastrear Encomendas</li>
                <li>Meus Correios</li>
                <li>Calculadora de Preços</li>
                <li>Agências</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Yellow */}
      <div className="bg-primary px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <img src={logoEct} alt="Correios" className="h-7 sm:h-8 object-contain" />
          </div>
          <p className="text-[10px] sm:text-xs text-primary-foreground/80 text-center">
            © 2026 Empresa Brasileira de Correios e Telégrafos — CNPJ: 34.028.316/0001-03 — Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2">
            <div className="bg-[hsl(142,60%,25%)] text-white text-[9px] px-2 py-1 rounded font-bold">
              GOV.BR
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CorreiosFooter;
