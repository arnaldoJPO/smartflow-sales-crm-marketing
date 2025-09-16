# Checklist do Projeto SmartFlow Sales

## 🟢 Funcionalidades Implementadas

### Frontend
- [x] Dashboard integrado (Supabase Edge) com guards de ambiente e exportação CSV
- [x] Gestão de Clientes (lista, filtros) consumindo `VITE_API_BASE_URL` (sem mocks)
- [x] Campanhas (abas Ativas/Agendadas/Concluídas/Rascunhos) sem mocks; métricas derivadas
- [x] Relatórios com Supabase (`report-generator`) e estados vazios quando sem env
- [x] Pedidos (nova página `/orders`) com listagem via `/api/orders`
- [x] Geração de Link de Pagamento (Stripe/Mercado Pago) via `/api/payments/link`
- [x] Configurações → Integrações reais:
  - WhatsApp (Twilio): salvar credenciais e enviar mensagem de teste via função edge
  - Stripe: salvar publishable/secret keys
  - Mercado Pago: salvar public key/access token
  - Facebook/Instagram: iniciar OAuth e desconexão
- [x] Configurações → Usuários: convite, alteração de papel e desativação (via endpoints backend)
- [x] Controle de acesso: helper `Access` por `roles`/`plans` consumindo `/auth/me` (permissivo sem backend)
- [x] Navegação/Rotas: item "Pedidos" no sidebar e rota `/orders`
- [x] Página de Vendas (Index) atualizada com novos planos e preços
- [x] Limites por plano (frontend):
  - Básico: 1 usuário
  - Intermediário: até 3 usuários
  - Premium: ilimitado

### Banco/Supabase/Infra já no repo
- [x] Migrations com tabelas (customers, campaigns, messages, orders, reports, integrations, profiles) e RLS
- [x] Triggers para estatísticas (clientes, campanhas) e `updated_at`
- [x] Edge Functions: `report-generator`, `whatsapp-sender`, `email-sender`, `campaign-processor`
- [x] Documentação de APIs necessárias em `API_REQUIREMENTS.md`

## 🟠 Dependências de Backend (a implementar)

### Autenticação e Contexto
- [ ] `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me` (retornar `{ id, email, role, plan, restaurant_id }`)
- [ ] Multi-tenant por `restaurant_id` em todas as rotas; CORS

### CRM Clientes
- [ ] `/api/clients` CRUD completo (lista já consumida no frontend)

### Pedidos
- [ ] `/api/orders` (lista) conforme schema em `API_REQUIREMENTS.md`
- [ ] Webhooks de pagamento (Stripe/Mercado Pago) para atualizar pedidos

### Campanhas
- [ ] `/api/campaigns` CRUD
- [ ] `/api/campaigns/:id/send` (aciona `campaign-processor`)

### Pagamentos (Links)
- [ ] `/api/payments/link` (Stripe Checkout Session ou Mercado Pago Preference)

### Integrações
- [ ] WhatsApp (Twilio): `PUT /api/integrations/whatsapp`, `GET /api/integrations`
- [ ] Stripe: `PUT /api/integrations/stripe`
- [ ] Mercado Pago: `PUT /api/integrations/mercadopago`
- [ ] Facebook/Instagram (Meta OAuth): `GET /api/integrations/facebook/connect`, `GET /api/integrations/facebook/callback`, `DELETE /api/integrations/facebook`

### Usuários e Permissões
- [ ] `GET /api/users`, `POST /api/users/invite`, `PUT /api/users/:id/role`, `POST /api/users/:id/disable`
- [ ] Aplicar limites por plano no backend (enforcar no servidor)
- [ ] Autorização por papel (owner/admin/manager/staff) em todas as rotas

### Relatórios/Dashboard
- [ ] Expandir `report-generator` para "atividades recentes" e "alertas"

## 🧪 Testes e Observabilidade
- [ ] Testes unitários e E2E (frontend e backend)
- [ ] Logs estruturados e monitoramento (métricas essenciais, alertas)

## 🔧 Ambiente e Variáveis
### Frontend (.env.local)
- [ ] `VITE_API_BASE_URL`
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`

### Backend
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] AWS (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_SES_REGION`)
- [ ] Twilio (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`)
- [ ] Stripe (`STRIPE_SECRET_KEY`, etc.)
- [ ] Mercado Pago (`MP_ACCESS_TOKEN`, etc.)
- [ ] JWT Secret e CORS

## 📊 Métricas de Sucesso (alvos)
- [ ] Entrega de mensagens > 95%
- [ ] P95 de APIs < 200ms
- [ ] Conversão de campanhas > 5%
- [ ] Taxa de erro < 1%

---

Este checklist reflete o estado atual: frontend preparado, integrações configuráveis na UI e funções Supabase prontas; resta implementação dos endpoints e governança (auth, limites de plano e papéis) no backend.