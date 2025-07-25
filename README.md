# SmartFlow Sales - CRM & Marketing Automation Platform

## 📋 Visão Geral

SmartFlow Sales é uma plataforma completa de CRM e automação de marketing projetada especificamente para restaurantes e pequenas empresas. A plataforma oferece gestão de clientes, campanhas automatizadas, integração com WhatsApp, análises em tempo real e muito mais.

## 🚀 Recursos Principais

### Frontend
- **Dashboard Interativo**: Analytics em tempo real com gráficos e KPIs
- **Gestão de Clientes**: CRUD completo com segmentação e histórico
- **Campanhas de Marketing**: Wizard de criação com 4 passos, templates e A/B testing
- **Relatórios Avançados**: Filtros, exportação PDF/Excel, gráficos interativos
- **Integração WhatsApp**: Envio automatizado de mensagens
- **Interface Responsiva**: Design moderno com modo claro/escuro
- **Busca Global**: Com atalhos de teclado e filtros avançados

### Backend
- **Autenticação Segura**: Supabase Auth com JWT
- **Database PostgreSQL**: Estrutura otimizada com RLS
- **APIs RESTful**: Express.js + TypeScript
- **Processamento Assíncrono**: AWS Lambda Functions
- **Filas de Mensagens**: AWS SQS para alta disponibilidade
- **Envio de Emails**: AWS SES com templates
- **SMS/WhatsApp**: Integração Twilio
- **Real-time**: Supabase subscriptions
- **File Storage**: Supabase Storage para uploads

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Supabase      │    │   AWS Services  │
│   (Frontend)    │◄──►│   Backend       │◄──►│   (Lambda/SQS)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Stack Tecnológica

**Frontend:**
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS + shadcn/ui
- React Router Dom
- TanStack Query
- Recharts (Gráficos)

**Backend:**
- Node.js 18+ 
- Express.js + TypeScript
- Supabase (Database + Auth + Storage)
- AWS Lambda (Serverless Functions)
- AWS SQS (Message Queues)
- AWS SES (Email Service)
- Twilio (SMS/WhatsApp)

## 📊 Schema do Banco de Dados

### Tabelas Principais

1. **profiles** - Perfis de usuários
2. **restaurants** - Dados dos restaurantes
3. **customers** - Clientes dos restaurantes
4. **campaigns** - Campanhas de marketing
5. **messages** - Mensagens enviadas
6. **reports** - Relatórios gerados
7. **integrations** - Configurações de integração

## 🔧 Configuração e Instalação

### 1. Pré-requisitos
- Node.js 18+
- Conta Supabase
- Conta AWS (Lambda, SQS, SES)
- Conta Twilio (opcional)

### 2. Variáveis de Ambiente (Supabase Secrets)

Configure os seguintes secrets no Supabase:

```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS Services
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_SQS_QUEUE_URL=your_sqs_queue_url
AWS_SES_REGION=us-east-1

# Twilio (WhatsApp/SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# JWT
JWT_SECRET=your_jwt_secret_key

# Email Templates
SES_SENDER_EMAIL=noreply@yourcompany.com
SES_REPLY_TO_EMAIL=support@yourcompany.com
```

### 3. Configuração AWS

#### Lambda Functions
1. Crie funções Lambda para:
   - `campaign-processor`: Processamento de campanhas
   - `email-sender`: Envio de emails
   - `whatsapp-sender`: Envio WhatsApp
   - `report-generator`: Geração de relatórios

#### SQS Queues
1. `campaign-queue`: Fila para campanhas
2. `email-queue`: Fila para emails
3. `whatsapp-queue`: Fila para WhatsApp

#### SES Configuration
1. Verifique domínio/email remetente
2. Configure templates de email
3. Ajuste limites de envio

### 4. Configuração Twilio

1. **WhatsApp Business Account**:
   - Registre sua conta business
   - Configure webhook endpoints
   - Obtenha números aprovados

