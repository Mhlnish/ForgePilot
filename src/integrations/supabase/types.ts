export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      assistant_conversations: {
        Row: {
          created_at: string;
          id: string;
          repository_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          repository_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          repository_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assistant_conversations_repository_id_fkey";
            columns: ["repository_id"];
            isOneToOne: false;
            referencedRelation: "repositories";
            referencedColumns: ["id"];
          },
        ];
      };
      assistant_messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["chat_role"];
          source: string;
          user_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["chat_role"];
          source?: string;
          user_id?: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["chat_role"];
          source?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assistant_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "assistant_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      maintenance_tasks: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          due_date: string | null;
          id: string;
          position: number;
          priority: Database["public"]["Enums"]["task_priority"];
          repository_id: string | null;
          status: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          position?: number;
          priority?: Database["public"]["Enums"]["task_priority"];
          repository_id?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          title: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          due_date?: string | null;
          id?: string;
          position?: number;
          priority?: Database["public"]["Enums"]["task_priority"];
          repository_id?: string | null;
          status?: Database["public"]["Enums"]["task_status"];
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_repository_id_fkey";
            columns: ["repository_id"];
            isOneToOne: false;
            referencedRelation: "repositories";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          github_username: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          github_username?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          github_username?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      release_drafts: {
        Row: {
          breaking_changes: string | null;
          bug_fixes: string | null;
          changes: string | null;
          content_markdown: string | null;
          created_at: string;
          generator: string;
          id: string;
          improvements: string | null;
          repository_id: string | null;
          status: Database["public"]["Enums"]["release_status"];
          updated_at: string;
          user_id: string;
          version: string;
        };
        Insert: {
          breaking_changes?: string | null;
          bug_fixes?: string | null;
          changes?: string | null;
          content_markdown?: string | null;
          created_at?: string;
          generator?: string;
          id?: string;
          improvements?: string | null;
          repository_id?: string | null;
          status?: Database["public"]["Enums"]["release_status"];
          updated_at?: string;
          user_id?: string;
          version: string;
        };
        Update: {
          breaking_changes?: string | null;
          bug_fixes?: string | null;
          changes?: string | null;
          content_markdown?: string | null;
          created_at?: string;
          generator?: string;
          id?: string;
          improvements?: string | null;
          repository_id?: string | null;
          status?: Database["public"]["Enums"]["release_status"];
          updated_at?: string;
          user_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "release_drafts_repository_id_fkey";
            columns: ["repository_id"];
            isOneToOne: false;
            referencedRelation: "repositories";
            referencedColumns: ["id"];
          },
        ];
      };
      repositories: {
        Row: {
          created_at: string;
          default_branch: string;
          description: string | null;
          external_id: string | null;
          id: string;
          language: string | null;
          last_opened_at: string | null;
          last_synced_at: string | null;
          name: string;
          provider: string;
          updated_at: string;
          url: string | null;
          user_id: string;
          visibility: Database["public"]["Enums"]["repo_visibility"];
        };
        Insert: {
          created_at?: string;
          default_branch?: string;
          description?: string | null;
          external_id?: string | null;
          id?: string;
          language?: string | null;
          last_opened_at?: string | null;
          last_synced_at?: string | null;
          name: string;
          provider?: string;
          updated_at?: string;
          url?: string | null;
          user_id?: string;
          visibility?: Database["public"]["Enums"]["repo_visibility"];
        };
        Update: {
          created_at?: string;
          default_branch?: string;
          description?: string | null;
          external_id?: string | null;
          id?: string;
          language?: string | null;
          last_opened_at?: string | null;
          last_synced_at?: string | null;
          name?: string;
          provider?: string;
          updated_at?: string;
          url?: string | null;
          user_id?: string;
          visibility?: Database["public"]["Enums"]["repo_visibility"];
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          ai_mode: string;
          created_at: string;
          onboarding_completed: boolean;
          theme: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_mode?: string;
          created_at?: string;
          onboarding_completed?: boolean;
          theme?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_mode?: string;
          created_at?: string;
          onboarding_completed?: boolean;
          theme?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      chat_role: "user" | "assistant" | "system";
      release_status: "draft" | "final";
      repo_visibility: "public" | "private";
      task_priority: "low" | "medium" | "high" | "urgent";
      task_status: "backlog" | "todo" | "in_progress" | "review" | "done";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      chat_role: ["user", "assistant", "system"],
      release_status: ["draft", "final"],
      repo_visibility: ["public", "private"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["backlog", "todo", "in_progress", "review", "done"],
    },
  },
} as const;
