import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  LogOut, 
  RefreshCw,
  Loader2,
  Calendar,
  TableIcon,
  LayoutList,
  Clock
} from "lucide-react";
import FunnelChart from "@/components/admin/FunnelChart";
import FunnelTable from "@/components/admin/FunnelTable";
import UpsellMetrics from "@/components/admin/UpsellMetrics";
import StatsCards from "@/components/admin/StatsCards";
import TrafficSources from "@/components/admin/TrafficSources";
import LiveEvents from "@/components/admin/LiveEvents";
import SourceFilter from "@/components/admin/SourceFilter";

interface FunnelStep {
  step: string;
  count: number;
  dropoff?: number;
}

interface AnalyticsData {
  totalSessions: number;
  totalEvents: number;
  funnelSteps: FunnelStep[];
  recentEvents: Array<{
    step: string;
    created_at: string;
    utm_source: string | null;
    session_id: string;
  }>;
  utmSources: Array<{
    source: string;
    count: number;
  }>;
  availableSources: string[];
}

type Period = '24h' | '7d' | '30d';
type ViewMode = 'chart' | 'table';

const STEP_LABELS: Record<string, string> = {
  'login': 'Login (CPF)',
  'verificando': 'Verificando',
  'confirma-dados': 'Confirma Dados',
  'biometria': 'Biometria',
  'video': 'Vídeo',
  'chat': 'Chat',
  'saque': 'Saque',
  'pix-generated': 'PIX Gerado',
  'payment-confirmed': 'Pagamento ✅',
  'upsell-1': 'Upsell 1',
  'upsell-2': 'Upsell 2',
  'upsell-3': 'Upsell 3',
  'upsell-4': 'Upsell 4',
  'upsell-5': 'Upsell 5',
  'upsell-6': 'Upsell 6',
  'upsell-7': 'Upsell 7',
  'upsell-8': 'Upsell 8',
};

// Main funnel steps (exclude upsells)
const MAIN_FUNNEL_STEPS = [
  'login', 'verificando', 'confirma-dados', 
  'biometria', 'video', 'chat', 'saque', 'pix-generated', 'payment-confirmed'
];

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('24h');
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const adminName = localStorage.getItem('admin_name') || 'Admin';

  const verifyAndFetchData = useCallback(async (showLoading = true) => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const verifyResponse = await supabase.functions.invoke('admin-verify', {
        body: { token },
      });

      if (!verifyResponse.data?.valid) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_name');
        navigate('/admin/login');
        return;
      }

      const analyticsResponse = await supabase.functions.invoke('admin-analytics', {
        body: { token, period, utmFilter: selectedSource },
      });

      if (analyticsResponse.data?.success) {
        setAnalytics(analyticsResponse.data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, period, selectedSource]);

  // Initial load and period/filter changes
  useEffect(() => {
    verifyAndFetchData();
  }, [verifyAndFetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      verifyAndFetchData(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [verifyAndFetchData]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    navigate('/admin/login');
  };

  // Calculate seconds since last update
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSinceUpdate(Math.floor((Date.now() - lastUpdate.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Process funnel data
  const processedFunnelData = () => {
    if (!analytics?.funnelSteps?.length) return { mainSteps: [], upsells: [], saqueCount: 0 };

    const stepsMap = new Map(analytics.funnelSteps.map(s => [s.step, s.count]));
    const firstStepCount = analytics.funnelSteps[0]?.count || 1;

    // Main funnel steps
    const mainSteps = MAIN_FUNNEL_STEPS
      .map((stepKey, index) => {
        const count = stepsMap.get(stepKey) || 0;
        const prevStep = index > 0 ? MAIN_FUNNEL_STEPS[index - 1] : null;
        const prevCount = prevStep ? (stepsMap.get(prevStep) || 0) : count;
        const dropoff = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0;
        const cumulativePercentage = firstStepCount > 0 ? (count / firstStepCount) * 100 : 0;

        return {
          name: STEP_LABELS[stepKey] || stepKey,
          count,
          percentage: 0,
          dropoff: index === 0 ? 0 : dropoff,
          cumulativePercentage,
        };
      });

    // Upsells
    const saqueCount = stepsMap.get('saque') || 0;
    const upsells = Array.from({ length: 8 }, (_, i) => {
      const stepKey = `upsell-${i + 1}`;
      const count = stepsMap.get(stepKey) || 0;
      const rate = saqueCount > 0 ? (count / saqueCount) * 100 : 0;
      return { number: i + 1, count, rate };
    }).filter(u => u.count > 0);

    return { mainSteps, upsells, saqueCount };
  };

  const { mainSteps, upsells, saqueCount } = processedFunnelData();

  // Create steps map for stats cards
  const stepsMap = new Map(analytics?.funnelSteps?.map(s => [s.step, s.count]) || []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Dashboard Admin</h1>
            <p className="text-sm text-muted-foreground">Olá, {adminName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{secondsSinceUpdate}s</span>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => verifyAndFetchData(false)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              <Calendar className="w-4 h-4 mr-1" />
              {p === '24h' ? 'Hoje' : p === '7d' ? '7 dias' : '30 dias'}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <StatsCards 
          totalSessions={analytics?.totalSessions || 0} 
          stepsMap={stepsMap} 
        />

        {/* Traffic Sources */}
        <TrafficSources 
          utmSources={analytics?.utmSources || []} 
          totalEvents={analytics?.totalEvents || 0} 
        />

        {/* Funnel Chart/Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Funil de Conversão</CardTitle>
              <CardDescription>
                Visualização do fluxo de usuários com taxas de drop-off
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'chart' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('chart')}
                className="h-8"
              >
                <LayoutList className="w-4 h-4 mr-1" />
                Gráfico
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8"
              >
                <TableIcon className="w-4 h-4 mr-1" />
                Tabela
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Source Filter */}
            <SourceFilter
              sources={analytics?.availableSources || []}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
            />
            
            {viewMode === 'chart' ? (
              <FunnelChart steps={mainSteps} />
            ) : (
              <FunnelTable steps={mainSteps} />
            )}
          </CardContent>
        </Card>

        {/* Upsell Metrics */}
        {upsells.length > 0 && (
          <UpsellMetrics upsells={upsells} baseCount={saqueCount} />
        )}

        {/* Live Events */}
        <LiveEvents 
          events={analytics?.recentEvents || []} 
          stepLabels={STEP_LABELS} 
        />
      </main>
    </div>
  );
};

export default Admin;
