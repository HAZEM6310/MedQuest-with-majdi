export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Voucher {
  id: string;
  code: string;
  label?: string;
  number_of_users: number;
  total_credits: number;
  totalMonthsSold: number;
  totalRevenue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  credits?: number; // compatibility for legacy code
}

export interface VoucherStats {
  voucher_id: string;
  code: string;
  label?: string;
  is_active: boolean;
  total_users: number;
  total_credits: number;
  credit_count: number;
  total_months_sold: number;
  total_revenue: number;
  created_at: string;
  user_count?: number; // Add this new field
  // other fields...
}

// Add Faculty interface
export interface Faculty {
  id: string;
  name: string;
  name_en?: string;
  name_fr?: string;
  description?: string;
  description_en?: string;
  description_fr?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

// Update Question interface to include faculty_id
export interface Question {
  id: string;
  course_id: string;
  faculty_id?: string;
  text: string;
  text_en?: string;
  text_fr?: string;
  explanation?: string;
  explanation_en?: string;
  explanation_fr?: string;
  created_at: string;
  options?: Option[];
  faculty?: Faculty;
}

export interface Option {
  id: string;
  question_id: string;
  text: string;
  text_en?: string;
  text_fr?: string;
  is_correct?: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  title_en?: string;
  title_fr?: string;
  description?: string;
  description_en?: string;
  description_fr?: string;
  subject_id: string;
  image?: string;
  is_free?: boolean;
  created_at: string;
  question_count?: number;
}

export interface QuizSettings {
  showAnswersImmediately: boolean;
}

export interface QuizProgress {
  id: string;
  user_id: string;
  course_id: string;
  current_question?: number;
  user_answers?: {[key: string]: string[]};
  score?: number;
  questions_answered?: number;
  is_completed?: boolean;
  final_grade?: number;
  wrong_answers?: string[];
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      course_sections: {
        Row: {
          content_en: string | null
          content_fr: string | null
          course_id: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          id: string
          order_index: number
          title_en: string
          title_fr: string
        }
        Insert: {
          content_en?: string | null
          content_fr?: string | null
          course_id: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          id?: string
          order_index: number
          title_en: string
          title_fr: string
        }
        Update: {
          content_en?: string | null
          content_fr?: string | null
          course_id?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          id?: string
          order_index?: number
          title_en?: string
          title_fr?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          description_en: string | null
          description_fr: string | null
          id: string
          image: string | null
          is_free: boolean | null
          question_count: number | null
          subject_id: string
          title: string
          title_en: string | null
          title_fr: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          image?: string | null
          is_free?: boolean | null
          question_count?: number | null
          subject_id: string
          title: string
          title_en?: string | null
          title_fr?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          image?: string | null
          is_free?: boolean | null
          question_count?: number | null
          subject_id?: string
          title?: string
          title_en?: string | null
          title_fr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      device_sessions: {
        Row: {
          created_at: string
          device_fingerprint: string
          id: string
          is_active: boolean | null
          last_active: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          id?: string
          is_active?: boolean | null
          last_active?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          id?: string
          is_active?: boolean | null
          last_active?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          text: string
          text_en: string | null
          text_fr: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          text: string
          text_en?: string | null
          text_fr?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          text?: string
          text_en?: string | null
          text_fr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      question_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          question_id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          question_id: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          question_id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          course_id: string
          created_at: string
          explanation: string | null
          explanation_en: string | null
          explanation_fr: string | null
          id: string
          text: string
          text_en: string | null
          text_fr: string | null
          faculty_id: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          explanation?: string | null
          explanation_en?: string | null
          explanation_fr?: string | null
          id?: string
          text: string
          text_en?: string | null
          text_fr?: string | null
          faculty_id?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          explanation?: string | null
          explanation_en?: string | null
          explanation_fr?: string | null
          id?: string
          text?: string
          text_en?: string | null
          text_fr?: string | null
          faculty_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculties"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_progress: {
        Row: {
          course_id: string
          created_at: string
          current_question: number | null
          final_grade: number | null
          id: string
          is_completed: boolean | null
          questions_answered: number | null
          score: number | null
          updated_at: string
          user_answers: Json | null
          user_id: string
          wrong_answers: string[] | null
        }
        Insert: {
          course_id: string
          created_at?: string
          current_question?: number | null
          final_grade?: number | null
          id?: string
          is_completed?: boolean | null
          questions_answered?: number | null
          score?: number | null
          updated_at?: string
          user_answers?: Json | null
          user_id: string
          wrong_answers?: string[] | null
        }
        Update: {
          course_id?: string
          created_at?: string
          current_question?: number | null
          final_grade?: number | null
          id?: string
          is_completed?: boolean | null
          questions_answered?: number | null
          score?: number | null
          updated_at?: string
          user_answers?: Json | null
          user_id?: string
          wrong_answers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          description_fr: string | null
          id: string
          name: string
          name_en: string | null
          name_fr: string | null
          order_index: number
          year_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name: string
          name_en?: string | null
          name_fr?: string | null
          order_index: number
          year_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name?: string
          name_en?: string | null
          name_fr?: string | null
          order_index?: number
          year_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_year_id_fkey"
            columns: ["year_id"]
            isOneToOne: false
            referencedRelation: "years"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          clicktopay_transaction_id: string | null
          created_at: string
          duration: Database["public"]["Enums"]["subscription_duration"]
          end_date: string
          id: string
          is_active: boolean | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          price_tnd: number
          start_date: string
          user_id: string
        }
        Insert: {
          clicktopay_transaction_id?: string | null
          created_at?: string
          duration: Database["public"]["Enums"]["subscription_duration"]
          end_date: string
          id?: string
          is_active?: boolean | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price_tnd: number
          start_date?: string
          user_id: string
        }
        Update: {
          clicktopay_transaction_id?: string | null
          created_at?: string
          duration?: Database["public"]["Enums"]["subscription_duration"]
          end_date?: string
          id?: string
          is_active?: boolean | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          price_tnd?: number
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          course_id: string
          created_at: string
          id: string
          last_attempt: string | null
          questions_attempted: number | null
          questions_correct: number | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          last_attempt?: string | null
          questions_attempted?: number | null
          questions_correct?: number | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          last_attempt?: string | null
          questions_attempted?: number | null
          questions_correct?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      years: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          description_fr: string | null
          id: string
          name: string
          name_en: string | null
          name_fr: string | null
          order_index: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name: string
          name_en?: string | null
          name_fr?: string | null
          order_index: number
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name?: string
          name_en?: string | null
          name_fr?: string | null
          order_index?: number
        }
        Relationships: []
      }
      faculties: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          description_fr: string | null
          id: string
          name: string
          name_en: string | null
          name_fr: string | null
          order_index: number
          is_active: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name: string
          name_en?: string | null
          name_fr?: string | null
          order_index: number
          is_active?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name?: string
          name_en?: string | null
          name_fr?: string | null
          order_index?: number
          is_active?: boolean
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
      payment_status: "pending" | "completed" | "failed" | "refunded"
      subscription_duration:
        | "1_month"
        | "2_months"
        | "3_months"
        | "6_months"
        | "9_months"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      payment_status: ["pending", "completed", "failed", "refunded"],
      subscription_duration: [
        "1_month",
        "2_months",
        "3_months",
        "6_months",
        "9_months",
      ],
    },
  },
} as const