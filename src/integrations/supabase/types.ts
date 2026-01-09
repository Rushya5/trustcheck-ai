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
      activity_logs: {
        Row: {
          action: string
          case_id: string | null
          created_at: string
          description: string | null
          icon: string | null
          icon_color: string | null
          id: string
          media_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          action: string
          case_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          media_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          action?: string
          case_id?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          icon_color?: string | null
          id?: string
          media_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_results: {
        Row: {
          audio_artifacts: Json | null
          audio_confidence: number | null
          audio_manipulation_detected: boolean | null
          blockchain_tx_id: string | null
          blockchain_verified_at: string | null
          completed_at: string | null
          context_notes: string | null
          context_verified: boolean | null
          created_at: string
          credibility_level:
            | Database["public"]["Enums"]["credibility_level"]
            | null
          credibility_score: number | null
          exif_data: Json | null
          heatmap_data: Json | null
          id: string
          legal_explanation: string | null
          media_id: string
          metadata_integrity_score: number | null
          metadata_issues: Json | null
          plain_explanation: string | null
          processing_started_at: string | null
          sha256_hash: string | null
          status: Database["public"]["Enums"]["analysis_status"]
          technical_explanation: string | null
          updated_at: string
          visual_artifacts: Json | null
          visual_confidence: number | null
          visual_manipulation_detected: boolean | null
        }
        Insert: {
          audio_artifacts?: Json | null
          audio_confidence?: number | null
          audio_manipulation_detected?: boolean | null
          blockchain_tx_id?: string | null
          blockchain_verified_at?: string | null
          completed_at?: string | null
          context_notes?: string | null
          context_verified?: boolean | null
          created_at?: string
          credibility_level?:
            | Database["public"]["Enums"]["credibility_level"]
            | null
          credibility_score?: number | null
          exif_data?: Json | null
          heatmap_data?: Json | null
          id?: string
          legal_explanation?: string | null
          media_id: string
          metadata_integrity_score?: number | null
          metadata_issues?: Json | null
          plain_explanation?: string | null
          processing_started_at?: string | null
          sha256_hash?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          technical_explanation?: string | null
          updated_at?: string
          visual_artifacts?: Json | null
          visual_confidence?: number | null
          visual_manipulation_detected?: boolean | null
        }
        Update: {
          audio_artifacts?: Json | null
          audio_confidence?: number | null
          audio_manipulation_detected?: boolean | null
          blockchain_tx_id?: string | null
          blockchain_verified_at?: string | null
          completed_at?: string | null
          context_notes?: string | null
          context_verified?: boolean | null
          created_at?: string
          credibility_level?:
            | Database["public"]["Enums"]["credibility_level"]
            | null
          credibility_score?: number | null
          exif_data?: Json | null
          heatmap_data?: Json | null
          id?: string
          legal_explanation?: string | null
          media_id?: string
          metadata_integrity_score?: number | null
          metadata_issues?: Json | null
          plain_explanation?: string | null
          processing_started_at?: string | null
          sha256_hash?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          technical_explanation?: string | null
          updated_at?: string
          visual_artifacts?: Json | null
          visual_confidence?: number | null
          visual_manipulation_detected?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_number: string
          created_at: string
          description: string | null
          id: string
          priority: string | null
          status: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          case_number: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          case_number?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      media_files: {
        Row: {
          case_id: string
          created_at: string
          duration: number | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type: string
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          duration?: number | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          mime_type: string
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          duration?: number | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          mime_type?: string
          thumbnail_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_files_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          organization: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          organization?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          organization?: string | null
          role?: string | null
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
      generate_case_number: { Args: never; Returns: string }
    }
    Enums: {
      analysis_status: "pending" | "processing" | "completed" | "failed"
      case_status: "open" | "analyzing" | "completed" | "archived"
      credibility_level:
        | "authentic"
        | "likely_authentic"
        | "uncertain"
        | "likely_manipulated"
        | "manipulated"
      media_type: "image" | "video" | "audio"
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
      analysis_status: ["pending", "processing", "completed", "failed"],
      case_status: ["open", "analyzing", "completed", "archived"],
      credibility_level: [
        "authentic",
        "likely_authentic",
        "uncertain",
        "likely_manipulated",
        "manipulated",
      ],
      media_type: ["image", "video", "audio"],
    },
  },
} as const
