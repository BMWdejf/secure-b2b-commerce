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
      addresses: {
        Row: {
          city: string
          company_id: string
          contact_name: string | null
          country: string
          created_at: string
          id: string
          is_default: boolean
          kind: Database["public"]["Enums"]["address_kind"]
          label: string | null
          phone: string | null
          postal_code: string
          street: string
          updated_at: string
        }
        Insert: {
          city: string
          company_id: string
          contact_name?: string | null
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          kind: Database["public"]["Enums"]["address_kind"]
          label?: string | null
          phone?: string | null
          postal_code: string
          street: string
          updated_at?: string
        }
        Update: {
          city?: string
          company_id?: string
          contact_name?: string | null
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          kind?: Database["public"]["Enums"]["address_kind"]
          label?: string | null
          phone?: string | null
          postal_code?: string
          street?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          qty: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          qty?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          qty?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          dic: string | null
          email: string | null
          ico: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          pricelist_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dic?: string | null
          email?: string | null
          ico?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          pricelist_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dic?: string | null
          email?: string | null
          ico?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          pricelist_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "pricelists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_addresses: {
        Row: {
          city: string | null
          company_name: string
          country: string
          created_at: string
          dic: string | null
          email: string | null
          ico: string | null
          id: string
          kind: Database["public"]["Enums"]["contact_address_kind"]
          phone: string | null
          postal_code: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          company_name?: string
          country?: string
          created_at?: string
          dic?: string | null
          email?: string | null
          ico?: string | null
          id?: string
          kind: Database["public"]["Enums"]["contact_address_kind"]
          phone?: string | null
          postal_code?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          company_name?: string
          country?: string
          created_at?: string
          dic?: string | null
          email?: string | null
          ico?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["contact_address_kind"]
          phone?: string | null
          postal_code?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          low_stock_threshold: number
          product_id: string
          qty_available: number
          updated_at: string
        }
        Insert: {
          low_stock_threshold?: number
          product_id: string
          qty_available?: number
          updated_at?: string
        }
        Update: {
          low_stock_threshold?: number
          product_id?: string
          qty_available?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          qty: number
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          qty: number
          unit?: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          qty?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          company_id: string
          created_at: string
          created_by: string
          currency: string
          customer_note: string | null
          id: string
          internal_note: string | null
          invoice_url: string | null
          order_number: string
          shipping: number
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          vat: number
        }
        Insert: {
          billing_address?: Json | null
          company_id: string
          created_at?: string
          created_by: string
          currency?: string
          customer_note?: string | null
          id?: string
          internal_note?: string | null
          invoice_url?: string | null
          order_number?: string
          shipping?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          vat?: number
        }
        Update: {
          billing_address?: Json | null
          company_id?: string
          created_at?: string
          created_by?: string
          currency?: string
          customer_note?: string | null
          id?: string
          internal_note?: string | null
          invoice_url?: string | null
          order_number?: string
          shipping?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          vat?: number
        }
        Relationships: []
      }
      pages: {
        Row: {
          content_html: string
          created_at: string
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content_html?: string
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content_html?: string
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricelist_items: {
        Row: {
          created_at: string
          id: string
          min_qty: number
          pricelist_id: string
          product_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_qty?: number
          pricelist_id: string
          product_id: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          min_qty?: number
          pricelist_id?: string
          product_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricelist_items_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "pricelists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricelist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pricelists: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_default: boolean
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_default?: boolean
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_default?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability: Database["public"]["Enums"]["product_availability"]
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          main_image_url: string | null
          moq: number
          name: string
          pack_label: string
          pack_size: number
          short_description: string | null
          sku: string | null
          slug: string
          unit: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          availability?: Database["public"]["Enums"]["product_availability"]
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          main_image_url?: string | null
          moq?: number
          name: string
          pack_label?: string
          pack_size?: number
          short_description?: string | null
          sku?: string | null
          slug: string
          unit?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          availability?: Database["public"]["Enums"]["product_availability"]
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          main_image_url?: string | null
          moq?: number
          name?: string
          pack_label?: string
          pack_size?: number
          short_description?: string | null
          sku?: string | null
          slug?: string
          unit?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
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
      site_settings: {
        Row: {
          availability_in_stock_label: string
          availability_on_request_label: string
          brand_name: string
          company_dic: string | null
          company_ico: string | null
          created_at: string
          cta_button: string
          cta_text: string
          cta_title: string
          default_pack_label: string
          features: Json
          features_subtitle: string
          features_title: string
          footer_text: string
          hero_badge: string
          hero_cta_primary: string
          hero_cta_secondary: string
          hero_note: string
          hero_stats: Json
          hero_subtitle: string
          hero_title: string
          hero_title_accent: string
          id: string
          is_singleton: boolean
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          availability_in_stock_label?: string
          availability_on_request_label?: string
          brand_name?: string
          company_dic?: string | null
          company_ico?: string | null
          created_at?: string
          cta_button?: string
          cta_text?: string
          cta_title?: string
          default_pack_label?: string
          features?: Json
          features_subtitle?: string
          features_title?: string
          footer_text?: string
          hero_badge?: string
          hero_cta_primary?: string
          hero_cta_secondary?: string
          hero_note?: string
          hero_stats?: Json
          hero_subtitle?: string
          hero_title?: string
          hero_title_accent?: string
          id?: string
          is_singleton?: boolean
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          availability_in_stock_label?: string
          availability_on_request_label?: string
          brand_name?: string
          company_dic?: string | null
          company_ico?: string | null
          created_at?: string
          cta_button?: string
          cta_text?: string
          cta_title?: string
          default_pack_label?: string
          features?: Json
          features_subtitle?: string
          features_title?: string
          footer_text?: string
          hero_badge?: string
          hero_cta_primary?: string
          hero_cta_secondary?: string
          hero_note?: string
          hero_stats?: Json
          hero_subtitle?: string
          hero_title?: string
          hero_title_accent?: string
          id?: string
          is_singleton?: boolean
          logo_url?: string | null
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      get_user_pricelist_id: { Args: { _user_id: string }; Returns: string }
      get_user_status: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["profile_status"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_order_number: { Args: never; Returns: string }
    }
    Enums: {
      address_kind: "billing" | "shipping"
      app_role: "admin" | "client"
      contact_address_kind: "billing" | "shipping"
      order_status:
        | "new"
        | "confirmed"
        | "processing"
        | "shipped"
        | "completed"
        | "cancelled"
      product_availability: "in_stock" | "on_request"
      profile_status: "pending" | "approved" | "blocked"
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
      address_kind: ["billing", "shipping"],
      app_role: ["admin", "client"],
      contact_address_kind: ["billing", "shipping"],
      order_status: [
        "new",
        "confirmed",
        "processing",
        "shipped",
        "completed",
        "cancelled",
      ],
      product_availability: ["in_stock", "on_request"],
      profile_status: ["pending", "approved", "blocked"],
    },
  },
} as const
