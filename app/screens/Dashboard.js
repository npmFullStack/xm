import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard({ navigation }) {
  const { getUser, logout } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const data = await getUser();
      setUser(data);
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View className="flex-1 bg-light-bg dark:bg-dark-bg p-6">
      <Text className="text-2xl font-bold text-light-heading dark:text-dark-heading mb-4">
        Dashboard
      </Text>

      {user ? (
        <>
          <Text className="text-light-content dark:text-dark-content text-lg mb-2">
            Welcome, {user.full_name}
          </Text>
          <Text className="text-light-content dark:text-dark-content text-sm">
            Email: {user.email}
          </Text>
          <Text className="text-light-content dark:text-dark-content text-sm">
            Role: {user.role}
          </Text>
        </>
      ) : (
        <Text className="text-light-content dark:text-dark-content">Loading user...</Text>
      )}

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        onPress={handleLogout}
        className="mt-8 bg-red-600 py-3 rounded-xl"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}
