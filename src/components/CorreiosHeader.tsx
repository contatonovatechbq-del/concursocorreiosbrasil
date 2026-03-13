import { Menu, Search, ChevronDown } from "lucide-react";

interface CorreiosHeaderProps {
  breadcrumb?: string;
}

const CorreiosHeader = ({ breadcrumb = "Concursos > Agente de Correios > Inscrição" }: CorreiosHeaderProps) => {
  return (
    <>
      {/* Top Bar - Gov */}
      <div className="bg-[hsl(220,10%,15%)] text-white/80 text-[10px] sm:text-xs py-1 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span>Empresa Brasileira de Correios e Telégrafos</span>
          <span className="hidden sm:inline">Governo Federal</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="gradient-correios text-white px-4 py-3 sm:py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-[hsl(47,100%,50%)] rounded-sm p-1">
                <span className="text-[hsl(220,10%,15%)] font-black text-lg sm:text-xl leading-none">✉</span>
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg tracking-tight">CORREIOS</span>
                <span className="text-[10px] block text-white/70 -mt-0.5 hidden sm:block">correios.com.br</span>
              </div>
            </div>
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button className="flex items-center gap-1 hover:text-[hsl(47,100%,50%)] transition-colors">
              Enviar <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:text-[hsl(47,100%,50%)] transition-colors">
              Receber <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-1 hover:text-[hsl(47,100%,50%)] transition-colors">
              Comprar <ChevronDown className="w-3 h-3" />
            </button>
            <button className="text-[hsl(47,100%,50%)] font-bold">Concursos</button>
            <button className="flex items-center gap-1 hover:text-[hsl(47,100%,50%)] transition-colors">
              Atendimento <ChevronDown className="w-3 h-3" />
            </button>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-card border-b border-border px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-muted-foreground">{breadcrumb}</p>
        </div>
      </div>
    </>
  );
};

export default CorreiosHeader;
