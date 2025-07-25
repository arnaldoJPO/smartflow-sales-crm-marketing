-- Seed data for SmartFlow Sales

-- Insert sample restaurant (you'll need to replace the owner_id with actual user ID after signup)
INSERT INTO public.restaurants (id, owner_id, name, description, address, phone, email, website, business_hours, settings) VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'Restaurante Demo',
  'Restaurante de demonstração para o SmartFlow Sales',
  'Rua das Flores, 123, Centro, São Paulo - SP',
  '+55 11 99999-9999',
  'contato@restaurantedemo.com',
  'https://restaurantedemo.com',
  '{
    "monday": {"open": "11:00", "close": "22:00"},
    "tuesday": {"open": "11:00", "close": "22:00"},
    "wednesday": {"open": "11:00", "close": "22:00"},
    "thursday": {"open": "11:00", "close": "22:00"},
    "friday": {"open": "11:00", "close": "23:00"},
    "saturday": {"open": "11:00", "close": "23:00"},
    "sunday": {"open": "11:00", "close": "21:00"}
  }',
  '{
    "currency": "BRL",
    "timezone": "America/Sao_Paulo",
    "language": "pt-BR",
    "notifications": {
      "email": true,
      "whatsapp": true,
      "dashboard": true
    }
  }'
);

-- Insert sample customers
INSERT INTO public.customers (restaurant_id, name, email, phone, whatsapp, birth_date, gender, tags, preferences, total_orders, total_spent, average_order_value, customer_since, status) VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'João Silva',
  'joao.silva@email.com',
  '+5511999999999',
  '+5511999999999',
  '1985-03-15',
  'M',
  ARRAY['vip', 'frequente'],
  '{"favorite_dishes": ["pizza", "hamburguer"], "dietary_restrictions": [], "preferred_contact": "whatsapp"}',
  25,
  1250.00,
  50.00,
  '2023-01-15 10:00:00+00',
  'active'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Maria Santos',
  'maria.santos@email.com',
  '+5511888888888',
  '+5511888888888',
  '1990-07-22',
  'F',
  ARRAY['novo', 'promocao'],
  '{"favorite_dishes": ["salada", "sushi"], "dietary_restrictions": ["vegetariano"], "preferred_contact": "email"}',
  8,
  320.00,
  40.00,
  '2024-03-01 14:30:00+00',
  'active'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Pedro Oliveira',
  'pedro.oliveira@email.com',
  '+5511777777777',
  '+5511777777777',
  '1978-12-05',
  'M',
  ARRAY['executivo', 'almoco'],
  '{"favorite_dishes": ["prato_executivo", "risotto"], "dietary_restrictions": [], "preferred_contact": "whatsapp"}',
  45,
  2700.00,
  60.00,
  '2022-08-10 11:15:00+00',
  'active'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Ana Costa',
  'ana.costa@email.com',
  '+5511666666666',
  '+5511666666666',
  '1995-04-18',
  'F',
  ARRAY['jovem', 'final_semana'],
  '{"favorite_dishes": ["pizza", "sobremesa"], "dietary_restrictions": [], "preferred_contact": "whatsapp"}',
  12,
  480.00,
  40.00,
  '2023-11-20 19:45:00+00',
  'active'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Carlos Ferreira',
  'carlos.ferreira@email.com',
  '+5511555555555',
  '+5511555555555',
  '1982-09-30',
  'M',
  ARRAY['familia', 'domingo'],
  '{"favorite_dishes": ["churrasco", "feijoada"], "dietary_restrictions": [], "preferred_contact": "whatsapp"}',
  18,
  900.00,
  50.00,
  '2023-06-12 13:20:00+00',
  'active'
);

-- Insert sample campaigns
INSERT INTO public.campaigns (restaurant_id, created_by, name, description, type, status, message, customer_segment, scheduled_at, sent_count, delivered_count, opened_count, clicked_count, open_rate, click_rate, a_b_test, settings) VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'Promoção Pizza Especial',
  'Campanha promocional para pizza especial no final de semana',
  'whatsapp',
  'sent',
  'Olá {{name}}! 🍕 Que tal uma Pizza Especial neste final de semana? 50% OFF em todas as pizzas grandes! Válido até domingo. Peça já pelo WhatsApp!',
  ARRAY['vip', 'final_semana'],
  '2024-01-15 16:00:00+00',
  150,
  145,
  120,
  45,
  82.75,
  37.50,
  false,
  '{"priority": "high", "auto_retry": true}'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'Newsletter Mensal',
  'Newsletter com novidades e promoções do mês',
  'email',
  'sent',
  'Olá {{name}}, confira as novidades deste mês no nosso restaurante! Novos pratos, promoções especiais e muito mais.',
  ARRAY['todos'],
  '2024-01-01 09:00:00+00',
  200,
  195,
  140,
  35,
  71.79,
  25.00,
  false,
  '{"template": "newsletter", "images": true}'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'Almoço Executivo',
  'Promoção do almoço executivo para público corporativo',
  'whatsapp',
  'scheduled',
  'Bom dia {{name}}! Que tal um almoço executivo delicioso hoje? Pratos especiais a partir de R$ 25,90. Reserve sua mesa!',
  ARRAY['executivo', 'almoco'],
  '2024-01-25 10:30:00+00',
  0,
  0,
  0,
  0,
  0,
  0,
  true,
  '{"ab_test": {"version_a": "pratos especiais", "version_b": "menu completo"}}'
);

