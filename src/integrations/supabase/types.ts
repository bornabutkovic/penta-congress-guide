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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_logs: {
        Row: {
          created_at: string | null
          endpoint: string | null
          error: string | null
          id: string
          latency_ms: number | null
          request: Json | null
          response: Json | null
          service: string
        }
        Insert: {
          created_at?: string | null
          endpoint?: string | null
          error?: string | null
          id?: string
          latency_ms?: number | null
          request?: Json | null
          response?: Json | null
          service: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string | null
          error?: string | null
          id?: string
          latency_ms?: number | null
          request?: Json | null
          response?: Json | null
          service?: string
        }
        Relationships: []
      }
      approved_quotes_reference: {
        Row: {
          approved_at: string | null
          congress_name: string | null
          destination_iata: string | null
          fee_price_eur: number | null
          flight_carrier: string | null
          flight_price_eur: number | null
          flight_stops: number | null
          hotel_distance_km: number | null
          hotel_id: string | null
          hotel_price_eur: number | null
          hotel_stars: number | null
          id: string
          quote_id: string | null
          rejection_count: number | null
          total_price_eur: number | null
          transfer_price_eur: number | null
        }
        Insert: {
          approved_at?: string | null
          congress_name?: string | null
          destination_iata?: string | null
          fee_price_eur?: number | null
          flight_carrier?: string | null
          flight_price_eur?: number | null
          flight_stops?: number | null
          hotel_distance_km?: number | null
          hotel_id?: string | null
          hotel_price_eur?: number | null
          hotel_stars?: number | null
          id?: string
          quote_id?: string | null
          rejection_count?: number | null
          total_price_eur?: number | null
          transfer_price_eur?: number | null
        }
        Update: {
          approved_at?: string | null
          congress_name?: string | null
          destination_iata?: string | null
          fee_price_eur?: number | null
          flight_carrier?: string | null
          flight_price_eur?: number | null
          flight_stops?: number | null
          hotel_distance_km?: number | null
          hotel_id?: string | null
          hotel_price_eur?: number | null
          hotel_stars?: number | null
          id?: string
          quote_id?: string | null
          rejection_count?: number | null
          total_price_eur?: number | null
          transfer_price_eur?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "approved_quotes_reference_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          whatsapp_number: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          whatsapp_number: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          whatsapp_number?: string
        }
        Relationships: []
      }
      congresses: {
        Row: {
          city: string
          country: string
          created_at: string | null
          date_end: string
          date_start: string
          id: string
          name: string
          source_url: string | null
          venue_address: string | null
          venue_lat: number | null
          venue_lng: number | null
          venue_name: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string | null
          date_end: string
          date_start: string
          id?: string
          name: string
          source_url?: string | null
          venue_address?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          date_end?: string
          date_start?: string
          id?: string
          name?: string
          source_url?: string | null
          venue_address?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string
          completed_at: string | null
          congress_id: string | null
          created_at: string | null
          id: string
          intent: string | null
          messages: Json | null
          n8n_session_id: string | null
          quote_id: string | null
          slots: Json | null
          slots_complete: boolean | null
          status: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          congress_id?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          messages?: Json | null
          n8n_session_id?: string | null
          quote_id?: string | null
          slots?: Json | null
          slots_complete?: boolean | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          congress_id?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          messages?: Json | null
          n8n_session_id?: string | null
          quote_id?: string | null
          slots?: Json | null
          slots_complete?: boolean | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_congress_id_fkey"
            columns: ["congress_id"]
            isOneToOne: false
            referencedRelation: "congresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      "hotels 4*": {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          enriched: boolean | null
          hid: string
          latitude: number | null
          longitude: number | null
          name: string | null
          stars: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          enriched?: boolean | null
          hid: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          stars?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          enriched?: boolean | null
          hid?: string
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          stars?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      quote_approvals: {
        Row: {
          action: string
          approved_by: string | null
          comment: string | null
          created_at: string | null
          id: string
          quote_id: string
        }
        Insert: {
          action: string
          approved_by?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          quote_id: string
        }
        Update: {
          action?: string
          approved_by?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_approvals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          approval_token: string
          approved_at: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          congress_id: string | null
          created_at: string | null
          currency: string | null
          fee_data: Json | null
          flight_data: Json | null
          hotel_data: Json | null
          html_content: string | null
          id: string
          rejected_at: string | null
          rejection_segments: string[] | null
          request_data: Json | null
          sent_at: string | null
          status: string
          total_price: number | null
          transfer_data: Json | null
          updated_at: string | null
        }
        Insert: {
          approval_token?: string
          approved_at?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          congress_id?: string | null
          created_at?: string | null
          currency?: string | null
          fee_data?: Json | null
          flight_data?: Json | null
          hotel_data?: Json | null
          html_content?: string | null
          id?: string
          rejected_at?: string | null
          rejection_segments?: string[] | null
          request_data?: Json | null
          sent_at?: string | null
          status?: string
          total_price?: number | null
          transfer_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          approval_token?: string
          approved_at?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          congress_id?: string | null
          created_at?: string | null
          currency?: string | null
          fee_data?: Json | null
          flight_data?: Json | null
          hotel_data?: Json | null
          html_content?: string | null
          id?: string
          rejected_at?: string | null
          rejection_segments?: string[] | null
          request_data?: Json | null
          sent_at?: string | null
          status?: string
          total_price?: number | null
          transfer_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_congress_id_fkey"
            columns: ["congress_id"]
            isOneToOne: false
            referencedRelation: "congresses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_user_id: string | null
          company: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
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
