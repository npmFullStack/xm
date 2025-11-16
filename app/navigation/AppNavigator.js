import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Dashboard from '../screens/Dashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
    checkAuthStatus();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      setIsFirstLaunch(hasLaunched === null);
    } catch (error) {
      setIsFirstLaunch(true);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  if (isFirstLaunch === null) {
    return null; // Or a loading screen
  }

  // Determine initial route based on app state
  const getInitialRouteName = () => {
    if (isFirstLaunch) return 'Welcome';
    if (isLoggedIn) return 'Dashboard';
    return 'Login';
  };

  return (
    <Stack.Navigator 
      initialRouteName={getInitialRouteName()}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
    </Stack.Navigator>
  );
}