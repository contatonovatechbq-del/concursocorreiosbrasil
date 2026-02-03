import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Facebook, MessageCircle, Twitter, Share2, Search, User } from "lucide-react";

const Noticia = () => {
  const navigate = useNavigate();

  // Data dinâmica para parecer notícia recente
  const now = new Date();
  const formattedDate = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Data de "publicação" (algumas horas atrás)
  const publishDate = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const publishDateFormatted = publishDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const publishTime = publishDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleConsultar = () => {
    navigate("/verificacao");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top Bar - Globo */}
      <div className="bg-[#1a1a1a] text-white text-xs py-2">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold">globo.com</span>
            <span className="hidden sm:inline text-gray-400">|</span>
            <div className="hidden sm:flex items-center gap-3 text-gray-300">
              <span>g1</span>
              <span>ge</span>
              <span>gshow</span>
              <span>receitas</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4" />
            <button className="flex items-center gap-1 bg-[#0669de] px-3 py-1 rounded text-xs font-medium">
              <User className="w-3 h-3" />
              Entrar
            </button>
          </div>
        </div>
      </div>

      {/* G1 Header */}
      <header className="bg-[#cc0000] py-3">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white text-3xl font-black">g1</span>
            <span className="hidden sm:inline text-white/80 text-sm">ECONOMIA</span>
          </div>
          <div className="text-white/90 text-xs">
            {formattedDate} {formattedTime}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="bg-[#cc0000] text-white text-xs font-bold px-2 py-1 rounded">
            ESCÂNDALO
          </span>
        </div>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] leading-tight mb-3">
              STF condena Will Bank a pagar indenização a ex-clientes; veja se você tem direito
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-[#666] mb-4">
              Decisão judicial determina que banco digital ressarça clientes com valores entre R$ 3 mil e R$ 9 mil. Consulta pode ser feita online.
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#999] mb-4 pb-4 border-b border-gray-200">
              <span>Por <strong className="text-[#0669de]">Redação G1</strong></span>
              <span>—</span>
              <span>Brasília</span>
              <span className="hidden sm:inline">|</span>
              <span>{publishDateFormatted} às {publishTime}</span>
              <span className="text-[#666]">• Atualizado há 47 minutos</span>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2 mb-6">
              <button className="flex items-center gap-1 bg-[#3b5998] text-white text-xs px-3 py-1.5 rounded">
                <Facebook className="w-3 h-3" />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
              <button className="flex items-center gap-1 bg-[#25d366] text-white text-xs px-3 py-1.5 rounded">
                <MessageCircle className="w-3 h-3" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button className="flex items-center gap-1 bg-[#1da1f2] text-white text-xs px-3 py-1.5 rounded">
                <Twitter className="w-3 h-3" />
              </button>
              <button className="flex items-center gap-1 bg-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded">
                <Share2 className="w-3 h-3" />
              </button>
            </div>

            {/* Featured Image */}
            <img 
              src="/images/will-bank-hero.png" 
              alt="Cliente usando app Will Bank" 
              className="w-full aspect-video object-cover rounded-lg mb-4"
            />
            <p className="text-xs text-[#999] mb-6">
              Sede do STF em Brasília; decisão beneficia milhares de ex-clientes do Will Bank — Foto: Reprodução/STF
            </p>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none text-[#333] space-y-4">
              <p>
                O <strong>Supremo Tribunal Federal (STF)</strong> determinou nesta semana que o <strong>Will Bank</strong> deve pagar indenizações a todos os ex-clientes que tiveram conta no banco digital. A decisão, que tem efeito imediato, prevê valores que variam entre <strong>R$ 3 mil e R$ 9 mil</strong>, dependendo do tempo de relacionamento com a instituição.
              </p>

              <p>
                Segundo a decisão judicial, o banco digital terá que ressarcir os clientes por práticas consideradas abusivas durante o período de operação. A medida beneficia milhares de brasileiros que mantiveram conta ativa na plataforma.
              </p>

              {/* CTA Box 1 */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-primary p-4 sm:p-6 rounded-r-lg my-6">
                <p className="text-[#1a1a1a] font-semibold mb-3">
                  ⚠️ Atenção: O prazo para consultar e resgatar o benefício é limitado.
                </p>
                <Button 
                  onClick={handleConsultar}
                  className="w-full sm:w-auto h-12 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg"
                >
                  CONSULTAR MEU BENEFÍCIO
                </Button>
              </div>

              <h2 className="text-xl font-bold text-[#1a1a1a] mt-6">Quem tem direito?</h2>

              <p>
                De acordo com o tribunal, têm direito ao ressarcimento todos os cidadãos que:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Possuíram conta no Will Bank em qualquer período</li>
                <li>Realizaram transações ou movimentações pela plataforma</li>
                <li>Tiveram o CPF cadastrado no sistema do banco</li>
              </ul>

              <p>
                A consulta pode ser feita de forma <strong>100% online e gratuita</strong>, bastando informar o CPF para verificar se há valores disponíveis para saque.
              </p>

              <h2 className="text-xl font-bold text-[#1a1a1a] mt-6">Valores disponíveis</h2>

              <p>
                Os valores da indenização foram calculados com base no tempo de relacionamento do cliente com o banco:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Até 6 meses de conta:</strong> aproximadamente R$ 3.000</li>
                <li><strong>De 6 meses a 1 ano:</strong> aproximadamente R$ 5.000</li>
                <li><strong>Mais de 1 ano:</strong> até R$ 9.000</li>
              </ul>

              <blockquote className="border-l-4 border-[#cc0000] pl-4 italic text-[#666] my-6">
                "A decisão representa uma vitória importante para os consumidores brasileiros. Os valores serão liberados mediante simples consulta do CPF", afirmou o advogado responsável pelo caso.
              </blockquote>

              <h2 className="text-xl font-bold text-[#1a1a1a] mt-6">Como consultar?</h2>

              <p>
                O processo de consulta é simples e pode ser feito em poucos minutos:
              </p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>Clique no botão "Consultar Benefício" abaixo</li>
                <li>Informe seu CPF no campo indicado</li>
                <li>Aguarde a verificação automática</li>
                <li>Se aprovado, siga as instruções para resgate</li>
              </ol>

              {/* CTA Box 2 */}
              <div className="bg-[#1a1a1a] text-white p-4 sm:p-6 rounded-lg my-6 text-center">
                <p className="text-lg font-bold mb-2">
                  🔒 Consulta segura e gratuita
                </p>
                <p className="text-gray-300 text-sm mb-4">
                  Verifique agora se você tem direito ao benefício
                </p>
                <Button 
                  onClick={handleConsultar}
                  className="w-full sm:w-auto h-14 px-10 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg animate-pulse"
                >
                  CONSULTAR MEU CPF AGORA
                </Button>
                <p className="text-xs text-gray-400 mt-3">
                  Mais de 47.000 consultas realizadas hoje
                </p>
              </div>

              <p>
                A expectativa é que os pagamentos sejam liberados de forma gradual ao longo das próximas semanas. Especialistas recomendam que os interessados realizem a consulta o quanto antes para garantir seu lugar na fila de pagamentos.
              </p>

              <p className="text-[#666] text-sm italic">
                * Atualização: Devido à alta demanda, o sistema pode apresentar lentidão em horários de pico.
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-gray-200">
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Will Bank</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">STF</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Indenização</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Banco Digital</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Economia</span>
            </div>
          </div>
        </article>

        {/* Related News (fake) */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-bold text-[#1a1a1a] mb-4">Veja também</h3>
          <div className="space-y-3">
            <div className="flex gap-3 pb-3 border-b border-gray-100">
              <img 
                src="/images/banco-central.png" 
                alt="Banco Central do Brasil" 
                className="w-20 h-14 object-cover rounded flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-[#333] line-clamp-2">
                  Banco Central anuncia novas regras para bancos digitais
                </p>
                <span className="text-xs text-[#999]">há 2 horas</span>
              </div>
            </div>
            <div className="flex gap-3 pb-3 border-b border-gray-100">
              <img 
                src="/images/justica.png" 
                alt="Martelo de juiz" 
                className="w-20 h-14 object-cover rounded flex-shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-[#333] line-clamp-2">
                  Justiça determina ressarcimento a clientes de instituições financeiras
                </p>
                <span className="text-xs text-[#999]">há 4 horas</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-400">
          <p>© Copyright 2000-2024 Globo Comunicação e Participações S.A.</p>
        </div>
      </footer>
    </div>
  );
};

export default Noticia;
