import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Group, IconKey } from '../lib/types';

export function useGroups(householdId: string | undefined) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!householdId) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('groups')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });
    setGroups(data ?? []);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createGroup(name: string, icon: IconKey): Promise<Group> {
    if (!householdId) throw new Error('No household selected.');
    const { data, error } = await supabase
      .from('groups')
      .insert({ household_id: householdId, name, icon })
      .select()
      .single();
    if (error) throw error;
    await refresh();
    return data;
  }

  return { groups, loading, refresh, createGroup };
}
