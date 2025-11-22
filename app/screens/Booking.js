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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getBookingStatusColor = (status) => {
    switch (status) {
      case 'in_transit': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getBookingStatusText = (status) => {
    switch (status) {
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

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
          <View style={tw`px-6 pb-4 pt-2`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <TouchableOpacity
                style={tw`bg-blue-600 rounded-xl px-4 py-3 flex-row items-center shadow-lg`}
                onPress={() => navigation.navigate('CreateBooking')}
              >
                <Icon name="plus" size={20} color="white" />
                <Text style={tw`text-white font-semibold ml-2`}>New Booking</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={tw`bg-gray-100 rounded-full px-4 py-3 flex-row items-center border border-gray-200`}>
              <Icon name="magnify" size={20} color="#64748b" />
              <TextInput
                style={tw`flex-1 ml-3 text-gray-900 font-sans`}
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
              contentContainerStyle={tw`pb-6`}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View style={tw`px-6 pt-6`}>
                {isLoading ? (
                  <View style={tw`items-center py-8`}>
                    <Text style={tw`text-gray-500 text-lg`}>Loading bookings...</Text>
                  </View>
                ) : error ? (
                  <View style={tw`items-center py-8`}>
                    <Text style={tw`text-red-500 text-lg`}>Error loading bookings</Text>
                    <TouchableOpacity onPress={refetch} style={tw`mt-4`}>
                      <Text style={tw`text-blue-600`}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                ) : filteredBookings.length === 0 ? (
                  <View style={tw`items-center py-12`}>
                    <Icon name="package-variant" size={64} color="#94a3b8" />
                    <Text style={tw`text-gray-500 text-lg mt-4 text-center`}>
                      {searchQuery ? 'No bookings found' : 'No bookings yet'}
                    </Text>
                    {!searchQuery && (
                      <TouchableOpacity
                        style={tw`bg-blue-600 rounded-xl px-6 py-3 mt-4`}
                        onPress={() => navigation.navigate('CreateBooking')}
                      >
                        <Text style={tw`text-white font-semibold`}>Create Your First Booking</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredBookings.map((booking) => (
                    <TouchableOpacity
                      key={booking.id}
                      style={tw`bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200`}
                      onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
                    >
                      <View style={tw`flex-row justify-between items-start mb-3`}>
                        <View style={tw`flex-1`}>
                          <Text style={tw`text-lg font-bold text-gray-900 mb-1`}>
                            {booking.origin?.name} → {booking.destination?.name}
                          </Text>
                          <Text style={tw`text-gray-600 text-sm`}>
                            Booking #: {booking.booking_number}
                          </Text>
                        </View>
                        <View style={tw`flex-row gap-2`}>
                          <View style={tw`${getStatusColor(booking.status)} px-2 py-1 rounded-full`}>
                            <Text style={tw`text-white text-xs font-semibold`}>
                              {getStatusText(booking.status)}
                            </Text>
                          </View>
                          <View style={tw`${getBookingStatusColor(booking.booking_status)} px-2 py-1 rounded-full`}>
                            <Text style={tw`text-white text-xs font-semibold`}>
                              {getBookingStatusText(booking.booking_status)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={tw`flex-row justify-between items-center`}>
                        <View>
                          <Text style={tw`text-gray-600 text-sm`}>
                            Container: {booking.container_size?.size}
                          </Text>
                          <Text style={tw`text-gray-600 text-sm`}>
                            Items: {booking.items?.length || 0}
                          </Text>
                        </View>
                        <View style={tw`items-end`}>
                          <Text style={tw`text-gray-600 text-sm`}>
                            Created: {new Date(booking.created_at).toLocaleDateString()}
                          </Text>
                          {booking.payment_summary && (
                            <Text style={tw`${booking.payment_summary.is_paid ? 'text-green-600' : 'text-yellow-600'} text-sm font-semibold`}>
                              {booking.payment_summary.is_paid ? 'Paid' : `Due: $${booking.payment_summary.total_due}`}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}