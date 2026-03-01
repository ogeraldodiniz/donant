import { Ngo, Store, CashbackTransaction, Notification, DonationLedger, User } from '@/types';

export const mockUser: User = {
  id: '1',
  email: 'joao@email.com',
  display_name: 'João Silva',
  avatar_url: '',
  selected_ngo_id: '1',
  created_at: '2025-01-15',
  updated_at: '2025-02-01',
};

export const mockNgos: Ngo[] = [
  { id: '1', name: 'Instituto Criança Feliz', slug: 'crianca-feliz', description: 'Promovemos educação e alimentação para crianças em situação de vulnerabilidade.', mission: 'Garantir que toda criança tenha acesso à educação e alimentação de qualidade.', logo_url: '', website_url: 'https://criancafeliz.org', total_received: 45230.50, is_active: true, created_at: '2024-01-01' },
  { id: '2', name: 'Amigos do Planeta', slug: 'amigos-planeta', description: 'Organização dedicada à preservação ambiental e reflorestamento.', mission: 'Reflorestar 1 milhão de árvores até 2030.', logo_url: '', website_url: 'https://amigosplaneta.org', total_received: 32100.00, is_active: true, created_at: '2024-01-01' },
  { id: '3', name: 'Lar dos Idosos', slug: 'lar-idosos', description: 'Acolhimento e cuidado digno para idosos sem família.', mission: 'Oferecer moradia e cuidado a idosos em situação de abandono.', logo_url: '', website_url: 'https://laridosos.org', total_received: 18750.75, is_active: true, created_at: '2024-02-01' },
  { id: '4', name: 'Esporte para Todos', slug: 'esporte-todos', description: 'Inclusão social através do esporte em comunidades carentes.', mission: 'Usar o esporte como ferramenta de transformação social.', logo_url: '', website_url: 'https://esportetodos.org', total_received: 12400.00, is_active: true, created_at: '2024-03-01' },
  { id: '5', name: 'Saúde na Periferia', slug: 'saude-periferia', description: 'Atendimento médico gratuito em regiões periféricas.', mission: 'Levar saúde de qualidade para quem mais precisa.', logo_url: '', website_url: 'https://saudeperiferia.org', total_received: 28900.25, is_active: true, created_at: '2024-03-15' },
  { id: '6', name: 'Educação Digital', slug: 'educacao-digital', description: 'Ensino de tecnologia para jovens de baixa renda.', mission: 'Democratizar o acesso à educação tecnológica.', logo_url: '', website_url: 'https://educacaodigital.org', total_received: 21350.00, is_active: true, created_at: '2024-04-01' },
];

export const mockStores: Store[] = [
  { id: '1', name: 'Amazon', slug: 'amazon', logo_url: '', website_url: 'https://amazon.com.br', cashback_rate: 3.5, terms: 'Cashback válido para todas as categorias exceto eletrônicos.', category: 'Marketplace', is_active: true, created_at: '2024-01-01' },
  { id: '2', name: 'Magazine Luiza', slug: 'magalu', logo_url: '', website_url: 'https://magazineluiza.com.br', cashback_rate: 5.0, terms: 'Válido para compras acima de R$50.', category: 'Varejo', is_active: true, created_at: '2024-01-01' },
  { id: '3', name: 'Netshoes', slug: 'netshoes', logo_url: '', website_url: 'https://netshoes.com.br', cashback_rate: 7.0, terms: 'Cashback em todos os produtos.', category: 'Esportes', is_active: true, created_at: '2024-01-15' },
  { id: '4', name: 'Booking.com', slug: 'booking', logo_url: '', website_url: 'https://booking.com', cashback_rate: 4.0, terms: 'Válido para reservas de hotel.', category: 'Viagens', is_active: true, created_at: '2024-02-01' },
  { id: '5', name: 'Americanas', slug: 'americanas', logo_url: '', website_url: 'https://americanas.com.br', cashback_rate: 2.5, terms: 'Cashback em compras acima de R$30.', category: 'Marketplace', is_active: true, created_at: '2024-02-15' },
  { id: '6', name: 'Dafiti', slug: 'dafiti', logo_url: '', website_url: 'https://dafiti.com.br', cashback_rate: 6.0, terms: 'Válido para moda e acessórios.', category: 'Moda', is_active: true, created_at: '2024-03-01' },
  { id: '7', name: 'AliExpress', slug: 'aliexpress', logo_url: '', website_url: 'https://aliexpress.com', cashback_rate: 8.5, terms: 'Cashback em todas as categorias.', category: 'Marketplace', is_active: true, created_at: '2024-03-15' },
  { id: '8', name: 'Centauro', slug: 'centauro', logo_url: '', website_url: 'https://centauro.com.br', cashback_rate: 5.5, terms: 'Válido para esportes e fitness.', category: 'Esportes', is_active: true, created_at: '2024-04-01' },
  { id: '9', name: 'Zattini', slug: 'zattini', logo_url: '', website_url: 'https://zattini.com.br', cashback_rate: 4.5, terms: 'Cashback em calçados e roupas.', category: 'Moda', is_active: true, created_at: '2024-04-15' },
  { id: '10', name: 'Casas Bahia', slug: 'casas-bahia', logo_url: '', website_url: 'https://casasbahia.com.br', cashback_rate: 3.0, terms: 'Válido exceto para marketplace.', category: 'Varejo', is_active: true, created_at: '2024-05-01' },
];

