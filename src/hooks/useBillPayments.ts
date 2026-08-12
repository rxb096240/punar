import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { BillPayment } from '../lib/types';

export function useBillPayments(billId: string | null) {
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!billId) {
      setPayments([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('bill_payments')
      .select('*')
      .eq('bill_id', billId)
      .order('paid_date', { ascending: false });
    setPayments(data ?? []);
    setLoading(false);
  }, [billId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { payments, loading, refresh };
}
