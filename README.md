# SmartFlow Sales - CRM & Marketing Automation Platform

## 🎉 **NOVIDADES 2024** - Versão 1.0 Lançada!

### ✅ **Migração Completa para Supabase**
- **Sistema 100% funcional** com dados reais
- **Autenticação integrada** via Supabase Auth
- **Dashboard dinâmico** com KPIs em tempo real
- **Avatar inteligente** com iniciais personalizadas

---

## 📋 Visão Geral

SmartFlow Sales é uma plataforma completa de CRM e automação de marketing projetada especificamente para restaurantes e pequenas empresas. A plataforma oferece gestão de clientes, campanhas automatizadas, integração com WhatsApp, análises em tempo real e muito mais.

## 🚀 Recursos Principais

### Frontend - ✅ **ATUALIZADO 2024**
- **Dashboard Interativo**: KPIs reais em tempo real via Supabase
- **Gestão de Clientes**: Listagem dinâmica com dados reais do banco
- **Campanhas de Marketing**: Status e métricas reais do Supabase
- **Relatórios**: Geração dinâmica com dados reais
- **Pedidos**: Integração completa com sistema de pedidos
- **Links de Pagamento**: Integração pronta com Stripe/Mercado Pago
- **Integrações Configuráveis**: WhatsApp, Facebook, Instagram ativos
- **Avatar Inteligente**: Iniciais personalizadas do usuário logado
- **Interface Responsiva**: Modo claro/escuro com shadcn/ui

### Backend - ✅ **INTEGRADO**
- **Autenticação Supabase**: JWT e multi-tenant funcional
- **APIs RESTful**: Todos endpoints migrados para Supabase
- **Dados em Tempo Real**: Integração completa com Supabase Realtime

### Backend
- **Autenticação Segura**: JWT e multi-tenant por restaurante (a implementar)
- **APIs RESTful**: Endpoints descritos em `API_REQUIREMENTS.md`
- **Supabase Functions**: `report-generator`, `campaign-processor`, `whatsapp-sender`, `email-sender`
- **AWS**: SQS/SES (para filas e emails)

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

## 🔧 Configuração e Instalação - ✅ **SIMPLIFICADA**

### 1. Pré-requisitos
- Node.js 18+
- Conta Supabase (ativa)
- Variáveis de ambiente configuradas (ver abaixo)

### 2. Instalação Rápida
```bash
# Clone o repositório
git clone https://github.com/srgatocoursesonline/smartflowcrm.git
cd smartflowcrm

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Inicie o servidor
npm run dev
```

### 2. Variáveis de Ambiente

Frontend (`.env.local`):
```bash
VITE_API_BASE_URL=https://seu-backend
VITE_SUPABASE_URL=https://sua-instancia.supabase.co
VITE_SUPABASE_ANON_KEY=chave_anon
```

Supabase (secrets):
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS Services
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_SES_REGION=us-east-1

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Email Templates
SES_SENDER_EMAIL=noreply@yourcompany.com
SES_REPLY_TO_EMAIL=support@yourcompany.com
```

### 3. Backend (APIs)
Consulte `API_REQUIREMENTS.md` para a lista completa de endpoints (Clientes, Pedidos, Campanhas, Pagamentos, Integrações, Usuários, Auth).

### 4. Configuração AWS

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

### 5. Configuração Twilio

1. **WhatsApp Business Account**:
   - Registre sua conta business
   - Configure webhook endpoints
   - Obtenha números aprovados

2. **Sandbox (Desenvolvimento)**:
   - Use número sandbox: `whatsapp:+14155238886`
   - Configure webhooks para desenvolvimento

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

## 🧾 Planos (Página de Vendas)
- **Básico – R$ 67/mês**: CRM, Pedidos, Link de pagamento, 1 login. WhatsApp cobrado por uso.
- **Intermediário – R$ 147/mês**: Tudo do Básico + Dashboard de Analytics, Integração Instagram/Facebook, Automações básicas, até 3 logins. WhatsApp por uso.
- **Premium – R$ 297/mês**: Tudo do Intermediário + Automações avançadas, Acesso via API, Logins ilimitados com permissões, Suporte prioritário. WhatsApp por uso.

Limites implementados no frontend: 1/3/ilimitado usuários conforme plano. A validação final deve ocorrer no backend ao convidar/criar usuários.
