-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type campaign_status as enum ('draft', 'scheduled', 'sending', 'sent', 'failed', 'paused');
create type campaign_type as enum ('email', 'whatsapp', 'sms');
create type message_status as enum ('sent', 'delivered', 'opened', 'clicked', 'converted', 'failed', 'bounced');

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  phone text,
  role text default 'owner',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Restaurants table
create table public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  logo_url text,
  address text,
  phone text,
  email text,
  website text,
  business_hours jsonb,
  timezone text default 'America/Sao_Paulo',
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customers table
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  whatsapp text,
  birth_date date,
  gender text,
  address jsonb,
  tags text[] default '{}',
  preferences jsonb default '{}',
  last_visit timestamp with time zone,
  total_orders integer default 0,
  total_spent decimal default 0,
  average_order_value decimal default 0,
  customer_since timestamp with time zone default timezone('utc'::text, now()),
  status text default 'active',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Campaigns table
create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  description text,
  type campaign_type not null,
  status campaign_status default 'draft',
  message text not null,
  template_id text,
  template_data jsonb default '{}',
  customer_segment text[] default '{}',
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  sent_count integer default 0,
  delivered_count integer default 0,
  opened_count integer default 0,
  clicked_count integer default 0,
  converted_count integer default 0,
  failed_count integer default 0,
  open_rate decimal default 0,
  click_rate decimal default 0,
  conversion_rate decimal default 0,
  a_b_test boolean default false,
  a_b_test_data jsonb,
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete cascade not null,
  type campaign_type not null,
  content text not null,
  status message_status default 'sent',
  sent_at timestamp with time zone default timezone('utc'::text, now()),
  delivered_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  converted_at timestamp with time zone,
  failed_at timestamp with time zone,
  error text,
  external_id text, -- ID from external service (Twilio, SES, etc.)
  metadata jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table (simulating POS integration)
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete set null,
  order_number text not null,
  total decimal not null default 0,
  subtotal decimal not null default 0,
  tax decimal default 0,
  discount decimal default 0,
  tip decimal default 0,
  payment_method text,
  status text default 'completed',
  items jsonb not null default '[]',
  notes text,
  source text default 'pos', -- pos, online, app, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reports table
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,
  name text not null,
  type text not null, -- dashboard, sales, campaigns, customers
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  data jsonb not null,
  file_url text,
  file_format text, -- json, csv, pdf
  status text default 'completed', -- generating, completed, failed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Integrations table
create table public.integrations (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name text not null, -- whatsapp, pos, email, etc.
  type text not null,
  config jsonb not null default '{}',
  credentials jsonb, -- encrypted sensitive data
  status text default 'active', -- active, inactive, error
  last_sync timestamp with time zone,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_customers_restaurant_id on public.customers(restaurant_id);
create index idx_customers_tags on public.customers using gin(tags);
create index idx_campaigns_restaurant_id on public.campaigns(restaurant_id);
create index idx_campaigns_status on public.campaigns(status);
create index idx_campaigns_scheduled_at on public.campaigns(scheduled_at);
create index idx_messages_restaurant_id on public.messages(restaurant_id);
create index idx_messages_campaign_id on public.messages(campaign_id);
create index idx_messages_customer_id on public.messages(customer_id);
create index idx_messages_sent_at on public.messages(sent_at);
create index idx_orders_restaurant_id on public.orders(restaurant_id);
create index idx_orders_customer_id on public.orders(customer_id);
create index idx_orders_created_at on public.orders(created_at);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.customers enable row level security;
alter table public.campaigns enable row level security;
alter table public.messages enable row level security;
alter table public.orders enable row level security;
alter table public.reports enable row level security;
alter table public.integrations enable row level security;

-- RLS Policies

-- Profiles: Users can only see and edit their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Restaurants: Users can only access restaurants they own or are members of
create policy "Users can view own restaurants" on public.restaurants
  for select using (auth.uid() = owner_id);

create policy "Users can update own restaurants" on public.restaurants
  for update using (auth.uid() = owner_id);

create policy "Users can insert restaurants" on public.restaurants
  for insert with check (auth.uid() = owner_id);

-- Customers: Users can only access customers from their restaurants
create policy "Users can access customers from own restaurants" on public.customers
  for all using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- Campaigns: Users can only access campaigns from their restaurants
create policy "Users can access campaigns from own restaurants" on public.campaigns
  for all using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- Messages: Users can only access messages from their restaurants
create policy "Users can access messages from own restaurants" on public.messages
  for all using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- Orders: Users can only access orders from their restaurants
create policy "Users can access orders from own restaurants" on public.orders
  for all using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- Reports: Users can only access reports from their restaurants
create policy "Users can access reports from own restaurants" on public.reports
  for all using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- Integrations: Users can only access integrations from their restaurants
create policy "Users can access integrations from own restaurants" on public.integrations
  for all using (
    restaurant_id in (
      select id from public.restaurants where owner_id = auth.uid()
    )
  );

-- Functions

-- Function to update updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.restaurants
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.customers
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.campaigns
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.integrations
  for each row execute function public.handle_updated_at();

-- Function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update customer statistics
create or replace function public.update_customer_stats()
returns trigger as $$
begin
  -- Update customer stats when a new order is created
  if TG_OP = 'INSERT' then
    update public.customers
    set 
      total_orders = total_orders + 1,
      total_spent = total_spent + new.total,
      average_order_value = (total_spent + new.total) / (total_orders + 1),
      last_visit = new.created_at
    where id = new.customer_id;
  end if;
  
  return coalesce(new, old);
end;
$$ language plpgsql;

-- Trigger to update customer stats
create trigger update_customer_stats_trigger
  after insert on public.orders
  for each row execute function public.update_customer_stats();

-- Function to update campaign statistics
create or replace function public.update_campaign_stats()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    -- Update campaign counters based on message status
    update public.campaigns
    set 
      sent_count = (select count(*) from public.messages where campaign_id = new.campaign_id),
      delivered_count = (select count(*) from public.messages where campaign_id = new.campaign_id and status in ('delivered', 'opened', 'clicked', 'converted')),
      opened_count = (select count(*) from public.messages where campaign_id = new.campaign_id and status in ('opened', 'clicked', 'converted')),
      clicked_count = (select count(*) from public.messages where campaign_id = new.campaign_id and status in ('clicked', 'converted')),
      converted_count = (select count(*) from public.messages where campaign_id = new.campaign_id and status = 'converted')
    where id = new.campaign_id;
    
    -- Update rates
    update public.campaigns
    set 
      open_rate = case when sent_count > 0 then (opened_count::decimal / sent_count::decimal) * 100 else 0 end,
      click_rate = case when opened_count > 0 then (clicked_count::decimal / opened_count::decimal) * 100 else 0 end,
      conversion_rate = case when sent_count > 0 then (converted_count::decimal / sent_count::decimal) * 100 else 0 end
    where id = new.campaign_id;
  end if;
  
  return coalesce(new, old);
end;
$$ language plpgsql;

-- Trigger to update campaign stats
create trigger update_campaign_stats_trigger
  after insert or update on public.messages
  for each row execute function public.update_campaign_stats();