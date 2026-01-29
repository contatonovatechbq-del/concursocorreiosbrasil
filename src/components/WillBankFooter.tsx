import { Instagram, Facebook, Twitter, Linkedin, Youtube, Phone, Mail, MessageCircle, Clock, Shield, Lock, CheckCircle } from "lucide-react";
import willbankLogo from "@/assets/willbank-logo.png";

const WillBankFooter = () => {
  return (
    <footer className="bg-foreground text-background/90 mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Logo and Description */}
        <div className="text-center space-y-3 mb-6 sm:mb-8">
          <img src={willbankLogo} alt="Will Bank" className="h-9 sm:h-12 mx-auto brightness-0 invert" />
          <p className="text-xs sm:text-sm text-background/70 max-w-md mx-auto leading-relaxed">
            O banco digital que te ajuda a realizar seus sonhos com soluções financeiras inteligentes.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          {[
            { icon: Instagram, label: "Instagram" },
            { icon: Facebook, label: "Facebook" },
            { icon: Twitter, label: "Twitter" },
            { icon: Linkedin, label: "LinkedIn" },
            { icon: Youtube, label: "YouTube" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              aria-label={label}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-background/30 flex items-center justify-center hover:bg-background/10 hover:border-background/50 transition-all duration-200"
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ))}
        </div>

        {/* Help Section */}
        <div className="text-center mb-8 sm:mb-10">
          <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-5">Ajuda</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>0800 707 1515</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>contato@willbank.com.br</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>Chat no app</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span>Atendimento 24h</span>
            </div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-background/10 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span>Dados Protegidos</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-background/10 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium">
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span>Transações Seguras</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-background/10 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium">
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span>Regulamentado pelo BC</span>
          </div>
        </div>

        {/* Legal Text */}
        <div className="border-t border-background/20 pt-6 sm:pt-8 text-center space-y-2 sm:space-y-3">
          <p className="text-[10px] sm:text-xs text-background/60 max-w-lg mx-auto">
            Will Bank - Instituição Financeira autorizada pelo Banco Central do Brasil.
          </p>
          <p className="text-[10px] sm:text-xs text-background/60">
            CNPJ: 23.862.762/0001-00 | Av. Paulista, 1374 - São Paulo, SP - 34711571
          </p>
          <p className="text-[10px] sm:text-xs text-background/50 pt-1 sm:pt-2">
            © 2025 Will Bank. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default WillBankFooter;