// app/screens/Dashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import { CustomDrawer, useDrawer } from '../components/CustomDrawer';
import tw from '../../lib/tailwind';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api'; // Make sure you have your API setup

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const navigation = useNavigation();
  const { isOpen } = useDrawer();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get('/customer/bookings');
      setDashboardData(data.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data || { message: 'Failed to load dashboard data' });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Calculate metrics from customer's bookings
  const calculateMetrics = () => {
    if (!dashboardData || dashboardData.length === 0) {
      return {
        totalBookings: 0,
        pendingBookings: 0,
        inTransitBookings: 0,
        deliveredBookings: 0,
        seaFreightBookings: 0,
        landTransportBookings: 0
      };
    }

    return {
      totalBookings: dashboardData.length,
      pendingBookings: dashboardData.filter(booking => booking.booking_status === 'pending').length,
      inTransitBookings: dashboardData.filter(booking => booking.booking_status === 'in_transit').length,
      deliveredBookings: dashboardData.filter(booking => booking.booking_status === 'delivered').length,
      seaFreightBookings: dashboardData.filter(booking => 
        booking.mode_of_service?.toLowerCase().includes('sea')
      ).length,
      landTransportBookings: dashboardData.filter(booking => 
        booking.mode_of_service?.toLowerCase().includes('land')
      ).length
    };
  };

  const metrics = calculateMetrics();

  // Get recent bookings
  const getRecentBookings = () => {
    if (!dashboardData) return [];
    return dashboardData.slice(0, 3); // Show only 3 recent bookings
  };

  const recentBookings = getRecentBookings();

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      const configs = {
        'pending': { color: 'bg-yellow-500', icon: 'clock' },
        'in_transit': { color: 'bg-blue-500', icon: 'truck' },
        'delivered': { color: 'bg-green-500', icon: 'check-circle' },
        'picked_up': { color: 'bg-purple-500', icon: 'package' },
        'origin_port': { color: 'bg-indigo-500', icon: 'map-marker' },
        'destination_port': { color: 'bg-cyan-500', icon: 'map-marker' },
        'out_for_delivery': { color: 'bg-orange-500', icon: 'truck' }
      };
      
      return configs[status] || { color: 'bg-gray-500', icon: 'alert-circle' };
    };

    const config = getStatusConfig(status);
    const statusText = status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return (
      <View style={tw`flex-row items-center ${config.color} px-3 py-1 rounded-full`}>
        <Icon name={config.icon} size={14} color="white" />
        <Text style={tw`text-white text-xs font-sans ml-1`}>{statusText}</Text>
      </View>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#020617]`}>
        <Header title="Dashboard" />
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          {/* Loading skeleton for metrics */}
          <View style={tw`px-4 pt-4`}>
            <View style={tw`bg-slate-800 rounded-2xl p-4 border border-slate-700`}>
              <View style={tw`animate-pulse`}>
                <View style={tw`h-4 bg-slate-700 rounded w-3/4 mb-2`} />
                <View style={tw`h-6 bg-slate-700 rounded w-1/2 mb-4`} />
                <View style={tw`h-3 bg-slate-700 rounded w-full mb-2`} />
                <View style={tw`h-2 bg-slate-700 rounded w-4/5`} />
              </View>
            </View>
          </View>
          
          {/* Loading for recent bookings */}
          <View style={tw`px-4 pt-4`}>
            <View style={tw`bg-slate-800 rounded-2xl p-4 border border-slate-700`}>
              <View style={tw`animate-pulse`}>
                <View style={tw`h-4 bg-slate-700 rounded w-1/2 mb-4`} />
                {[...Array(3)].map((_, i) => (
                  <View key={i} style={tw`mb-3`}>
                    <View style={tw`h-4 bg-slate-700 rounded w-3/4 mb-2`} />
                    <View style={tw`h-3 bg-slate-700 rounded w-1/2`} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={tw`flex-1 bg-[#020617]`}>
        <Header title="Dashboard" />
        <ScrollView 
          style={tw`flex-1`} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={tw`px-4 pt-4`}>
            <View style={tw`bg-red-900 rounded-2xl p-4 border border-red-700`}>
              <View style={tw`flex-row items-center mb-3`}>
                <Icon name="alert-circle" size={24} color="#fca5a5" />
                <Text style={tw`text-red-200 font-sans ml-2`}>Failed to load data</Text>
              </View>
              <Text style={tw`text-red-200 text-sm font-sans mb-3`}>
                {error.message || 'Please try again'}
              </Text>
              <TouchableOpacity 
                style={tw`bg-red-600 rounded-lg px-4 py-2 self-start`}
                onPress={fetchDashboardData}
              >
                <Text style={tw`text-white font-bold font-sans text-sm`}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-[#020617]`}>
      <Header title="Dashboard" />
      <CustomDrawer navigation={navigation} />
      
      <ScrollView 
        style={tw`flex-1`} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome & Overview Card */}
        <View style={tw`px-4 pt-4`}>
          <View style={tw`bg-slate-800 rounded-2xl p-4 border border-slate-700`}>
            <View style={tw`flex-row justify-between items-start mb-3`}>
              <View>
                <Text style={tw`text-gray-400 text-sm font-sans mb-1`}>Welcome back!</Text>
                <Text style={tw`text-white text-xl font-bold font-sans`}>Shipment Overview</Text>
                <Text style={tw`text-blue-400 text-sm font-sans`}>
                  {metrics.totalBookings} total bookings
                </Text>
              </View>
              <Icon name="package-variant" size={48} color="#60a5fa" />
            </View>
            
            {/* Service Distribution */}
            <View style={tw`bg-slate-900 rounded-xl p-3 mb-3`}>
              <Text style={tw`text-gray-400 text-xs font-sans mb-2`}>Service Distribution</Text>
              <View style={tw`flex-row items-center mb-2`}>
                <View style={tw`flex-1 bg-slate-700 rounded-full h-2 mr-3`}>
                  <View 
                    style={tw`bg-blue-500 rounded-full h-2`} 
                    style={{ 
                      width: `${metrics.totalBookings > 0 ? (metrics.seaFreightBookings / metrics.totalBookings) * 100 : 0}%` 
                    }} 
                  />
                </View>
                <Text style={tw`text-white font-bold font-sans text-xs`}>
                  Sea: {metrics.seaFreightBookings}
                </Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <View style={tw`flex-1 bg-slate-700 rounded-full h-2 mr-3`}>
                  <View 
                    style={tw`bg-green-500 rounded-full h-2`} 
                    style={{ 
                      width: `${metrics.totalBookings > 0 ? (metrics.landTransportBookings / metrics.totalBookings) * 100 : 0}%` 
                    }} 
                  />
                </View>
                <Text style={tw`text-white font-bold font-sans text-xs`}>
                  Land: {metrics.landTransportBookings}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Icon name="clock" size={16} color="#94a3b8" />
                <Text style={tw`text-gray-400 text-sm font-sans ml-1`}>
                  {metrics.pendingBookings} Pending
                </Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Icon name="truck" size={16} color="#94a3b8" />
                <Text style={tw`text-gray-400 text-sm font-sans ml-1`}>
                  {metrics.inTransitBookings} In Transit
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={tw`px-4 pt-4 flex-row`}>
          <View style={tw`flex-1 bg-slate-800 rounded-2xl p-4 border border-slate-700 mr-2`}>
            <Icon name="package-variant" size={32} color="#60a5fa" />
            <Text style={tw`text-white text-2xl font-bold font-sans mt-2`}>
              {metrics.totalBookings}
            </Text>
            <Text style={tw`text-gray-400 text-xs font-sans`}>Total Bookings</Text>
          </View>
          
          <View style={tw`flex-1 bg-slate-800 rounded-2xl p-4 border border-slate-700 ml-2`}>
            <Icon name="truck" size={32} color="#10b981" />
            <Text style={tw`text-white text-2xl font-bold font-sans mt-2`}>
              {metrics.inTransitBookings}
            </Text>
            <Text style={tw`text-gray-400 text-xs font-sans`}>In Transit</Text>
          </View>
        </View>

        {/* Recent Bookings Section */}
        <View style={tw`px-4 pt-4 pb-20`}>
          <View style={tw`bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden`}>
            {/* Header */}
            <View style={tw`p-4 flex-row justify-between items-center`}>
              <Text style={tw`text-white text-lg font-bold font-sans`}>Recent Bookings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
                <Icon name="arrow-right" size={24} color="#60a5fa" />
              </TouchableOpacity>
            </View>

            {/* Bookings List */}
            <View style={tw`p-4`}>
              {recentBookings.length === 0 ? (
                <View style={tw`items-center py-8`}>
                  <Icon name="package-variant-closed" size={48} color="#475569" />
                  <Text style={tw`text-gray-400 font-sans mt-2`}>No bookings found</Text>
                </View>
              ) : (
                recentBookings.map((booking, index) => (
                  <View 
                    key={booking.id} 
                    style={[
                      tw`flex-row items-center justify-between p-3 bg-slate-900 rounded-lg mb-3`,
                      index === recentBookings.length - 1 && tw`mb-0`
                    ]}
                  >
                    <View style={tw`flex-row items-center flex-1`}>
                      <View style={tw`bg-blue-500 rounded-full p-2 mr-3`}>
                        <Icon 
                          name={booking.mode_of_service?.includes('sea') ? "ship" : "truck"} 
                          size={20} 
                          color="white" 
                        />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text style={tw`text-white font-bold font-sans`}>
                          #{booking.booking_number}
                        </Text>
                        <Text style={tw`text-gray-400 text-xs font-sans`}>
                          {booking.origin?.name} → {booking.destination?.name}
                        </Text>
                        <Text style={tw`text-gray-500 text-xs font-sans mt-1`}>
                          {formatDate(booking.created_at)}
                        </Text>
                      </View>
                    </View>
                    <StatusBadge status={booking.booking_status} />
                  </View>
                ))
              )}
            </View>

            {/* View All Button */}
            {recentBookings.length > 0 && (
              <View style={tw`p-4 border-t border-slate-700`}>
                <TouchableOpacity 
                  style={tw`bg-blue-600 rounded-lg px-4 py-3 items-center`}
                  onPress={() => navigation.navigate('Bookings')}
                >
                  <Text style={tw`text-white font-bold font-sans text-sm`}>
                    View All Bookings
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={tw`px-4 pt-4 pb-20`}>
          <View style={tw`bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden`}>
            <View style={tw`p-4`}>
              <Text style={tw`text-white text-lg font-bold font-sans mb-4`}>Quick Actions</Text>
              <View style={tw`flex-row justify-between`}>
                <TouchableOpacity 
                  style={tw`bg-blue-600 rounded-xl p-4 flex-1 mr-2 items-center`}
                  onPress={() => navigation.navigate('NewBooking')}
                >
                  <Icon name="plus-circle" size={24} color="white" />
                  <Text style={tw`text-white font-sans text-sm mt-2`}>New Booking</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={tw`bg-green-600 rounded-xl p-4 flex-1 ml-2 items-center`}
                  onPress={() => navigation.navigate('Track')}
                >
                  <Icon name="map-marker-path" size={24} color="white" />
                  <Text style={tw`text-white font-sans text-sm mt-2`}>Track Shipment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}