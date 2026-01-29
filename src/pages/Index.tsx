import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CPFInput } from "@/components/CPFInput";
import { validateCPF, unformatCPF, consultarCPF } from "@/lib/cpf";
import { Search, ShieldCheck, Loader2, AlertTriangle, Phone, Mail, MessageCircle, Clock, Lock, Shield, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import willbankLogo from "@/assets/willbank-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConsultar = async () => {
    setError("");
    
    const cpfNumbers = unformatCPF(cpf);
    
    if (cpfNumbers.length !== 11) {
      setError("Digite um CPF completo com 11 dígitos");
      return;
    }

    if (!validateCPF(cpf)) {
      setError("CPF inválido. Verifique os números digitados.");
      return;
    }

    setLoading(true);
    
    try {
      const data = await consultarCPF(cpf);
      // Navega para a página de loading com os dados
      navigate("/loading", { state: { cpfData: data } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao consultar CPF";
      toast({
        title: "Erro na consulta",
        description: message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <img src={willbankLogo} alt="Will Bank" className="h-10 object-contain" />
          </div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Benefício</span>
            <span>›</span>
            <span>Indenização</span>
            <span>›</span>
            <span className="text-foreground font-medium">Análise</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
          {/* Card Header with primary color */}
          <div className="bg-primary h-2" />
          
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Consulte seu benefício
              </h1>
              <p className="text-muted-foreground">
                Descubra se você tem direito a receber uma indenização
              </p>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Digite seu CPF para consultar se você possui benefícios disponíveis
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">CPF</label>
              <CPFInput 
                value={cpf} 
                onChange={setCpf} 
                disabled={loading}
                error={!!error}
              />
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={handleConsultar}
              disabled={loading || unformatCPF(cpf).length < 11}
              className="w-full h-12 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Consultar benefício
                </>
              )}
            </Button>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Seus dados estão protegidos e seguros
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Info Section */}
      <section className="bg-card border-t border-border px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">
            O banco digital que te ajuda a realizar seus sonhos com soluções financeiras inteligentes.
          </p>
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-muted px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-semibold text-foreground mb-6 text-center">Ajuda</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Phone className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">0800 707 1515</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">contato@willbank.com.br</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Chat no app</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Atendimento 24h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-card px-6 py-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="text-xs">Dados Protegidos</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Transações Seguras</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span className="text-xs">Regulamentado pelo BC</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground px-6 py-6">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="text-sm">
            Will Bank - Instituição Financeira autorizada pelo Banco Central do Brasil.
          </p>
          <p className="text-xs opacity-80">
            CNPJ: 34.711.571/0001-36 | Av. Paulista, 1374 - São Paulo, SP - 01310-100
          </p>
          <p className="text-xs opacity-80 pt-2">
            © 2025 Will Bank. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
