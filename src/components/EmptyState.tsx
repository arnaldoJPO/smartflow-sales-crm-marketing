import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import { FileText, Users, BarChart3, Search, Zap } from "lucide-react";

// Pre-built empty states for common scenarios
export const EmptyCampaigns = ({ onCreateCampaign }: { onCreateCampaign: () => void }) => {
  return (
    <EmptyState
      icon={FileText}
      title="Nenhuma campanha encontrada"
      description="Você ainda não criou nenhuma campanha. Comece criando sua primeira campanha de marketing."
      action={{
        label: "Criar primeira campanha",
        onClick: onCreateCampaign
      }}
    />
  );
};

export const EmptyClients = ({ onAddClient }: { onAddClient: () => void }) => {
  return (
    <EmptyState
      icon={Users}
      title="Nenhum cliente cadastrado"
      description="Sua lista de clientes está vazia. Adicione o primeiro cliente para começar."
      action={{
        label: "Adicionar cliente",
        onClick: onAddClient
      }}
    />
  );
};

export const EmptyReports = () => {
  return (
    <EmptyState
      icon={BarChart3}
      title="Dados insuficientes"
      description="Não há dados suficientes para gerar relatórios. Execute algumas campanhas primeiro."
    />
  );
};

export const EmptySearch = ({ query }: { query: string }) => {
  return (
    <EmptyState
      icon={Search}
      title={`Nenhum resultado para "${query}"`}
      description="Tente ajustar sua busca ou usar outros termos."
    />
  );
};

export const EmptyIntegrations = ({ onSetupIntegration }: { onSetupIntegration: () => void }) => {
  return (
    <EmptyState
      icon={Zap}
      title="Nenhuma integração configurada"
      description="Configure suas integrações para automatizar processos e sincronizar dados."
      action={{
        label: "Configurar integrações",
        onClick: onSetupIntegration
      }}
    />
  );
};
