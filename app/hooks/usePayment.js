// src/hooks/usePayment.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import api from '../api';

export function usePayment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create payment
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      const res = await api.post('/payments', paymentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customer-bookings']);
      queryClient.invalidateQueries(['payments']);
    },
  });

  // Get payment breakdown for a booking
  const getPaymentBreakdownQuery = (arId) => useQuery({
    queryKey: ['payment-breakdown', arId],
    queryFn: async () => {
      const res = await api.get(`/accounts-receivables/${arId}/payment-breakdown`);
      return res.data;
    },
    enabled: !!arId,
  });

  // Get customer payments
  const customerPaymentsQuery = useQuery({
    queryKey: ['customer-payments', user?.id],
    queryFn: async () => {
      const res = await api.get('/payments/customer/my-payments');
      return res.data;
    },
    enabled: !!user?.id,
  });

  return {
    createPaymentMutation,
    getPaymentBreakdownQuery,
    customerPaymentsQuery,
  };
}