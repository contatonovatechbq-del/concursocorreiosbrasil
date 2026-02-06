import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Globe, Instagram, Monitor, Search } from "lucide-react";

interface UtmSource {
  source: string;
  count: number;
}

interface TrafficSourcesProps {
  utmSources: UtmSource[];
  totalEvents: number;
}

const getSourceIcon = (source: string) => {
  const lower = source.toLowerCase();
  if (lower.includes('facebook') || lower === 'fb') {
    return <Facebook className="w-5 h-5" />;
  }
  if (lower.includes('instagram') || lower === 'ig') {
    return <Instagram className="w-5 h-5" />;
  }
  if (lower.includes('google')) {
    return <Search className="w-5 h-5" />;
  }
  if (lower === 'direct' || lower === 'direto') {
    return <Monitor className="w-5 h-5" />;
  }
  return <Globe className="w-5 h-5" />;
};

const getSourceColor = (source: string): string => {
  const lower = source.toLowerCase();
  if (lower.includes('facebook') || lower === 'fb') {
    return 'bg-[#1877F2] text-white';
  }
  if (lower.includes('instagram') || lower === 'ig') {
    return 'bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white';
  }
  if (lower.includes('google')) {
    return 'bg-[#34A853] text-white';
  }
  if (lower === 'direct' || lower === 'direto') {
    return 'bg-muted text-muted-foreground';
  }
  if (lower.includes('tiktok')) {
    return 'bg-black text-white';
  }
  return 'bg-secondary text-secondary-foreground';
};

const getSourceLabel = (source: string): string => {
  const lower = source.toLowerCase();
  if (lower.includes('facebook') || lower === 'fb') return 'Facebook';
  if (lower.includes('instagram') || lower === 'ig') return 'Instagram';
  if (lower.includes('google')) return 'Google';
  if (lower === 'direct' || lower === 'direto') return 'Direto';
  if (lower.includes('tiktok')) return 'TikTok';
  return source || 'Direto';
};

const TrafficSources = ({ utmSources, totalEvents }: TrafficSourcesProps) => {
  const topSources = utmSources.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Tráfego por Fonte
        </CardTitle>
        <CardDescription>Distribuição de visitas por origem</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {topSources.length > 0 ? (
            topSources.map((source, index) => {
              const percentage = totalEvents > 0 
                ? ((source.count / totalEvents) * 100).toFixed(1) 
                : '0';
              
              return (
                <div 
                  key={index}
                  className={`rounded-lg p-4 ${getSourceColor(source.source)} flex flex-col items-center justify-center text-center transition-all hover:scale-105`}
                >
                  {getSourceIcon(source.source)}
                  <span className="font-bold text-lg mt-1">{source.count}</span>
                  <span className="text-xs opacity-80">
                    {getSourceLabel(source.source)}
                  </span>
                  <span className="text-xs font-medium mt-1">
                    {percentage}%
                  </span>
                </div>
              );
            })
          ) : (
            <div className="col-span-5 text-center text-muted-foreground py-8">
              Nenhuma fonte de tráfego registrada ainda
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficSources;