export const mockTransactions: CashbackTransaction[] = [
  { id: '1', user_id: '1', store_id: '1', clickout_id: '1', ngo_id: '1', amount: 12.50, status: 'donated', tracked_at: '2025-01-10', confirmed_at: '2025-01-25', donated_at: '2025-02-01', created_at: '2025-01-10', updated_at: '2025-02-01', store: mockStores[0], ngo: mockNgos[0] },
  { id: '2', user_id: '1', store_id: '2', clickout_id: '2', ngo_id: '1', amount: 25.00, status: 'confirmed', tracked_at: '2025-01-20', confirmed_at: '2025-02-05', created_at: '2025-01-20', updated_at: '2025-02-05', store: mockStores[1], ngo: mockNgos[0] },
  { id: '3', user_id: '1', store_id: '3', clickout_id: '3', ngo_id: '1', amount: 8.75, status: 'pending', tracked_at: '2025-02-01', created_at: '2025-02-01', updated_at: '2025-02-01', store: mockStores[2], ngo: mockNgos[0] },
  { id: '4', user_id: '1', store_id: '7', clickout_id: '4', ngo_id: '1', amount: 15.30, status: 'donated', tracked_at: '2025-01-05', confirmed_at: '2025-01-20', donated_at: '2025-01-28', created_at: '2025-01-05', updated_at: '2025-01-28', store: mockStores[6], ngo: mockNgos[0] },
  { id: '5', user_id: '1', store_id: '4', clickout_id: '5', ngo_id: '1', amount: 32.00, status: 'tracked', tracked_at: '2025-02-10', created_at: '2025-02-10', updated_at: '2025-02-10', store: mockStores[3], ngo: mockNgos[0] },
  { id: '6', user_id: '1', store_id: '6', clickout_id: '6', ngo_id: '1', amount: 18.90, status: 'confirmed', tracked_at: '2025-01-28', confirmed_at: '2025-02-12', created_at: '2025-01-28', updated_at: '2025-02-12', store: mockStores[5], ngo: mockNgos[0] },
  { id: '7', user_id: '1', store_id: '5', clickout_id: '7', ngo_id: '1', amount: 5.25, status: 'reverted', tracked_at: '2025-01-12', reverted_at: '2025-01-30', created_at: '2025-01-12', updated_at: '2025-01-30', store: mockStores[4], ngo: mockNgos[0] },
];

export const mockNotifications: Notification[] = [
  { id: '1', user_id: '1', title: 'Doação confirmada!', body: 'Sua compra na Amazon gerou R$12,50 para o Instituto Criança Feliz.', type: 'donation_confirmed', related_transaction_id: '1', is_read: false, created_at: '2025-02-01' },
  { id: '2', user_id: '1', title: 'Cashback confirmado', body: 'Seu cashback de R$25,00 da Magazine Luiza foi confirmado.', type: 'status_change', related_transaction_id: '2', is_read: false, created_at: '2025-02-05' },
  { id: '3', user_id: '1', title: 'Nova loja parceira!', body: 'AliExpress agora oferece até 8.5% de cashback solidário.', type: 'general', is_read: true, created_at: '2025-01-28' },
  { id: '4', user_id: '1', title: 'Compra rastreada', body: 'Sua compra na Booking.com está sendo rastreada.', type: 'status_change', related_transaction_id: '5', is_read: true, created_at: '2025-02-10' },
];

export const mockDonations: DonationLedger[] = [
  { id: '1', transaction_id: '1', ngo_id: '1', amount: 12.50, donated_at: '2025-02-01', ngo: mockNgos[0] },
  { id: '2', transaction_id: '4', ngo_id: '1', amount: 15.30, donated_at: '2025-01-28', ngo: mockNgos[0] },
  { id: '3', transaction_id: 'ext1', ngo_id: '2', amount: 45.00, donated_at: '2025-01-25', ngo: mockNgos[1] },
  { id: '4', transaction_id: 'ext2', ngo_id: '3', amount: 22.80, donated_at: '2025-01-20', ngo: mockNgos[2] },
  { id: '5', transaction_id: 'ext3', ngo_id: '4', amount: 18.00, donated_at: '2025-02-08', ngo: mockNgos[3] },
  { id: '6', transaction_id: 'ext4', ngo_id: '5', amount: 33.50, donated_at: '2025-02-05', ngo: mockNgos[4] },
  { id: '7', transaction_id: 'ext5', ngo_id: '6', amount: 27.90, donated_at: '2025-02-03', ngo: mockNgos[5] },
];

export const categoryColors: Record<string, string> = {
  Marketplace: 'bg-duo-blue',
  Varejo: 'bg-duo-green',
  Esportes: 'bg-duo-orange',
  Viagens: 'bg-duo-purple',
  Moda: 'bg-duo-yellow',
};

export const categoryEmojis: Record<string, string> = {
  Marketplace: '🛒',
  Varejo: '🏪',
  Esportes: '⚽',
  Viagens: '✈️',
  Moda: '👗',
};

export const ngoEmojis = ['🧒', '🌍', '👴', '⚽', '🏥', '💻'];
