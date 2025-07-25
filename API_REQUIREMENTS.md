# 🔄 Funcionalidades com Dados Reais - SmartFlow Sales

## ⚠️ APIs Obrigatórias para Funcionamento Completo

As seguintes funcionalidades foram atualizadas para usar dados reais e **REQUEREM** as APIs correspondentes para funcionar corretamente:

### 1. **Dashboard** (`src/pages/Dashboard.tsx`)
- **API Necessária**: `POST /supabase/functions/report-generator`
- **Payload**: 
  ```json
  {
    "type": "dashboard",
    "period": "month",
    "restaurant_id": "your-restaurant-id"
  }
  ```
- **Funcionalidade**: Carrega dados reais de vendas, métricas e gráficos
- **Status**: ✅ Implementado com dados reais

### 2. **Gestão de Campanhas** (`src/pages/Campaigns.tsx`)
- **API Necessária**: `GET /api/campaigns`
- **Resposta Esperada**:
  ```json
  {
    "active": [...],
    "scheduled": [...],
    "completed": [...],
    "drafts": [...]
  }
  ```
- **Funcionalidade**: Lista campanhas por status, métricas de performance
- **Status**: ✅ Implementado com dados reais

### 3. **Gestão de Clientes** (`src/pages/Clients.tsx`)
- **API Necessária**: `GET /api/clients`
- **Resposta Esperada**:
  ```json
  {
    "clients": [
      {
        "id": 1,
        "name": "Nome do Cliente",
        "email": "email@exemplo.com",
        "phone": "(11) 99999-9999",
        "score": 85,
        "status": "Ativo",
        "lastOrder": "2024-01-15",
        "totalSpent": 1250.50,
        "orders": 12
      }
    ]
  }
  ```
- **Funcionalidade**: Lista clientes, filtros, segmentação
- **Status**: ✅ Implementado com dados reais

## 🚧 APIs Pendentes de Implementação

Para que todas as funcionalidades funcionem com dados reais, as seguintes APIs precisam ser implementadas:

1. **`GET /api/campaigns`** - Endpoint para listar campanhas por status
2. **`GET /api/clients`** - Endpoint para listar clientes com filtros
3. **Melhorias no `report-generator`** - Adicionar dados de atividades recentes e alertas

## 📋 Como Implementar as APIs Pendentes

### 1. API de Campanhas (`/api/campaigns`)
```javascript
// Exemplo de implementação
app.get('/api/campaigns', async (req, res) => {
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('restaurant_id', req.user.restaurant_id);
  
  const grouped = {
    active: campaigns.filter(c => c.status === 'Ativa'),
    scheduled: campaigns.filter(c => c.status === 'Agendada'),
    completed: campaigns.filter(c => c.status === 'Concluída'),
    drafts: campaigns.filter(c => c.status === 'Rascunho')
  };
  
  res.json(grouped);
});
```

### 2. API de Clientes (`/api/clients`)
```javascript
// Exemplo de implementação
app.get('/api/clients', async (req, res) => {
  const { data: clients } = await supabase
    .from('customers')
    .select(`
      *,
      orders (*)
    `)
    .eq('restaurant_id', req.user.restaurant_id);
  
  const processedClients = clients.map(client => ({
    ...client,
    totalSpent: client.orders?.reduce((sum, order) => sum + order.total, 0) || 0,
    orders: client.orders?.length || 0,
    score: calculateCustomerScore(client),
    status: determineCustomerStatus(client)
  }));
  
  res.json({ clients: processedClients });
});
```

### 3. Melhorias no Report Generator
```javascript
// Adicionar ao supabase/functions/report-generator/index.ts
async function getRecentActivities(restaurant_id: string) {
  const activities = [];
  
  // Buscar campanhas recentes
  const { data: recentCampaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('restaurant_id', restaurant_id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Buscar novos clientes
  const { data: newCustomers } = await supabase
    .from('customers')
    .select('*')
    .eq('restaurant_id', restaurant_id)
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Processar e formatar atividades
  return activities;
}

async function getAlerts(restaurant_id: string) {
  const alerts = [];
  
  // Clientes em risco (sem pedidos há 30+ dias)
  const { data: riskCustomers } = await supabase
    .from('customers')
    .select('*')
    .eq('restaurant_id', restaurant_id)
    .lt('last_order_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  
  if (riskCustomers?.length > 0) {
    alerts.push({
      id: 1,
      title: "Clientes em Risco",
      description: `${riskCustomers.length} clientes não fazem pedidos há mais de 30 dias`,
      type: "warning",
      action: "Ver Lista"
    });
  }
  
  return alerts;
}
```

## 🔧 Configuração para Desenvolvimento

### Variáveis de Ambiente Necessárias
```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Executar o Projeto
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Acessar em http://localhost:8080
```

## 📝 Notas Importantes

1. **Dados Mock vs Reais**: As páginas Dashboard, Campaigns e Clients foram atualizadas para buscar dados reais das APIs. Sem as APIs implementadas, elas mostrarão dados vazios ou mensagens de erro.

2. **Autenticação**: As APIs precisam implementar autenticação para identificar o `restaurant_id` do usuário logado.

3. **Tratamento de Erros**: Todas as páginas implementam tratamento básico de erros com toast notifications.

4. **Loading States**: Estados de carregamento foram implementados para melhor UX durante as requisições.

5. **Supabase Functions**: A função `report-generator` já existe e funciona, mas pode ser expandida para incluir mais dados como atividades recentes e alertas.
