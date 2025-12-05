// src/hooks/useCargoMonitoring.js
import { useQuery } from '@tanstack/react-query';
import api from '../api';

export function useCargoMonitoring() {
  // Get cargo monitoring by booking ID
  const getCargoMonitoringQuery = (bookingId) => useQuery({
    queryKey: ['cargo-monitoring', bookingId],
    queryFn: async () => {
      const res = await api.get(`/cargo-monitoring/booking/${bookingId}`);
      return res.data;
    },
    enabled: !!bookingId,
  });

  return {
    getCargoMonitoringQuery,
  };
}