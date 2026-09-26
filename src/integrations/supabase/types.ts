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
    PostgrestVersion: "14.5"
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
      api_token_cache: {
        Row: {
          access_token: string
          expires_at: string
          provider: string
          updated_at: string
        }
        Insert: {
          access_token: string
          expires_at: string
          provider: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          expires_at?: string
          provider?: string
          updated_at?: string
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
      aqc_bookings: {
        Row: {
          amadeus_order_id: string | null
          contact_email: string | null
          created_at: string
          error_detail: Json | null
          id: string
          offer_id: string | null
          order_response: Json | null
          passengers: Json | null
          pnr: string | null
          price_response: Json | null
          search_id: string | null
          status: string
          ticket_numbers: Json | null
          ticket_requested_at: string | null
          ticket_requested_by: string | null
          ticketed_at: string | null
          ticketed_by: string | null
          ticketing_status: string
          updated_at: string
        }
        Insert: {
          amadeus_order_id?: string | null
          contact_email?: string | null
          created_at?: string
          error_detail?: Json | null
          id?: string
          offer_id?: string | null
          order_response?: Json | null
          passengers?: Json | null
          pnr?: string | null
          price_response?: Json | null
          search_id?: string | null
          status?: string
          ticket_numbers?: Json | null
          ticket_requested_at?: string | null
          ticket_requested_by?: string | null
          ticketed_at?: string | null
          ticketed_by?: string | null
          ticketing_status?: string
          updated_at?: string
        }
        Update: {
          amadeus_order_id?: string | null
          contact_email?: string | null
          created_at?: string
          error_detail?: Json | null
          id?: string
          offer_id?: string | null
          order_response?: Json | null
          passengers?: Json | null
          pnr?: string | null
          price_response?: Json | null
          search_id?: string | null
          status?: string
          ticket_numbers?: Json | null
          ticket_requested_at?: string | null
          ticket_requested_by?: string | null
          ticketed_at?: string | null
          ticketed_by?: string | null
          ticketing_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      aqc_flight_offers_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          offer_id: string
          raw_offer: Json
          search_id: string
          search_params: Json | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          offer_id: string
          raw_offer: Json
          search_id: string
          search_params?: Json | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          offer_id?: string
          raw_offer?: Json
          search_id?: string
          search_params?: Json | null
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          booked_at: string | null
          booked_by: string | null
          confirmed_at: string | null
          confirmed_by_email: string | null
          created_at: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          include_fee: boolean
          include_flight: boolean
          include_hotel: boolean
          include_transfer: boolean
          notes: string | null
          price_check: Json | null
          quote_id: string
          requested_by_email: string | null
          selected_fee: Json | null
          selected_flight: Json | null
          selected_hotel: Json | null
          selected_transfer: Json | null
          status: string
          updated_at: string
          vendor_booking_reference: string | null
          vendor_response: Json | null
        }
        Insert: {
          booked_at?: string | null
          booked_by?: string | null
          confirmed_at?: string | null
          confirmed_by_email?: string | null
          created_at?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          include_fee?: boolean
          include_flight?: boolean
          include_hotel?: boolean
          include_transfer?: boolean
          notes?: string | null
          price_check?: Json | null
          quote_id: string
          requested_by_email?: string | null
          selected_fee?: Json | null
          selected_flight?: Json | null
          selected_hotel?: Json | null
          selected_transfer?: Json | null
          status?: string
          updated_at?: string
          vendor_booking_reference?: string | null
          vendor_response?: Json | null
        }
        Update: {
          booked_at?: string | null
          booked_by?: string | null
          confirmed_at?: string | null
          confirmed_by_email?: string | null
          created_at?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          include_fee?: boolean
          include_flight?: boolean
          include_hotel?: boolean
          include_transfer?: boolean
          notes?: string | null
          price_check?: Json | null
          quote_id?: string
          requested_by_email?: string | null
          selected_fee?: Json | null
          selected_flight?: Json | null
          selected_hotel?: Json | null
          selected_transfer?: Json | null
          status?: string
          updated_at?: string
          vendor_booking_reference?: string | null
          vendor_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_quote_id_fkey"
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
          company_id: string | null
          created_at: string | null
          email: string | null
          id: string
          language: string | null
          name: string | null
          whatsapp_number: string
        }
        Insert: {
          company?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          language?: string | null
          name?: string | null
          whatsapp_number: string
        }
        Update: {
          company?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          language?: string | null
          name?: string | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_mobile: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          domain: string | null
          id: string
          name: string
          notes: string | null
          oib: string | null
          payment_terms_days: number | null
          payment_terms_note: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_mobile?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
          notes?: string | null
          oib?: string | null
          payment_terms_days?: number | null
          payment_terms_note?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_mobile?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
          notes?: string | null
          oib?: string | null
          payment_terms_days?: number | null
          payment_terms_note?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_fee_schedules: {
        Row: {
          company_id: string | null
          created_at: string | null
          flight_domestic_business_eur: number | null
          flight_domestic_economy_eur: number | null
          flight_europe_business_eur: number | null
          flight_europe_economy_eur: number | null
          flight_intercontinental_business_eur: number | null
          flight_intercontinental_economy_eur: number | null
          hotel_commission_pct: number | null
          id: string
          notes: string | null
          transfer_commission_pct: number | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          flight_domestic_business_eur?: number | null
          flight_domestic_economy_eur?: number | null
          flight_europe_business_eur?: number | null
          flight_europe_economy_eur?: number | null
          flight_intercontinental_business_eur?: number | null
          flight_intercontinental_economy_eur?: number | null
          hotel_commission_pct?: number | null
          id?: string
          notes?: string | null
          transfer_commission_pct?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          flight_domestic_business_eur?: number | null
          flight_domestic_economy_eur?: number | null
          flight_europe_business_eur?: number | null
          flight_europe_economy_eur?: number | null
          flight_intercontinental_business_eur?: number | null
          flight_intercontinental_economy_eur?: number | null
          hotel_commission_pct?: number | null
          id?: string
          notes?: string | null
          transfer_commission_pct?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_fee_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_policy_destination_rates: {
        Row: {
          created_at: string | null
          currency: string | null
          destination: string
          id: string
          max_nightly_rate_eur: number
          policy_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          destination: string
          id?: string
          max_nightly_rate_eur: number
          policy_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          destination?: string
          id?: string
          max_nightly_rate_eur?: number
          policy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_policy_destination_rates_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "company_travel_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_travel_policies: {
        Row: {
          company_id: string
          created_at: string | null
          hotel_near_venue_required: boolean | null
          id: string
          long_flight_class: string | null
          max_accommodation_stars: number | null
          max_flight_class: string | null
          min_accommodation_stars: number | null
          notes: string | null
          short_flight_class: string | null
          short_flight_max_hours: number | null
          traveler_type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          hotel_near_venue_required?: boolean | null
          id?: string
          long_flight_class?: string | null
          max_accommodation_stars?: number | null
          max_flight_class?: string | null
          min_accommodation_stars?: number | null
          notes?: string | null
          short_flight_class?: string | null
          short_flight_max_hours?: number | null
          traveler_type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          hotel_near_venue_required?: boolean | null
          id?: string
          long_flight_class?: string | null
          max_accommodation_stars?: number | null
          max_flight_class?: string | null
          min_accommodation_stars?: number | null
          notes?: string | null
          short_flight_class?: string | null
          short_flight_max_hours?: number | null
          traveler_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_travel_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
      hotels_by_stars: {
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
      profiles: {
        Row: {
          company: string
          company_id: string | null
          created_at: string
          full_name: string
          id: string
          role: string
        }
        Insert: {
          company?: string
          company_id?: string | null
          created_at?: string
          full_name?: string
          id: string
          role?: string
        }
        Update: {
          company?: string
          company_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
          assigned_agent_id: string | null
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
          assigned_agent_id?: string | null
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
          assigned_agent_id?: string | null
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
            foreignKeyName: "quotes_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      traveler_profiles: {
        Row: {
          account_id: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          is_default: boolean
          last_name: string
          notes: string | null
          passport_country: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone_country_code: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_default?: boolean
          last_name: string
          notes?: string | null
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_default?: boolean
          last_name?: string
          notes?: string | null
          passport_country?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "traveler_profiles_account_id_fkey"
            columns: ["account_id"]
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
      current_role_in: { Args: { target_roles: string[] }; Returns: boolean }
      current_role_is: { Args: { target_role: string }; Returns: boolean }
      get_applicable_fee_schedule: {
        Args: { p_company_id?: string }
        Returns: Json
      }
      get_applicable_travel_policy: {
        Args: { p_company_id: string; p_traveler_type: string }
        Returns: Json
      }
      get_traveler_profile_by_email: {
        Args: { p_email: string }
        Returns: {
          account_id: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          is_default: boolean
          last_name: string
          notes: string | null
          passport_country: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone_country_code: string | null
          phone_number: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "traveler_profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      match_4star_hotels: { Args: { candidates: Json }; Returns: Json }
      match_hotels_by_stars: {
        Args: { candidates: Json; p_stars: number }
        Returns: Json
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
