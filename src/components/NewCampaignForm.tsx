
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface NewCampaignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignCreated?: (campaign: any) => void;
}

export function NewCampaignForm({ open, onOpenChange, onCampaignCreated }: NewCampaignFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    message: "",
    audience: "",
    scheduledDate: "",
    scheduledTime: ""
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newCampaign = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      status: formData.scheduledDate ? "Agendada" : "Ativa",
      message: formData.message,
      audience: formData.audience === "all" ? 320 : 150,
      scheduledFor: formData.scheduledDate && formData.scheduledTime 
        ? `${formData.scheduledDate} ${formData.scheduledTime}` 
        : null,
      created: new Date().toISOString().split('T')[0],
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0
    };

    onCampaignCreated?.(newCampaign);
    
    toast({
      title: "Campanha criada!",
      description: `A campanha "${formData.name}" foi ${newCampaign.status === "Agendada" ? "agendada" : "criada"} com sucesso.`,
    });

    // Reset form
    setFormData({
      name: "",
      type: "",
      message: "",
      audience: "",
      scheduledDate: "",
      scheduledTime: ""
    });

    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Campanha</DialogTitle>
          <DialogDescription>
            Crie uma nova campanha de marketing para seus clientes.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Campanha *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Happy Hour Especial"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="type">Tipo da Campanha *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
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
          </div>

          <div>
            <Label htmlFor="message">Mensagem da Campanha *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Digite a mensagem que será enviada aos clientes..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="audience">Público-Alvo</Label>
            <Select value={formData.audience} onValueChange={(value) => handleInputChange("audience", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o público" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes (320)</SelectItem>
                <SelectItem value="active">Clientes ativos (150)</SelectItem>
                <SelectItem value="vip">Clientes VIP (45)</SelectItem>
                <SelectItem value="new">Novos clientes (80)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate">Data de Envio (Opcional)</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="scheduledTime">Horário de Envio (Opcional)</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange("scheduledTime", e.target.value)}
                disabled={!formData.scheduledDate}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {formData.scheduledDate ? "Agendar Campanha" : "Criar Campanha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
