export type IconKey =
  | 'home'
  | 'bill'
  | 'car'
  | 'health'
  | 'pet'
  | 'plant'
  | 'tech'
  | 'card'
  | 'shield'
  | 'tool'
  | 'cal'
  | 'star';

export interface Household {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface HouseholdMember {
  household_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface Group {
  id: string;
  household_id: string;
  name: string;
  icon: IconKey;
  created_at: string;
}

export interface RecurringItem {
  id: string;
  household_id: string;
  group_id: string | null;
  name: string;
  last_date: string; // date
  interval_days: number;
  interval_months: number | null;
  created_by: string;
  created_at: string;
}

export interface Todo {
  id: string;
  household_id: string;
  title: string;
  notes: string | null;
  due_date: string | null; // date
  completed: boolean;
  completed_at: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
}

export interface Bill {
  id: string;
  household_id: string;
  group_id: string | null;
  name: string;
  amount: number | null;
  interval_days: number;
  interval_months: number | null;
  next_due_date: string; // date
  autopay: boolean;
  created_by: string;
  created_at: string;
}

export interface BillPayment {
  id: string;
  bill_id: string;
  household_id: string;
  amount_paid: number | null;
  paid_date: string; // date
  paid_by: string;
  created_at: string;
}

export type Urgency = 'ok' | 'soon' | 'late';
