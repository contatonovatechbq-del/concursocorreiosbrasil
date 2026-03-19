import { Menu } from "lucide-react";
import bbLogoTop from "@/assets/bb-logo-top.png";

interface CorreiosHeaderProps {
  breadcrumb?: string;
}

const CorreiosHeader = ({ breadcrumb = "Concursos > Agente Comercial > Inscrição" }: CorreiosHeaderProps) => {
  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground/90 text-[11px] py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-1">Acessibilidade ▾</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded-sm overflow-hidden leading-none text-[8px]">🇧🇷</span>
            Português ▾
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-accent border-b border-border px-4 py-2 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-center relative">
          {/* Hamburger - left */}
          <button className="absolute left-0 p-2 text-primary hover:bg-accent/80 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <img src={bbLogoTop} alt="Banco do Brasil" className="h-9 sm:h-10 object-contain" loading="eager" />
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
