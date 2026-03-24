import { useQuery } from '@tanstack/react-query';
import { getUserDashboard } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import type { DashboardData } from '../types';

export function useDashboard() {
  const session = useAppStore((s) => s.session);
  const identifier = session?.phone || session?.email || '';

  return useQuery<DashboardData>({
    queryKey: ['dashboard', identifier],
    queryFn: () => getUserDashboard(identifier),
    enabled: !!identifier,
    staleTime: 2 * 60 * 1000,
  });
}
