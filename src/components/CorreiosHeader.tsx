import { Menu } from "lucide-react";
import logoEct from "@/assets/logo-ect.svg";

interface CorreiosHeaderProps {
  breadcrumb?: string;
}

const CorreiosHeader = ({ breadcrumb = "Concursos > Atendente Comercial > Inscrição" }: CorreiosHeaderProps) => {
  return (
    <>
      {/* Top Bar */}
      <div className="bg-[hsl(200,60%,28%)] text-white/90 text-[11px] py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-1">Acessibilidade ▾</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded-sm overflow-hidden leading-none text-[8px]">🇧🇷</span>
            Português ▾
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-border px-4 py-2 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-center relative">
          {/* Hamburger - left */}
          <button className="absolute left-0 p-2 text-[hsl(200,60%,28%)] hover:bg-muted rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo centered */}
          <img src={logoEct} alt="Correios" className="h-7 sm:h-8" />
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
