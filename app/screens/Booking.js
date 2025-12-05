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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../hooks/useBooking';
import tw from '../../lib/tailwind';
import Header from '../components/Header';

const { width } = Dimensions.get('window');

// Create these hooks if they don't exist yet
const usePayment = () => {
  // This should be implemented in your hooks folder
  return {
    createPaymentMutation: { mutate: () => {}, isPending: false },
    getPaymentBreakdownQuery: (id) => ({ data: null, isLoading: false }),
  };
};

const useCargoMonitoring = () => {
  // This should be implemented in your hooks folder
  return {
    getCargoMonitoringQuery: (bookingId) => ({ data: null, isLoading: false }),
  };
};

export default function Booking() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { customerBookingsQuery } = useBooking();
  const paymentHook = usePayment();
  const cargoMonitoringHook = useCargoMonitoring();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: bookingsData, isLoading, error, refetch } = customerBookingsQuery;
  const bookings = bookingsData?.data || bookingsData || [];
  
  const filteredBookings = bookings.filter(booking => 
    booking.booking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.hwb_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.van_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${booking.first_name} ${booking.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Get the main display status (single status system)
  const getDisplayStatus = (booking) => {
    // Priority 1: Check if booking is pending approval
    if (booking.status === 'pending') {
      return 'Pending Approval';
    }
    
    // Priority 2: Use cargo monitoring status if available
    if (booking.cargo_monitoring && booking.cargo_monitoring.current_status) {
      return booking.cargo_monitoring.current_status;
    }
    
    // Priority 3: Map booking_status to readable format
    const statusMap = {
      'pending': 'Pending',
      'picked_up': 'Picked Up',
      'origin_port': 'Origin Port', 
      'in_transit': 'In Transit',
      'destination_port': 'Destination Port',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered'
    };
    
    return statusMap[booking.booking_status] || 'Processing';
  };

  // Status badge configuration
  const getStatusBadgeStyle = (status, isFullyPaid = false, isPaymentPending = false) => {
    if (status === 'Pending Approval') {
      return { bg: 'bg-yellow-500', text: 'text-white' };
    }
    
    if (isPaymentPending) {
      return { bg: 'bg-purple-500', text: 'text-white' };
    }
    
    if (isFullyPaid) {
      return { bg: 'bg-green-500', text: 'text-white' };
    }
    
    const statusConfig = {
      'Pending': { bg: 'bg-gray-500', text: 'text-white' },
      'Processing': { bg: 'bg-blue-500', text: 'text-white' },
      'Picked Up': { bg: 'bg-blue-500', text: 'text-white' },
      'Origin Port': { bg: 'bg-purple-500', text: 'text-white' },
      'In Transit': { bg: 'bg-orange-500', text: 'text-white' },
      'Destination Port': { bg: 'bg-indigo-500', text: 'text-white' },
      'Out for Delivery': { bg: 'bg-yellow-500', text: 'text-black' },
      'Delivered': { bg: 'bg-green-500', text: 'text-white' }
    };
    return statusConfig[status] || { bg: 'bg-gray-500', text: 'text-white' };
  };

  const getStatusIcon = (status, isFullyPaid = false, isPaymentPending = false) => {
    if (status === 'Pending Approval') return 'clock';
    if (isPaymentPending) return 'shield-check';
    if (isFullyPaid) return 'check-circle';
    
    const iconConfig = {
      'Pending': 'clock',
      'Processing': 'clock',
      'Picked Up': 'truck',
      'Origin Port': 'ship-wheel',
      'In Transit': 'ship-wheel',
      'Destination Port': 'map-marker',
      'Out for Delivery': 'truck',
      'Delivered': 'check-circle'
    };
    return iconConfig[status] || 'clock';
  };

  // Check if booking is fully paid
  const isFullyPaid = (booking) => {
    if (booking.accounts_receivable) {
      const ar = booking.accounts_receivable;
      return ar.is_paid === true || ar.collectible_amount <= 0;
    }
    return false;
  };

  // Check if payment is pending
  const isPaymentPending = (booking) => {
    return !booking.accounts_receivable || 
           !booking.accounts_receivable.total_payment || 
           booking.accounts_receivable.total_payment === 0;
  };

  // Check if booking is COD
  const isCOD = (booking) => {
    if (booking.accounts_receivable) {
      return booking.accounts_receivable.payment_method === 'cod';
    }
    return false;
  };

  // Check if COD is pending
  const isCODPending = (booking) => {
    if (booking.accounts_receivable) {
      const ar = booking.accounts_receivable;
      return ar.payment_method === 'cod' && !ar.is_paid && ar.collectible_amount > 0;
    }
    return false;
  };

  // Get total payment due
  const getTotalPaymentDue = (booking) => {
    if (booking.accounts_receivable) {
      const ar = booking.accounts_receivable;
      
      // If COD pending, return 0 (no pay button)
      if (isCODPending(booking)) {
        return 0;
      }
      
      // If fully paid, return 0
      if (isFullyPaid(booking)) {
        return 0;
      }
      
      // Return the collectible amount
      return ar.collectible_amount > 0 ? ar.collectible_amount : 0;
    }
    return 0;
  };

  // Calculate total items and weight
  const calculateTotalWeight = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const weight = parseFloat(item.weight) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (weight * quantity);
    }, 0);
  };

  const calculateTotalItems = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
  };

  // Format weight display
  const formatWeight = (weight) => {
    return `${parseFloat(weight).toFixed(0)} kg`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle payment button press
  const handlePaymentPress = (booking) => {
    navigation.navigate('PaymentScreen', { 
      bookingId: booking.id,
      bookingData: booking
    });
  };

  // Handle timeline button press
  const handleTimelinePress = (booking) => {
    navigation.navigate('TimelineScreen', { 
      bookingId: booking.id,
      bookingData: booking
    });
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <StatusBar backgroundColor="#1e40af" barStyle="light-content" />
      
      {/* Header */}
      <View style={tw`z-50`}>
        <Header 
          title="My Bookings" 
          backgroundColor="#1e40af"
          textColor="white"
        />
      </View>

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
            <View style={tw`bg-white rounded-full px-4 py-2 flex-row items-center border border-blue-200 shadow-sm`}>
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
          <View style={tw`flex-1 bg-gray-50`}>
            <ScrollView
              style={tw`flex-1`}
              contentContainerStyle={tw`pb-4`}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh}
                  colors={['#3b82f6']}
                />
              }
            >
              <View style={tw`px-4 pt-4`}>
                {isLoading ? (
                  <View style={tw`items-center py-6`}>
                    <Icon name="loading" size={24} color="#3b82f6" style={tw`animate-spin`} />
                    <Text style={tw`text-gray-500 text-sm mt-2`}>Loading bookings...</Text>
                  </View>
                ) : error ? (
                  <View style={tw`items-center py-6`}>
                    <Icon name="alert-circle" size={48} color="#ef4444" />
                    <Text style={tw`text-red-500 text-sm mt-2`}>Error loading bookings</Text>
                    <TouchableOpacity 
                      onPress={refetch} 
                      style={tw`mt-3 bg-blue-600 px-4 py-2 rounded-lg`}
                    >
                      <Text style={tw`text-white text-sm font-semibold`}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                ) : filteredBookings.length === 0 ? (
                  <View style={tw`items-center py-8`}>
                    <Icon name="package-variant" size={48} color="#94a3b8" />
                    <Text style={tw`text-gray-500 text-sm mt-3 text-center`}>
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
                    const fullyPaid = isFullyPaid(booking);
                    const codPending = isCODPending(booking);
                    const totalPaymentDue = getTotalPaymentDue(booking);
                    const hasPaymentData = booking.accounts_receivable && booking.accounts_receivable.total_payment > 0;
                    const paymentPending = isPaymentPending(booking);
                    const totalWeight = calculateTotalWeight(booking.items);
                    const totalItems = calculateTotalItems(booking.items);
                    const statusStyle = getStatusBadgeStyle(displayStatus, fullyPaid, paymentPending);
                    const statusIcon = getStatusIcon(displayStatus, fullyPaid, paymentPending);
                    
                    return (
                      <View 
                        key={booking.id}
                        style={tw`bg-white rounded-xl p-4 mb-3 border border-blue-100 shadow-sm`}
                      >
                        {/* Header with Customer Name and Booking Number */}
                        <View style={tw`flex-row justify-between items-start mb-3`}>
                          <View style={tw`flex-1`}>
                            <Text style={tw`text-base font-bold text-gray-900 mb-1`}>
                              {booking.first_name} {booking.last_name}
                            </Text>
                            <View style={tw`flex-row items-center gap-2`}>
                              <Text style={tw`text-xs text-gray-600 font-medium`}>
                                #{booking.booking_number}
                              </Text>
                              {booking.hwb_number && (
                                <>
                                  <View style={tw`w-1 h-1 bg-gray-300 rounded-full`} />
                                  <Text style={tw`text-xs text-gray-600 font-medium`}>
                                    HWB: {booking.hwb_number}
                                  </Text>
                                </>
                              )}
                            </View>
                          </View>
                          
                          {/* Status Badge */}
                          <View style={tw`items-end`}>
                            <View style={tw`${statusStyle.bg} px-3 py-1 rounded-full mb-1 flex-row items-center`}>
                              <Icon name={statusIcon} size={12} color="white" />
                              <Text style={tw`text-white text-xs font-semibold ml-1`}>
                                {displayStatus}
                              </Text>
                            </View>
                            
                            {/* Total Amount if Approved and Has Payment */}
                            {booking.status === 'approved' && hasPaymentData && (
                              <View style={tw`items-end`}>
                                <Text style={tw`text-xs text-gray-500 mb-1`}>Total Amount</Text>
                                <Text style={tw`text-lg font-bold text-blue-600`}>
                                  {formatCurrency(booking.accounts_receivable.total_payment)}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Date */}
                        <View style={tw`flex-row items-center mb-3`}>
                          <Icon name="calendar" size={14} color="#64748b" />
                          <Text style={tw`text-xs text-gray-600 ml-1`}>
                            Booked on {formatDate(booking.created_at)}
                          </Text>
                        </View>

                        {/* Compact Info Grid */}
                        <View style={tw`grid grid-cols-2 gap-3 mb-3 border-t border-b border-gray-100 py-3`}>
                          {/* Route */}
                          <View>
                            <Text style={tw`text-xs font-bold text-gray-500 mb-1`}>ROUTE</Text>
                            <View style={tw`flex-row items-center`}>
                              <Icon name="map-marker" size={12} color="#64748b" />
                              <Text style={tw`text-xs text-gray-800 ml-1 truncate`}>
                                {booking.origin?.route_name || booking.origin?.name || 'N/A'}
                              </Text>
                              <Icon name="arrow-right" size={12} color="#64748b" style={tw`mx-1`} />
                              <Icon name="map-marker" size={12} color="#64748b" />
                              <Text style={tw`text-xs text-gray-800 ml-1 truncate`}>
                                {booking.destination?.route_name || booking.destination?.name || 'N/A'}
                              </Text>
                            </View>
                          </View>

                          {/* Container */}
                          <View>
                            <Text style={tw`text-xs font-bold text-gray-500 mb-1`}>CONTAINER</Text>
                            <View style={tw`flex-row items-center`}>
                              <Icon name="cube-outline" size={12} color="#64748b" />
                              <Text style={tw`text-xs text-gray-800 ml-1`}>
                                {booking.container_quantity} x {booking.container_size?.size || booking.container_size?.name}
                              </Text>
                            </View>
                            {booking.van_number && (
                              <Text style={tw`text-xs text-gray-700 mt-1 font-mono`}>
                                VAN #: {booking.van_number}
                              </Text>
                            )}
                          </View>

                          {/* Items */}
                          <View>
                            <Text style={tw`text-xs font-bold text-gray-500 mb-1`}>ITEMS</Text>
                            <View style={tw`flex-col`}>
                              <View style={tw`flex-row items-center`}>
                                <Icon name="package-variant" size={12} color="#64748b" />
                                <Text style={tw`text-xs text-gray-800 ml-1`}>
                                  {booking.items?.length || 0} types, {totalItems} units
                                </Text>
                              </View>
                              <View style={tw`flex-row items-center mt-1`}>
                                <Icon name="weight" size={12} color="#64748b" />
                                <Text style={tw`text-xs text-gray-800 ml-1`}>
                                  {formatWeight(totalWeight)} total
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Parties */}
                          <View>
                            <Text style={tw`text-xs font-bold text-gray-500 mb-1`}>PARTIES</Text>
                            <Text style={tw`text-xs text-gray-800`}>
                              Shipper: {booking.shipper_first_name} {booking.shipper_last_name}
                            </Text>
                            <Text style={tw`text-xs text-gray-800 mt-1`}>
                              Consignee: {booking.consignee_first_name} {booking.consignee_last_name}
                            </Text>
                          </View>
                        </View>

                        {/* Payment Status Notice */}
                        {booking.status === 'approved' ? (
                          hasPaymentData ? (
                            <>
                              {/* Fully Paid */}
                              {fullyPaid && (
                                <View style={tw`bg-green-50 border border-green-200 rounded-lg p-3 mb-3`}>
                                  <View style={tw`flex-row items-start`}>
                                    <Icon name="check-circle" size={16} color="#059669" style={tw`mt-0.5 mr-2`} />
                                    <View style={tw`flex-1`}>
                                      <Text style={tw`text-green-800 font-medium`}>
                                        Payment Complete
                                      </Text>
                                      <Text style={tw`text-green-700 text-xs mt-1`}>
                                        Thank you for your payment! Your booking is now fully paid.
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              )}

                              {/* COD Pending */}
                              {codPending && (
                                <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3`}>
                                  <View style={tw`flex-row items-start`}>
                                    <Icon name="truck" size={16} color="#3b82f6" style={tw`mt-0.5 mr-2`} />
                                    <View style={tw`flex-1`}>
                                      <Text style={tw`text-blue-800 font-medium`}>
                                        Cash on Delivery Selected
                                      </Text>
                                      <Text style={tw`text-blue-700 text-xs mt-1`}>
                                        Payment will be collected upon delivery.
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              )}

                              {/* Payment Due */}
                              {!fullyPaid && !codPending && totalPaymentDue > 0 && (
                                <View style={tw`bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3`}>
                                  <View style={tw`flex-row items-start`}>
                                    <Icon name="alert-circle" size={16} color="#f97316" style={tw`mt-0.5 mr-2`} />
                                    <View style={tw`flex-1`}>
                                      <Text style={tw`text-orange-800 font-medium`}>
                                        Outstanding Balance
                                      </Text>
                                      <Text style={tw`text-orange-700 text-xs mt-1`}>
                                        Balance due: {formatCurrency(totalPaymentDue)}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              )}

                              {/* No Payment Due */}
                              {!fullyPaid && !codPending && totalPaymentDue === 0 && hasPaymentData && (
                                <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3`}>
                                  <View style={tw`flex-row items-start`}>
                                    <Icon name="bell" size={16} color="#3b82f6" style={tw`mt-0.5 mr-2`} />
                                    <View style={tw`flex-1`}>
                                      <Text style={tw`text-blue-800 font-medium`}>
                                        Awaiting Payment Method Selection
                                      </Text>
                                      <Text style={tw`text-blue-700 text-xs mt-1`}>
                                        Please select a payment method to proceed.
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              )}
                            </>
                          ) : (
                            <View style={tw`bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3`}>
                              <View style={tw`flex-row items-start`}>
                                <Icon name="alert-circle" size={16} color="#3b82f6" style={tw`mt-0.5 mr-2`} />
                                <View style={tw`flex-1`}>
                                  <Text style={tw`text-blue-800 font-medium`}>
                                    Payment Information Pending
                                  </Text>
                                  <Text style={tw`text-blue-700 text-xs mt-1`}>
                                    Your payment amount is being calculated by our admin team.
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )
                        ) : (
                          <View style={tw`bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3`}>
                            <View style={tw`flex-row items-start`}>
                              <Icon name="clock" size={16} color="#eab308" style={tw`mt-0.5 mr-2`} />
                              <View style={tw`flex-1`}>
                                <Text style={tw`text-yellow-800 font-medium`}>
                                  Waiting for Approval
                                </Text>
                                <Text style={tw`text-yellow-700 text-xs mt-1`}>
                                  Your booking request is pending admin approval.
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}

                        {/* Footer with Two Buttons */}
                        {booking.status === 'approved' && (
                          <View style={tw`border-t border-gray-100 pt-3`}>
                            <View style={tw`flex-row gap-3`}>
                              {/* Timeline Button */}
                              <TouchableOpacity
                                style={tw`flex-1 bg-gray-100 rounded-lg px-4 py-2.5 flex-row items-center justify-center`}
                                onPress={() => handleTimelinePress(booking)}
                              >
                                <Icon name="timeline" size={16} color="#4b5563" />
                                <Text style={tw`text-gray-700 font-medium text-sm ml-2`}>Timeline</Text>
                              </TouchableOpacity>

                              {/* Pay Button - Only show if payment is due */}
                              {totalPaymentDue > 0 && !codPending && (
                                <TouchableOpacity
                                  style={tw`flex-1 bg-blue-600 rounded-lg px-4 py-2.5 flex-row items-center justify-center`}
                                  onPress={() => handlePaymentPress(booking)}
                                >
                                  <Icon name="credit-card" size={16} color="white" />
                                  <Text style={tw`text-white font-semibold text-sm ml-2`}>
                                    Pay {formatCurrency(totalPaymentDue)}
                                  </Text>
                                </TouchableOpacity>
                              )}

                              {/* View Statement Button for COD or Fully Paid */}
                              {(fullyPaid || codPending || totalPaymentDue === 0) && (
                                <TouchableOpacity
                                  style={tw`flex-1 bg-blue-600 rounded-lg px-4 py-2.5 flex-row items-center justify-center`}
                                  onPress={() => handlePaymentPress(booking)}
                                >
                                  <Icon name="receipt" size={16} color="white" />
                                  <Text style={tw`text-white font-semibold text-sm ml-2`}>
                                    {codPending ? 'View COD' : fullyPaid ? 'View Receipt' : 'View Statement'}
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        )}
                      </View>
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