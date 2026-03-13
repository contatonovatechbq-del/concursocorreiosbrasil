import { ReactNode } from "react";

interface CorreiosCardProps {
  children: ReactNode;
  className?: string;
}

const CorreiosCard = ({ children, className = "" }: CorreiosCardProps) => {
  return (
    <div className={`bg-card rounded-lg shadow-correios overflow-hidden border border-border animate-fade-in ${className}`}>
      <div className="h-1 gradient-correios" />
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default CorreiosCard;
