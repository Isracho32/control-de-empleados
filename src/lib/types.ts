export type Database = {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          position: string;
          hourly_rate_normal: number;
          hourly_rate_extra: number;
          is_active: boolean | null;
          created_at: string | null;
          employee_type: string | null;
          monthly_salary: number | null;
          daily_hours_required: number | null;
          shift_start: string | null;
          shift_end: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          position?: string;
          hourly_rate_normal?: number;
          hourly_rate_extra?: number;
          is_active?: boolean | null;
          created_at?: string;
          employee_type?: string | null;
          monthly_salary?: number | null;
          daily_hours_required?: number | null;
          shift_start?: string | null;
          shift_end?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          position?: string;
          hourly_rate_normal?: number;
          hourly_rate_extra?: number;
          is_active?: boolean | null;
          created_at?: string;
          employee_type?: string | null;
          monthly_salary?: number | null;
          daily_hours_required?: number | null;
          shift_start?: string | null;
          shift_end?: string | null;
        };
      };
      time_records: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          check_in: string;
          check_out: string | null;
          normal_hours: number | null;
          extra_hours: number | null;
          normal_pay: number | null;
          extra_pay: number | null;
          total_pay: number | null;
          created_at: string | null;
          updated_at: string | null;
          hours_missed: number | null;
          discount_pay: number | null;
          base_pay: number | null;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date?: string;
          check_in: string;
          check_out?: string | null;
          normal_hours?: number | null;
          extra_hours?: number | null;
          normal_pay?: number | null;
          extra_pay?: number | null;
          total_pay?: number | null;
          created_at?: string;
          updated_at?: string;
          hours_missed?: number | null;
          discount_pay?: number | null;
          base_pay?: number | null;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          check_in?: string;
          check_out?: string | null;
          normal_hours?: number | null;
          extra_hours?: number | null;
          normal_pay?: number | null;
          extra_pay?: number | null;
          total_pay?: number | null;
          created_at?: string;
          updated_at?: string;
          hours_missed?: number | null;
          discount_pay?: number | null;
          base_pay?: number | null;
        };
      };
    };
  };
};

export type Employee = Database['public']['Tables']['employees']['Row'];
export type TimeRecord = Database['public']['Tables']['time_records']['Row'];
