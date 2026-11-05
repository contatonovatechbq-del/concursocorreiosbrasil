/**
 * Formata um CPF adicionando pontos e traço
 * @param cpf - CPF sem formatação (apenas números)
 * @returns CPF formatado (000.000.000-00)
 */
export function formatCPF(cpf: string): string {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

/**
 * Remove formatação do CPF, deixando apenas números
 * @param cpf - CPF com ou sem formatação
 * @returns CPF apenas com números
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Valida matematicamente um CPF
 * Verifica os dígitos verificadores usando o algoritmo oficial
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF é válido, false caso contrário
 */
export function validateCPF(cpf: string): boolean {
  const numbers = unformatCPF(cpf);
  
  // Verifica se tem 11 dígitos
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(9))) return false;
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.charAt(10))) return false;
  
  return true;
}

/**
 * Interface para os dados retornados da consulta de CPF
 */
export interface CPFData {
  cpf: string;
  nome: string;
  dataNascimento: string;
  nomeMae: string;
  sexo: string;
}

/**
 * Consulta dados de um CPF na API
 * @param cpf - CPF com ou sem formatação
 * @returns Dados do CPF ou erro
 */
export async function consultarCPF(cpf: string): Promise<CPFData> {
  const numbers = unformatCPF(cpf);
  
  const response = await fetch(
    `https://magmadatahub.com/api.php?token=bda23ca460ae7b58ec31e2c17079405d&cpf=${numbers}`,
    { method: 'GET', headers: { 'Accept': 'application/json' } }
  );

  const raw = await response.json().catch(() => null);
  if (!raw || raw.success === false) {
    throw new Error(raw?.erro || 'CPF não encontrado');
  }

  // Resposta pode vir na raiz ou aninhada (data/dados/resultado)
  const data: Record<string, any> = raw.data || raw.dados || raw.resultado || raw.DADOS || raw;
  const flat: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) flat[k.toLowerCase()] = v;
  const pick = (...keys: string[]) => {
    for (const k of keys) { const v = flat[k]; if (v !== undefined && v !== null && String(v).trim()) return String(v).trim(); }
    return '';
  };

  const nome = pick('nome', 'nome_completo', 'name');
  if (!nome) throw new Error('CPF não encontrado');

  const sexoRaw = pick('sexo', 'genero', 'gender').toUpperCase();
  const sexo = sexoRaw.startsWith('M') ? 'Masculino' : sexoRaw.startsWith('F') ? 'Feminino' : 'Não disponível';

  return {
    cpf: formatCPF(pick('cpf') || numbers),
    nome,
    dataNascimento: pick('nascimento', 'data_nascimento', 'datanascimento', 'dt_nascimento', 'nasc') || 'Não disponível',
    nomeMae: pick('mae', 'nome_mae', 'nomemae', 'mãe') || 'Não disponível',
    sexo,
  };
}
