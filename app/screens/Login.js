import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schema/authSchema';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import tw from '../../lib/tailwind';
import { useDeviceContext } from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';

const { height, width } = Dimensions.get('window');

export default function Login({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useDeviceContext(tw);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const placeholderColor = isDark ? '#94a3b8' : '#64748b';

  const { login } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#020617]`}>
      <StatusBar backgroundColor="#020617" barStyle="light-content" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1`}>
        <ScrollView contentContainerStyle={tw`flex-grow`} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={tw`flex-1 min-h-full relative`}>

            {/* GRID + GLOW BACKGROUND */}
            <View style={[tw`absolute inset-0 z-0`, { backgroundColor: '#020617' }]}>    

              {/* Grid vertical lines */}
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0.3,
                  backgroundSize: 32,
                  backgroundImage:
                    'linear-gradient(to right, rgba(71,85,105,0.3) 1px, transparent 1px)',
                }}
              />

              {/* Grid horizontal lines */}
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0.3,
                  backgroundSize: 32,
                  backgroundImage: 'linear-gradient(to bottom, rgba(15,23,42,0.3) 1px, transparent 1px)',
                }}
              />

              {/* Radial glow */}
              <View
                style={{
                  position: 'absolute',
                  width: width * 2,
                  height: width * 2,
                  borderRadius: width,
                  left: width * -0.5,
                  top: height * 0.25,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={['rgba(37,99,235,0.7)', 'transparent']}
                  start={{ x: 0.5, y: 0.5 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            </View>

            {/* FOREGROUND CONTENT */}
            <View style={tw`flex-1 z-10`}>

              {/* Branding */}
              <View style={tw`h-80 justify-center items-center px-6`}>
                <View style={tw`items-center justify-center`}>

                <View style={tw`relative items-center justify-center`}>
  {/* Wider, soft outline clone layers */}
  {[ -3, -2, 0, 2, 3 ].map((offsetX) =>
    [ -3, -2, 0, 2, 3 ].map((offsetY) => (
      <Text
        key={`x-${offsetX}-y-${offsetY}`}
        style={[
          tw`absolute text-5xl font-bold text-gray-800`,
          {
            top: offsetY,
            left: offsetX,
            opacity: 0.8,
          },
        ]}
      >
        XtraMile
      </Text>
    ))
  )}

  {/* Main Title */}
  <Text style={tw`text-5xl font-bold text-blue-600 relative z-10`}>XtraMile</Text>
</View>


                  <Text style={[tw`text-base font-medium text-white mt-2 text-center`, { textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }]}>Your Trusted Delivery Partner</Text>
                </View>
              </View>

              {/* FORM */}
              <View style={tw`flex-1 bg-white dark:bg-slate-900 rounded-t-3xl px-6 pt-8 pb-8`}>
                <Text style={tw`text-2xl font-bold text-gray-900 dark:text-white text-center mb-2`}>Login</Text>

                <View style={tw`flex-row justify-center mb-6`}>
                  <Text style={tw`text-gray-600 dark:text-gray-400 font-sans`}>Don't Have An Account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={tw`text-blue-600 font-semibold`}> Sign Up</Text>
                  </TouchableOpacity>
                </View>

                {/* Email */}
                <View style={tw`mb-4`}>
                  <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3`}>
                    <Icon name="account-outline" size={20} color={placeholderColor} />
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={tw`flex-1 ml-3 text-gray-900 dark:text-white font-sans`}
                          placeholder="Enter your email address"
                          placeholderTextColor={placeholderColor}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          selectionColor="#06b6d4"
                        />
                      )}
                    />
                  </View>
                  {errors.email && <Text style={tw`text-red-400 text-sm mt-1 ml-1 font-sans`}>{errors.email.message}</Text>}
                </View>

                {/* Password */}
                <View style={tw`mb-6`}>
                  <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3`}>
                    <Icon name="lock-outline" size={20} color={placeholderColor} />
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          style={tw`flex-1 ml-3 text-gray-900 dark:text-white font-sans`}
                          placeholder="Enter your password"
                          placeholderTextColor={placeholderColor}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          value={value}
                          secureTextEntry={!showPassword}
                          selectionColor="#06b6d4"
                        />
                      )}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={tw`p-1`}>
                      <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={placeholderColor} />
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={tw`text-red-400 text-sm mt-1 ml-1 font-sans`}>{errors.password.message}</Text>}
                </View>

                {/* Login */}
                <TouchableOpacity style={tw`bg-blue-600 rounded-xl py-4 shadow-lg`} onPress={handleSubmit(onSubmit)} disabled={loading}>
                  <Text style={tw`text-white text-center font-bold text-base font-sans`}>{loading ? 'Signing In...' : 'Login'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