-- Insert sample orders
INSERT INTO public.orders (restaurant_id, customer_id, order_number, total, subtotal, tax, discount, payment_method, status, items, source) VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  (SELECT id FROM public.customers WHERE email = 'joao.silva@email.com'),
  'ORD-2024-001',
  45.90,
  42.00,
  3.90,
  0.00,
  'pix',
  'completed',
  '[
    {"name": "Pizza Margherita", "quantity": 1, "price": 32.00, "total": 32.00},
    {"name": "Refrigerante", "quantity": 2, "price": 5.00, "total": 10.00}
  ]',
  'pos'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  (SELECT id FROM public.customers WHERE email = 'maria.santos@email.com'),
  'ORD-2024-002',
  28.50,
  25.00,
  3.50,
  0.00,
  'cartao',
  'completed',
  '[
    {"name": "Salada Caesar", "quantity": 1, "price": 18.00, "total": 18.00},
    {"name": "Suco Natural", "quantity": 1, "price": 7.00, "total": 7.00}
  ]',
  'app'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  (SELECT id FROM public.customers WHERE email = 'pedro.oliveira@email.com'),
  'ORD-2024-003',
  35.90,
  32.00,
  3.90,
  0.00,
  'pix',
  'completed',
  '[
    {"name": "Prato Executivo", "quantity": 1, "price": 25.00, "total": 25.00},
    {"name": "Água", "quantity": 1, "price": 3.00, "total": 3.00},
    {"name": "Sobremesa", "quantity": 1, "price": 4.00, "total": 4.00}
  ]',
  'pos'
);

-- Insert sample messages
INSERT INTO public.messages (restaurant_id, campaign_id, customer_id, type, content, status, sent_at, delivered_at, opened_at, clicked_at, external_id) VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  (SELECT id FROM public.campaigns WHERE name = 'Promoção Pizza Especial'),
  (SELECT id FROM public.customers WHERE email = 'joao.silva@email.com'),
  'whatsapp',
  'Olá João Silva! 🍕 Que tal uma Pizza Especial neste final de semana? 50% OFF em todas as pizzas grandes! Válido até domingo. Peça já pelo WhatsApp!',
  'clicked',
  '2024-01-15 16:05:00+00',
  '2024-01-15 16:05:30+00',
  '2024-01-15 16:12:00+00',
  '2024-01-15 16:15:00+00',
  'twilio_msg_001'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  (SELECT id FROM public.campaigns WHERE name = 'Newsletter Mensal'),
  (SELECT id FROM public.customers WHERE email = 'maria.santos@email.com'),
  'email',
  'Olá Maria Santos, confira as novidades deste mês no nosso restaurante! Novos pratos, promoções especiais e muito mais.',
  'opened',
  '2024-01-01 09:10:00+00',
  '2024-01-01 09:10:15+00',
  '2024-01-01 14:30:00+00',
  null,
  'ses_msg_001'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  (SELECT id FROM public.campaigns WHERE name = 'Promoção Pizza Especial'),
  (SELECT id FROM public.customers WHERE email = 'ana.costa@email.com'),
  'whatsapp',
  'Olá Ana Costa! 🍕 Que tal uma Pizza Especial neste final de semana? 50% OFF em todas as pizzas grandes! Válido até domingo. Peça já pelo WhatsApp!',
  'converted',
  '2024-01-15 16:05:00+00',
  '2024-01-15 16:05:30+00',
  '2024-01-15 16:20:00+00',
  '2024-01-15 16:22:00+00',
  'twilio_msg_002'
);

-- Insert sample integrations
INSERT INTO public.integrations (restaurant_id, name, type, config, status, last_sync) VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'WhatsApp Business',
  'messaging',
  '{
    "phone_number": "+5511999999999",
    "business_name": "Restaurante Demo",
    "webhook_url": "https://your-domain.com/webhook/whatsapp",
    "features": ["messages", "media", "templates"]
  }',
  'active',
  '2024-01-20 10:00:00+00'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Sistema PDV',
  'pos',
  '{
    "api_endpoint": "https://pdv-api.com/v1",
    "sync_frequency": "realtime",
    "sync_entities": ["orders", "customers", "products"],
    "last_order_id": "ORD-2024-003"
  }',
  'active',
  '2024-01-20 15:30:00+00'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Email Marketing',
  'email',
  '{
    "provider": "aws_ses",
    "sender_email": "noreply@restaurantedemo.com",
    "sender_name": "Restaurante Demo",
    "reply_to": "contato@restaurantedemo.com",
    "templates": ["welcome", "newsletter", "promotion"]
  }',
  'active',
  '2024-01-20 12:00:00+00'
);

-- Insert sample reports
INSERT INTO public.reports (restaurant_id, created_by, name, type, period_start, period_end, data, status) VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'Relatório Janeiro 2024',
  'dashboard',
  '2024-01-01 00:00:00+00',
  '2024-01-31 23:59:59+00',
  '{
    "total_customers": 5,
    "new_customers": 2,
    "total_orders": 25,
    "total_revenue": 1250.00,
    "average_order_value": 50.00,
    "campaigns_sent": 2,
    "messages_sent": 350,
    "open_rate": 75.5,
    "click_rate": 32.1,
    "conversion_rate": 12.8
  }',
  'completed'
);