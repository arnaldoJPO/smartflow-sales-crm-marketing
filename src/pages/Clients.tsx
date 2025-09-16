import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definição das interfaces
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Ativo' | 'Risco' | 'Inativo';
  score: number;
  lastOrder: string;
  totalSpent: number;
  orders: number;
}

interface ClientsStats {
  total: number;
  active: number;
  risk: number;
  inactive: number;
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const Clients = () => {
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [clientsStats, setClientsStats] = useState<ClientsStats>({
    total: 0,
    active: 0,
    risk: 0,
    inactive: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

  const filteredClients = clientsData.filter((client: Client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesScore = scoreFilter === "all" || 
                        (scoreFilter === "high" && client.score >= 70) ||
                        (scoreFilter === "medium" && client.score >= 40 && client.score < 70) ||
                        (scoreFilter === "low" && client.score < 40);
    
    return matchesSearch && matchesStatus && matchesScore;
  });

  const getStatusColor = (status: 'Ativo' | 'Risco' | 'Inativo'): BadgeVariant => {
    switch (status) {
      case "Ativo": return "default";
      case "Risco": return "secondary";
      case "Inativo": return "destructive";
      default: return "default";
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950";
    return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
  };

  const handleExport = () => {
    toast({
      title: "Exportando clientes",
      description: "A lista de clientes está sendo exportada...",
    });
  };

  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  const handleClientAction = (action: string, clientName: string) => {
    toast({
      title: `${action} - ${clientName}`,
      description: `Ação executada com sucesso.`,
    });
  };

  useEffect(() => {
    async function fetchClients() {
      try {
        // Buscar restaurant_id do usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setClientsData([]);
          setClientsStats({ total: 0, active: 0, risk: 0, inactive: 0 });
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('restaurant_id')
          .eq('id', user.id)
          .single();

        if (!profile?.restaurant_id) {
          setClientsData([]);
          setClientsStats({ total: 0, active: 0, risk: 0, inactive: 0 });
          setLoading(false);
          return;
        }

        // Buscar clientes do restaurante
        const { data: clients, error } = await supabase
          .from('customers')
          .select('*')
          .eq('restaurant_id', profile.restaurant_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar clientes:', error);
          setClientsData([]);
          setClientsStats({ total: 0, active: 0, risk: 0, inactive: 0 });
          setLoading(false);
          return;
        }

        setClientsData(clients || []);
        
        // Calcular estatísticas reais
        const stats = {
          total: clients?.length || 0,
          active: clients?.filter((client: Client) => client.status === 'Ativo').length || 0,
          risk: clients?.filter((client: Client) => client.status === 'Risco').length || 0,
          inactive: clients?.filter((client: Client) => client.status === 'Inativo').length || 0
        };
        setClientsStats(stats);
        
      } catch (error) {
        console.error('Falha ao buscar clientes:', error);
        setClientsData([]);
        setClientsStats({ total: 0, active: 0, risk: 0, inactive: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, []);

  if (loading) {
    return <div>Carregando dados dos clientes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes e identifique oportunidades</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleImport}>
            <Users className="h-4 w-4 mr-2" />
            Importar Clientes
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                <p className="text-2xl font-bold text-foreground">{clientsStats.total.toLocaleString('pt-BR')}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold text-green-600">{clientsStats.active.toLocaleString('pt-BR')}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Risco</p>
                <p className="text-2xl font-bold text-yellow-600">{clientsStats.risk.toLocaleString('pt-BR')}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-red-600">{clientsStats.inactive.toLocaleString('pt-BR')}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            Gerencie e filtre sua base de clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Risco">Em Risco</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Scores</SelectItem>
                <SelectItem value="high">Alto (70+)</SelectItem>
                <SelectItem value="medium">Médio (40-69)</SelectItem>
                <SelectItem value="low">Baixo (menos de 40)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Pedido</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{client.name}</div>
                        <div className="text-sm text-muted-foreground">{client.email}</div>
                        <div className="text-sm text-muted-foreground">{client.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-sm font-medium ${getScoreColor(client.score)}`}>
                        {client.score}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {client.lastOrder ? new Date(client.lastOrder).toLocaleDateString('pt-BR') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-foreground">
                      R$ {(client.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-foreground">{client.orders || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleClientAction('Ver Detalhes', client.name)}>
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleClientAction('Enviar Mensagem', client.name)}>
                          Enviar Mensagem
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Clientes</DialogTitle>
            <DialogDescription>
              Faça upload de um arquivo CSV com os dados dos clientes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste e solte seu arquivo CSV aqui ou
              </p>
              <Button variant="outline" size="sm">
                Selecionar Arquivo
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Formato suportado: CSV</p>
              <p>Colunas obrigatórias: nome, email, telefone</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
