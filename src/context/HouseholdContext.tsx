import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Household } from '../lib/types';
import { useAuth } from './AuthContext';

interface HouseholdContextValue {
  household: Household | null;
  households: Household[];
  loading: boolean;
  refresh: () => Promise<void>;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (code: string) => Promise<void>;
  selectHousehold: (id: string) => Promise<void>;
  renameHousehold: (id: string, name: string) => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextValue>({
  household: null,
  households: [],
  loading: true,
  refresh: async () => {},
  createHousehold: async () => {},
  joinHousehold: async () => {},
  selectHousehold: async () => {},
  renameHousehold: async () => {},
});

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Tracks which user the current households/activeId snapshot belongs to, so
  // a user change is reflected in `loading` immediately (this render), not
  // only once the refresh effect below gets to run (next render/commit).
  // Without this, there's a frame where the new user is known but household
  // data still reflects the previous (often signed-out) user — e.g. briefly
  // showing the "no household" onboarding screen right after signing in.
  // `undefined` = nothing has ever been loaded yet.
  const [loadedForUserId, setLoadedForUserId] = useState<string | null | undefined>(undefined);

  async function refresh() {
    const uid = user?.id ?? null;
    if (!user) {
      setHouseholds([]);
      setActiveId(null);
      setLoading(false);
      setLoadedForUserId(uid);
      return;
    }
    setLoading(true);
    const fetchHouseholds = () =>
      Promise.all([
        supabase.from('households').select('*').order('created_at', { ascending: true }),
        supabase.from('user_settings').select('last_household_id').eq('user_id', user.id).maybeSingle(),
      ]);

    let [{ data: list }, { data: settings }] = await fetchHouseholds();
    // A household query can come back empty right after interactive sign-in
    // if it raced the client still settling the new session — retry once
    // rather than sending an actual household owner to onboarding.
    if ((list ?? []).length === 0) {
      [{ data: list }, { data: settings }] = await fetchHouseholds();
    }

    const households = list ?? [];
    setHouseholds(households);
    const lastId = settings?.last_household_id;
    setActiveId(lastId && households.some((h) => h.id === lastId) ? lastId : (households[0]?.id ?? null));
    setLoading(false);
    setLoadedForUserId(uid);
  }

  useEffect(() => {
    if (authLoading) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  async function persistActive(id: string) {
    setActiveId(id);
    if (!user) return;
    await supabase.from('user_settings').upsert({ user_id: user.id, last_household_id: id, updated_at: new Date().toISOString() });
  }

  async function selectHousehold(id: string) {
    if (id === activeId || !households.some((h) => h.id === id)) return;
    await persistActive(id);
  }

  async function createHousehold(name: string) {
    const { data, error } = await supabase.rpc('create_household', { household_name: name });
    if (error) throw error;
    await refresh();
    if (data?.id) await persistActive(data.id);
  }

  async function joinHousehold(code: string) {
    const { data, error } = await supabase.rpc('join_household', { code });
    if (error) throw error;
    await refresh();
    if (data?.id) await persistActive(data.id);
  }

  async function renameHousehold(id: string, name: string) {
    const { data, error } = await supabase.from('households').update({ name }).eq('id', id).select().single();
    if (error) throw error;
    setHouseholds((prev) => prev.map((h) => (h.id === id ? data : h)));
  }

  const household = households.find((h) => h.id === activeId) ?? null;
  // Stay "loading" until the loaded snapshot actually matches the current
  // user — closes the race even for the render(s) before the effect above
  // has had a chance to re-run for a newly-changed user.
  const effectiveLoading = authLoading || loading || loadedForUserId !== (user?.id ?? null);

  return (
    <HouseholdContext.Provider
      value={{
        household,
        households,
        loading: effectiveLoading,
        refresh,
        createHousehold,
        joinHousehold,
        selectHousehold,
        renameHousehold,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  return useContext(HouseholdContext);
}
