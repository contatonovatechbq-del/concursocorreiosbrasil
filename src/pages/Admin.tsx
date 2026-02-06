import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  LogOut, 
  RefreshCw,
  Loader2,
  Calendar,
  TableIcon,
  LayoutList,
  MessageCircle,
  ArrowRight,
  DollarSign,
  MessageSquare
} from "lucide-react";
import FunnelChart from "@/components/admin/FunnelChart";
import FunnelTable from "@/components/admin/FunnelTable";
import UpsellMetrics from "@/components/admin/UpsellMetrics";

interface FunnelStep {
  step: string;
  count: number;
  dropoff?: number;
}

interface AnalyticsData {
  totalSessions: number;
  funnelSteps: FunnelStep[];
  recentEvents: Array<{
    step: string;
    created_at: string;
    utm_source: string | null;
  }>;
  utmSources: Array<{
    source: string;
    count: number;
  }>;
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
  'payment-confirmed': 'Pagamento',
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
  const adminName = localStorage.getItem('admin_name') || 'Admin';

  const verifyAndFetchData = async (showLoading = true) => {
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
        body: { token, period },
      });

      if (analyticsResponse.data?.success) {
        setAnalytics(analyticsResponse.data.data);
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
  };

  useEffect(() => {
    verifyAndFetchData();
  }, [period]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    navigate('/admin/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        const cumulativePercentage = (count / firstStepCount) * 100;

        return {
          name: STEP_LABELS[stepKey] || stepKey,
          count,
          percentage: 0,
          dropoff: index === 0 ? 0 : dropoff,
          cumulativePercentage,
        };
      })
      .filter(step => step.count > 0 || MAIN_FUNNEL_STEPS.indexOf(step.name) < 5);

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

  // Calculate conversion rates
  const stepsMap = new Map(analytics?.funnelSteps?.map(s => [s.step, s.count]) || []);
  
  const getConversionRate = () => {
    const loginCount = stepsMap.get('login') || 0;
    const paymentCount = stepsMap.get('payment-confirmed') || 0;
    if (!loginCount) return 0;
    return ((paymentCount / loginCount) * 100).toFixed(1);
  };

  const getChatConversionRate = () => {
    const loginCount = stepsMap.get('login') || 0;
    const chatCount = stepsMap.get('chat') || 0;
    return loginCount > 0 ? ((chatCount / loginCount) * 100).toFixed(1) : '0';
  };

  const getChatToSaqueRate = () => {
    const chatCount = stepsMap.get('chat') || 0;
    const saqueCount = stepsMap.get('saque') || 0;
    return chatCount > 0 ? ((saqueCount / chatCount) * 100).toFixed(1) : '0';
  };

  const getSaqueToPaymentRate = () => {
    const saqueCount = stepsMap.get('saque') || 0;
    const paymentCount = stepsMap.get('payment-confirmed') || 0;
    return saqueCount > 0 ? ((paymentCount / saqueCount) * 100).toFixed(1) : '0';
  };

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
          <div className="flex items-center gap-2">
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

        {/* Stats Cards - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Sessões</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                {analytics?.totalSessions || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taxa de Conversão (Login → Pag.)</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                {getConversionRate()}%
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pagamentos Confirmados</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-amber-500" />
                {stepsMap.get('payment-confirmed') || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards - Row 2: Detailed Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Login → Chat</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                {getChatConversionRate()}%
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Chat → Saque</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-purple-500" />
                {getChatToSaqueRate()}%
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saque → Pagamento</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                {getSaqueToPaymentRate()}%
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Chegaram ao Chat</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                {stepsMap.get('chat') || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

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
          <CardContent>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos Recentes</CardTitle>
              <CardDescription>Últimos 20 eventos do funil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {analytics?.recentEvents?.length ? (
                  analytics.recentEvents.map((event, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                    >
                      <span className="font-medium">
                        {STEP_LABELS[event.step] || event.step}
                      </span>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="text-xs bg-primary/10 px-2 py-0.5 rounded">
                          {event.utm_source || 'direto'}
                        </span>
                        <span className="text-xs">{formatDate(event.created_at)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhum evento encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* UTM Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Fontes de Tráfego (UTM)</CardTitle>
              <CardDescription>Performance por fonte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.utmSources?.length ? (
                  analytics.utmSources.map((source, index) => {
                    const maxCount = analytics.utmSources[0]?.count || 1;
                    const percentage = (source.count / maxCount) * 100;
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{source.source || 'Direto'}</span>
                          <span className="text-muted-foreground">{source.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhuma fonte encontrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
