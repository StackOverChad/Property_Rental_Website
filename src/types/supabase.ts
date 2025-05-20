export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          address: string
          city: string
          state: string
          zip: string
          price: number
          bedrooms: number
          bathrooms: number
          square_feet: number
          property_type: string
          available_from: string
          available_to: string | null
          is_available: boolean
          owner_id: string
          images: string[]
          amenities: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          address: string
          city: string
          state: string
          zip: string
          price: number
          bedrooms: number
          bathrooms: number
          square_feet: number
          property_type: string
          available_from: string
          available_to?: string | null
          is_available?: boolean
          owner_id: string
          images?: string[]
          amenities?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          price?: number
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          property_type?: string
          available_from?: string
          available_to?: string | null
          is_available?: boolean
          owner_id?: string
          images?: string[]
          amenities?: string[]
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          property_id: string
          tenant_id: string
          start_date: string
          end_date: string
          total_price: number
          status: string
          message: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          property_id: string
          tenant_id: string
          start_date: string
          end_date: string
          total_price: number
          status?: string
          message?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          property_id?: string
          tenant_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: string
          message?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          avatar_url: string | null
          phone: string | null
          user_type: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          phone?: string | null
          user_type: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          phone?: string | null
          user_type?: string
        }
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          property_id: string
          reviewer_id: string
          rating: number
          comment: string
        }
        Insert: {
          id?: string
          created_at?: string
          property_id: string
          reviewer_id: string
          rating: number
          comment: string
        }
        Update: {
          id?: string
          created_at?: string
          property_id?: string
          reviewer_id?: string
          rating?: number
          comment?: string
        }
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
  }
}