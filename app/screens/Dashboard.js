import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Dashboard({ navigation }) {
  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg p-6">
      <Text className="text-2xl font-bold text-light-heading dark:text-dark-heading mb-4">
        Dashboard
      </Text>
      <Text className="text-light-content dark:text-dark-content">
        Welcome to your dashboard!
      </Text>
    </View>
  );
}