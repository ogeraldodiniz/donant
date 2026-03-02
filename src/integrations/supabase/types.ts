export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cashback_transactions: {
        Row: {
          amount: number
          clickout_id: string | null
          confirmed_at: string | null
          created_at: string
          donated_at: string | null
          id: string
          mycashbacks_transaction_id: string | null
          ngo_id: string
          reverted_at: string | null
          status: Database["public"]["Enums"]["cashback_status"]
          store_id: string
          tracked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          clickout_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          donated_at?: string | null
          id?: string
          mycashbacks_transaction_id?: string | null
          ngo_id: string
          reverted_at?: string | null
          status?: Database["public"]["Enums"]["cashback_status"]
          store_id: string
          tracked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          clickout_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          donated_at?: string | null
          id?: string
          mycashbacks_transaction_id?: string | null
          ngo_id?: string
          reverted_at?: string | null
          status?: Database["public"]["Enums"]["cashback_status"]
          store_id?: string
          tracked_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cashback_transactions_clickout_id_fkey"
            columns: ["clickout_id"]
            isOneToOne: false
            referencedRelation: "clickouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_transactions_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cashback_transactions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      clickouts: {
        Row: {
          clicked_at: string
          id: string
          redirect_url: string | null
          store_id: string
          user_id: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          redirect_url?: string | null
          store_id: string
          user_id: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          redirect_url?: string | null
          store_id?: string
          user_id?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clickouts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_ledger: {
        Row: {
          amount: number
          donated_at: string
          id: string
          ngo_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          donated_at?: string
          id?: string
          ngo_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          donated_at?: string
          id?: string
          ngo_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_ledger_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_ledger_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "cashback_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      ngos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          mission: string | null
          name: string
          slug: string
          total_received: number
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          mission?: string | null
          name: string
          slug: string
          total_received?: number
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          mission?: string | null
          name?: string
          slug?: string
          total_received?: number
          website_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          related_transaction_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          related_transaction_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          related_transaction_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_transaction_id_fkey"
            columns: ["related_transaction_id"]
            isOneToOne: false
            referencedRelation: "cashback_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_batches: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          ngo_id: string
          status: Database["public"]["Enums"]["payout_status"]
          total_amount: number
          transaction_count: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          ngo_id: string
          status?: Database["public"]["Enums"]["payout_status"]
          total_amount?: number
          transaction_count?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          ngo_id?: string
          status?: Database["public"]["Enums"]["payout_status"]
          total_amount?: number
          transaction_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "payout_batches_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          display_name: string | null
          email: string | null
          id: string
          notify_email: boolean
          notify_web: boolean
          notify_whatsapp: boolean
          phone: string | null
          selected_ngo_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          notify_email?: boolean
          notify_web?: boolean
          notify_whatsapp?: boolean
          phone?: string | null
          selected_ngo_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          notify_email?: boolean
          notify_web?: boolean
          notify_whatsapp?: boolean
          phone?: string | null
          selected_ngo_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_selected_ngo"
            columns: ["selected_ngo_id"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          created_at: string
          id: string
          locale: string
          section: string
          updated_at: string
          value: string
        }
        Insert: {
          content_key: string
          created_at?: string
          id?: string
          locale?: string
          section?: string
          updated_at?: string
          value?: string
        }
        Update: {
          content_key?: string
          created_at?: string
          id?: string
          locale?: string
          section?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          cashback_rate: number
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          mycashbacks_store_id: string | null
          name: string
          slug: string
          terms: string | null
          website_url: string | null
        }
        Insert: {
          cashback_rate?: number
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          mycashbacks_store_id?: string | null
          name: string
          slug: string
          terms?: string | null
          website_url?: string | null
        }
        Update: {
          cashback_rate?: number
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          mycashbacks_store_id?: string | null
          name?: string
          slug?: string
          terms?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      cashback_status:
        | "tracked"
        | "pending"
        | "confirmed"
        | "donated"
        | "reverted"
      notification_type: "status_change" | "donation_confirmed" | "general"
      payout_status: "pending" | "processing" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      cashback_status: [
        "tracked",
        "pending",
        "confirmed",
        "donated",
        "reverted",
      ],
      notification_type: ["status_change", "donation_confirmed", "general"],
      payout_status: ["pending", "processing", "completed"],
    },
  },
} as const
