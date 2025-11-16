// app/screens/Profile.js
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { CustomDrawer, useDrawer } from '../components/CustomDrawer';
import tw from '../../lib/tailwind';

export default function Profile() {
  const navigation = useNavigation();
  const { isOpen } = useDrawer();

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50 dark:bg-slate-900`}>
      <Header title="Profile" />
      <CustomDrawer navigation={navigation} />
      
      <ScrollView style={tw`flex-1 px-4 py-6`}>
        <View style={tw`bg-white dark:bg-slate-800 rounded-xl p-6`}>
          <Text style={tw`text-2xl font-bold text-gray-900 dark:text-white font-sans mb-4`}>
            My Profile
          </Text>
          <Text style={tw`text-gray-600 dark:text-gray-400 font-sans`}>
            Profile screen content coming soon...
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}