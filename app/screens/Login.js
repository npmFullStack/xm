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
import { loginSchema } from '../schema/authSchema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../hooks/useTheme';

export default function Login({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post('http://your-api-domain.com/api/auth/login', data);
      
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('hasLaunched', 'true');
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  const statusBarStyle = theme.isDark ? 'light-content' : 'dark-content';
  const statusBarBackgroundColor = theme.isDark ? '#0f172a' : '#f8fafc';

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
              Welcome Back
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-300 text-center mb-8 font-medium">
              Sign in to continue
            </Text>

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
                    placeholderTextColor={theme.colors.muted}
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
                      placeholderTextColor={theme.colors.muted}
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
                    color={theme.colors.muted} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-400 text-sm mt-2 ml-1 font-sans">{errors.password.message}</Text>
              )}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-4 mt-4"
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text className="text-white text-center font-semibold text-lg font-semibold">
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 dark:text-gray-400 font-sans">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-blue-500 font-semibold font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}