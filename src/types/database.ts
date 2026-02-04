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
          email: string | null;
          phone: string | null;
          location_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pin: string;
          full_name: string;
          role?: string;
          email?: string | null;
          phone?: string | null;
          location_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pin?: string;
          full_name?: string;
          role?: string;
          email?: string | null;
          phone?: string | null;
          location_id?: string | null;
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
      locations: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      time_off_requests: {
        Row: {
          id: string;
          worker_id: string;
          type: TimeOffType;
          start_date: string;
          end_date: string;
          paid_hours: number;
          unpaid_hours: number;
          is_excused: boolean;
          is_planned: boolean;
          comments: string | null;
          status: RequestStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          denial_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          type: TimeOffType;
          start_date: string;
          end_date: string;
          paid_hours?: number;
          unpaid_hours?: number;
          is_excused?: boolean;
          is_planned?: boolean;
          comments?: string | null;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          denial_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          type?: TimeOffType;
          start_date?: string;
          end_date?: string;
          paid_hours?: number;
          unpaid_hours?: number;
          is_excused?: boolean;
          is_planned?: boolean;
          comments?: string | null;
          status?: RequestStatus;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          denial_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      verification_codes: {
        Row: {
          id: string;
          worker_id: string;
          code: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          code: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          code?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
      };
      passkey_credentials: {
        Row: {
          id: string;
          worker_id: string;
          credential_id: string;
          public_key: string; // Base64 encoded
          counter: number;
          device_name: string | null;
          transports: string[] | null;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          credential_id: string;
          public_key: string;
          counter?: number;
          device_name?: string | null;
          transports?: string[] | null;
          last_used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          credential_id?: string;
          public_key?: string;
          counter?: number;
          device_name?: string | null;
          transports?: string[] | null;
          last_used_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      punch_type: "IN" | "OUT";
      time_off_type: TimeOffType;
      request_status: RequestStatus;
    };
  };
};

// Enum types
export type TimeOffType = "vacation" | "personal" | "sick" | "bereavement" | "unpaid";
export type RequestStatus = "pending" | "approved" | "denied";

// Convenience types
export type Worker = Database["public"]["Tables"]["workers"]["Row"];
export type Punch = Database["public"]["Tables"]["punches"]["Row"];
export type ProductionLog = Database["public"]["Tables"]["production_logs"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type TimeOffRequest = Database["public"]["Tables"]["time_off_requests"]["Row"];
export type VerificationCode = Database["public"]["Tables"]["verification_codes"]["Row"];
export type PasskeyCredential = Database["public"]["Tables"]["passkey_credentials"]["Row"];

// Extended types with relations
export type WorkerWithLocation = Worker & {
  location?: Location;
};

export type TimeOffRequestWithWorker = TimeOffRequest & {
  worker?: Worker;
  reviewer?: Worker;
};
