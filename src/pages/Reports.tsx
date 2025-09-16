import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart3, FileText, Calendar as CalendarIcon, Users, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

// Interfaces para tipagem dos dados
interface SalesData {
  month: string;
  vendas: number;
  clientes: number;
}

interface CampaignData {
  name: string;
  value: number;
  color: string;
}

interface ClientData {
  name: string;
  vendas: number;
  pedidos: number;
}

interface HourlyData {
  hour: string;
  pedidos: number;
}

interface ReportData {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    total_customers: number;
    total_campaigns: number;
    total_messages: number;
    total_orders: number;
    total_revenue: number;
    open_rate: number;
    click_rate: number;
    conversion_rate: number;
  };
  campaign_performance: Array<{
    id: string;
    name: string;
    type: string;
    sent_count: number;
    open_rate: number;
    click_rate: number;
  }>;
  daily_stats: Array<{
    date: string;
    messages_sent: number;
    orders: number;
    revenue: number;
  }>;
}

const Reports = () => {
  const [date, setDate] = useState<Date>();
  const [period, setPeriod] = useState("last30days");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const { toast } = useToast();

  // Dados transformados para os gráficos
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [topClients, setTopClients] = useState<ClientData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Função para buscar dados do relatório
  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Se variáveis de ambiente não estiverem configuradas, não tenta buscar
      if (!supabaseUrl || !supabaseAnonKey) {
        setReportData(null);
        setSalesData([]);
        setCampaignData([]);
        setTopClients([]);
        setHourlyData([]);
        return;
      }

      // Determinar o período baseado na seleção do usuário
      let reportPeriod = period;
      if (date) {
        reportPeriod = 'custom';
      }

      if (!restaurantId) {
        setReportData(null);
        setSalesData([]);
        setCampaignData([]);
        setTopClients([]);
        setHourlyData([]);
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/report-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          type: 'sales',
          period: reportPeriod,
          start_date: date ? format(date, 'yyyy-MM-dd') : undefined,
          end_date: date ? format(date, 'yyyy-MM-dd') : undefined,
          restaurant_id: restaurantId,
          export_format: 'json'
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }

      const data = await response.json();
      setReportData(data.data);

      // Transformar dados para os gráficos
      transformData(data.data);
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      toast({
        title: "Erro ao carregar relatório",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao carregar os dados do relatório",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Transformar dados da API para o formato dos gráficos
  const transformData = (data: ReportData) => {
    // Sempre limpa coleções derivadas antes de popular
    setSalesData([]);
    setCampaignData([]);
    setTopClients([]);
    setHourlyData([]);

    // Transformar dados de vendas por dia/mês
    if (data.daily_stats) {
      const salesByDay = data.daily_stats.map(stat => ({
        month: new Date(stat.date).toLocaleDateString('pt-BR', { month: 'short' }),
        vendas: stat.revenue,
        clientes: stat.orders
      }));
      setSalesData(salesByDay);
    }

    // Transformar dados de campanhas
    if (data.campaign_performance) {
      const colors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6'];
      const campaignStats = data.campaign_performance.map((campaign, index) => ({
        name: campaign.name,
        value: campaign.sent_count,
        color: colors[index % colors.length]
      }));
      setCampaignData(campaignStats);
    }

    // Sem dados mock: mantém topClients e hourlyData vazios
  };

  // Buscar restaurant_id do usuário logado
  useEffect(() => {
    async function fetchRestaurantId() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRestaurantId(null);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('restaurant_id')
          .eq('id', user.id)
          .single();

        setRestaurantId(profile?.restaurant_id || null);
      } catch (error) {
        console.error('Erro ao buscar restaurant_id:', error);
        setRestaurantId(null);
      }
    }
    fetchRestaurantId();
  }, []);

  // Buscar dados quando o período, data ou restaurant_id mudar
  useEffect(() => {
    if (restaurantId) {
      fetchReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, date, restaurantId]);

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise completa das suas vendas e performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" disabled={loading}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" disabled={loading}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Fallback quando Supabase não está configurado */}
      {!supabaseUrl || !supabaseAnonKey ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Variáveis de ambiente do Supabase não configuradas. Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> para visualizar os dados de relatórios.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={period} onValueChange={setPeriod} disabled={loading}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                <SelectItem value="last3months">Últimos 3 meses</SelectItem>
                <SelectItem value="custom">Período personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full md:w-64 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {!restaurantId ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Aguardando identificação do restaurante...
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Carregando dados...</span>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {reportData?.metrics?.total_revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </p>
                    <p className="text-sm text-green-600">+12.5% vs período anterior</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">R$</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pedidos</p>
                    <p className="text-2xl font-bold text-primary">
                      {reportData?.metrics?.total_orders?.toLocaleString('pt-BR') || '0'}
                    </p>
                    <p className="text-sm text-primary">+8.2% vs período anterior</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      R$ {reportData?.metrics?.total_revenue && reportData.metrics.total_orders ? 
                        (reportData.metrics.total_revenue / reportData.metrics.total_orders).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 
                        '0,00'}
                    </p>
                    <p className="text-sm text-yellow-600">+3.8% vs período anterior</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold text-sm">TM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Novos Clientes</p>
                    <p className="text-2xl font-bold text-foreground">
                      {reportData?.metrics?.total_customers?.toLocaleString('pt-BR') || '0'}
                    </p>
                    <p className="text-sm text-green-600">+15.3% vs período anterior</p>
                  </div>
                  <Users className="h-8 w-8 text-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução das Vendas</CardTitle>
                <CardDescription>Receita e número de clientes por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vendas" fill="#2563eb" name="Vendas (R$)" />
                    <Bar dataKey="clientes" fill="#16a34a" name="Clientes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Campaign Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance de Campanhas</CardTitle>
                <CardDescription>Distribuição de conversões por campanha</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={campaignData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {campaignData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Clientes</CardTitle>
                <CardDescription>Clientes que mais gastaram no período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topClients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem dados de clientes para exibir.</p>
                  ) : (
                    topClients.map((client, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{client.name}</p>
                            <p className="text-sm text-muted-foreground">{client.pedidos} pedidos</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            R$ {client.vendas.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hourly Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Horário</CardTitle>
                <CardDescription>Número de pedidos ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="pedidos" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      dot={{ fill: '#2563eb' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
