import { Menu, Search, Grid3X3 } from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";

interface WillBankHeaderProps {
  userName?: string;
  breadcrumb?: string;
}

const WillBankHeader = ({ userName, breadcrumb = "Benefício > Indenização > Análise" }: WillBankHeaderProps) => {
  return (
    <>
      {/* Top Header */}
      <header className="bg-card px-4 py-3.5 border-b border-border/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img 
            src={willbankLogo} 
            alt="Will Bank" 
            className="h-9 object-contain drop-shadow-sm" 
          />
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200">
              <span className="text-lg">⋮</span>
            </button>
            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200">
              <span className="text-lg">💎</span>
            </button>
            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200">
              <Grid3X3 className="w-5 h-5" />
            </button>
            {userName ? (
              <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-shadow duration-200">
                <span>👤</span>
                <span>{userName}</span>
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-md">
                <span className="text-primary-foreground text-sm">👤</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-card/80 backdrop-blur-sm px-4 py-2.5 border-b border-border/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Menu className="w-4 h-4" />
            <span className="font-medium">{breadcrumb}</span>
          </div>
          <Search className="w-4 h-4 text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer" />
        </div>
      </div>
    </>
  );
};

export default WillBankHeader;
