import { ReactNode } from "react";

interface CorreiosCardProps {
  children: ReactNode;
  className?: string;
}

const CorreiosCard = ({ children, className = "" }: CorreiosCardProps) => {
  return (
    <div className={`bg-card rounded border border-border overflow-hidden ${className}`}>
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
};

export default CorreiosCard;
