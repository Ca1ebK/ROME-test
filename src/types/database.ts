export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      workers: {
        Row: {
          id: string;
          pin: string;
          full_name: string;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pin: string;
          full_name: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pin?: string;
          full_name?: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      punches: {
        Row: {
          id: string;
          worker_id: string;
          type: "IN" | "OUT";
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          type: "IN" | "OUT";
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          type?: "IN" | "OUT";
          timestamp?: string;
          created_at?: string;
        };
      };
      production_logs: {
        Row: {
          id: string;
          worker_id: string;
          task_name: string;
          quantity: number;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          task_name: string;
          quantity: number;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          task_name?: string;
          quantity?: number;
          timestamp?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      punch_type: "IN" | "OUT";
    };
  };
};

// Convenience types
export type Worker = Database["public"]["Tables"]["workers"]["Row"];
export type Punch = Database["public"]["Tables"]["punches"]["Row"];
export type ProductionLog = Database["public"]["Tables"]["production_logs"]["Row"];
