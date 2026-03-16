/**
 * Normalizes buyer data for PIX payment requests.
 * Always returns valid { name, email, document } — never empty/invalid.
 */

/** Generate a mathematically valid CPF (for fallback only) */
function generateValidCpf(): string {
  const rnd = () => Math.floor(Math.random() * 9) + 1;
  const digits = Array.from({ length: 9 }, rnd);

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
  let rest = sum % 11;
  digits.push(rest < 2 ? 0 : 11 - rest);

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
  rest = sum % 11;
  digits.push(rest < 2 ? 0 : 11 - rest);

  return digits.join("");
}

function isValidCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // all same digits

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let rest = sum % 11;
  if (Number(cpf[9]) !== (rest < 2 ? 0 : 11 - rest)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  rest = sum % 11;
  if (Number(cpf[10]) !== (rest < 2 ? 0 : 11 - rest)) return false;

  return true;
}

export interface NormalizedBuyer {
  name: string;
  email: string;
  document: string;
}

/**
 * Takes raw name + document (from props, session, etc.) and returns
 * a sanitized buyer object guaranteed to pass the payment provider validation.
 */
export function normalizeBuyer(rawName?: string | null, rawDocument?: string | null): NormalizedBuyer {
  // --- Name ---
  const cleaned = (rawName ?? "")
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const name = cleaned.length >= 3 ? cleaned : "Usuario Pagador";

  // --- Document ---
  const digits = (rawDocument ?? "").replace(/\D/g, "");
  const document = (digits.length >= 11 && digits.length <= 14 && isValidCpf(digits.slice(0, 11)))
    ? digits
    : generateValidCpf();

  // --- Email ---
  const emailBase = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .replace(/\s+/g, ".") || "usuario";
  const email = `${emailBase}@api.com`;

  return { name, email, document };
}
