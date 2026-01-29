import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CPFInput } from "@/components/CPFInput";
import { validateCPF, unformatCPF, consultarCPF } from "@/lib/cpf";
import { Search, ShieldCheck, Loader2, AlertTriangle, Phone, Mail, MessageCircle, Clock, Lock, Shield, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import willbankLogo from "@/assets/willbank-logo.png";

const Login = () => {
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
      // Navega para a página de consulta com os dados
      navigate("/consulta", { state: { cpfData: data } });
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
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img src={willbankLogo} alt="Will Bank" className="h-10 object-contain" />
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-[#1a1a1a] px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-gray-400">
          <span>☰</span>
          <span>Benefício</span>
          <span>&gt;</span>
          <span>Indenização</span>
          <span>&gt;</span>
          <span className="text-white font-medium">Análise</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden bg-white">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Consulte seu benefício
              </h1>
              <p className="text-gray-500">
                Descubra se você tem direito a receber uma indenização
              </p>
            </div>

            <p className="text-sm text-center text-gray-500">
              Digite seu CPF para <strong className="text-gray-900">consultar</strong> se você possui benefícios disponíveis
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">CPF</label>
              <CPFInput 
                value={cpf} 
                onChange={setCpf} 
                disabled={loading}
                error={!!error}
              />
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={handleConsultar}
              disabled={loading || unformatCPF(cpf).length < 11}
              className="w-full h-12 text-base font-semibold bg-[#FFE600] hover:bg-[#FFD700] text-black"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Consultando...
                </>
              ) : (
                "Consultar benefício"
              )}
            </Button>

            {/* Security Footer */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                Seus dados estão protegidos e seguros
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer Section */}
      <footer className="bg-[#1a1a1a] text-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div>
              <img src={willbankLogo} alt="Will Bank" className="h-8 object-contain mb-4 brightness-0 invert" />
              <p className="text-gray-400 text-sm">
                O banco digital que te ajuda a realizar seus sonhos com soluções financeiras inteligentes.
              </p>
              {/* Social Icons */}
              <div className="flex gap-3 mt-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-lg">📷</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-lg">📘</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-lg">🐦</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-lg">💼</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-lg">▶️</span>
                </div>
              </div>
            </div>

            {/* Right Column - Help */}
            <div>
              <h3 className="font-semibold text-white mb-4">Ajuda</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-4 h-4 text-[#FFE600]" />
                  <span className="text-sm">0800 707 1515</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-4 h-4 text-[#FFE600]" />
                  <span className="text-sm">contato@willbank.com.br</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <MessageCircle className="w-4 h-4 text-[#FFE600]" />
                  <span className="text-sm">Chat no app</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Clock className="w-4 h-4 text-[#FFE600]" />
                  <span className="text-sm">Atendimento 24h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex justify-center gap-8 flex-wrap py-4 border-t border-gray-800">
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="w-4 h-4" />
              <span className="text-xs">Dados Protegidos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Transações Seguras</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Building2 className="w-4 h-4" />
              <span className="text-xs">Regulamentado pelo BC</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Footer */}
      <div className="bg-[#FFE600] text-black px-6 py-4">
        <div className="max-w-4xl mx-auto text-center space-y-1">
          <p className="text-sm font-medium">
            Will Bank - Instituição Financeira autorizada pelo Banco Central do Brasil.
          </p>
          <p className="text-xs opacity-80">
            CNPJ: 34.711.571/0001-36 | Av. Paulista, 1374 - São Paulo, SP - 01310-100
          </p>
          <p className="text-xs opacity-80">
            © 2025 Will Bank. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
