// app/components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from './CustomDrawer';
import tw from '../../lib/tailwind';

export default function Header({ title, showBack = false, rightComponent }) {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { setIsOpen, setActiveRoute } = useDrawer();

  const handleMenuPress = () => {
    setActiveRoute(title);
    setIsOpen(true);
  };

  return (
    <View style={tw`bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3`}>
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center flex-1`}>
          {showBack ? (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={tw`mr-3`}
            >
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={isDark ? '#e2e8f0' : '#334155'} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleMenuPress}
              style={tw`mr-3`}
            >
              <Ionicons 
                name="menu" 
                size={24} 
                color={isDark ? '#e2e8f0' : '#334155'} 
              />
            </TouchableOpacity>
          )}
          
          <Text style={tw`text-xl font-bold text-gray-900 dark:text-white font-sans`}>
            {title}
          </Text>
        </View>

        <View style={tw`flex-row items-center`}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
}