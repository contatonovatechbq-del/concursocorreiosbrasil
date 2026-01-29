import { Input } from "@/components/ui/input";
import { formatCPF, unformatCPF } from "@/lib/cpf";
import { ChangeEvent } from "react";

interface CPFInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function CPFInput({ value, onChange, disabled, error }: CPFInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = unformatCPF(e.target.value);
    // Limita a 11 dígitos
    if (rawValue.length <= 11) {
      onChange(formatCPF(rawValue));
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder="000.000.000-00"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`text-center text-lg h-12 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
      maxLength={14}
    />
  );
}
