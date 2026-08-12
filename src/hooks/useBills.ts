import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Bill } from '../lib/types';
import { todayISO } from '../lib/dates';

export function useBills(householdId: string | undefined) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!householdId) {
      setBills([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });
    setBills(data ?? []);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addBill(input: {
    groupId: string;
    name: string;
    amount: number | null;
    nextDueDate: string;
    intervalDays: number;
    autopay: boolean;
  }) {
    if (!householdId) throw new Error('No household selected.');
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('bills').insert({
      household_id: householdId,
      group_id: input.groupId,
      name: input.name,
      amount: input.amount,
      next_due_date: input.nextDueDate,
      interval_days: input.intervalDays,
      autopay: input.autopay,
      created_by: userData.user?.id,
    });
    if (error) throw error;
    await refresh();
  }

  async function payBill(id: string, amount: number | null, paidDate: string = todayISO()) {
    const { error } = await supabase.rpc('pay_bill', {
      p_bill_id: id,
      p_amount: amount,
      p_paid_date: paidDate,
    });
    if (error) throw error;
    await refresh();
  }

  async function removeBill(id: string) {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }

  return { bills, loading, refresh, addBill, payBill, removeBill };
}
