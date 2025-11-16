// app/screens/Dashboard.js
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { CustomDrawer, useDrawer } from '../components/CustomDrawer';
import tw from '../../lib/tailwind';

export default function Dashboard() {
  const navigation = useNavigation();
  const { isOpen } = useDrawer();

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50 dark:bg-slate-900`}>
      <Header title="Dashboard" />
      <CustomDrawer navigation={navigation} />
      
      <ScrollView style={tw`flex-1 px-4 py-6`}>
        <View style={tw`bg-white dark:bg-slate-800 rounded-xl p-6 mb-4`}>
          <Text style={tw`text-2xl font-bold text-gray-900 dark:text-white font-sans mb-2`}>
            Welcome to XtraMile! 🚚
          </Text>
          <Text style={tw`text-gray-600 dark:text-gray-400 font-sans mb-4`}>
            Your trusted delivery partner
          </Text>
          
          {/* Quick Stats */}
          <View style={tw`flex-row justify-between mt-4`}>
            <View style={tw`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex-1 mr-2`}>
              <Text style={tw`text-blue-600 dark:text-blue-400 text-lg font-bold font-sans`}>5</Text>
              <Text style={tw`text-gray-600 dark:text-gray-400 text-sm font-sans`}>Active Deliveries</Text>
            </View>
            <View style={tw`bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex-1 ml-2`}>
              <Text style={tw`text-green-600 dark:text-green-400 text-lg font-bold font-sans`}>12</Text>
              <Text style={tw`text-gray-600 dark:text-gray-400 text-sm font-sans`}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={tw`bg-white dark:bg-slate-800 rounded-xl p-6`}>
          <Text style={tw`text-xl font-bold text-gray-900 dark:text-white font-sans mb-4`}>
            Recent Activity
          </Text>
          
     <View style={tw`mt-3`}>
            <View style={tw`flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-3 h-3 bg-green-500 rounded-full mr-3`} />
                <View>
                  <Text style={tw`text-gray-900 dark:text-white font-sans font-medium`}>
                    Package Delivered
                  </Text>
                  <Text style={tw`text-gray-500 dark:text-gray-400 text-sm font-sans`}>
                    Order #12345
                  </Text>
                </View>
              </View>
              <Text style={tw`text-gray-500 dark:text-gray-400 text-sm font-sans`}>
                2 hours ago
              </Text>
            </View>
            
            <View style={tw`flex-row items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-3 h-3 bg-blue-500 rounded-full mr-3`} />
                <View>
                  <Text style={tw`text-gray-900 dark:text-white font-sans font-medium`}>
                    New Booking
                  </Text>
                  <Text style={tw`text-gray-500 dark:text-gray-400 text-sm font-sans`}>
                    Order #12346
                  </Text>
                </View>
              </View>
              <Text style={tw`text-gray-500 dark:text-gray-400 text-sm font-sans`}>
                5 hours ago
              </Text>
            </View>
            
            <View style={tw`flex-row items-center justify-between py-2`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-3 h-3 bg-yellow-500 rounded-full mr-3`} />
                <View>
                  <Text style={tw`text-gray-900 dark:text-white font-sans font-medium`}>
                    In Transit
                  </Text>
                  <Text style={tw`text-gray-500 dark:text-gray-400 text-sm font-sans`}>
                    Order #12347
                  </Text>
                </View>
              </View>
              <Text style={tw`text-gray-500 dark:text-gray-400 text-sm font-sans`}>
                1 day ago
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={tw`bg-white dark:bg-slate-800 rounded-xl p-6 mt-4`}>
          <Text style={tw`text-xl font-bold text-gray-900 dark:text-white font-sans mb-4`}>
            Quick Actions
          </Text>
          
          <View style={tw`flex-row flex-wrap justify-between`}>
            <View style={tw`w-1/2 mb-4 pr-2`}>
              <View style={tw`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 items-center`}>
                <Text style={tw`text-blue-600 dark:text-blue-400 text-lg font-bold font-sans`}>📦</Text>
                <Text style={tw`text-gray-900 dark:text-white font-sans font-medium mt-1`}>
                  New Booking
                </Text>
              </View>
            </View>
            
            <View style={tw`w-1/2 mb-4 pl-2`}>
              <View style={tw`bg-green-50 dark:bg-green-900/20 rounded-lg p-4 items-center`}>
                <Text style={tw`text-green-600 dark:text-green-400 text-lg font-bold font-sans`}>🚚</Text>
                <Text style={tw`text-gray-900 dark:text-white font-sans font-medium mt-1`}>
                  Track Package
                </Text>
              </View>
            </View>
            
            <View style={tw`w-1/2 pr-2`}>
              <View style={tw`bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 items-center`}>
                <Text style={tw`text-purple-600 dark:text-purple-400 text-lg font-bold font-sans`}>📋</Text>
                <Text style={tw`text-gray-900 dark:text-white font-sans font-medium mt-1`}>
                  My Orders
                </Text>
              </View>
            </View>
            
            <View style={tw`w-1/2 pl-2`}>
              <View style={tw`bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 items-center`}>
                <Text style={tw`text-orange-600 dark:text-orange-400 text-lg font-bold font-sans`}>👤</Text>
                <Text style={tw`text-gray-900 dark:text-white font-sans font-medium mt-1`}>
                  Profile
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}