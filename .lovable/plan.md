

## Sistema de Consulta de CPF

### Visão Geral
Um sistema interno para validar e consultar dados de CPF, com design inspirado no modelo enviado - limpo, moderno, com destaque em amarelo.

---

### Funcionalidades

#### 1. Página Principal de Consulta
- **Header** com logo e navegação
- **Card central** com borda superior amarela
- **Campo de CPF** com máscara automática (000.000.000-00)
- **Botão amarelo** "Consultar CPF"
- **Mensagem de segurança** no rodapé do card

#### 2. Validação de CPF (Local)
- Verificação matemática dos dígitos verificadores
- Formatação automática enquanto digita
- Mensagem de erro para CPF inválido
- Bloqueia consulta se formato estiver incorreto

#### 3. Consulta de Dados (API Brasil API)
Após validação, busca os seguintes dados:
- **Nome completo**
- **Data de nascimento**
- **Situação cadastral** (Regular, Pendente, etc.)

#### 4. Exibição de Resultados
- Card expandido mostrando os dados encontrados
- Ícones indicando cada informação
- Status visual da situação cadastral (verde = regular, vermelho = irregular)
- Opção de fazer nova consulta

---

### Design Visual
Baseado no modelo enviado:
- **Cores**: Amarelo (#F5C518) como destaque, fundo cinza claro, card branco
- **Tipografia**: Limpa e moderna
- **Layout**: Card centralizado com bordas arredondadas
- **Responsivo**: Funciona bem em mobile e desktop

---

### Experiência do Usuário
1. Usuário acessa a página
2. Digita o CPF (formatação automática)
3. Clica em "Consultar CPF"
4. Sistema valida o formato
5. Se válido, busca dados na API
6. Exibe resultado ou mensagem de erro

---

### Observações Técnicas
- **API utilizada**: Brasil API (gratuita, open-source)
- **Limitações**: A API pode ter instabilidade ou dados desatualizados
- **Fallback**: Se a API falhar, exibe apenas a validação local com mensagem informativa

