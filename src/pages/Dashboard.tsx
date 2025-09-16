import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, FileText, Grid2x2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CampaignWizard } from "@/components/CampaignWizard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);

  // State for real data
  const [salesData, setSalesData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [kpiData, setKpiData] = useState({
    todaySales: { value: 0, change: 0 },
    activeClients: { value: 0, change: 0 },
    conversionRate: { value: 0, change: 0 },
    campaignROI: { value: 0, change: 0 }
  });
  const [loading, setLoading] = useState(true);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const [currentUser, setCurrentUser] = useState<{ id: string; plan?: string; restaurant_id?: string } | null>(null);
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCurrentUser(null);
          return;
        }

        // Buscar informações do restaurante do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('restaurant_id')
          .eq('id', user.id)
          .single();

        setCurrentUser({
          id: user.id,
          plan: 'free', // Por enquanto usando plano padrão
          restaurant_id: profile?.restaurant_id
        });
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        setCurrentUser(null);
      }
    }
    fetchUserData();
  }, []);
  // lazy import to avoid circular dep
  const [planLimits, setPlanLimits] = useState<any>(null);
  
  useEffect(() => {
    import('@/lib/plan').then(({ getPlanLimits }) => {
      setPlanLimits(getPlanLimits(currentUser?.plan));
    });
  }, [currentUser?.plan]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        if (!supabaseUrl || !supabaseAnonKey) {
          setSalesData([]);
          setKpiData({
            todaySales: { value: 0, change: 0 },
            activeClients: { value: 0, change: 0 },
            conversionRate: { value: 0, change: 0 },
            campaignROI: { value: 0, change: 0 }
          });
          setRecentActivities([]);
          setAlerts([]);
          return;
        }

        if (!currentUser?.restaurant_id) {
          setSalesData([]);
          setKpiData({
            todaySales: { value: 0, change: 0 },
            activeClients: { value: 0, change: 0 },
            conversionRate: { value: 0, change: 0 },
            campaignROI: { value: 0, change: 0 }
          });
          setRecentActivities([]);
          setAlerts([]);
          return;
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/report-generator`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            type: 'dashboard',
            period: 'month',
            restaurant_id: currentUser.restaurant_id
          })
        });
        const data = await response.json();
        if (data.success) {
          const dashboardData = data.data;
          
          setSalesData(dashboardData.daily_stats?.map((day: any) => ({ 
            name: new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), 
            value: day.revenue 
          })) || []);
          
          const metrics = dashboardData.metrics || {};
          setKpiData({
            todaySales: {
              value: metrics.total_revenue || 0,
              change: 12.5
            },
            activeClients: {
              value: metrics.total_customers || 0,
              change: 8.2
            },
            conversionRate: {
              value: metrics.conversion_rate || 0,
              change: -2.1
            },
            campaignROI: {
              value: ((metrics.total_revenue || 0) / Math.max(metrics.total_messages || 1, 1)) * 100,
              change: 15.3
            }
          });
          
          setRecentActivities([]);
          setAlerts([]);
        } else {
          toast({
            title: "Erro ao carregar dados",
            description: data.error || "Falha ao buscar dados do dashboard."
          });
        }
      } catch (error) {
        toast({
          title: "Erro de rede",
          description: "Não foi possível conectar ao servidor."
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [toast, supabaseUrl, supabaseAnonKey, currentUser?.restaurant_id]);

  const handleExportReport = async () => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        toast({ title: "Exportação indisponível", description: "Configure as variáveis do Supabase." });
        return;
      }
      if (!currentUser?.restaurant_id) {
        toast({ title: "Exportação indisponível", description: "Restaurante não encontrado." });
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/report-generator`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          type: 'dashboard',
          period: 'month',
          restaurant_id: currentUser.restaurant_id,
          export_format: 'csv'
        })
      });
      
      const data = await response.json();
      if (data.success && data.download_url) {
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = data.file_name || 'dashboard_report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({ title: "Relatório exportado", description: "O relatório foi baixado com sucesso." });
      } else {
        toast({ title: "Erro na exportação", description: data.error || "Falha ao exportar relatório.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro de rede", description: "Não foi possível exportar o relatório.", variant: "destructive" });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'nova-campanha':
        setIsNewCampaignOpen(true);
        break;
      case 'importar-clientes':
        navigate('/clients');
        break;
      case 'ver-relatorios':
        navigate('/reports');
        break;
      case 'configuracoes':
        navigate('/settings');
        break;
    }
  };

  const handleAlertAction = (action: string) => {
    switch (action) {
      case 'Ver Lista':
        navigate('/clients');
        break;
      case 'Ver Detalhes':
        navigate('/reports');
        break;
      case 'Configurar':
        navigate('/settings');
        break;
    }
  };

  if (loading || !planLimits) {
    return <div>Carregando dados do dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas vendas e campanhas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportReport}>Exportar Relatório</Button>
          <Button onClick={() => setIsNewCampaignOpen(true)}>Nova Campanha</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Vendas Hoje"
          value={`R$ ${kpiData.todaySales.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={kpiData.todaySales.change}
          changeLabel="vs ontem"
          icon={BarChart3}
          color="green"
        />
        <KPICard
          title="Clientes Ativos"
          value={kpiData.activeClients.value.toLocaleString('pt-BR')}
          change={kpiData.activeClients.change}
          changeLabel="este mês"
          icon={Users}
          color="blue"
        />
        {planLimits.features.advancedAutomations && (
          <KPICard
            title="Taxa Conversão"
            value={`${kpiData.conversionRate.value.toFixed(1)}%`}
            change={kpiData.conversionRate.change}
            changeLabel="vs mês anterior"
            icon={Grid2x2}
            color="yellow"
          />
        )}
        <KPICard
          title="ROI Campanhas"
          value={`${kpiData.campaignROI.value.toFixed(0)}%`}
          change={kpiData.campaignROI.change}
          changeLabel="últimos 30 dias"
          icon={FileText}
          color="blue"
        />
      </div>
      {!planLimits.features.advancedAutomations && (
        <p className="text-xs text-muted-foreground">Alguns KPIs estão disponíveis apenas no Premium.</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vendas - Últimos 7 meses</CardTitle>
            <CardDescription>
              Evolução das vendas mensais em reais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  formatter={(value) => [`R$ ${value}`, 'Vendas']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas ações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma atividade recente disponível.</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas Importantes</CardTitle>
            <CardDescription>
              Itens que precisam da sua atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <p className="text-muted-foreground">Nenhum alerta disponível.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{alert.title}</h4>
                        <Badge variant={
                          alert.type === 'warning' ? 'destructive' :
                          alert.type === 'success' ? 'default' :
                          'secondary'
                        }>
                          {alert.type === 'warning' ? 'Atenção' :
                           alert.type === 'success' ? 'Sucesso' : 'Info'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAlertAction(alert.action)}>
                      {alert.action}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Funcionalidades mais usadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleQuickAction('nova-campanha')}>
                <FileText className="h-5 w-5" />
                <span className="text-sm">Nova Campanha</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleQuickAction('importar-clientes')}>
                <Users className="h-5 w-5" />
                <span className="text-sm">Importar Clientes</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleQuickAction('ver-relatorios')}>
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">Ver Relatórios</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => handleQuickAction('configuracoes')}>
                <Grid2x2 className="h-5 w-5" />
                <span className="text-sm">Configurações</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CampaignWizard
        open={isNewCampaignOpen}
        onOpenChange={setIsNewCampaignOpen}
        onCampaignCreated={(campaign) => {
          toast({
            title: "Campanha criada",
            description: `A campanha "${campaign.name}" foi criada com sucesso.`,
          });
        }}
      />
    </div>
  );
};

export default Dashboard;
