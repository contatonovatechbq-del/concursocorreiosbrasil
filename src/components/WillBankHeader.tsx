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
      <header className="bg-card px-3 py-2.5 sm:px-4 sm:py-3.5 border-b border-border/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img 
            src={willbankLogo} 
            alt="Will Bank" 
            className="h-7 sm:h-9 object-contain drop-shadow-sm" 
          />
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200">
              <span className="text-base sm:text-lg">⋮</span>
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200">
              <span className="text-base sm:text-lg">💎</span>
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all duration-200">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            {userName ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-primary text-primary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-shadow duration-200">
                <span>👤</span>
                <span className="max-w-[80px] sm:max-w-none truncate">{userName}</span>
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center shadow-md">
                <span className="text-primary-foreground text-xs sm:text-sm">👤</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-card/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2.5 border-b border-border/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-medium truncate">{breadcrumb}</span>
          </div>
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer" />
        </div>
      </div>
    </>
  );
};

export default WillBankHeader;
