
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [restaurantData, setRestaurantData] = useState({
    name: "Restaurante Exemplo",
    email: "contato@restaurante.com",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  });

  const [integrations, setIntegrations] = useState({
    whatsapp: true,
    stone: false,
    cielo: true,
    ifood: false
  });

  const [automations, setAutomations] = useState({
    welcomeMessage: true,
    birthdayMessage: true,
    churnPrevention: true,
    promotionalMessages: false
  });

  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleToggleIntegration = (integration: string) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: !prev[integration as keyof typeof prev]
    }));
    
    toast({
      title: "Integração atualizada!",
      description: `A integração foi ${integrations[integration as keyof typeof integrations] ? 'desativada' : 'ativada'}.`,
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da sua conta e integrações</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="automations">Automações</TabsTrigger>
          <TabsTrigger value="billing">Plano</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Restaurante</CardTitle>
              <CardDescription>
                Atualize as informações básicas do seu restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nome do Restaurante</Label>
                  <Input
                    id="name"
                    value={restaurantData.name}
                    onChange={(e) => setRestaurantData(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={restaurantData.email}
                    onChange={(e) => setRestaurantData(prev => ({...prev, email: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={restaurantData.phone}
                    onChange={(e) => setRestaurantData(prev => ({...prev, phone: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={restaurantData.address}
                    onChange={(e) => setRestaurantData(prev => ({...prev, address: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={restaurantData.city}
                    onChange={(e) => setRestaurantData(prev => ({...prev, city: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={restaurantData.state}
                    onChange={(e) => setRestaurantData(prev => ({...prev, state: e.target.value}))}
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Settings */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Configuração WhatsApp Business</CardTitle>
              <CardDescription>
                Configure sua integração com WhatsApp Business API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Status da Conexão</h4>
                  <p className="text-sm text-muted-foreground">WhatsApp Business API conectado</p>
                </div>
                <Badge variant="default">Conectado</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone-number">Número do WhatsApp</Label>
                  <Input
                    id="phone-number"
                    value="+55 11 99999-9999"
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label htmlFor="business-name">Nome do Negócio</Label>
                  <Input
                    id="business-name"
                    value="Restaurante Exemplo"
                  />
                </div>

                <div>
                  <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                  <Input
                    id="welcome-message"
                    value="Olá! Bem-vindo ao nosso restaurante. Como posso ajudar?"
                  />
                </div>
              </div>

              <Button>Atualizar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrações PDV</CardTitle>
              <CardDescription>
                Conecte com seu sistema de PDV e plataformas de delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(integrations).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="font-bold text-sm text-foreground">
                        {key === 'whatsapp' ? 'WA' : 
                         key === 'stone' ? 'ST' :
                         key === 'cielo' ? 'CI' : 'IF'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium capitalize text-foreground">{key}</h4>
                      <p className="text-sm text-muted-foreground">
                        {enabled ? 'Integração ativa' : 'Não conectado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? 'Conectado' : 'Desconectado'}
                    </Badge>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => handleToggleIntegration(key)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automations */}
        <TabsContent value="automations">
          <Card>
            <CardHeader>
              <CardTitle>Automações</CardTitle>
              <CardDescription>
                Configure as automações de marketing e relacionamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(automations).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {key === 'welcomeMessage' ? 'Mensagem de Boas-vindas' :
                       key === 'birthdayMessage' ? 'Mensagem de Aniversário' :
                       key === 'churnPrevention' ? 'Prevenção de Churn' :
                       'Mensagens Promocionais'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {key === 'welcomeMessage' ? 'Enviar mensagem automática para novos clientes' :
                       key === 'birthdayMessage' ? 'Enviar ofertas especiais no aniversário' :
                       key === 'churnPrevention' ? 'Identificar e engajar clientes em risco' :
                       'Enviar promoções e ofertas automaticamente'}
                    </p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => setAutomations(prev => ({
                      ...prev,
                      [key]: checked
                    }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Plano e Cobrança</CardTitle>
              <CardDescription>
                Gerencie seu plano e informações de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 border rounded-lg bg-primary/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Plano Professional</h3>
                    <p className="text-muted-foreground">R$ 197/mês</p>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Clientes</p>
                    <p className="font-medium text-foreground">1.247 / 2.000</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Campanhas este mês</p>
                    <p className="font-medium text-foreground">8 / Ilimitadas</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4 text-foreground">Histórico de Pagamentos</h4>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Janeiro 2024</p>
                        <p className="text-sm text-muted-foreground">Plano Professional</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">R$ 197,00</p>
                        <Badge variant="outline">Pago</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline">Alterar Plano</Button>
                <Button variant="outline">Atualizar Pagamento</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
