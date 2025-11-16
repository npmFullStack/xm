// App.js 
import './global.css';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppNavigator from './app/navigation/AppNavigator';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text, useColorScheme, StatusBar, Appearance } from 'react-native';
import { useDeviceContext } from 'twrnc';
import tw from './lib/tailwind';
import { DrawerProvider } from './app/components/CustomDrawer';
import { AuthProvider } from './app/hooks/useAuth'; // Add this import

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Custom themes
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

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Optional: Add Appearance listener for real-time updates
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            console.log('Color scheme changed to:', colorScheme);
        });

        return () => subscription.remove();
    }, []);

    // Tailwind device context
    useDeviceContext(tw, { 
        observeDeviceColorSchemeChanges: true 
    });

    useEffect(() => {
        if (fontsLoaded || fontError) SplashScreen.hideAsync();
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return (
            <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center', 
                backgroundColor: isDark ? '#0f172a' : '#f8fafc' 
            }}>
                <Text style={{ 
                    color: isDark ? 'white' : '#334155', 
                    fontFamily: 'Poppins-Regular' 
                }}>
                    Loading...
                </Text>
            </View>
        );
    }

    return (
        <>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={isDark ? '#0f172a' : '#f8fafc'}
            />
            <AuthProvider> 
                <NavigationContainer theme={isDark ? CustomDarkTheme : CustomLightTheme}>
                    <DrawerProvider>
                        <AppNavigator />
                    </DrawerProvider>
                </NavigationContainer>
            </AuthProvider>
        </>
    );
}