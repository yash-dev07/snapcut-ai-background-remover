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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          rate_limit_per_min: number
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          rate_limit_per_min?: number
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          rate_limit_per_min?: number
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          balance: number
          lifetime_purchased: number
          lifetime_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          lifetime_purchased?: number
          lifetime_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          lifetime_purchased?: number
          lifetime_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string
          detail: Json | null
          event: string
          id: string
          level: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: Json | null
          event: string
          id?: string
          level?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: Json | null
          event?: string
          id?: string
          level?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_reset_on: string
          daily_used: number
          email: string | null
          full_name: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_type"]
          plan_expires_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_reset_on?: string
          daily_used?: number
          email?: string | null
          full_name?: string | null
          id: string
          plan?: Database["public"]["Enums"]["plan_type"]
          plan_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_reset_on?: string
          daily_used?: number
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          plan_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_paise: number
          created_at: string
          credits_granted: number
          currency: string
          id: string
          plan: Database["public"]["Enums"]["plan_type"]
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_paise: number
          created_at?: string
          credits_granted?: number
          currency?: string
          id?: string
          plan: Database["public"]["Enums"]["plan_type"]
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_paise?: number
          created_at?: string
          credits_granted?: number
          currency?: string
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      uploads: {
        Row: {
          created_at: string
          credits_used: number
          error_message: string | null
          expires_at: string
          height: number | null
          id: string
          mime_type: string
          original_name: string
          processing_ms: number | null
          result_path: string | null
          size_bytes: number
          source: string
          status: Database["public"]["Enums"]["upload_status"]
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          credits_used?: number
          error_message?: string | null
          expires_at?: string
          height?: number | null
          id?: string
          mime_type: string
          original_name: string
          processing_ms?: number | null
          result_path?: string | null
          size_bytes: number
          source?: string
          status?: Database["public"]["Enums"]["upload_status"]
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          credits_used?: number
          error_message?: string | null
          expires_at?: string
          height?: number | null
          id?: string
          mime_type?: string
          original_name?: string
          processing_ms?: number | null
          result_path?: string | null
          size_bytes?: number
          source?: string
          status?: Database["public"]["Enums"]["upload_status"]
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      plan_type: "free" | "pro" | "credits"
      upload_status: "pending" | "processing" | "succeeded" | "failed"
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
      plan_type: ["free", "pro", "credits"],
      upload_status: ["pending", "processing", "succeeded", "failed"],
    },
  },
} as const
