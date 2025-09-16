
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, FileText, Grid2x2, Check } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Analytics Avançado",
    description: "Dashboards completos com métricas de vendas, conversão e ROI em tempo real."
  },
  {
    icon: Users,
    title: "Gestão de Clientes",
    description: "CRM inteligente que identifica oportunidades e previne churn automaticamente."
  },
  {
    icon: FileText,
    title: "Campanhas Automatizadas",
    description: "Crie e execute campanhas personalizadas via WhatsApp com templates prontos."
  },
  {
    icon: Grid2x2,
    title: "Integração Total",
    description: "Conecte com seu PDV, WhatsApp Business e principais plataformas de delivery."
  }
];

const plans = [
  {
    name: "Básico",
    price: "R$ 67",
    period: "/mês",
    description: "Foco no essencial: organize pedidos e clientes.",
    included: [
      "CRM para gestão de clientes",
      "Gestão de Pedidos",
      "Criação de link de pagamento (Stripe/Mercado Pago)",
      "1 login de usuário",
    ],
    addons: [
      "WhatsApp: cobrado por uso",
    ],
  },
  {
    name: "Intermediário",
    price: "R$ 147",
    period: "/mês",
    description: "Foco em inteligência: entenda seus dados e automatize o marketing.",
    included: [
      "Tudo do Básico",
      "Dashboard de Analytics (Vendas, Métricas do SaaS)",
      "Integração com Instagram/Facebook para Analytics de engajamento",
      "Automações básicas de marketing (ex: mensagem de 'feliz aniversário')",
      "Até 3 logins de usuário",
    ],
    addons: [
      "WhatsApp: cobrado por uso",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "R$ 297",
    period: "/mês",
    description: "Foco em escala e automação para grandes operações e franquias.",
    included: [
      "Tudo do Intermediário",
      "Automações avançadas e personalizadas",
      "Acesso via API para integrações externas",
      "Logins de usuário ilimitados com controle de permissões",
      "Suporte prioritário via WhatsApp/Telefone",
    ],
    addons: [
      "WhatsApp: cobrado por uso",
    ],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">SF</span>
            </div>
            <span className="text-xl font-bold text-neutral-900">SmartFlow Sales</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-neutral-600 hover:text-primary">Funcionalidades</a>
            <a href="#pricing" className="text-neutral-600 hover:text-primary">Preços</a>
            <a href="#about" className="text-neutral-600 hover:text-primary">Sobre</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Transforme seu restaurante em uma
            <span className="text-primary"> máquina de vendas</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
            Automatize suas vendas, recupere clientes inativos e aumente seu faturamento em até 35% 
            com nossa plataforma de automação inteligente para restaurantes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/register">
              <Button size="lg" className="px-8 py-3 text-lg">
                Teste Grátis por 14 Dias
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              Ver Demonstração
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success-500" />
              <span>Setup em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success-500" />
              <span>Sem contrato de fidelidade</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success-500" />
              <span>Suporte especializado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Funcionalidades completas para automatizar suas vendas e melhorar a experiência dos seus clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                   <h3 className="text-xl font-semibold text-foreground mb-2">
                     {feature.title}
                   </h3>
                   <p className="text-foreground/80">
                     {feature.description}
                   </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-neutral-600">
              Escolha o plano ideal para o tamanho do seu restaurante
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                   <div className="text-center mb-8">
                     <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                     <p className="text-foreground/70 mb-4">{plan.description}</p>
                     <div className="mb-6">
                       <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                       <span className="text-foreground/70">{plan.period}</span>
                     </div>
                   </div>

                   <div className="space-y-6 mb-8">
                     <div>
                       <p className="text-sm font-medium text-foreground/70 mb-2">Inclui:</p>
                       <ul className="space-y-3">
                         {plan.included?.map((feature: string, featureIndex: number) => (
                           <li key={featureIndex} className="flex items-center gap-3">
                             <Check className="h-5 w-5 text-green-600" />
                             <span className="text-foreground/80">{feature}</span>
                           </li>
                         ))}
                       </ul>
                     </div>

                     {plan.addons?.length ? (
                       <div>
                         <p className="text-sm font-medium text-foreground/70 mb-2">Recursos com custo adicional:</p>
                         <ul className="space-y-3">
                           {plan.addons.map((addon: string, addonIndex: number) => (
                             <li key={addonIndex} className="flex items-center gap-3">
                               <Check className="h-5 w-5 text-yellow-600" />
                               <span className="text-foreground/80">{addon}</span>
                             </li>
                           ))}
                         </ul>
                         <p className="text-xs text-muted-foreground mt-2">O uso de WhatsApp é cobrado à parte conforme volume de mensagens.</p>
                       </div>
                     ) : null}
                   </div>

                   <Link to="/register" className="block">
                     <Button 
                       className="w-full" 
                       variant={plan.popular ? "default" : "outline"}
                     >
                       Começar Agora
                     </Button>
                   </Link>
                 </CardContent>
               </Card>
             ))}
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para aumentar suas vendas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a mais de 2.000 restaurantes que já aumentaram suas vendas com o SmartFlow Sales
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Começar Teste Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="text-white font-semibold">SmartFlow Sales</span>
            </div>
            <div className="flex gap-6 text-neutral-400 text-sm">
              <a href="#" className="hover:text-white">Termos de Uso</a>
              <a href="#" className="hover:text-white">Privacidade</a>
              <a href="#" className="hover:text-white">Suporte</a>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-500 text-sm">
            © 2024 SmartFlow Sales. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
