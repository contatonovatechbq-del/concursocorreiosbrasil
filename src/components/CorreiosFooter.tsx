import bbLogoTop from "@/assets/bb-logo-top.png";

const CorreiosFooter = () => {
  return (
    <footer className="mt-auto">
      {/* Main Footer */}
      <div className="bg-primary text-primary-foreground px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-bold mb-3 text-accent">Institucional</h4>
              <ul className="space-y-1.5 text-primary-foreground/70 text-xs">
                <li>Sobre o BB</li>
                <li>Governança Corporativa</li>
                <li>Sustentabilidade</li>
                <li>Relações com Investidores</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-accent">Concursos</h4>
              <ul className="space-y-1.5 text-primary-foreground/70 text-xs">
                <li>Editais Abertos</li>
                <li>Resultados</li>
                <li>Convocações</li>
                <li>Dúvidas Frequentes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-accent">Atendimento</h4>
              <ul className="space-y-1.5 text-primary-foreground/70 text-xs">
                <li>SAC: 0800 729 0001</li>
                <li>Ouvidoria BB</li>
                <li>Fale Conosco</li>
                <li>Agências</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-accent">Acesso Rápido</h4>
              <ul className="space-y-1.5 text-primary-foreground/70 text-xs">
                <li>App BB</li>
                <li>Internet Banking</li>
                <li>Cartões</li>
                <li>Consórcio</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Yellow */}
      <div className="bg-accent px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-1.5">
              <span className="text-accent font-black text-xs">BB</span>
            </div>
            <span className="text-primary font-bold text-sm">BANCO DO BRASIL</span>
          </div>
          <p className="text-[10px] sm:text-xs text-accent-foreground/80 text-center">
            © 2026 Banco do Brasil S.A. CNPJ: 00.000.000/0001-91 — Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2">
            <div className="bg-[hsl(142,60%,25%)] text-primary-foreground text-[9px] px-2 py-1 rounded font-bold">
              GOV.BR
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CorreiosFooter;