2. **Sandbox (Desenvolvimento)**:
   - Use número sandbox: `whatsapp:+14155238886`
   - Configure webhooks para desenvolvimento

## 🔌 APIs e Endpoints

### Authentication
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de usuário
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do usuário atual

### Customers
- `GET /customers` - Listar clientes
- `POST /customers` - Criar cliente
- `PUT /customers/:id` - Atualizar cliente
- `DELETE /customers/:id` - Deletar cliente
- `GET /customers/:id/history` - Histórico do cliente

### Campaigns
- `GET /campaigns` - Listar campanhas
- `POST /campaigns` - Criar campanha
- `PUT /campaigns/:id` - Atualizar campanha
- `DELETE /campaigns/:id` - Deletar campanha
- `POST /campaigns/:id/send` - Enviar campanha
- `GET /campaigns/:id/analytics` - Analytics da campanha

### Messages
- `GET /messages` - Histórico de mensagens
- `POST /messages/whatsapp` - Enviar WhatsApp
- `POST /messages/email` - Enviar email
- `POST /messages/sms` - Enviar SMS

### Reports
- `GET /reports/dashboard` - Dados do dashboard
- `GET /reports/sales` - Relatório de vendas
- `POST /reports/export` - Exportar relatórios

## 📱 Integrações

### WhatsApp Business API

1. **Configuração**:
```javascript
// Webhook para receber mensagens
app.post('/webhook/whatsapp', (req, res) => {
  const { messages } = req.body;
  // Processar mensagens recebidas
});

// Enviar mensagem
const sendWhatsApp = async (to, message) => {
  await twilio.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${to}`,
    body: message
  });
};
```

### PDV Integration

1. **API Keys**: Configure no painel de configurações
2. **Webhooks**: Receba dados de vendas em tempo real
3. **Sync**: Sincronização automática de clientes

## 🚀 Deploy e Produção

### Supabase Edge Functions
```bash
# Deploy function
supabase functions deploy campaign-processor

# Set secrets
supabase secrets set --env-file .env.production
```

### AWS Lambda Deploy
```bash
# Package and deploy
npm run build:lambda
aws lambda update-function-code --function-name campaign-processor
```

## 🔒 Segurança

### Row Level Security (RLS)
- Todas as tabelas possuem políticas RLS
- Usuários só acessam seus próprios dados
- Auditoria completa de ações

### Validação
- Validação de entrada em todas APIs
- Sanitização de dados
- Rate limiting implementado

## 📈 Performance

### Otimizações Frontend
- Lazy loading de componentes
- Virtual scrolling em listas
- Debounced search
- Code splitting por rota

### Otimizações Backend
- Indexes otimizados no banco
- Cache de queries frequentes
- Processamento assíncrono
- Connection pooling

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
npm run test:api

# E2E tests
npm run test:e2e
```

## 📊 Monitoring

### Métricas Importantes
- Response time das APIs
- Taxa de entrega de mensagens
- Conversão de campanhas
- Erro rates

### Logs
- Structured logging com Winston
- Correlação de requests
- Error tracking

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob licença MIT. Veja o arquivo LICENSE para detalhes.

## 📞 Suporte

- **Email**: support@smartflow.com
- **Discord**: [SmartFlow Community](https://discord.gg/smartflow)
- **Documentação**: [docs.smartflow.com](https://docs.smartflow.com)

---

**SmartFlow Sales** - Desenvolvido com ❤️ para revolucionar o marketing de restaurantes.

## Como editar este código

Existem várias maneiras de editar sua aplicação:

**Use Lovable**

Visite o [Projeto Lovable](https://lovable.dev/projects/1747bab2-3f5d-4ce1-82b4-4be352dff476) e comece a usar prompts.

**Use seu IDE preferido**

Clone este repo e faça push das mudanças:

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

## Como fazer deploy

Abra [Lovable](https://lovable.dev/projects/1747bab2-3f5d-4ce1-82b4-4be352dff476) e clique em Share -> Publish.
