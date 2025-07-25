
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Restaurant Data
    restaurantType: "",
    monthlyRevenue: "",
    customerBase: "",
    
    // Step 2 - WhatsApp
    whatsappNumber: "",
    hasWhatsappBusiness: false,
    
    // Step 3 - PDV Integration
    pdvSystem: "",
    deliveryPlatforms: [] as string[],
    
    // Step 4 - First Campaign
    campaignType: "",
    targetAudience: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = () => {
    toast({
      title: "Configuração concluída!",
      description: "Seu SmartFlow Sales está pronto para usar.",
    });
    navigate("/dashboard");
  };

  const handleDeliveryPlatformToggle = (platform: string) => {
    const updatedPlatforms = formData.deliveryPlatforms.includes(platform)
      ? formData.deliveryPlatforms.filter(p => p !== platform)
      : [...formData.deliveryPlatforms, platform];
    
    updateFormData("deliveryPlatforms", updatedPlatforms);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">SF</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Configuração Inicial</h1>
          <p className="text-neutral-600">Vamos configurar seu SmartFlow Sales em 4 passos simples</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-neutral-600">
                Passo {currentStep} de {totalSteps}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}% concluído
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between mt-4 text-xs">
              <span className={currentStep >= 1 ? "text-primary font-medium" : "text-neutral-400"}>
                Dados do Restaurante
              </span>
              <span className={currentStep >= 2 ? "text-primary font-medium" : "text-neutral-400"}>
                WhatsApp
              </span>
              <span className={currentStep >= 3 ? "text-primary font-medium" : "text-neutral-400"}>
                Integrações
              </span>
              <span className={currentStep >= 4 ? "text-primary font-medium" : "text-neutral-400"}>
                Primeira Campanha
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {/* Step 1 - Restaurant Data */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Conte-nos sobre seu restaurante
                  </h2>
                  <p className="text-neutral-600">
                    Essas informações nos ajudam a personalizar sua experiência
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Restaurante</Label>
                    <Select value={formData.restaurantType} onValueChange={(value) => updateFormData("restaurantType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo do seu restaurante" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast-food">Fast Food</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="fine-dining">Fine Dining</SelectItem>
                        <SelectItem value="pizzaria">Pizzaria</SelectItem>
                        <SelectItem value="lanchonete">Lanchonete</SelectItem>
                        <SelectItem value="delivery">Delivery Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Faturamento Mensal Aproximado</Label>
                    <Select value={formData.monthlyRevenue} onValueChange={(value) => updateFormData("monthlyRevenue", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua faixa de faturamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-10k">Até R$ 10.000</SelectItem>
                        <SelectItem value="10k-30k">R$ 10.000 - R$ 30.000</SelectItem>
                        <SelectItem value="30k-50k">R$ 30.000 - R$ 50.000</SelectItem>
                        <SelectItem value="50k-100k">R$ 50.000 - R$ 100.000</SelectItem>
                        <SelectItem value="100k+">Acima de R$ 100.000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quantos clientes você atende por mês?</Label>
                    <Select value={formData.customerBase} onValueChange={(value) => updateFormData("customerBase", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Estimativa de clientes mensais" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-100">Até 100 clientes</SelectItem>
                        <SelectItem value="100-500">100 - 500 clientes</SelectItem>
                        <SelectItem value="500-1000">500 - 1.000 clientes</SelectItem>
                        <SelectItem value="1000-2000">1.000 - 2.000 clientes</SelectItem>
                        <SelectItem value="2000+">Mais de 2.000 clientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 - WhatsApp */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Configurar WhatsApp Business
                  </h2>
                  <p className="text-neutral-600">
                    Conecte seu WhatsApp para automatizar o atendimento
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="whatsapp-number">Número do WhatsApp Business</Label>
                    <Input
                      id="whatsapp-number"
                      placeholder="(11) 99999-9999"
                      value={formData.whatsappNumber}
                      onChange={(e) => updateFormData("whatsappNumber", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-whatsapp-business"
                      checked={formData.hasWhatsappBusiness}
                      onCheckedChange={(checked) => updateFormData("hasWhatsappBusiness", checked)}
                    />
                    <Label htmlFor="has-whatsapp-business">
                      Já possuo conta WhatsApp Business verificada
                    </Label>
                  </div>

                  {!formData.hasWhatsappBusiness && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2">Não tem WhatsApp Business?</h4>
                      <p className="text-sm text-neutral-600 mb-3">
                        Ajudaremos você a criar e verificar sua conta durante o processo.
                      </p>
                      <Button variant="outline" size="sm">
                        Saiba mais sobre WhatsApp Business
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 - Integrations */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Integrações PDV e Delivery
                  </h2>
                  <p className="text-neutral-600">
                    Conecte com suas ferramentas existentes
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label>Sistema de PDV/Pagamento</Label>
                    <Select value={formData.pdvSystem} onValueChange={(value) => updateFormData("pdvSystem", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu sistema de PDV" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stone">Stone</SelectItem>
                        <SelectItem value="cielo">Cielo</SelectItem>
                        <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                        <SelectItem value="pagseguro">PagSeguro</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                        <SelectItem value="nenhum">Não uso sistema de PDV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">
                      Plataformas de Delivery (selecione todas que usa)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["iFood", "Uber Eats", "Rappi", "99Food", "Delivery Próprio"].map((platform) => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform}
                            checked={formData.deliveryPlatforms.includes(platform)}
                            onCheckedChange={() => handleDeliveryPlatformToggle(platform)}
                          />
                          <Label htmlFor={platform}>{platform}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.deliveryPlatforms.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        Ótimo! Vamos integrar com: {formData.deliveryPlatforms.map(p => (
                          <Badge key={p} variant="outline" className="mx-1">{p}</Badge>
                        ))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4 - First Campaign */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Sua Primeira Campanha
                  </h2>
                  <p className="text-neutral-600">
                    Vamos criar uma campanha para começar
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Campanha</Label>
                    <Select value={formData.campaignType} onValueChange={(value) => updateFormData("campaignType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Que tipo de campanha quer criar?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Boas-vindas a novos clientes</SelectItem>
                        <SelectItem value="reactivation">Reativação de clientes inativos</SelectItem>
                        <SelectItem value="promotion">Promoção especial</SelectItem>
                        <SelectItem value="birthday">Aniversário dos clientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Público-alvo</Label>
                    <Select value={formData.targetAudience} onValueChange={(value) => updateFormData("targetAudience", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Para quem será a campanha?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os clientes</SelectItem>
                        <SelectItem value="new">Clientes novos</SelectItem>
                        <SelectItem value="regular">Clientes regulares</SelectItem>
                        <SelectItem value="inactive">Clientes inativos</SelectItem>
                        <SelectItem value="high-value">Clientes de alto valor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.campaignType && formData.targetAudience && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Check className="h-4 w-4 text-success-600" />
                        Campanha Configurada
                      </h4>
                      <p className="text-sm text-neutral-600">
                        Sua campanha de <strong>{
                          formData.campaignType === 'welcome' ? 'boas-vindas' :
                          formData.campaignType === 'reactivation' ? 'reativação' :
                          formData.campaignType === 'promotion' ? 'promoção especial' : 'aniversário'
                        }</strong> para <strong>{
                          formData.targetAudience === 'all' ? 'todos os clientes' :
                          formData.targetAudience === 'new' ? 'clientes novos' :
                          formData.targetAudience === 'regular' ? 'clientes regulares' :
                          formData.targetAudience === 'inactive' ? 'clientes inativos' : 'clientes de alto valor'
                        }</strong> será criada automaticamente.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                  disabled={
                    (currentStep === 1 && (!formData.restaurantType || !formData.monthlyRevenue || !formData.customerBase)) ||
                    (currentStep === 2 && !formData.whatsappNumber) ||
                    (currentStep === 3 && !formData.pdvSystem)
                  }
                >
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={finishOnboarding}
                  className="flex items-center gap-2"
                  disabled={!formData.campaignType || !formData.targetAudience}
                >
                  <Check className="h-4 w-4" />
                  Finalizar Configuração
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
