import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Household } from '../lib/types';
import { useAuth } from './AuthContext';

interface HouseholdContextValue {
  household: Household | null;
  loading: boolean;
  refresh: () => Promise<void>;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (code: string) => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextValue>({
  household: null,
  loading: true,
  refresh: async () => {},
  createHousehold: async () => {},
  joinHousehold: async () => {},
});

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!user) {
      setHousehold(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: membership } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      setHousehold(null);
      setLoading(false);
      return;
    }

    const { data: h } = await supabase
      .from('households')
      .select('*')
      .eq('id', membership.household_id)
      .single();

    setHousehold(h ?? null);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function createHousehold(name: string) {
    const { error } = await supabase.rpc('create_household', { household_name: name });
    if (error) throw error;
    await refresh();
  }

  async function joinHousehold(code: string) {
    const { error } = await supabase.rpc('join_household', { code });
    if (error) throw error;
    await refresh();
  }

  return (
    <HouseholdContext.Provider value={{ household, loading, refresh, createHousehold, joinHousehold }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  return useContext(HouseholdContext);
}
