// app/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Dashboard from '../screens/Dashboard';
import Booking from '../screens/Booking';
import CreateBooking from '../screens/CreateBooking';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import TimelineScreen from '../screens/TimelineScreen';
import PaymentScreen from '../screens/PaymentScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={Welcome} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Booking" component={Booking} />
      <Stack.Screen name="CreateBooking" component={CreateBooking} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Settings" component={Settings} />
      
      {/* New Screens */}
      <Stack.Screen 
        name="TimelineScreen" 
        component={TimelineScreen} 
        options={{
          headerShown: true,
          title: 'Shipping Timeline',
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen 
        name="PaymentScreen" 
        component={PaymentScreen} 
        options={{
          headerShown: true,
          title: 'Make Payment',
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: 'white',
        }}
      />
    </Stack.Navigator>
  );
}