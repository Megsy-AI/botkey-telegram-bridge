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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      market_snapshots: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      nfts: {
        Row: {
          created_at: string
          id: string
          item_index: number | null
          mint_status: string
          nft_address: string | null
          price_gram: number
          tier: number
          tx_hash: string | null
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_index?: number | null
          mint_status?: string
          nft_address?: string | null
          price_gram?: number
          tier?: number
          tx_hash?: string | null
          user_id: number
        }
        Update: {
          created_at?: string
          id?: string
          item_index?: number | null
          mint_status?: string
          nft_address?: string | null
          price_gram?: number
          tier?: number
          tx_hash?: string | null
          user_id?: number
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          created_at: string
          task_id: string
          user_id: number
        }
        Insert: {
          created_at?: string
          task_id: string
          user_id: number
        }
        Update: {
          created_at?: string
          task_id?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string | null
          link: string
          reward: number
          sort: number
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          link: string
          reward?: number
          sort?: number
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          link?: string
          reward?: number
          sort?: number
          title?: string
        }
        Relationships: []
      }
      tg_users: {
        Row: {
          balance: number
          created_at: string
          first_name: string | null
          id: number
          language_code: string | null
          mining_pending: number
          mining_rate_daily: number
          mining_settled_at: string | null
          mining_started_at: string | null
          photo_url: string | null
          power_level: number
          referral_earned: number
          referral_rate: number
          referred_by: number | null
          subscribed_until: string | null
          username: string | null
          wallet_address: string | null
          wallet_nonce: string | null
          wallet_verified: boolean
        }
        Insert: {
          balance?: number
          created_at?: string
          first_name?: string | null
          id: number
          language_code?: string | null
          mining_pending?: number
          mining_rate_daily?: number
          mining_settled_at?: string | null
          mining_started_at?: string | null
          photo_url?: string | null
          power_level?: number
          referral_earned?: number
          referral_rate?: number
          referred_by?: number | null
          subscribed_until?: string | null
          username?: string | null
          wallet_address?: string | null
          wallet_nonce?: string | null
          wallet_verified?: boolean
        }
        Update: {
          balance?: number
          created_at?: string
          first_name?: string | null
          id?: number
          language_code?: string | null
          mining_pending?: number
          mining_rate_daily?: number
          mining_settled_at?: string | null
          mining_started_at?: string | null
          photo_url?: string | null
          power_level?: number
          referral_earned?: number
          referral_rate?: number
          referred_by?: number | null
          subscribed_until?: string | null
          username?: string | null
          wallet_address?: string | null
          wallet_nonce?: string | null
          wallet_verified?: boolean
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          fee_tx: string | null
          id: string
          status: string
          to_address: string
          tx_hash: string | null
          user_id: number
        }
        Insert: {
          amount: number
          created_at?: string
          fee_tx?: string | null
          id?: string
          status?: string
          to_address: string
          tx_hash?: string | null
          user_id: number
        }
        Update: {
          amount?: number
          created_at?: string
          fee_tx?: string | null
          id?: string
          status?: string
          to_address?: string
          tx_hash?: string | null
          user_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      orange_mining_claim: { Args: { p_user_id: number }; Returns: Json }
      orange_refund_withdrawal: { Args: { p_id: string }; Returns: undefined }
      orange_reserve_withdrawal: {
        Args: {
          p_address: string
          p_amount: number
          p_fee: string
          p_user_id: number
        }
        Returns: string
      }
      orange_sync_power: {
        Args: { p_level: number; p_rate: number; p_user_id: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
