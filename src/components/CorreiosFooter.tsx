const CorreiosFooter = () => {
  return (
    <footer className="mt-auto">
      {/* Main Footer */}
      <div className="bg-[hsl(220,10%,15%)] text-white px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-bold mb-3 text-[hsl(47,100%,50%)]">Institucional</h4>
              <ul className="space-y-1.5 text-white/70 text-xs">
                <li>Sobre os Correios</li>
                <li>Governança Corporativa</li>
                <li>Sustentabilidade</li>
                <li>Transparência</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-[hsl(47,100%,50%)]">Concursos</h4>
              <ul className="space-y-1.5 text-white/70 text-xs">
                <li>Editais Abertos</li>
                <li>Resultados</li>
                <li>Convocações</li>
                <li>Dúvidas Frequentes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-[hsl(47,100%,50%)]">Atendimento</h4>
              <ul className="space-y-1.5 text-white/70 text-xs">
                <li>Central: 0800 725 7282</li>
                <li>Ouvidoria</li>
                <li>Fale Conosco</li>
                <li>Agências</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-[hsl(47,100%,50%)]">Acesso Rápido</h4>
              <ul className="space-y-1.5 text-white/70 text-xs">
                <li>Rastreamento</li>
                <li>Busca CEP</li>
                <li>Preços e Prazos</li>
                <li>Meu Correios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Yellow */}
      <div className="bg-[hsl(47,100%,50%)] px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-[hsl(209,100%,20%)] rounded-sm p-1">
              <span className="text-[hsl(47,100%,50%)] font-black text-sm">✉</span>
            </div>
            <span className="text-[hsl(220,10%,15%)] font-bold text-sm">CORREIOS</span>
          </div>
          <p className="text-[10px] sm:text-xs text-[hsl(209,100%,20%)]/80 text-center">
            © 2026 Empresa Brasileira de Correios e Telégrafos. CNPJ: 34.028.316/0001-03 - Todos os direitos reservados.
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
