import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { RecurringItem } from '../lib/types';
import { todayISO } from '../lib/dates';

export function useRecurringItems(householdId: string | undefined) {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!householdId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('recurring_items')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(input: {
    groupId: string;
    name: string;
    lastDate: string;
    intervalDays: number;
    intervalMonths?: number | null;
  }) {
    if (!householdId) throw new Error('No household selected.');
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('recurring_items').insert({
      household_id: householdId,
      group_id: input.groupId,
      name: input.name,
      last_date: input.lastDate,
      interval_days: input.intervalDays,
      interval_months: input.intervalMonths ?? null,
      created_by: userData.user?.id,
    });
    if (error) throw error;
    await refresh();
  }

  async function updateItem(
    id: string,
    input: { groupId: string; name: string; lastDate: string; intervalDays: number; intervalMonths?: number | null }
  ) {
    const { error } = await supabase
      .from('recurring_items')
      .update({
        group_id: input.groupId,
        name: input.name,
        last_date: input.lastDate,
        interval_days: input.intervalDays,
        interval_months: input.intervalMonths ?? null,
      })
      .eq('id', id);
    if (error) throw error;
    await refresh();
  }

  async function markDone(id: string) {
    const { error } = await supabase
      .from('recurring_items')
      .update({ last_date: todayISO() })
      .eq('id', id);
    if (error) throw error;
    await refresh();
  }

  async function removeItem(id: string) {
    const { error } = await supabase.from('recurring_items').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }

  return { items, loading, refresh, addItem, updateItem, markDone, removeItem };
}
