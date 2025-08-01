export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      company_logos: {
        Row: {
          created_at: string
          id: string
          logo_url: string
          name: string | null
          symbol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url: string
          name?: string | null
          symbol: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string
          name?: string | null
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          ai_confidence: number | null
          ai_prediction: string | null
          ai_reasoning: string | null
          ai_sentiment: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          priority: string | null
          published_at: string | null
          source_links: string | null
          symbol: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_prediction?: string | null
          ai_reasoning?: string | null
          ai_sentiment?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          published_at?: string | null
          source_links?: string | null
          symbol: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_prediction?: string | null
          ai_reasoning?: string | null
          ai_sentiment?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          published_at?: string | null
          source_links?: string | null
          symbol?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          account_id: string
          buying_power: number
          cash: number
          created_at: string
          id: string
          long_market_value: number
          snapshot_date: string
          total_equity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          buying_power?: number
          cash?: number
          created_at?: string
          id?: string
          long_market_value?: number
          snapshot_date?: string
          total_equity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          buying_power?: number
          cash?: number
          created_at?: string
          id?: string
          long_market_value?: number
          snapshot_date?: string
          total_equity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alpaca_account_created_at: string | null
          alpaca_account_id: string | null
          alpaca_account_number: string | null
          alpaca_account_status: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          alpaca_account_created_at?: string | null
          alpaca_account_id?: string | null
          alpaca_account_number?: string | null
          alpaca_account_status?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          alpaca_account_created_at?: string | null
          alpaca_account_id?: string | null
          alpaca_account_number?: string | null
          alpaca_account_status?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_bank_accounts: {
        Row: {
          account_number_last_four: string
          account_type: string
          alpaca_account_id: string
          alpaca_relationship_id: string | null
          bank_name: string | null
          created_at: string
          id: string
          is_default: boolean
          nickname: string
          routing_number: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number_last_four: string
          account_type?: string
          alpaca_account_id: string
          alpaca_relationship_id?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          nickname: string
          routing_number: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number_last_four?: string
          account_type?: string
          alpaca_account_id?: string
          alpaca_relationship_id?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          nickname?: string
          routing_number?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stock_articles: {
        Row: {
          ai_confidence: number | null
          ai_reasoning: string | null
          ai_sentiment: string | null
          created_at: string
          description: string | null
          id: string
          published_at: string | null
          source_links: string | null
          symbol: string
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_reasoning?: string | null
          ai_sentiment?: string | null
          created_at?: string
          description?: string | null
          id?: string
          published_at?: string | null
          source_links?: string | null
          symbol: string
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_reasoning?: string | null
          ai_sentiment?: string | null
          created_at?: string
          description?: string | null
          id?: string
          published_at?: string | null
          source_links?: string | null
          symbol?: string
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_stocks: {
        Row: {
          created_at: string
          id: string
          symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          symbol: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      user_transfers: {
        Row: {
          alpaca_account_id: string
          alpaca_transfer_id: string | null
          amount: number
          created_at: string
          direction: string
          id: string
          reason: string | null
          relationship_id: string | null
          status: string
          transfer_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alpaca_account_id: string
          alpaca_transfer_id?: string | null
          amount: number
          created_at?: string
          direction: string
          id?: string
          reason?: string | null
          relationship_id?: string | null
          status?: string
          transfer_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alpaca_account_id?: string
          alpaca_transfer_id?: string | null
          amount?: number
          created_at?: string
          direction?: string
          id?: string
          reason?: string | null
          relationship_id?: string | null
          status?: string
          transfer_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
