import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../hooks/useBooking';
import tw from '../../lib/tailwind';
import Header from '../components/Header';
import { CustomDrawer, useDrawer } from '../components/CustomDrawer';

const { width } = Dimensions.get('window');

export default function Booking() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { customerBookingsQuery } = useBooking();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { isOpen } = useDrawer();

  // Use the query hook directly
  const { data: bookingsData, isLoading, error, refetch } = customerBookingsQuery;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Safe data access with optional chaining
  const bookings = bookingsData?.data || bookingsData || [];
  
  const filteredBookings = bookings.filter(booking => 
    booking.booking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.hwb_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.van_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${booking.first_name} ${booking.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // COMPLETE status mapping to match BookingTable
  const getDisplayStatus = (booking) => {
    // Priority 1: Use cargo monitoring status if available
    if (booking.cargo_monitoring && booking.cargo_monitoring.current_status) {
      return booking.cargo_monitoring.current_status;
    }
    
    // Priority 2: Map booking_status to cargo monitoring status format
    const statusMap = {
      'pending': 'Pending',
      'in_transit': 'In Transit', 
      'delivered': 'Delivered',
      'picked_up': 'Picked Up',
      'origin_port': 'Origin Port',
      'destination_port': 'Destination Port',
      'out_for_delivery': 'Out for Delivery'
    };
    
    return statusMap[booking.booking_status] || booking.booking_status || 'Pending';
  };

  // Complete status system to match BookingTable
  const getBookingStatusBadge = (status) => {
    const statusConfig = {
      'Pending': 'bg-gray-500',
      'Picked Up': 'bg-blue-500',
      'Origin Port': 'bg-purple-500',
      'In Transit': 'bg-orange-500',
      'Destination Port': 'bg-indigo-500',
      'Out for Delivery': 'bg-yellow-500',
      'Delivered': 'bg-green-500'
    };
    return statusConfig[status] || 'bg-gray-500';
  };

  const getBookingStatusIcon = (status) => {
    const iconConfig = {
      'Pending': 'clock',
      'Picked Up': 'truck',
      'Origin Port': 'ship-wheel',
      'In Transit': 'ship-wheel',
      'Destination Port': 'map-marker',
      'Out for Delivery': 'truck',
      'Delivered': 'check-circle'
    };
    return iconConfig[status] || 'clock';
  };

  // Approval status (original 3 status system)
  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getApprovalStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Calculate totals for compact display
  const calculateTotalWeight = (items) => items?.reduce((sum, i) => sum + (i.weight || 0) * (i.quantity || 0), 0) || 0;
  const calculateTotalItems = (items) => items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;
  const formatWeight = (w) => `${parseFloat(w).toFixed(0)} kg`;

  return (
    <View style={tw`flex-1 bg-white`}>
      <StatusBar backgroundColor="#3b82f6" barStyle="light-content" />
      
      {/* Fixed Header */}
      <View style={tw`z-50`}>
        <Header title="My Bookings" />
      </View>

      <CustomDrawer navigation={navigation} />

      {/* Content */}
      <View style={tw`flex-1 z-10 pt-2`}>
        <SafeAreaView style={tw`flex-1`} edges={['left', 'right', 'bottom']}>
          <View style={tw`px-4 pb-2 pt-1`}>
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <TouchableOpacity
                style={tw`bg-blue-600 rounded-xl px-4 py-3 flex-row items-center shadow-lg`}
                onPress={() => navigation.navigate('CreateBooking')}
              >
                <Icon name="plus" size={18} color="white" />
                <Text style={tw`text-white font-semibold ml-2 text-sm`}>New Booking</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={tw`bg-gray-100 rounded-full px-4 py-2 flex-row items-center border border-gray-200`}>
              <Icon name="magnify" size={18} color="#64748b" />
              <TextInput
                style={tw`flex-1 ml-2 text-gray-900 font-sans text-sm`}
                placeholder="Search bookings..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Bookings List */}
          <View style={tw`flex-1 bg-white rounded-t-3xl`}>
            <ScrollView
              style={tw`flex-1`}
              contentContainerStyle={tw`pb-4`}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View style={tw`px-4 pt-4`}>
                {isLoading ? (
                  <View style={tw`items-center py-6`}>
                    <Text style={tw`text-gray-500 text-base`}>Loading bookings...</Text>
                  </View>
                ) : error ? (
                  <View style={tw`items-center py-6`}>
                    <Text style={tw`text-red-500 text-base`}>Error loading bookings</Text>
                    <TouchableOpacity onPress={refetch} style={tw`mt-3`}>
                      <Text style={tw`text-blue-600`}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                ) : filteredBookings.length === 0 ? (
                  <View style={tw`items-center py-8`}>
                    <Icon name="package-variant" size={48} color="#94a3b8" />
                    <Text style={tw`text-gray-500 text-base mt-3 text-center`}>
                      {searchQuery ? 'No bookings found' : 'No bookings yet'}
                    </Text>
                    {!searchQuery && (
                      <TouchableOpacity
                        style={tw`bg-blue-600 rounded-xl px-5 py-2.5 mt-3`}
                        onPress={() => navigation.navigate('CreateBooking')}
                      >
                        <Text style={tw`text-white font-semibold text-sm`}>Create Your First Booking</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredBookings.map((booking) => {
                    const displayStatus = getDisplayStatus(booking);
                    const totalWeight = calculateTotalWeight(booking.items);
                    const totalItems = calculateTotalItems(booking.items);

                    return (
                      <TouchableOpacity
                        key={booking.id}
                        style={tw`bg-gray-50 rounded-xl p-3 mb-3 border border-gray-200`}
                        onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
                      >
                        {/* Header with route and status */}
                        <View style={tw`flex-row justify-between items-start mb-2`}>
                          <View style={tw`flex-1 pr-2`}>
                            <Text style={tw`text-base font-bold text-gray-900 mb-1`}>
                              {booking.origin?.name} → {booking.destination?.name}
                            </Text>
                            <Text style={tw`text-gray-600 text-xs`}>
                              #{booking.booking_number}
                            </Text>
                          </View>
                          <View style={tw`items-end`}>
                            <View style={tw`${getBookingStatusBadge(displayStatus)} px-2 py-1 rounded-full mb-1 flex-row items-center`}>
                              <Icon name={getBookingStatusIcon(displayStatus)} size={12} color="white" />
                              <Text style={tw`text-white text-xs font-semibold ml-1`}>
                                {displayStatus}
                              </Text>
                            </View>
                            <View style={tw`${getApprovalStatusColor(booking.status)} px-2 py-1 rounded-full`}>
                              <Text style={tw`text-white text-xs font-semibold`}>
                                {getApprovalStatusText(booking.status)}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Compact details row */}
                        <View style={tw`flex-row justify-between items-center`}>
                          <View style={tw`flex-1`}>
                            <View style={tw`flex-row items-center mb-1`}>
                              <Icon name="cube-outline" size={14} color="#64748b" />
                              <Text style={tw`text-gray-600 text-xs ml-1`}>
                                {booking.container_size?.size || 'N/A'}
                              </Text>
                            </View>
                            <View style={tw`flex-row items-center`}>
                              <Icon name="package-variant" size={14} color="#64748b" />
                              <Text style={tw`text-gray-600 text-xs ml-1`}>
                                {booking.items?.length || 0} types, {totalItems} units
                              </Text>
                            </View>
                          </View>
                          
                          <View style={tw`items-end`}>
                            <Text style={tw`text-gray-500 text-xs mb-1`}>
                              {new Date(booking.created_at).toLocaleDateString()}
                            </Text>
                            {booking.payment_summary && (
                              <Text style={tw`${booking.payment_summary.is_paid ? 'text-green-600' : 'text-yellow-600'} text-xs font-semibold`}>
                                {booking.payment_summary.is_paid ? 'Paid' : `Due: $${booking.payment_summary.total_due}`}
                              </Text>
                            )}
                          </View>
                        </View>

                        {/* Additional compact info */}
                        {(booking.van_number || totalWeight > 0) && (
                          <View style={tw`flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200`}>
                            {booking.van_number && (
                              <View style={tw`flex-row items-center`}>
                                <Icon name="truck" size={12} color="#64748b" />
                                <Text style={tw`text-gray-600 text-xs ml-1`}>
                                  VAN: {booking.van_number}
                                </Text>
                              </View>
                            )}
                            {totalWeight > 0 && (
                              <View style={tw`flex-row items-center`}>
                                <Icon name="weight" size={12} color="#64748b" />
                                <Text style={tw`text-gray-600 text-xs ml-1`}>
                                  {formatWeight(totalWeight)}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}