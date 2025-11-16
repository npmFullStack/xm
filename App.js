import './global.css';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppNavigator from './app/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text, useColorScheme } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Custom themes that match your design
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc',
    card: '#ffffff',
    text: '#334155',
    border: '#e2e8f0',
    primary: '#2563eb',
    notification: '#2563eb',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f172a',
    card: '#1e293b',
    text: '#e2e8f0',
    border: '#334155',
    primary: '#2563eb',
    notification: '#2563eb',
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('./app/assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./app/assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./app/assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./app/assets/fonts/Poppins-Bold.ttf'),
  });

  // Get device color scheme
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <Text style={{ color: 'white', fontFamily: 'Poppins-Regular' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
}