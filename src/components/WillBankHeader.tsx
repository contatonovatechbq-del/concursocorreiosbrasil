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
      <header className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img src={willbankLogo} alt="Will Bank" className="h-8 object-contain" />
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <span className="text-lg">⋮</span>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <span className="text-lg">💎</span>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Grid3X3 className="w-5 h-5" />
            </button>
            {userName ? (
              <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                <span>👤</span>
                <span>{userName}</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground">👤</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white px-4 py-2 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Menu className="w-4 h-4" />
            <span>{breadcrumb}</span>
          </div>
          <Search className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </>
  );
};

export default WillBankHeader;
