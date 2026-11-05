import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SelecionarCargo from "./pages/SelecionarCargo";
import Resultado from "./pages/Resultado";
import Inscricao from "./pages/Inscricao";
import ConfirmaDados from "./pages/ConfirmaDados";
import DetalhesInscricao from "./pages/DetalhesInscricao";
import Pagamento from "./pages/Pagamento";
import Upsell from "./pages/Upsell";
import UpsellInfo from "./pages/UpsellInfo";
import NotFound from "./pages/NotFound";
import UtmCapture from "@/components/UtmCapture";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UtmCapture />
        <Routes>
          <Route path="/" element={<SelecionarCargo />} />
          <Route path="/atendente-comercial" element={<Index cargoId="atendente-comercial" />} />
          <Route path="/carteiro" element={<Index cargoId="carteiro" />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/inscricao" element={<Inscricao />} />
          <Route path="/confirma-dados" element={<ConfirmaDados />} />
          <Route path="/detalhes-inscricao" element={<DetalhesInscricao />} />
          <Route path="/pagamento" element={<Pagamento />} />
          <Route path="/upsell-info/:step" element={<UpsellInfo />} />
          <Route path="/upsell/:step" element={<Upsell />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
