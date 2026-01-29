import { ReactNode } from "react";

interface WillBankCardProps {
  children: ReactNode;
  className?: string;
  yellowBorder?: boolean;
}

const WillBankCard = ({ children, className = "", yellowBorder = true }: WillBankCardProps) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {yellowBorder && (
        <div className="h-1.5 bg-primary" />
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default WillBankCard;
