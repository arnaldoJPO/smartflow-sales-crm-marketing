import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewCampaignForm } from "@/components/NewCampaignForm";
import { CampaignWizard } from "@/components/CampaignWizard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EmptyCampaigns } from "@/components/EmptyState";

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

  const getStatusColor = (status: string) => {
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
        {showMetrics && campaign.sent && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{campaign.sent}</p>
              <p className="text-sm text-muted-foreground">Enviadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Math.round((campaign.opened / campaign.sent) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa Abertura</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {Math.round((campaign.clicked / campaign.sent) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa Clique</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                R$ {campaign.revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">Receita</p>
            </div>
          </div>
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

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch('/api/campaigns'); // Replace with actual API endpoint
        const data = await response.json();
        setCampaignsData({
          active: data.active || [],
          scheduled: data.scheduled || [],
          completed: data.completed || [],
          drafts: data.drafts || []
        });
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);
  
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
                <p className="text-2xl font-bold text-primary">78.5%</p>
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
                <p className="text-2xl font-bold text-yellow-600">127</p>
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
                <p className="text-2xl font-bold text-green-600">R$ 8.450</p>
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
