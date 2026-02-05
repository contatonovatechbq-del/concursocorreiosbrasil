
# Plano: Corrigir Bugs Criticos Mobile

## Problemas Identificados

### 1. Bug do Dialog - Clicar Fora Ainda Trava
**Causa Raiz:** O componente `DialogContent` tem um botao X (close button) que ainda permite fechar o dialog. Mesmo com `onInteractOutside` prevenido, o usuario pode:
- Clicar no X no canto superior direito
- O dialog fecha, mas o estado do chat nao avanca, travando o fluxo

**Solucao:** Esconder o botao X apenas nos dialogs do Chat, adicionando `hideCloseButton` ao componente ou removendo via CSS

### 2. Admin Login Nao Funciona
**Causa:** O usuario pode estar usando credenciais incorretas. A tabela `admin_users` existe com:
- Email: `admin@willbank.com`
- Senha (hash SHA-256): corresponde a `admin123`

**Solucao:** Adicionar logging na edge function para debug e melhorar mensagens de erro

### 3. PIX - Timeout 504
**Status:** Ja corrigido! O `check-pix-status` agora retorna 200 com status "pending" em vez de 504 quando ha timeout.

O `create-pix` esta funcionando - logs mostram respostas 201 com PIX gerado.

## Arquivos a Modificar

### `src/components/ui/dialog.tsx`
Adicionar prop `hideCloseButton` ao DialogContent para esconder o X quando necessario:
```tsx
const DialogContent = React.forwardRef<...>(
  ({ className, children, hideCloseButton = false, ...props }, ref) => (
    ...
    {!hideCloseButton && (
      <DialogPrimitive.Close className="absolute right-4...">
        <X className="h-4 w-4" />
      </DialogPrimitive.Close>
    )}
  )
)
```

### `src/pages/Chat.tsx`
Aplicar `hideCloseButton` nos dois dialogs:

**Dialog PIX Key (linha 1356):**
```tsx
<DialogContent 
  className="sm:max-w-md"
  onInteractOutside={(e) => e.preventDefault()}
  onEscapeKeyDown={(e) => e.preventDefault()}
  hideCloseButton
>
```

**Dialog Comprovante (linha 1389):**
```tsx
<DialogContent 
  className="sm:max-w-md"
  onInteractOutside={(e) => e.preventDefault()}
  onEscapeKeyDown={(e) => e.preventDefault()}
  hideCloseButton
>
```

### `supabase/functions/admin-login/index.ts`
Adicionar logging para facilitar debug:
```typescript
console.log('Login attempt for email:', email);
// ... apos hash
console.log('Password hash comparison result:', passwordHash === admin.password_hash);
```

## Otimizacoes Mobile Adicionais

### `src/pages/Chat.tsx`
- Garantir padding seguro para areas do celular (safe-area-inset)
- Melhorar responsividade de botoes

### `src/components/WillBankFooter.tsx`
- Reduzir tamanho de icones sociais no mobile
- Ajustar espacamento

## Credenciais Admin (Para Teste)
- **Email:** admin@willbank.com
- **Senha:** admin123

## Resultado Final
- Dialogs nao fecham ao clicar fora nem no X - usuario obrigado a confirmar dados
- Admin login funciona com credenciais corretas
- PIX gerando normalmente (ja estava funcionando)
- Interface otimizada para celular
