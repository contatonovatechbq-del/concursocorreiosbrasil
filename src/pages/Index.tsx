import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CPFInput } from "@/components/CPFInput";
import { CPFResult } from "@/components/CPFResult";
import { validateCPF, unformatCPF, consultarCPF, CPFData } from "@/lib/cpf";
import { Search, ShieldCheck, RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CPFData | null>(null);

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
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao consultar CPF";
      toast({
        title: "Erro na consulta",
        description: message,
        variant: "destructive",
      });
      // Fallback: mostra validação local
      setResult({
        cpf: cpf,
        nome: "Não disponível (API indisponível)",
        dataNascimento: "Não disponível",
        situacao: "CPF válido matematicamente",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNovaConsulta = () => {
    setCpf("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-lg">Consulta CPF</span>
          </div>
          <span className="text-sm text-muted-foreground hidden sm:block">Sistema Interno</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">
              {result ? "Resultado da Consulta" : "Consultar CPF"}
            </CardTitle>
            <CardDescription>
              {result 
                ? "Dados encontrados para o CPF consultado"
                : "Digite o CPF para validar e consultar os dados"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!result ? (
              <>
                <div className="space-y-2">
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
                      Consultar CPF
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <CPFResult data={result} />
                
                <Button 
                  onClick={handleNovaConsulta}
                  variant="outline"
                  className="w-full h-12 text-base"
                >
                  <RefreshCw className="w-5 h-5" />
                  Nova Consulta
                </Button>
              </>
            )}

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-border">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Consulta segura • Dados protegidos
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border px-6 py-3">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs text-muted-foreground">
            Sistema interno de consulta • Dados via Brasil API
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
