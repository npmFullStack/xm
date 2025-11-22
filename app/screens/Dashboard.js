// app/screens/Dashboard.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import { CustomDrawer, useDrawer } from '../components/CustomDrawer';
import tw from '../../lib/tailwind';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const navigation = useNavigation();
  const { isOpen } = useDrawer();

  return (
    <SafeAreaView style={tw`flex-1 bg-[#020617]`}>
      <Header title="Dashboard" />
      <CustomDrawer navigation={navigation} />
      
      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Vehicle Status Card */}
        <View style={tw`px-4 pt-4`}>
          <View style={tw`bg-slate-800 rounded-2xl p-4 border border-slate-700`}>
            <View style={tw`flex-row justify-between items-start mb-3`}>
              <View>
                <Text style={tw`text-gray-400 text-sm font-sans mb-1`}>Good morning! Rhazel</Text>
                <Text style={tw`text-white text-xl font-bold font-sans`}>Tesla Model X</Text>
                <Text style={tw`text-blue-400 text-sm font-sans`}>P-23-AGP</Text>
              </View>
              <Icon name="car-side" size={48} color="#60a5fa" />
            </View>
            
            <View style={tw`bg-slate-900 rounded-xl p-3 mb-3`}>
              <Text style={tw`text-gray-400 text-xs font-sans mb-1`}>Battery</Text>
              <View style={tw`flex-row items-center`}>
                <View style={tw`flex-1 bg-slate-700 rounded-full h-2 mr-3`}>
                  <View style={tw`bg-green-500 rounded-full h-2`} style={{ width: '72%' }} />
                </View>
                <Text style={tw`text-white font-bold font-sans`}>72%</Text>
              </View>
            </View>

            <View style={tw`flex-row justify-between`}>
              <View style={tw`flex-row items-center`}>
                <Icon name="map-marker" size={16} color="#94a3b8" />
                <Text style={tw`text-gray-400 text-sm font-sans ml-1`}>New York, USA</Text>
              </View>
              <View style={tw`flex-row items-center`}>
                <Icon name="gas-station" size={16} color="#94a3b8" />
                <Text style={tw`text-gray-400 text-sm font-sans ml-1`}>Favorite station</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weather & Charging Station */}
        <View style={tw`px-4 pt-4 flex-row`}>
          <View style={tw`flex-1 bg-slate-800 rounded-2xl p-4 border border-slate-700 mr-2`}>
            <Icon name="weather-partly-cloudy" size={32} color="#60a5fa" />
            <Text style={tw`text-white text-2xl font-bold font-sans mt-2`}>81°F</Text>
            <Text style={tw`text-gray-400 text-xs font-sans`}>Low: 75°F • High: 87°F</Text>
          </View>
          
          <View style={tw`flex-1 bg-slate-800 rounded-2xl p-4 border border-slate-700 ml-2`}>
            <Icon name="ev-station" size={32} color="#10b981" />
            <Text style={tw`text-white text-lg font-bold font-sans mt-2`}>Tesla Station</Text>
            <Text style={tw`text-gray-400 text-xs font-sans`}>Available slots</Text>
          </View>
        </View>

        {/* Map Section */}
        <View style={tw`px-4 pt-4 pb-20`}>
          <View style={tw`bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden`}>
            {/* Map Header */}
            <View style={tw`p-4 flex-row justify-between items-center`}>
              <Text style={tw`text-white text-lg font-bold font-sans`}>Nearby Stations</Text>
              <TouchableOpacity>
                <Icon name="map" size={24} color="#60a5fa" />
              </TouchableOpacity>
            </View>

            {/* Map Area with Grid Background */}
            <View style={[tw`relative`, { height: 300 }]}>
              {/* Grid Background */}
              <View style={tw`absolute inset-0 bg-slate-900`}>
                {/* Vertical grid lines */}
                {[...Array(8)].map((_, i) => (
                  <View
                    key={`v-${i}`}
                    style={[
                      tw`absolute bg-slate-700`,
                      { width: 1, height: '100%', left: `${(i + 1) * 12.5}%`, opacity: 0.3 }
                    ]}
                  />
                ))}
                {/* Horizontal grid lines */}
                {[...Array(6)].map((_, i) => (
                  <View
                    key={`h-${i}`}
                    style={[
                      tw`absolute bg-slate-700`,
                      { height: 1, width: '100%', top: `${(i + 1) * 16.66}%`, opacity: 0.3 }
                    ]}
                  />
                ))}

                {/* Glow effect */}
                <View
                  style={{
                    position: 'absolute',
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    left: '30%',
                    top: '30%',
                  }}
                >
                  <LinearGradient
                    colors={['rgba(37,99,235,0.3)', 'transparent']}
                    start={{ x: 0.5, y: 0.5 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ width: '100%', height: '100%', borderRadius: 100 }}
                  />
                </View>
              </View>

              {/* Station Markers */}
              <View style={tw`absolute inset-0 items-center justify-center`}>
                {/* Center marker (current location) */}
                <View style={tw`absolute`} style={{ top: '50%', left: '50%', transform: [{ translateX: -12 }, { translateY: -12 }] }}>
                  <View style={tw`bg-blue-500 rounded-full p-2`}>
                    <Icon name="crosshairs-gps" size={20} color="white" />
                  </View>
                </View>

                {/* Station markers positioned around */}
                {[
                  { top: '20%', left: '30%' },
                  { top: '30%', left: '60%' },
                  { top: '40%', left: '25%' },
                  { top: '60%', left: '70%' },
                  { top: '70%', left: '40%' },
                  { top: '35%', left: '80%' },
                ].map((pos, i) => (
                  <View
                    key={i}
                    style={[tw`absolute`, { top: pos.top, left: pos.left, transform: [{ translateX: -12 }, { translateY: -12 }] }]}
                  >
                    <View style={tw`bg-cyan-500 rounded-full p-2 shadow-lg`}>
                      <Icon name="ev-station" size={20} color="white" />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Stations List */}
            <View style={tw`p-4 border-t border-slate-700`}>
              <View style={tw`flex-row items-center justify-between mb-3`}>
                <View style={tw`flex-row items-center flex-1`}>
                  <View style={tw`bg-cyan-500 rounded-full p-2 mr-3`}>
                    <Icon name="ev-station" size={20} color="white" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-bold font-sans`}>Tesla Supercharger</Text>
                    <Text style={tw`text-gray-400 text-xs font-sans`}>2.5 km away</Text>
                  </View>
                </View>
                <TouchableOpacity style={tw`bg-blue-600 rounded-lg px-4 py-2`}>
                  <Text style={tw`text-white font-bold font-sans text-sm`}>Navigate</Text>
                </TouchableOpacity>
              </View>

              <View style={tw`flex-row items-center justify-between mb-3`}>
                <View style={tw`flex-row items-center flex-1`}>
                  <View style={tw`bg-cyan-500 rounded-full p-2 mr-3`}>
                    <Icon name="ev-station" size={20} color="white" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-bold font-sans`}>ChargePoint Station</Text>
                    <Text style={tw`text-gray-400 text-xs font-sans`}>3.8 km away</Text>
                  </View>
                </View>
                <TouchableOpacity style={tw`bg-blue-600 rounded-lg px-4 py-2`}>
                  <Text style={tw`text-white font-bold font-sans text-sm`}>Navigate</Text>
                </TouchableOpacity>
              </View>

              <View style={tw`flex-row items-center justify-between`}>
                <View style={tw`flex-row items-center flex-1`}>
                  <View style={tw`bg-cyan-500 rounded-full p-2 mr-3`}>
                    <Icon name="ev-station" size={20} color="white" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-bold font-sans`}>EVgo Fast Charging</Text>
                    <Text style={tw`text-gray-400 text-xs font-sans`}>5.2 km away</Text>
                  </View>
                </View>
                <TouchableOpacity style={tw`bg-blue-600 rounded-lg px-4 py-2`}>
                  <Text style={tw`text-white font-bold font-sans text-sm`}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}