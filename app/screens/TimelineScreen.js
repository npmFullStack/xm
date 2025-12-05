// src/screens/TimelineScreen.js
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCargoMonitoring } from '../hooks/useCargoMonitoring';
import tw from '../../lib/tailwind';

const TimelineScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { bookingId, bookingData } = route.params;
  const { getCargoMonitoringQuery } = useCargoMonitoring();
  const { data: cargoData, isLoading } = getCargoMonitoringQuery(bookingId);

  const timelineSteps = [
    { status: 'Pending', field: null, icon: 'clock' },
    { status: 'Picked Up', field: 'picked_up_at', icon: 'truck' },
    { status: 'Origin Port', field: 'origin_port_at', icon: 'ship-wheel' },
    { status: 'In Transit', field: 'in_transit_at', icon: 'ship-wheel' },
    { status: 'Destination Port', field: 'destination_port_at', icon: 'map-marker' },
    { status: 'Delivered', field: 'delivered_at', icon: 'check-circle' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isStepCompleted = (step) => {
    if (!cargoData) return false;
    return cargoData[step.field] !== null;
  };

  const isCurrentStep = (step) => {
    if (!cargoData) return step.status === 'Pending';
    return cargoData.current_status === step.status;
  };

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <StatusBar backgroundColor="#1e40af" barStyle="light-content" />
      
      {/* Header */}
      <View style={tw`bg-blue-700 px-4 pt-12 pb-4`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={tw`text-white text-xl font-bold ml-4`}>
            Shipping Timeline
          </Text>
        </View>
        <Text style={tw`text-blue-200 text-sm mt-2`}>
          Booking #{bookingData?.booking_number}
        </Text>
      </View>

      <SafeAreaView style={tw`flex-1`} edges={['left', 'right', 'bottom']}>
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-6`}>
          <View style={tw`px-4 pt-6`}>
            {/* Route Info */}
            <View style={tw`bg-white rounded-xl p-4 mb-6 shadow-sm`}>
              <Text style={tw`text-lg font-bold text-gray-900 mb-2`}>Route Details</Text>
              <View style={tw`flex-row items-center`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm text-gray-700`}>
                    {bookingData?.origin?.name || 'N/A'} → {bookingData?.destination?.name || 'N/A'}
                  </Text>
                  <Text style={tw`text-xs text-gray-500 mt-1`}>
                    Container: {bookingData?.container_quantity}x {bookingData?.container_size?.size}
                  </Text>
                </View>
              </View>
            </View>

            {/* Timeline */}
            <View style={tw`bg-white rounded-xl p-4 shadow-sm`}>
              <Text style={tw`text-lg font-bold text-gray-900 mb-6`}>
                Shipping Status Timeline
              </Text>

              {isLoading ? (
                <View style={tw`items-center py-8`}>
                  <Icon name="loading" size={24} color="#3b82f6" style={tw`animate-spin`} />
                  <Text style={tw`text-gray-500 text-sm mt-2`}>Loading timeline...</Text>
                </View>
              ) : (
                <View style={tw`relative`}>
                  {timelineSteps.map((step, index) => {
                    const completed = isStepCompleted(step);
                    const current = isCurrentStep(step);
                    const date = step.field ? cargoData?.[step.field] : null;
                    
                    return (
                      <View key={step.status} style={tw`flex-row items-start mb-6`}>
                        {/* Timeline dot and line */}
                        <View style={tw`items-center w-10`}>
                          <View style={tw`w-6 h-6 rounded-full z-10 flex items-center justify-center ${
                            current ? 'bg-blue-500 ring-4 ring-blue-100' :
                            completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            <Icon 
                              name={step.icon} 
                              size={12} 
                              color={completed || current ? "white" : "gray"} 
                            />
                          </View>
                          
                          {/* Vertical line */}
                          {index < timelineSteps.length - 1 && (
                            <View style={tw`w-0.5 h-12 mt-1 ${
                              completed ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                          )}
                        </View>

                        {/* Status content */}
                        <View style={tw`flex-1 ml-3`}>
                          <View style={tw`flex-row justify-between items-start`}>
                            <View>
                              <Text style={tw`font-medium text-sm ${
                                current ? 'text-blue-600' :
                                completed ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {step.status}
                              </Text>
                              
                              {date && (
                                <Text style={tw`text-xs text-gray-500 mt-1`}>
                                  {formatDate(date)}
                                </Text>
                              )}
                            </View>
                            
                            {current && (
                              <View style={tw`bg-blue-100 px-2 py-1 rounded-full`}>
                                <Text style={tw`text-blue-600 text-xs font-medium`}>
                                  Current
                                </Text>
                              </View>
                            )}
                            
                            {completed && !current && (
                              <View style={tw`bg-green-100 px-2 py-1 rounded-full`}>
                                <Icon name="check" size={12} color="#059669" />
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Additional Info */}
              {cargoData && (
                <View style={tw`mt-6 pt-6 border-t border-gray-100`}>
                  <Text style={tw`text-sm font-medium text-gray-700 mb-2`}>
                    Last Updated
                  </Text>
                  <Text style={tw`text-xs text-gray-500`}>
                    {cargoData.updated_at ? formatDate(cargoData.updated_at) : 'Not available'}
                  </Text>
                </View>
              )}
            </View>

            {/* Shipping Info */}
            <View style={tw`bg-white rounded-xl p-4 mt-6 shadow-sm`}>
              <Text style={tw`text-lg font-bold text-gray-900 mb-4`}>
                Shipping Information
              </Text>
              
              <View style={tw`space-y-3`}>
                {bookingData?.shipping_line?.name && (
                  <View style={tw`flex-row items-center`}>
                    <Icon name="ship-wheel" size={16} color="#64748b" />
                    <Text style={tw`text-sm text-gray-700 ml-2`}>
                      Shipping Line: {bookingData.shipping_line.name}
                    </Text>
                  </View>
                )}
                
                {bookingData?.truck_comp?.name && (
                  <View style={tw`flex-row items-center`}>
                    <Icon name="truck" size={16} color="#64748b" />
                    <Text style={tw`text-sm text-gray-700 ml-2`}>
                      Trucking: {bookingData.truck_comp.name}
                    </Text>
                  </View>
                )}
                
                {bookingData?.van_number && (
                  <View style={tw`flex-row items-center`}>
                    <Icon name="truck" size={16} color="#64748b" />
                    <Text style={tw`text-sm text-gray-700 ml-2`}>
                      VAN #: {bookingData.van_number}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default TimelineScreen;