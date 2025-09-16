import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Clock, Users, Mail, Phone, Calendar, Plus, FileText, Eye } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CampaignWizard } from "@/components/CampaignWizard";
import { NewCampaignForm } from "@/components/NewCampaignForm";
import { getPlanLimits } from "@/lib/plan";
import { supabase } from "@/lib/supabase";

const Campaigns = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [campaignsData, setCampaignsData] = useState({
    active: [],
    scheduled: [],
    completed: [],
    drafts: []
  });
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = React.useState<{ plan?: string; restaurant_id?: string } | null>(null);
  const [restaurantId, setRestaurantId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCurrentUser(null);
          return;
        }

        // Buscar informações do perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, restaurant_id')
          .eq('id', user.id)
          .single();

        setCurrentUser({ 
          plan: profile?.plan || 'free',
          restaurant_id: profile?.restaurant_id
        });
        setRestaurantId(profile?.restaurant_id || null);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        setCurrentUser(null);
      }
    }
    fetchUserData();
  }, []);

  const planLimits = getPlanLimits(currentUser?.plan);

  const handleNewCampaign = (newCampaign: any) => {
    setCampaignsData(prev => {
      const updatedData = { ...prev };
      
      if (newCampaign.status === "Agendada") {
        updatedData.scheduled = [...updatedData.scheduled, newCampaign];
      } else if (newCampaign.status === "Ativa") {
        updatedData.active = [...updatedData.active, newCampaign];
      } else if (newCampaign.status === "Concluída") {
        updatedData.completed = [...updatedData.completed, newCampaign];
      } else {
        updatedData.drafts = [...updatedData.drafts, newCampaign];
      }
      
      return updatedData;
    });
  };

  type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

  const getStatusColor = (status: string): BadgeVariant => {
    switch (status) {
      case "Ativa": return "default";
      case "Agendada": return "secondary";
      case "Concluída": return "outline";
      case "Rascunho": return "destructive";
      default: return "default";
    }
  };

  const CampaignCard = ({ campaign, showMetrics = false }: { campaign: any; showMetrics?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">{campaign.name}</CardTitle>
            <CardDescription>
              {campaign.type} • {new Date(campaign.created).toLocaleDateString('pt-BR')}
            </CardDescription>
          </div>
          <Badge variant={getStatusColor(campaign.status)}>
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {showMetrics && typeof campaign.sent === 'number' && campaign.sent > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{campaign.sent}</p>
              <p className="text-sm text-muted-foreground">Enviadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round(((campaign.opened ?? 0) / campaign.sent) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa Abertura</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {Math.round(((campaign.clicked ?? 0) / campaign.sent) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa Clique</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                R$ {(campaign.revenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">Receita</p>
            </div>
          </div>
        )}
        {!planLimits.features.advancedAutomations && showMetrics && (
          <p className="text-xs text-muted-foreground mb-4">Métricas avançadas completas disponíveis no Premium.</p>
        )}
        
        {campaign.scheduledFor && (
          <div className="mb-4">
            <p className="text-sm text-foreground">
              <strong>Agendada para:</strong> {new Date(campaign.scheduledFor).toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-foreground">
              <strong>Público:</strong> {campaign.audience} clientes
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Ver Detalhes
          </Button>
          {campaign.status === "Ativa" && (
            <Button variant="outline" size="sm">
              Pausar
            </Button>
          )}
          {campaign.status === "Rascunho" && (
            <Button variant="outline" size="sm">
              Editar
            </Button>
          )}
          {campaign.status === "Agendada" && (
            <Button variant="outline" size="sm">
              Reagendar
            </Button>
          )}
          <Button variant="outline" size="sm">
            Duplicar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Cálculos derivados (evita mocks nos cards)
  const allForMetrics = [
    ...campaignsData.active,
    ...campaignsData.completed,
  ] as any[];

  const totalSent = allForMetrics.reduce((acc, c) => acc + (typeof c.sent === 'number' ? c.sent : 0), 0);
  const totalOpened = allForMetrics.reduce((acc, c) => acc + (typeof c.opened === 'number' ? c.opened : 0), 0);
  const totalRevenue = allForMetrics.reduce((acc, c) => acc + (typeof c.revenue === 'number' ? c.revenue : 0), 0);

  const averageOpenRate = totalSent > 0 ? `${(totalOpened / totalSent * 100).toFixed(1)}%` : '—';
  const conversionsThisMonth = '—'; // Preparado para receber campo real do backend (ex.: conversions)

  useEffect(() => {
    async function fetchCampaigns() {
      if (!restaurantId) {
        setCampaignsData({ active: [], scheduled: [], completed: [], drafts: [] });
        setLoading(false);
        return;
      }

      try {
        // Buscar campanhas do Supabase
        const { data: campaigns, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar campanhas:', error);
          setCampaignsData({ active: [], scheduled: [], completed: [], drafts: [] });
          return;
        }

        // Categorizar campanhas por status
        const categorized = {
          active: campaigns?.filter(c => c.status === 'ativa') || [],
          scheduled: campaigns?.filter(c => c.status === 'agendada') || [],
          completed: campaigns?.filter(c => c.status === 'concluida') || [],
          drafts: campaigns?.filter(c => c.status === 'rascunho') || []
        };

        setCampaignsData(categorized);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        setCampaignsData({ active: [], scheduled: [], completed: [], drafts: [] });
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, [restaurantId]);
  
  if (loading) {
    return <div>Carregando campanhas...</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas de marketing automatizado</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setIsWizardOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaignsData.active.length}
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">Taxa Média Abertura</p>
                <p className="text-2xl font-bold text-primary">{averageOpenRate}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversões Este Mês</p>
                <p className="text-2xl font-bold text-yellow-600">{conversionsThisMonth}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Gerada</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">R$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Suas Campanhas</CardTitle>
          <CardDescription>
            Organize e gerencie todas as suas campanhas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active">
                Ativas ({campaignsData.active.length})
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                Agendadas ({campaignsData.scheduled.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Concluídas ({campaignsData.completed.length})
              </TabsTrigger>
              <TabsTrigger value="drafts">
                Rascunhos ({campaignsData.drafts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {campaignsData.active.length > 0 ? (
                campaignsData.active.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} showMetrics />
                ))
              ) : (
                <EmptyCampaigns onCreateCampaign={() => setIsWizardOpen(true)} />
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4 mt-6">
              {campaignsData.scheduled.length > 0 ? (
                campaignsData.scheduled.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))
              ) : (
                <EmptyCampaigns onCreateCampaign={() => setIsWizardOpen(true)} />
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {campaignsData.completed.length > 0 ? (
                campaignsData.completed.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} showMetrics />
                ))
              ) : (
                <EmptyCampaigns onCreateCampaign={() => setIsWizardOpen(true)} />
              )}
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4 mt-6">
              {campaignsData.drafts.length > 0 ? (
                campaignsData.drafts.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))
              ) : (
                <EmptyCampaigns onCreateCampaign={() => setIsWizardOpen(true)} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CampaignWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onCampaignCreated={handleNewCampaign}
      />
    </div>
  );
};

export default Campaigns;
