
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
import { getPlanLimits } from "@/lib/plan";

interface UserAccount {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'staff';
  status: 'active' | 'invited' | 'disabled';
}

const Settings = () => {
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });

  const [integrations, setIntegrations] = useState({
    whatsapp: false,
    stripe: false,
    mercadopago: false,
    facebook: false,
  });

  const [automations, setAutomations] = useState({
    welcomeMessage: true,
    birthdayMessage: true,
    churnPrevention: true,
    promotionalMessages: false
  });

  const { toast } = useToast();

  // Users state (multi-login)
  const [users, setUsers] = useState<UserAccount[]>([]);

  // API base
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  // WhatsApp config state
  const [waStatus, setWaStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [waLoading, setWaLoading] = useState(false);
  const [waConfig, setWaConfig] = useState({
    accountSid: '',
    authToken: '',
    senderNumber: 'whatsapp:+14155238886',
  });
  const [waTest, setWaTest] = useState({ to: '', message: 'Mensagem de teste do SmartFlow Sales' });

  // Facebook/Instagram state
  const [fbStatus, setFbStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [fbLoading, setFbLoading] = useState(false);

  // Stripe & Mercado Pago state
  const [stripeConfig, setStripeConfig] = useState({ publishableKey: '', secretKey: '' });
  const [mpConfig, setMpConfig] = useState({ publicKey: '', accessToken: '' });
  const [payLoading, setPayLoading] = useState(false);

  // Load initial integrations status/config
  React.useEffect(() => {
    async function loadIntegrations() {
      try {
        const url = `${apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''}/api/integrations` || '/api/integrations';
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          // Expecting { integrations: [{ name, status, config }] }
          const map: any = { whatsapp: false, stripe: false, mercadopago: false, facebook: false };
          (data.integrations || []).forEach((i: any) => { map[i.name] = i.status === 'active'; });
          setIntegrations(map);

          const wa = (data.integrations || []).find((i: any) => i.name === 'whatsapp');
          if (wa) {
            setWaStatus(wa.status === 'active' ? 'connected' : 'disconnected');
            setWaConfig({
              accountSid: wa.credentials?.accountSid || '',
              authToken: '', // nunca exibir secret
              senderNumber: wa.config?.senderNumber || 'whatsapp:+14155238886',
            });
          }
          const fb = (data.integrations || []).find((i: any) => i.name === 'facebook');
          if (fb) setFbStatus(fb.status === 'active' ? 'connected' : 'disconnected');
          const st = (data.integrations || []).find((i: any) => i.name === 'stripe');
          if (st) setStripeConfig({ publishableKey: st.config?.publishableKey || '', secretKey: '' });
          const mp = (data.integrations || []).find((i: any) => i.name === 'mercadopago');
          if (mp) setMpConfig({ publicKey: mp.config?.publicKey || '', accessToken: '' });
        }
      } catch (_) {}
    }
    loadIntegrations();
  }, [apiBaseUrl]);

  // Fetch current user and restaurant data
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string; plan?: string; restaurant_id?: string } | null>(null);
  React.useEffect(() => {
    async function fetchUserAndRestaurantData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCurrentUser(null);
          return;
        }
        
        // Buscar informações do perfil e restaurante
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, restaurant_id, restaurants(*)')
          .eq('id', user.id)
          .single();
          
        if (profile?.restaurants) {
          setRestaurantData({
            name: profile.restaurants.name || '',
            email: profile.restaurants.email || user.email || '',
            phone: profile.restaurants.phone || '',
            address: profile.restaurants.address || '',
            city: profile.restaurants.city || '',
            state: profile.restaurants.state || '',
            zipCode: profile.restaurants.zip_code || ''
          });
        }
        
        setCurrentUser({ 
          id: user.id,
          email: user.email,
          plan: profile?.plan || 'free',
          restaurant_id: profile?.restaurant_id
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setCurrentUser(null);
      }
    }
    fetchUserAndRestaurantData();
  }, []);

  const planLimits = getPlanLimits(currentUser?.plan);
  const usersCount = users.length;
  const reachedUserLimit = planLimits.maxUsers !== 'unlimited' && usersCount >= planLimits.maxUsers;

  const handleSaveWhatsApp = async () => {
    try {
      setWaLoading(true);
      const url = `${apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''}/api/integrations/whatsapp` || '/api/integrations/whatsapp';
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          credentials: { accountSid: waConfig.accountSid, authToken: waConfig.authToken },
          config: { senderNumber: waConfig.senderNumber }
        })
      });
      if (!res.ok) throw new Error('Falha ao salvar configuração do WhatsApp');
      setWaStatus('connected');
      setIntegrations(prev => ({ ...prev, whatsapp: true }));
      toast({ title: 'WhatsApp atualizado', description: 'Credenciais salvas com sucesso.' });
    } catch (e) {
      setWaStatus('error');
      toast({ title: 'Erro', description: 'Não foi possível salvar as credenciais.', variant: 'destructive' });
    } finally {
      setWaLoading(false);
    }
  };

  const handleTestWhatsApp = async () => {
    try {
      if (!supabaseUrl || !supabaseAnonKey) {
        toast({ title: 'Indisponível', description: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.', variant: 'destructive' });
        return;
      }
      const res = await fetch(`${supabaseUrl}/functions/v1/whatsapp-sender`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ to: waTest.to, message: waTest.message })
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Mensagem enviada', description: 'Mensagem de teste enviada com sucesso.' });
    } catch (e) {
      toast({ title: 'Erro no envio', description: 'Verifique as credenciais e o número de destino.', variant: 'destructive' });
    }
  };

  const handleFacebookConnect = async () => {
    try {
      setFbLoading(true);
      const url = `${apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''}/api/integrations/facebook/connect` || '/api/integrations/facebook/connect';
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error('URL de conexão não recebida');
      }
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível iniciar a conexão com o Facebook.', variant: 'destructive' });
    } finally {
      setFbLoading(false);
    }
  };

  const handleFacebookDisconnect = async () => {
    try {
      const url = `${apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''}/api/integrations/facebook` || '/api/integrations/facebook';
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      setFbStatus('disconnected');
      setIntegrations(prev => ({ ...prev, facebook: false }));
      toast({ title: 'Desconectado', description: 'Facebook/Instagram desconectados.' });
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível desconectar.', variant: 'destructive' });
    }
  };

  const handleSaveStripe = async () => {
    try {
      setPayLoading(true);
      const url = `${apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''}/api/integrations/stripe` || '/api/integrations/stripe';
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ config: { publishableKey: stripeConfig.publishableKey }, credentials: { secretKey: stripeConfig.secretKey } })
      });
      if (!res.ok) throw new Error();
      setIntegrations(prev => ({ ...prev, stripe: true }));
      toast({ title: 'Stripe salvo', description: 'Credenciais salvas.' });
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao salvar Stripe.', variant: 'destructive' });
    } finally { setPayLoading(false); }
  };

  const handleSaveMercadoPago = async () => {
    try {
      setPayLoading(true);
      const url = `${apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''}/api/integrations/mercadopago` || '/api/integrations/mercadopago';
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ config: { publicKey: mpConfig.publicKey }, credentials: { accessToken: mpConfig.accessToken } })
      });
      if (!res.ok) throw new Error();
      setIntegrations(prev => ({ ...prev, mercadopago: true }));
      toast({ title: 'Mercado Pago salvo', description: 'Credenciais salvas.' });
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao salvar Mercado Pago.', variant: 'destructive' });
    } finally { setPayLoading(false); }
  };

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
    toast({ title: "Integração atualizada!", description: `A integração foi ${integrations[integration as keyof typeof integrations] ? 'desativada' : 'ativada'}.` });
  };

  const handleInviteUser = async (email: string, role: UserAccount['role']) => {
    try {
      if (reachedUserLimit) {
        toast({ title: 'Limite atingido', description: 'Você atingiu o limite de usuários do seu plano. Atualize para convidar mais.', variant: 'destructive' });
        return;
      }
      const url = `${apiBaseUrl ? apiBaseUrl.replace(/\/$/, '') : ''}/api/users/invite` || '/api/users/invite';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, role })
      });
      if (!res.ok) throw new Error('Falha ao convidar usuário');
      toast({ title: 'Convite enviado', description: `${email} foi convidado(a).` });
    } catch (e) {
      toast({ title: 'Erro', description: 'Não foi possível enviar o convite', variant: 'destructive' });
    }
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="automations">Automações</TabsTrigger>
          <TabsTrigger value="billing">Plano</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
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
                Configure sua integração com WhatsApp via Twilio e envie uma mensagem de teste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-foreground">Status da Conexão</h4>
                  <p className="text-sm text-muted-foreground">{waStatus === 'connected' ? 'Conectado' : waStatus === 'error' ? 'Erro' : 'Desconectado'}</p>
                </div>
                <Badge variant={waStatus === 'connected' ? 'default' : (waStatus === 'error' ? 'destructive' : 'secondary')}>
                  {waStatus === 'connected' ? 'Conectado' : waStatus === 'error' ? 'Erro' : 'Desconectado'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="wa-accountSid">Twilio Account SID</Label>
                  <Input id="wa-accountSid" value={waConfig.accountSid} onChange={(e) => setWaConfig(prev => ({ ...prev, accountSid: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="wa-authToken">Twilio Auth Token</Label>
                  <Input id="wa-authToken" type="password" value={waConfig.authToken} onChange={(e) => setWaConfig(prev => ({ ...prev, authToken: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="wa-sender">Número Remetente (WhatsApp)</Label>
                  <Input id="wa-sender" value={waConfig.senderNumber} onChange={(e) => setWaConfig(prev => ({ ...prev, senderNumber: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveWhatsApp} disabled={waLoading}>Salvar Configuração</Button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="wa-to">Enviar Teste para</Label>
                  <Input id="wa-to" placeholder="+5511999999999" value={waTest.to} onChange={(e) => setWaTest(prev => ({ ...prev, to: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="wa-message">Mensagem</Label>
                  <Input id="wa-message" value={waTest.message} onChange={(e) => setWaTest(prev => ({ ...prev, message: e.target.value }))} />
                </div>
              </div>
              <Button variant="outline" onClick={handleTestWhatsApp}>Enviar Mensagem de Teste</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
              <CardDescription>
                Conecte WhatsApp, Facebook/Instagram, Stripe e Mercado Pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Facebook & Instagram</h4>
                    <p className="text-sm text-muted-foreground">Conecte sua conta para métricas de engajamento</p>
                  </div>
                  <Badge variant={fbStatus === 'connected' ? 'default' : 'secondary'}>{fbStatus === 'connected' ? 'Conectado' : 'Desconectado'}</Badge>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleFacebookConnect} disabled={!planLimits.features.facebookAnalytics || fbLoading}>{!planLimits.features.facebookAnalytics ? 'Disponível no Intermediário+' : 'Conectar'}</Button>
                  <Button variant="outline" onClick={handleFacebookDisconnect} disabled={!planLimits.features.facebookAnalytics}>Desconectar</Button>
                </div>
                {!planLimits.features.facebookAnalytics && (
                  <p className="text-xs text-muted-foreground">Atualize para Intermediário ou Premium para usar esta integração.</p>
                )}
              </div>

              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Stripe</h4>
                    <p className="text-sm text-muted-foreground">Use Stripe para links de pagamento</p>
                  </div>
                  <Badge variant={integrations.stripe ? 'default' : 'secondary'}>{integrations.stripe ? 'Conectado' : 'Desconectado'}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="stripe-pk">Publishable Key</Label>
                    <Input id="stripe-pk" value={stripeConfig.publishableKey} onChange={(e) => setStripeConfig(prev => ({ ...prev, publishableKey: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="stripe-sk">Secret Key</Label>
                    <Input id="stripe-sk" type="password" value={stripeConfig.secretKey} onChange={(e) => setStripeConfig(prev => ({ ...prev, secretKey: e.target.value }))} />
                  </div>
                </div>
                <Button onClick={handleSaveStripe} disabled={payLoading}>Salvar Stripe</Button>
              </div>

              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Mercado Pago</h4>
                    <p className="text-sm text-muted-foreground">Gere links com o Mercado Pago</p>
                  </div>
                  <Badge variant={integrations.mercadopago ? 'default' : 'secondary'}>{integrations.mercadopago ? 'Conectado' : 'Desconectado'}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="mp-public">Public Key</Label>
                    <Input id="mp-public" value={mpConfig.publicKey} onChange={(e) => setMpConfig(prev => ({ ...prev, publicKey: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="mp-access">Access Token</Label>
                    <Input id="mp-access" type="password" value={mpConfig.accessToken} onChange={(e) => setMpConfig(prev => ({ ...prev, accessToken: e.target.value }))} />
                  </div>
                </div>
                <Button onClick={handleSaveMercadoPago} disabled={payLoading}>Salvar Mercado Pago</Button>
              </div>
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
                    disabled={
                      // basic automations (welcome/birthday) only Intermediário+
                      ((key === 'welcomeMessage' || key === 'birthdayMessage') && !planLimits.features.basicAutomations) ||
                      // churn/promotional as advanced (Premium)
                      ((key === 'churnPrevention' || key === 'promotionalMessages') && !planLimits.features.advancedAutomations)
                    }
                  />
                </div>
              ))}
              {(!planLimits.features.basicAutomations || !planLimits.features.advancedAutomations) && (
                <p className="text-xs text-muted-foreground">
                  Automações básicas disponíveis no Intermediário+. Automações avançadas apenas no Premium.
                </p>
              )}
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
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Plano atual</h3>
                    <p className="text-muted-foreground">{(currentUser?.plan || 'Desconhecido')}</p>
                  </div>
                  <Badge variant="default">{planLimits.maxUsers === 'unlimited' ? 'Usuários ilimitados' : `${planLimits.maxUsers} usuários`}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <p className="text-muted-foreground">Usuários</p>
                    <p className="font-medium text-foreground">{usersCount} / {planLimits.maxUsers === 'unlimited' ? '∞' : planLimits.maxUsers}</p>
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

        {/* Users */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuários e Permissões</CardTitle>
              <CardDescription>Convide usuários, gerencie papéis e acessos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg">
                <div className="flex flex-col md:flex-row gap-3">
                  <Input placeholder="email@exemplo.com" id="invite-email" />
                  <select id="invite-role" className="border rounded-md px-3 py-2 bg-background">
                    <option value="manager">Gerente</option>
                    <option value="staff">Equipe</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button disabled={reachedUserLimit} onClick={() => {
                    const email = (document.getElementById('invite-email') as HTMLInputElement)?.value;
                    const role = (document.getElementById('invite-role') as HTMLSelectElement)?.value as UserAccount['role'];
                    if (email) handleInviteUser(email, role);
                  }}>{reachedUserLimit ? 'Limite Atingido' : 'Convidar'}</Button>
                </div>
                {reachedUserLimit && (
                  <p className="text-xs text-destructive mt-2">Você atingiu o limite de usuários do seu plano.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
