import { ReactNode } from "react";

interface WillBankCardProps {
  children: ReactNode;
  className?: string;
  yellowBorder?: boolean;
}

const WillBankCard = ({ children, className = "", yellowBorder = true }: WillBankCardProps) => {
  return (
    <div className={`bg-card rounded-2xl shadow-lg shadow-foreground/5 overflow-hidden border border-border/40 animate-fade-in ${className}`}>
      {yellowBorder && (
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary to-amber-400" />
      )}
      <div className="p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
};

export default WillBankCard;
