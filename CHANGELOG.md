# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-19

### ✅ Adicionado
- **Integração completa com Supabase** - Migração de API mockada para dados reais
- **Sistema de autenticação** via Supabase Auth com JWT
- **Dashboard dinâmico** com KPIs em tempo real por restaurante
- **Avatar inteligente** com iniciais personalizadas do usuário
- **Gestão de clientes** com dados reais do banco
- **Campanhas de marketing** com status e métricas reais
- **Sistema de pedidos** integrado ao Supabase
- **Configurações dinâmicas** por restaurante
- **Interface responsiva** com modo claro/escuro

### 🔧 Alterado
- **Header.tsx**: Agora exibe dados reais do usuário logado
- **ProtectedLayout.tsx**: Integração completa com Supabase Auth
- **Dashboard.tsx**: KPIs calculados dinamicamente
- **Campaigns.tsx**: Listagem dinâmica com filtros reais
- **Clients.tsx**: Cadastro e listagem com dados reais
- **Orders.tsx**: Integração completa com sistema real
- **Settings.tsx**: Configurações dinâmicas por restaurante

### 🐛 Corrigido
- **Erros de fetch** resolvidos em todas as páginas
- **Warnings de React** eliminados
- **Validações de dados** implementadas
- **Fallback de dados** melhorado

### 🗑️ Removido
- **API mockada** - completamente substituída pelo Supabase
- **Dados estáticos** - todos os dados agora são dinâmicos

## [0.1.0] - 2024-12-18

### ✅ Adicionado
- Estrutura inicial do projeto
- Configuração do ambiente de desenvolvimento
- Componentes base com shadcn/ui
- Sistema de rotas com React Router
- Layout responsivo com Sidebar
- Mock de dados para desenvolvimento