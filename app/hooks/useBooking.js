import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import api from '../api';

export function useBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get customer bookings
  const customerBookingsQuery = useQuery({
    queryKey: ['customer-bookings', user?.id],
    queryFn: async () => {
      const res = await api.get('/customer/bookings');
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Create booking - FIXED: Using customer/bookings endpoint (storeCustomerBooking)
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const res = await api.post('/customer/bookings', bookingData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customer-bookings']);
    },
  });

  // Get single booking
  const getBookingQuery = (bookingId) => useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const res = await api.get(`/bookings/${bookingId}`);
      return res.data;
    },
    enabled: !!bookingId,
  });

  // Fetch categories - USING DROPDOWN ENDPOINT
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories/dropdown');
      return res.data;
    },
  });

  // Fetch ports - USING DROPDOWN ENDPOINT
  const portsQuery = useQuery({
    queryKey: ['ports'],
    queryFn: async () => {
      const res = await api.get('/ports/dropdown');
      return res.data;
    },
  });

  const containerTypesQuery = useQuery({
    queryKey: ['container-types'],
    queryFn: async () => {
      const res = await api.get('/container-types/');
      return res.data.data || res.data;
    },
  });

  // Fetch shipping lines - USING DROPDOWN ENDPOINT
  const shippingLinesQuery = useQuery({
    queryKey: ['shipping-lines'],
    queryFn: async () => {
      const res = await api.get('/shipping-lines/dropdown');
      return res.data;
    },
  });

  // Fetch truck companies - USING DROPDOWN ENDPOINT
  const truckCompaniesQuery = useQuery({
    queryKey: ['truck-companies'],
    queryFn: async () => {
      const res = await api.get('/truck-comps/dropdown');
      return res.data;
    },
  });

  return {
    customerBookingsQuery,
    createBookingMutation,
    getBookingQuery,
    categoriesQuery,
    portsQuery,
    containerTypesQuery,
    shippingLinesQuery,
    truckCompaniesQuery,
  };
}