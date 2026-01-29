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
  situacao: string;
}

/**
 * Consulta dados de um CPF na Brasil API
 * @param cpf - CPF apenas com números
 * @returns Dados do CPF ou erro
 */
export async function consultarCPF(cpf: string): Promise<CPFData> {
  const numbers = unformatCPF(cpf);
  
  const response = await fetch(`https://brasilapi.com.br/api/cpf/v1/${numbers}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('CPF não encontrado na base de dados');
    }
    throw new Error('Erro ao consultar CPF. Tente novamente mais tarde.');
  }
  
  const data = await response.json();
  
  return {
    cpf: formatCPF(numbers),
    nome: data.nome || 'Não disponível',
    dataNascimento: data.data_nascimento || 'Não disponível',
    situacao: data.situacao_cadastral || 'Regular',
  };
}
