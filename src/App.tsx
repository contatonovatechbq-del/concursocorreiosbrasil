import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Verificacao from "./pages/Verificacao";
import Verificando from "./pages/Verificando";
import ConfirmaDados from "./pages/ConfirmaDados";
import Biometria from "./pages/Biometria";
import Video from "./pages/Video";
import Chat from "./pages/Chat";
import Saque from "./pages/Saque";
import Upsell from "./pages/Upsell";
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
          <Route path="/" element={<Login />} />
          <Route path="/verificacao" element={<Verificacao />} />
            <Route path="/verificando" element={<Verificando />} />
            <Route path="/confirma-dados" element={<ConfirmaDados />} />
            <Route path="/biometria" element={<Biometria />} />
            <Route path="/video" element={<Video />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/saque" element={<Saque />} />
            <Route path="/upsell/:step" element={<Upsell />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
