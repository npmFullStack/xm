// app/components/CustomDrawer.js
import React, { useState, createContext, useContext } from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import tw from '../../lib/tailwind';

const DrawerContext = createContext();

export function DrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('Dashboard');

  const value = {
    isOpen,
    setIsOpen,
    activeRoute,
    setActiveRoute
  };

  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
}

export function CustomDrawer({ navigation }) {
  const { isOpen, setIsOpen, activeRoute } = useDrawer();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logout, user, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const menuItems = [
    { label: 'Dashboard', icon: 'home', route: 'Dashboard' },
    { label: 'Booking', icon: 'car', route: 'Booking' },
    { label: 'Profile', icon: 'person', route: 'Profile' },
    { label: 'Settings', icon: 'settings', route: 'Settings' },
  ];

  if (!isOpen) return null;

  return (
    <SafeAreaView style={tw`absolute inset-0 z-50`}>
      <TouchableOpacity 
        style={tw`flex-1`}
        activeOpacity={1}
        onPress={() => setIsOpen(false)}
      >
        <View style={tw`flex-1 bg-black/50`}>
          <View style={tw`w-4/5 h-full bg-white dark:bg-slate-900`}>
            <SafeAreaView style={tw`flex-1`}>
              {/* Header */}
              <View style={tw`px-4 py-6 border-b border-gray-200 dark:border-gray-700`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`bg-blue-600 w-12 h-12 rounded-full items-center justify-center mr-3`}>
                    <Text style={tw`text-white text-lg font-bold`}>
                      {user?.name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                  <View>
                    <Text style={tw`text-lg font-bold text-gray-900 dark:text-white font-sans`}>
                      {user?.name || 'User'}
                    </Text>
                    <Text style={tw`text-gray-500 dark:text-gray-400 text-sm font-sans`}>
                      {user?.email || 'user@example.com'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Menu Items */}
              <View style={tw`mt-2`}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={tw`flex-row items-center px-4 py-3 mx-2 rounded-lg ${
                      activeRoute === item.route ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onPress={() => {
                      navigation.navigate(item.route);
                      setIsOpen(false);
                    }}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={22} 
                      color={
                        activeRoute === item.route 
                          ? '#2563eb' 
                          : isDark ? '#94a3b8' : '#64748b'
                      } 
                    />
                    <Text style={tw`ml-4 text-gray-700 dark:text-gray-300 font-medium font-sans ${
                      activeRoute === item.route ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Logout Button */}
              <View style={tw`mt-auto px-4 py-6 border-t border-gray-200 dark:border-gray-700`}>
                <TouchableOpacity
                  style={tw`flex-row items-center px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg`}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out" size={22} color="#dc2626" />
                  <Text style={tw`ml-4 text-red-600 dark:text-red-400 font-medium font-sans`}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}