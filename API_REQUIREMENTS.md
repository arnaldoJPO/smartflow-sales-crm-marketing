# Requisitos de API para o SmartFlow Sales

Este documento lista os endpoints necessários no backend para que o frontend funcione sem dados mockados.

## Autenticação
- POST /auth/login: e-mail e senha, retorna token de sessão.
- POST /auth/register
- POST /auth/logout
- GET /auth/me: retorna usuário e restaurante atual.

## Clientes (CRM)
- GET /api/clients: lista clientes do restaurante atual.
- POST /api/clients
- PUT /api/clients/:id
- DELETE /api/clients/:id

## Pedidos (Orders)
- GET /api/orders: lista pedidos do restaurante atual.
  - Response exemplo:
  ```json
  { "orders": [{
    "id": "uuid",
    "order_number": "#12345",
    "customer_id": "uuid",
    "total": 120.5,
    "payment_method": "pix|card|cash",
    "status": "completed|pending|canceled",
    "created_at": "2024-08-01T12:34:56.000Z",
    "items": [{ "product_id": "p1", "name": "Pizza", "quantity": 2, "total": 80 }]
  }]}
  ```
- POST /api/payments/link: gerar link de pagamento
  - Body: `{ "order_id": "uuid", "provider": "stripe" | "mercadopago" }`
  - Response: `{ "url": "https://..." }`
  - Observação: implementar no backend a criação via Stripe Checkout Session ou Mercado Pago Preference.

## Campanhas
- GET /api/campaigns: retorna `{ active: [], scheduled: [], completed: [], drafts: [] }` com os campos utilizados em `src/pages/Campaigns.tsx`.
- POST /api/campaigns: criação de campanhas.
- POST /api/campaigns/:id/send: aciona envio (pode disparar Supabase Function `campaign-processor`).

## Relatórios / Dashboard
O frontend chama Supabase Edge Functions diretamente:
- POST {VITE_SUPABASE_URL}/functions/v1/report-generator
  - Headers: `Authorization: Bearer {VITE_SUPABASE_ANON_KEY}`
  - Body: `{ type, period, start_date?, end_date?, restaurant_id, export_format? }`

Configurar no Supabase:
- Buckets de storage: `reports` (público) para exportação.
- Tabelas conforme migrations em `supabase/migrations/001_initial_schema.sql`.

## Mensageria
### WhatsApp
- Supabase Function: `whatsapp-sender`
  - POST {VITE_SUPABASE_URL}/functions/v1/whatsapp-sender
  - Body: `{ to: "+5511999999999", message: "...", media_url? }`
  - Secrets: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`

### Email (SES)
- Supabase Function: `email-sender`
  - POST {VITE_SUPABASE_URL}/functions/v1/email-sender
  - Body: `{ to, subject, html_content, text_content?, template_id?, template_data? }`
  - Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SES_REGION`, `SES_SENDER_EMAIL`, `SES_REPLY_TO_EMAIL`

### Processamento de Campanhas
- Supabase Function: `campaign-processor`
  - POST {VITE_SUPABASE_URL}/functions/v1/campaign-processor
  - Body: `{ campaignId: "uuid", action: "send" | "schedule" }`
  - Secrets adicionais: `AWS_SQS_WHATSAPP_QUEUE_URL`, `AWS_SQS_SMS_QUEUE_URL`

## Variáveis de Ambiente (Frontend)
- `VITE_API_BASE_URL`: base URL do backend próprio (para `/api/clients`, `/api/orders`, `/api/campaigns`, `/api/payments/link`).
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`: chamadas às edge functions.

## Observações
- Todos endpoints devem respeitar o restaurante do usuário logado (multi-tenant) utilizando o token de autenticação.
- CORS: habilitar para o domínio do frontend.

## Integrações (Backend)

### WhatsApp (Twilio)
- PUT /api/integrations/whatsapp
  - Body: `{ credentials: { accountSid, authToken }, config: { senderNumber } }`
  - Persiste `credentials` (criptografadas) e `config` em `integrations` (name: "whatsapp").
- GET /api/integrations (retorna todas)
  - Response: `{ integrations: [{ name, status, config, credentials?: { accountSid } }] }`
- Teste de envio usa Supabase Edge Function `whatsapp-sender` já existente (frontend chama direto via `VITE_SUPABASE_URL`).

### Facebook/Instagram (Meta OAuth)
- GET /api/integrations/facebook/connect
  - Retorna `{ url }` para iniciar OAuth (scopes: `pages_read_engagement, instagram_basic`).
- GET /api/integrations/facebook/callback
  - Processa code, salva tokens em `integrations` (name: "facebook"), `status: active`.
- DELETE /api/integrations/facebook
  - Revoga/desativa a integração.

### Stripe
- PUT /api/integrations/stripe
  - Body: `{ config: { publishableKey }, credentials: { secretKey } }`
- Uso no frontend: geração de link de pagamento via `POST /api/payments/link`.

### Mercado Pago
- PUT /api/integrations/mercadopago
  - Body: `{ config: { publicKey }, credentials: { accessToken } }`
- Uso no frontend: geração de link de pagamento via `POST /api/payments/link`.

### Usuários (múltiplos logins e permissões)
- GET /api/users → `{ users: [{ id, email, role, status }] }`
- POST /api/users/invite → body `{ email, role }`
- PUT /api/users/:id/role → body `{ role }`
- POST /api/users/:id/disable
- GET /auth/me → `{ id, email, role, plan, restaurant_id }`

Notas de segurança:
- Credenciais devem ser armazenadas criptografadas (ex.: KMS/Hashicorp Vault) e nunca retornadas integrais ao frontend.
- Aplicar RLS e verificação de `restaurant_id` em todas as rotas.
