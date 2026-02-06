import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Facebook, Monitor, Search, Instagram, Globe } from "lucide-react";

interface Event {
  step: string;
  created_at: string;
  utm_source: string | null;
}

interface LiveEventsProps {
  events: Event[];
  stepLabels: Record<string, string>;
}

const STEP_COLORS: Record<string, string> = {
  'login': 'bg-green-500',
  'verificando': 'bg-green-500',
  'confirma-dados': 'bg-green-500',
  'biometria': 'bg-yellow-500',
  'video': 'bg-yellow-500',
  'chat': 'bg-yellow-500',
  'saque': 'bg-blue-500',
  'pix-generated': 'bg-blue-500',
  'payment-confirmed': 'bg-emerald-600',
};

const getSourceIcon = (source: string | null) => {
  if (!source) return <Monitor className="w-3 h-3" />;
  
  const lower = source.toLowerCase();
  if (lower.includes('facebook') || lower === 'fb') {
    return <Facebook className="w-3 h-3" />;
  }
  if (lower.includes('instagram') || lower === 'ig') {
    return <Instagram className="w-3 h-3" />;
  }
  if (lower.includes('google')) {
    return <Search className="w-3 h-3" />;
  }
  return <Globe className="w-3 h-3" />;
};

const getSourceColor = (source: string | null): string => {
  if (!source) return 'bg-muted text-muted-foreground';
  
  const lower = source.toLowerCase();
  if (lower.includes('facebook') || lower === 'fb') {
    return 'bg-[#1877F2] text-white';
  }
  if (lower.includes('instagram') || lower === 'ig') {
    return 'bg-[#E1306C] text-white';
  }
  if (lower.includes('google')) {
    return 'bg-[#34A853] text-white';
  }
  return 'bg-secondary text-secondary-foreground';
};

const getSourceLabel = (source: string | null): string => {
  if (!source) return 'direto';
  const lower = source.toLowerCase();
  if (lower.includes('facebook') || lower === 'fb') return 'fb';
  if (lower.includes('instagram') || lower === 'ig') return 'ig';
  if (lower.includes('google')) return 'google';
  if (lower === 'direct' || lower === 'direto') return 'direto';
  return source.slice(0, 6);
};

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 5) return 'agora';
  if (diffSec < 60) return `${diffSec}s`;
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}min`;
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h`;
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const LiveEvents = ({ events, stepLabels }: LiveEventsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-5 h-5 text-red-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
          Eventos em Tempo Real
        </CardTitle>
        <CardDescription>Últimos 50 eventos do funil</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[500px] overflow-auto">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className={`w-2 h-2 rounded-full ${STEP_COLORS[event.step] || 'bg-gray-400'}`} 
                  />
                  <span className="font-medium text-sm">
                    {stepLabels[event.step] || event.step}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs flex items-center gap-1 ${getSourceColor(event.utm_source)}`}
                  >
                    {getSourceIcon(event.utm_source)}
                    {getSourceLabel(event.utm_source)}
                  </Badge>
                  <span className="text-xs text-muted-foreground min-w-[50px] text-right">
                    {formatTimeAgo(event.created_at)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum evento registrado ainda</p>
              <p className="text-xs mt-1">Os eventos aparecerão aqui em tempo real</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveEvents;
