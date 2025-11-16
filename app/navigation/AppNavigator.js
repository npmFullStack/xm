// app/navigation/AppNavigator.js
import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Dashboard from '../screens/Dashboard';
import Booking from '../screens/Booking';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';

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
      
      // Mark as launched after first check
      if (hasLaunched === null) {
        await AsyncStorage.setItem('hasLaunched', 'true');
      }
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
      <Stack.Screen name="Booking" component={Booking} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
}