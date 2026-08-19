import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { RecurringItem } from '../lib/types';
import { advanceDateISO, todayISO } from '../lib/dates';

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
    amount?: number | null;
    nextDueDate: string;
    intervalDays: number;
    intervalMonths?: number | null;
  }) {
    if (!householdId) throw new Error('No household selected.');
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('recurring_items').insert({
      household_id: householdId,
      group_id: input.groupId,
      name: input.name,
      amount: input.amount ?? null,
      next_due_date: input.nextDueDate,
      interval_days: input.intervalDays,
      interval_months: input.intervalMonths ?? null,
      created_by: userData.user?.id,
    });
    if (error) throw error;
    await refresh();
  }

  async function updateItem(
    id: string,
    input: {
      groupId: string;
      name: string;
      amount?: number | null;
      nextDueDate: string;
      intervalDays: number;
      intervalMonths?: number | null;
      paymentMethod?: 'auto' | 'manual' | null;
      notes?: string | null;
    }
  ) {
    const { error } = await supabase
      .from('recurring_items')
      .update({
        group_id: input.groupId,
        name: input.name,
        amount: input.amount ?? null,
        next_due_date: input.nextDueDate,
        interval_days: input.intervalDays,
        interval_months: input.intervalMonths ?? null,
        payment_method: input.paymentMethod ?? null,
        notes: input.notes ?? null,
      })
      .eq('id', id);
    if (error) throw error;
    await refresh();
  }

  /** Advances an item's due date. Pass `amount` to also update the stored amount (e.g. this cycle's bill). */
  async function completeItem(id: string, amount?: number | null, completedDate: string = todayISO()) {
    const item = items.find((i) => i.id === id);
    if (!item) throw new Error('Item not found.');
    const update: Record<string, unknown> = {
      next_due_date: advanceDateISO(completedDate, item.interval_days, item.interval_months),
    };
    if (amount !== undefined) update.amount = amount;
    const { error } = await supabase.from('recurring_items').update(update).eq('id', id);
    if (error) throw error;
    await refresh();
  }

  async function removeItem(id: string) {
    const { error } = await supabase.from('recurring_items').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }

  return { items, loading, refresh, addItem, updateItem, completeItem, removeItem };
}
