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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      auctions: {
        Row: {
          bid_count: number
          bid_increment: number
          buyer_premium_pct: number
          course_id: string
          created_at: string
          current_bid: number | null
          ends_at: string
          final_price: number | null
          floor_price: number
          id: string
          opens_at: string
          players: number
          rack_rate: number
          slot_id: string | null
          status: Database["public"]["Enums"]["auction_status"]
          tee_date: string
          tee_time: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          bid_count?: number
          bid_increment?: number
          buyer_premium_pct?: number
          course_id: string
          created_at?: string
          current_bid?: number | null
          ends_at: string
          final_price?: number | null
          floor_price: number
          id?: string
          opens_at: string
          players: number
          rack_rate: number
          slot_id?: string | null
          status?: Database["public"]["Enums"]["auction_status"]
          tee_date: string
          tee_time: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          bid_count?: number
          bid_increment?: number
          buyer_premium_pct?: number
          course_id?: string
          created_at?: string
          current_bid?: number | null
          ends_at?: string
          final_price?: number | null
          floor_price?: number
          id?: string
          opens_at?: string
          players?: number
          rack_rate?: number
          slot_id?: string | null
          status?: Database["public"]["Enums"]["auction_status"]
          tee_date?: string
          tee_time?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auctions_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "tee_time_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auctions_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["bid_status"]
        }
        Insert: {
          amount: number
          auction_id: string
          bidder_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bid_status"]
        }
        Update: {
          amount?: number
          auction_id?: string
          bidder_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bid_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          active: boolean
          admin_id: string
          contact_email: string | null
          created_at: string
          id: string
          location: string | null
          market: string
          name: string
          rack_rate_default: number | null
          slug: string
          stripe_account_id: string | null
          stripe_onboarded: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          admin_id: string
          contact_email?: string | null
          created_at?: string
          id?: string
          location?: string | null
          market?: string
          name: string
          rack_rate_default?: number | null
          slug: string
          stripe_account_id?: string | null
          stripe_onboarded?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          admin_id?: string
          contact_email?: string | null
          created_at?: string
          id?: string
          location?: string | null
          market?: string
          name?: string
          rack_rate_default?: number | null
          slug?: string
          stripe_account_id?: string | null
          stripe_onboarded?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          id: string
          reason: string
          redeemed_at: string | null
          redeemed_transaction_id: string | null
          source_auction_id: string | null
          status: Database["public"]["Enums"]["credit_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at: string
          id?: string
          reason?: string
          redeemed_at?: string | null
          redeemed_transaction_id?: string | null
          source_auction_id?: string | null
          status?: Database["public"]["Enums"]["credit_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          reason?: string
          redeemed_at?: string | null
          redeemed_transaction_id?: string | null
          source_auction_id?: string | null
          status?: Database["public"]["Enums"]["credit_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_redeemed_transaction_id_fkey"
            columns: ["redeemed_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_source_auction_id_fkey"
            columns: ["source_auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          card_brand: string | null
          card_last4: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          updated_at: string
        }
        Insert: {
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string
        }
        Update: {
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      second_chance_offers: {
        Row: {
          cascade_rank: number
          claimed_transaction_id: string | null
          created_at: string
          expires_at: string
          id: string
          loser_id: string
          offered_auction_id: string
          price: number
          source_auction_id: string
          status: Database["public"]["Enums"]["offer_status"]
        }
        Insert: {
          cascade_rank?: number
          claimed_transaction_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          loser_id: string
          offered_auction_id: string
          price: number
          source_auction_id: string
          status?: Database["public"]["Enums"]["offer_status"]
        }
        Update: {
          cascade_rank?: number
          claimed_transaction_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          loser_id?: string
          offered_auction_id?: string
          price?: number
          source_auction_id?: string
          status?: Database["public"]["Enums"]["offer_status"]
        }
        Relationships: [
          {
            foreignKeyName: "second_chance_offers_claimed_transaction_id_fkey"
            columns: ["claimed_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "second_chance_offers_loser_id_fkey"
            columns: ["loser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "second_chance_offers_offered_auction_id_fkey"
            columns: ["offered_auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "second_chance_offers_source_auction_id_fkey"
            columns: ["source_auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      tee_time_slots: {
        Row: {
          course_id: string
          created_at: string
          id: string
          notes: string | null
          players: number
          rack_rate: number
          tee_date: string
          tee_time: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          notes?: string | null
          players?: number
          rack_rate: number
          tee_date: string
          tee_time: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          players?: number
          rack_rate?: number
          tee_date?: string
          tee_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "tee_time_slots_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          auction_id: string
          buyer_premium: number
          captured_at: string | null
          course_id: string
          created_at: string
          credit_applied: number
          id: string
          paid_out_at: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          total_charged: number
          winner_id: string
          winning_bid: number
        }
        Insert: {
          auction_id: string
          buyer_premium: number
          captured_at?: string | null
          course_id: string
          created_at?: string
          credit_applied?: number
          id?: string
          paid_out_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_charged: number
          winner_id: string
          winning_bid: number
        }
        Update: {
          auction_id?: string
          buyer_premium?: number
          captured_at?: string | null
          course_id?: string
          created_at?: string
          credit_applied?: number
          id?: string
          paid_out_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_charged?: number
          winner_id?: string
          winning_bid?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: true
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_second_chance: {
        Args: { p_offer_id: string; p_user_id: string }
        Returns: Json
      }
      close_auction: { Args: { p_auction_id: string }; Returns: Json }
      close_due_auctions: { Args: never; Returns: number }
      decline_second_chance: {
        Args: { p_offer_id: string; p_user_id: string }
        Returns: Json
      }
      get_my_courses: {
        Args: never
        Returns: {
          contact_email: string
          id: string
          location: string
          name: string
          rack_rate_default: number
          slug: string
          stripe_account_id: string
          stripe_onboarded: boolean
        }[]
      }
      offer_next_loser: {
        Args: { p_offered: string; p_rank: number; p_source: string }
        Returns: undefined
      }
      place_bid: {
        Args: { p_amount: number; p_auction_id: string; p_bidder_id: string }
        Returns: Json
      }
      redeem_available_credit: {
        Args: { p_premium: number; p_tx: string; p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      auction_status:
        | "draft"
        | "scheduled"
        | "live"
        | "closing"
        | "closed"
        | "cancelled"
      bid_status: "active" | "outbid" | "won" | "refunded"
      credit_status: "active" | "redeemed" | "expired"
      offer_status: "pending" | "claimed" | "declined" | "expired"
      transaction_status:
        | "pending"
        | "captured"
        | "paid_out"
        | "refunded"
        | "failed"
      user_role: "golfer" | "course_admin" | "teestrike_admin"
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
      auction_status: [
        "draft",
        "scheduled",
        "live",
        "closing",
        "closed",
        "cancelled",
      ],
      bid_status: ["active", "outbid", "won", "refunded"],
      credit_status: ["active", "redeemed", "expired"],
      offer_status: ["pending", "claimed", "declined", "expired"],
      transaction_status: [
        "pending",
        "captured",
        "paid_out",
        "refunded",
        "failed",
      ],
      user_role: ["golfer", "course_admin", "teestrike_admin"],
    },
  },
} as const
