import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
