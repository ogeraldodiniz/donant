

# MyCashbacks - Plano de Desenvolvimento Completo
## Estilo visual inspirado no Duolingo

---

## Pre-requisitos

Antes de comecar a implementacao, voce precisara:

1. **Conectar Supabase** (Cloud ou externo) para banco de dados, auth e edge functions
2. **Credenciais mycashbacks API** para integracao de lojas e tracking
3. **Google OAuth** configurado no Supabase Dashboard

A Fase 1 sera construida com **dados mock** para que o frontend fique funcional imediatamente. A integracao real sera feita apos conectar o Supabase.

---

## Design System - Estilo Duolingo

Cores e estilo inspirados no Duolingo:
- **Verde principal**: `#58CC02` (vibrante, positivo)
- **Verde escuro**: `#58A700` (hover/active)
- **Azul**: `#1CB0F6` (acoes secundarias)
- **Vermelho**: `#FF4B4B` (alertas/erros)
- **Amarelo**: `#FFC800` (destaques/badges)
- **Roxo**: `#CE82FF` (acentos)
- **Fundo**: `#F7F7F7` claro, cards brancos
- **Tipografia**: rounded, friendly, bold headings
- **Bordas**: arredondadas (`rounded-2xl`), sombras suaves
- **Botoes**: grandes, com sombra inferior (efeito 3D do Duolingo)
- **Icones**: Lucide icons com estilo lúdico
- **Animacoes**: transicoes suaves, micro-interacoes

---

## Fase 1 - Fundacao e Layout (esta sessao)

### 1.1 Design System e Tema
- Atualizar `index.css` com as cores Duolingo em variaveis CSS
- Criar componente `DuoButton` com efeito 3D (sombra inferior)
- Criar componente `DuoCard` com bordas arredondadas e sombra

### 1.2 Layout Principal
- **Header/Navbar**: logo MyCashbacks, navegacao, badge de notificacoes, avatar do usuario
- **Bottom Navigation** (mobile): Home, Lojas, ONGs, Impacto, Menu - estilo app nativo
- **Layout wrapper** com sidebar (desktop) e bottom nav (mobile)

### 1.3 Telas Publicas (sem login)
- **Home publica**: hero section com CTA verde grande, secao "Como Funciona" com 3 passos ilustrados (icones animados), carousel de ONGs parceiras
- **Tela de Login/Cadastro**: formulario com Google OAuth button e email/senha, checkbox de termos
- **Privacidade e Termos**: paginas estaticas com tipografia legivel

### 1.4 Telas Autenticadas (com dados mock)
- **Home logada**: card da ONG selecionada, resumo de doacoes (pendente/confirmado/doado), lojas em destaque
- **Lojas - Listagem**: grid responsivo, busca por nome, badge de cashback rate em cada card
- **Lojas - Detalhe**: info completa, taxa de cashback, termos, botao CTA de redirecionamento
- **ONGs - Listagem**: grid com indicador de "selecionada", busca por nome
- **ONGs - Detalhe**: missao, impacto total, historico de doacoes, botao "Quero doar para esta ONG"
- **Seu Impacto**: 3 cards de status (Pendente/Confirmado/Doado) com valores, tabela de transacoes com filtro por periodo
- **Redirecionamento**: tela de loading com animacao e feedback
- **Notificacoes**: feed com badge, marcacao de lido
- **Transparencia**: totais globais, breakdown por ONG com grafico (recharts), timeline de doacoes
- **Configuracoes**: perfil, alterar ONG, logout, excluir conta com confirmacao

---

## Fase 2 - Banco de Dados (apos conectar Supabase)

### 2.1 Migrations
Criar todas as tabelas em migrations sequenciais:

1. **Enums**: `cashback_status`, `payout_status`, `notification_type`, `app_role`
2. **Tabela `ngos`**: dados das ONGs (publica)
3. **Tabela `profiles`** (em vez de `users` customizada): linked a `auth.users`, com `selected_ngo_id`
4. **Tabela `user_roles`**: separada conforme requisito de seguranca
5. **Tabela `stores`**: lojas parceiras
6. **Tabela `clickouts`**: registro de cliques
7. **Tabela `cashback_transactions`**: transacoes com state machine
8. **Tabela `donation_ledger`**: registro de doacoes
9. **Tabela `payout_batches`**: lotes de pagamento
10. **Tabela `notifications`**: notificacoes do usuario

