import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart3, FileText, Calendar as CalendarIcon, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const salesData = [
  { month: 'Jan', vendas: 4000, clientes: 240 },
  { month: 'Fev', vendas: 3000, clientes: 198 },
  { month: 'Mar', vendas: 5000, clientes: 315 },
  { month: 'Abr', vendas: 4500, clientes: 289 },
  { month: 'Mai', vendas: 6000, clientes: 387 },
  { month: 'Jun', vendas: 5500, clientes: 356 },
];

const campaignData = [
  { name: 'Happy Hour', value: 35, color: '#2563eb' },
  { name: 'Almoço Executivo', value: 28, color: '#16a34a' },
  { name: 'Delivery', value: 22, color: '#f59e0b' },
  { name: 'Fim de Semana', value: 15, color: '#dc2626' },
];

const topClients = [
  { name: 'Maria Silva', vendas: 2150, pedidos: 18 },
  { name: 'João Santos', vendas: 1850, pedidos: 15 },
  { name: 'Ana Costa', vendas: 1650, pedidos: 12 },
  { name: 'Pedro Oliveira', vendas: 1450, pedidos: 11 },
  { name: 'Carla Ferreira', vendas: 1250, pedidos: 9 },
];

const hourlyData = [
  { hour: '08:00', pedidos: 12 },
  { hour: '10:00', pedidos: 19 },
  { hour: '12:00', pedidos: 45 },
  { hour: '14:00', pedidos: 38 },
  { hour: '16:00', pedidos: 22 },
  { hour: '18:00', pedidos: 41 },
  { hour: '20:00', pedidos: 35 },
  { hour: '22:00', pedidos: 18 },
];

const Reports = () => {
  const [date, setDate] = useState<Date>();
  const [period, setPeriod] = useState("last30days");

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
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={period} onValueChange={setPeriod}>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">R$ 28.500</p>
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
                <p className="text-2xl font-bold text-primary">1.847</p>
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
                <p className="text-2xl font-bold text-yellow-600">R$ 15.44</p>
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
                <p className="text-2xl font-bold text-foreground">234</p>
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
              {topClients.map((client, index) => (
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
              ))}
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
    </div>
  );
};

export default Reports;
