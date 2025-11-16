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
  ImageBackground,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schema/authSchema';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import tw from '../../lib/tailwind';

export default function Login({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const placeholderColor = isDark ? '#94a3b8' : '#64748b';

  const { login } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (error) {
      Alert.alert('Login Failed', error?.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-slate-900`}>
      <StatusBar
        backgroundColor={isDark ? '#0f172a' : '#f8fafc'}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Section */}
          <View style={tw`h-80`}>
            <ImageBackground
              source={require('../assets/images/background.png')}
              style={tw`flex-1 justify-center items-center px-6`}
              resizeMode="cover"
            />
          </View>

          {/* Login Form */}
          <View style={tw`flex-1 bg-white dark:bg-slate-900 rounded-t-3xl -mt-8 px-6 pt-8`}>
            <Text style={tw`text-2xl font-bold text-gray-900 dark:text-white text-center mb-2`}>
              Login
            </Text>

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
              {errors.email && (
                <Text style={tw`text-red-400 text-sm mt-1 ml-1 font-sans`}>{errors.email.message}</Text>
              )}
            </View>

            {/* Password */}
            <View style={tw`mb-3`}>
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
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={placeholderColor} />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={tw`text-red-400 text-sm mt-1 ml-1 font-sans`}>{errors.password.message}</Text>
              )}
            </View>

            {/* Remember Me / Forgot */}
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <TouchableOpacity style={tw`flex-row items-center`} onPress={() => setRememberMe(!rememberMe)}>
                <View style={tw`${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'} w-5 h-5 rounded border-2 mr-2 justify-center items-center`}>
                  {rememberMe && <Icon name="check" size={14} color="white" />}
                </View>
                <Text style={tw`text-gray-600 dark:text-gray-400 font-sans`}>Remember Me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={tw`text-blue-600 font-semibold font-sans`}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={tw`bg-blue-600 rounded-xl py-4 mb-4`}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text style={tw`text-white text-center font-bold text-base font-sans`}>
                {loading ? 'Signing In...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
