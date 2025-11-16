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
  Platform 
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../schema/authSchema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../hooks/useTheme';

export default function Register({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('http://your-api-domain.com/api/auth/register', data);
      
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('hasLaunched', 'true');
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const statusBarStyle = theme.isDark ? 'light-content' : 'dark-content';
  const statusBarBackgroundColor = theme.isDark ? '#0f172a' : '#f8fafc';
  const placeholderColor = theme?.colors?.muted || '#9CA3AF';

  return (
    <View className="flex-1 bg-white dark:bg-slate-900">
      <StatusBar 
        backgroundColor={statusBarBackgroundColor}
        barStyle={statusBarStyle}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2 font-bold">
              Create Account
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-300 text-center mb-8 font-medium">
              Sign up to get started
            </Text>

            {/* Name Field */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Full Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-gray-50 dark:bg-gray-800 border ${
                      errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                    } rounded-xl px-4 py-4 text-gray-900 dark:text-white text-lg font-sans`}
                    placeholder="Enter your full name"
                    placeholderTextColor={placeholderColor}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    selectionColor="#2563eb"
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-400 text-sm mt-2 ml-1 font-sans">{errors.name.message}</Text>
              )}
            </View>

            {/* Email Field */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-gray-50 dark:bg-gray-800 border ${
                      errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                    } rounded-xl px-4 py-4 text-gray-900 dark:text-white text-lg font-sans`}
                    placeholder="Enter your email"
                    placeholderTextColor={placeholderColor}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    selectionColor="#2563eb"
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-400 text-sm mt-2 ml-1 font-sans">{errors.email.message}</Text>
              )}
            </View>

            {/* Password Field */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Password</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-gray-50 dark:bg-gray-800 border ${
                        errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                      } rounded-xl px-4 py-4 text-gray-900 dark:text-white text-lg pr-12 font-sans`}
                      placeholder="Enter your password"
                      placeholderTextColor={placeholderColor}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
                      selectionColor="#2563eb"
                    />
                  )}
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color={placeholderColor} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-400 text-sm mt-2 ml-1 font-sans">{errors.password.message}</Text>
              )}
            </View>

            {/* Confirm Password Field */}
            <View className="mb-6">
              <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Confirm Password</Text>
              <View className="relative">
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-gray-50 dark:bg-gray-800 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                      } rounded-xl px-4 py-4 text-gray-900 dark:text-white text-lg pr-12 font-sans`}
                      placeholder="Confirm your password"
                      placeholderTextColor={placeholderColor}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showConfirmPassword}
                      selectionColor="#2563eb"
                    />
                  )}
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color={placeholderColor} 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-400 text-sm mt-2 ml-1 font-sans">{errors.confirmPassword.message}</Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-4 mt-4"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 dark:text-gray-400 font-sans">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-blue-500 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}