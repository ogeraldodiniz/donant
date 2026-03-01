export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  selected_ngo_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Ngo {
  id: string;
  name: string;
  slug: string;
  description: string;
  mission: string;
  logo_url: string;
  website_url: string;
  total_received: number;
  is_active: boolean;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  cashback_rate: number;
  terms: string;
  category: string;
  is_active: boolean;
  mycashbacks_store_id?: string;
  created_at: string;
}

export interface Clickout {
  id: string;
  user_id: string;
  store_id: string;
  redirect_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  clicked_at: string;
}

export type CashbackStatus = 'tracked' | 'pending' | 'confirmed' | 'donated' | 'reverted';

export interface CashbackTransaction {
  id: string;
  user_id: string;
  store_id: string;
  clickout_id: string;
  ngo_id: string;
  amount: number;
  status: CashbackStatus;
  mycashbacks_transaction_id?: string;
  tracked_at: string;
  confirmed_at?: string;
  donated_at?: string;
  reverted_at?: string;
  created_at: string;
  updated_at: string;
  store?: Store;
  ngo?: Ngo;
}

export interface DonationLedger {
  id: string;
  transaction_id: string;
  ngo_id: string;
  amount: number;
  donated_at: string;
  ngo?: Ngo;
}

export type PayoutStatus = 'pending' | 'processing' | 'completed';

export interface PayoutBatch {
  id: string;
  ngo_id: string;
  total_amount: number;
  transaction_count: number;
  status: PayoutStatus;
  created_at: string;
  completed_at?: string;
}

export type NotificationType = 'status_change' | 'donation_confirmed' | 'general';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  related_transaction_id?: string;
  is_read: boolean;
  created_at: string;
}
