import { Input } from "@/components/ui/input";

interface CEPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function formatCEP(cep: string): string {
  const numbers = cep.replace(/\D/g, '');
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
}

export function unformatCEP(cep: string): string {
  return cep.replace(/\D/g, '');
}

export const CEPInput = ({ value, onChange, disabled, error }: CEPInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    onChange(formatCEP(raw));
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder="00000-000"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      maxLength={9}
      className={`h-12 text-center text-lg font-mono tracking-widest ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
    />
  );
};