### 2.2 RLS Policies
- `profiles`: SELECT/UPDATE proprio usuario
- `ngos`, `stores`: SELECT publico, mutacao via service_role
- `clickouts`: SELECT/INSERT proprio usuario
- `cashback_transactions`: SELECT proprio usuario, mutacao via service_role
- `donation_ledger`, `payout_batches`: SELECT publico
- `notifications`: SELECT/UPDATE proprio usuario

### 2.3 Helper Functions
- `has_role(user_id, role)` - SECURITY DEFINER para RLS
- Trigger para criar profile automaticamente no signup

### 2.4 Seed Data
- Inserir 5-8 ONGs de exemplo
- Inserir 10-15 lojas de exemplo com taxas de cashback variadas

---

## Fase 3 - Autenticacao e Integracao

### 3.1 Auth
- Implementar login/signup com Supabase Auth
- Google OAuth (requer configuracao no dashboard)
- Email/senha com validacao
- Protecao de rotas autenticadas
- Hook `useAuth` para estado de sessao

### 3.2 Conectar Frontend ao Supabase
- Substituir dados mock por queries reais (TanStack Query)
- Implementar client Supabase (`src/integrations/supabase`)
- Tipagem TypeScript gerada do schema

---

## Fase 4 - Edge Functions

### 4.1 `track-clickout`
- Recebe user_id e store_id
- Gera URL com UTM params
- Registra clickout no banco
- Retorna URL de redirect

### 4.2 `sync-transactions`
- Consulta mycashbacks API
- Atualiza status (state machine)
- Cria notificacoes
- Atualiza donation_ledger quando status = "donated"

### 4.3 `get-transparency-data`
- Totais globais, breakdown por ONG
- Ultimas doacoes (sem PII)

### 4.4 `delete-account`
- Anonimiza dados pessoais
- Soft delete conforme LGPD

### 4.5 `process-payout-batch`
- Agrupa doacoes confirmadas por ONG
- Cria batch de pagamento

---

## Fase 5 - PWA

### 5.1 Manifest
- `public/manifest.json` com icones, cores, display standalone

### 5.2 Service Worker
- Cache de assets estaticos
- Network-first para API
- Offline fallback page

### 5.3 Install Prompt
- Detectar `beforeinstallprompt`
- Banner customizado na home
- Persistir preferencia do usuario

---

## Estrutura de Arquivos

```text
src/
  components/
    layout/
      Header.tsx
      BottomNav.tsx
      AppLayout.tsx
      Sidebar.tsx
    ui/
      duo-button.tsx
      duo-card.tsx
      (shadcn components)
    home/
      HeroSection.tsx
      HowItWorks.tsx
      FeaturedNgos.tsx
      DonationSummary.tsx
      FeaturedStores.tsx
    stores/
      StoreCard.tsx
      StoreGrid.tsx
      StoreSearch.tsx
    ngos/
      NgoCard.tsx
      NgoGrid.tsx
    impact/
      StatusCards.tsx
      TransactionTable.tsx
    notifications/
      NotificationItem.tsx
      NotificationBadge.tsx
    transparency/
      GlobalStats.tsx
      NgoBreakdown.tsx
      DonationTimeline.tsx
    auth/
      LoginForm.tsx
      SignupForm.tsx
      GoogleAuthButton.tsx
    settings/
      ProfileInfo.tsx
      NgoSelector.tsx
      DeleteAccount.tsx
  pages/
    Index.tsx (home publica/logada)
    Stores.tsx
    StoreDetail.tsx
    Ngos.tsx
    NgoDetail.tsx
    Impact.tsx
    Redirect.tsx
    Auth.tsx
    Settings.tsx
    Notifications.tsx
    Transparency.tsx
    Privacy.tsx
    Terms.tsx
  hooks/
    useAuth.ts
    useStores.ts
    useNgos.ts
    useTransactions.ts
    useNotifications.ts
    usePwaInstall.ts
  lib/
    mock-data.ts
    utils.ts
  types/
    index.ts
```

---

## O que sera construido agora (primeira implementacao)

Como o Supabase ainda nao esta conectado, vamos construir:

1. **Design system completo** com tema Duolingo
2. **Todas as 14 telas** com dados mock
3. **Navegacao completa** com rotas e layout responsivo
4. **Componentes reutilizaveis** para cards, grids, formularios
5. **Tipos TypeScript** para todo o dominio
6. **Graficos** na pagina de transparencia com Recharts

Apos aprovacao, implementarei tela por tela, comecando pelo layout e design system, depois as telas publicas, e por fim as telas autenticadas com dados mock.

