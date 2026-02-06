import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  MessageCircle,
  ArrowRight,
  DollarSign,
  MessageSquare,
  CreditCard
} from "lucide-react";

interface StatsCardsProps {
  totalSessions: number;
  stepsMap: Map<string, number>;
}

const StatsCards = ({ totalSessions, stepsMap }: StatsCardsProps) => {
  const getConversionRate = () => {
    const loginCount = stepsMap.get('login') || 0;
    const paymentCount = stepsMap.get('payment-confirmed') || 0;
    if (!loginCount) return '0';
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

  const getPixToPaymentRate = () => {
    const pixCount = stepsMap.get('pix-generated') || 0;
    const paymentCount = stepsMap.get('payment-confirmed') || 0;
    return pixCount > 0 ? ((paymentCount / pixCount) * 100).toFixed(1) : '0';
  };

  return (
    <>
      {/* Row 1: Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Sessões</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              {totalSessions}
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
            <CardDescription>Pagamentos</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-500" />
              {stepsMap.get('payment-confirmed') || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>PIX Gerados</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-500" />
              {stepsMap.get('pix-generated') || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Row 2: Detailed Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <CardDescription>PIX → Pagamento</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              {getPixToPaymentRate()}%
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
    </>
  );
};

export default StatsCards;
