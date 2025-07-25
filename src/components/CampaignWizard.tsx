import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Users, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  message: string;
  audience: number;
  scheduledFor: string | null;
  created: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  hasABTest: boolean;
}

interface CampaignWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignCreated?: (campaign: Campaign) => void;
}

const templates = [
  {
    id: "happy-hour",
    name: "Happy Hour",
    message: "🍻 Happy Hour especial hoje das 17h às 19h! 50% de desconto em todas as bebidas. Venha aproveitar!",
    category: "Promocional"
  },
  {
    id: "lunch",
    name: "Almoço Executivo",
    message: "🍽️ Almoço executivo por apenas R$ 15,90! Entrada + prato principal + sobremesa. De segunda a sexta.",
    category: "Produto"
  },
  {
    id: "birthday",
    name: "Aniversário",
    message: "🎂 Parabéns pelo seu aniversário! Ganhe 20% de desconto na sua próxima visita. Válido por 30 dias.",
    category: "Fidelidade"
  }
];

export function CampaignWizard({ open, onOpenChange, onCampaignCreated }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    audience: "",
    audienceSize: 0,
    message: "",
    template: "",
    scheduledDate: undefined as Date | undefined,
    scheduledTime: "",
    enableAB: false,
    variantA: "",
    variantB: ""
  });

  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const audienceOptions = [
    { value: "all", label: "Todos os clientes", size: 320 },
    { value: "active", label: "Clientes ativos", size: 150 },
    { value: "vip", label: "Clientes VIP", size: 45 },
    { value: "new", label: "Novos clientes", size: 80 },
    { value: "inactive", label: "Clientes inativos", size: 95 }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    const newCampaign = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      status: formData.scheduledDate ? "Agendada" : "Ativa",
      message: formData.message,
      audience: formData.audienceSize,
      scheduledFor: formData.scheduledDate && formData.scheduledTime 
        ? `${format(formData.scheduledDate, "yyyy-MM-dd")} ${formData.scheduledTime}` 
        : null,
      created: new Date().toISOString().split('T')[0],
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0,
      hasABTest: formData.enableAB
    };

    onCampaignCreated?.(newCampaign);
    
    toast({
      title: "Campanha criada com sucesso!",
      description: `A campanha "${formData.name}" foi ${newCampaign.status === "Agendada" ? "agendada" : "criada"} com sucesso.`,
    });

    // Reset wizard
    setCurrentStep(1);
    setFormData({
      name: "",
      type: "",
      audience: "",
      audienceSize: 0,
      message: "",
      template: "",
      scheduledDate: undefined,
      scheduledTime: "",
      enableAB: false,
      variantA: "",
      variantB: ""
    });

    onOpenChange(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.type && formData.audience;
      case 2:
        return formData.message;
      case 3:
        return true; // Agendamento é opcional
      case 4:
        return true; // Revisão sempre pode finalizar
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="campaign-name">Nome da Campanha *</Label>
              <Input
                id="campaign-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Happy Hour Especial"
              />
            </div>

            <div>
              <Label htmlFor="campaign-type">Tipo da Campanha *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Promocional">Promocional</SelectItem>
                  <SelectItem value="Produto">Produto</SelectItem>
                  <SelectItem value="Sazonal">Sazonal</SelectItem>
                  <SelectItem value="Fidelidade">Fidelidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="audience">Público-Alvo *</Label>
              <Select 
                value={formData.audience} 
                onValueChange={(value) => {
                  const option = audienceOptions.find(opt => opt.value === value);
                  setFormData(prev => ({ 
                    ...prev, 
                    audience: value,
                    audienceSize: option?.size || 0
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o público-alvo" />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.size} clientes)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.audienceSize > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      Sua campanha será enviada para <strong>{formData.audienceSize} clientes</strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Templates Disponíveis</Label>
              <div className="grid gap-3 mt-2">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      formData.template === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        template: template.id,
                        message: template.message
                      }));
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline" className="mt-1">
                            {template.category}
                          </Badge>
                        </div>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {template.message}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="custom-message">Mensagem Personalizada *</Label>
              <Textarea
                id="custom-message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Digite sua mensagem personalizada ou selecione um template acima"
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Agendamento (Opcional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Deixe em branco para enviar imediatamente
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Envio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledDate ? 
                        format(formData.scheduledDate, "PPP", { locale: ptBR }) : 
                        "Selecionar data"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, scheduledDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="scheduled-time">Horário de Envio</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  disabled={!formData.scheduledDate}
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {formData.scheduledDate ? 
                      `Campanha será enviada em ${format(formData.scheduledDate, "PPP", { locale: ptBR })} às ${formData.scheduledTime || "horário não definido"}` :
                      "Campanha será enviada imediatamente após a criação"
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Revisão e Confirmação</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Revise todos os dados antes de criar a campanha
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Informações Básicas</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nome:</span>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <p className="font-medium">{formData.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Público:</span>
                      <p className="font-medium">
                        {audienceOptions.find(opt => opt.value === formData.audience)?.label}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Alcance:</span>
                      <p className="font-medium">{formData.audienceSize} clientes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Mensagem</h4>
                  <p className="text-sm bg-muted p-3 rounded">
                    {formData.message}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Agendamento</h4>
                  <p className="text-sm">
                    {formData.scheduledDate ? 
                      `📅 ${format(formData.scheduledDate, "PPP", { locale: ptBR })} às ${formData.scheduledTime}` :
                      "📤 Envio imediato"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Campanha</DialogTitle>
          <DialogDescription>
            Passo {currentStep} de {totalSteps}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Tipo e Público</span>
              <span>Mensagem</span>
              <span>Agendamento</span>
              <span>Revisão</span>
            </div>
          </div>

          {renderStep()}

          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              
              {currentStep === totalSteps ? (
                <Button onClick={handleFinish} disabled={!canProceed()}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Criar Campanha
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Próximo
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}