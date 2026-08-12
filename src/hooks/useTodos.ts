import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Todo } from '../lib/types';

export function useTodos(householdId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!householdId) {
      setTodos([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('todos')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });
    setTodos(data ?? []);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addTodo(input: { title: string; notes?: string; dueDate?: string | null }) {
    if (!householdId) throw new Error('No household selected.');
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('todos').insert({
      household_id: householdId,
      title: input.title,
      notes: input.notes || null,
      due_date: input.dueDate || null,
      created_by: userData.user?.id,
    });
    if (error) throw error;
    await refresh();
  }

  async function toggleTodo(id: string, completed: boolean) {
    const { error } = await supabase
      .from('todos')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) throw error;
    await refresh();
  }

  async function removeTodo(id: string) {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }

  return { todos, loading, refresh, addTodo, toggleTodo, removeTodo };
}
