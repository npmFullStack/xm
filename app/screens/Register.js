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
import { registerSchema } from '../schema/authSchema';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import tw from '../../lib/tailwind';

export default function Register({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const placeholderColor = isDark ? '#94a3b8' : '#64748b';

  const { register: registerUser } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });

      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (error) {
      Alert.alert('Registration Failed', error?.response?.data?.message || 'Something went wrong');
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
          {/* Top Image Section */}
          <View style={tw`h-80`}>
            <ImageBackground
              source={require('../assets/images/background.png')}
              style={tw`flex-1 justify-center items-center px-6`}
              resizeMode="cover"
            />
          </View>

          {/* Form Card */}
          <View style={tw`flex-1 bg-white dark:bg-slate-900 rounded-t-3xl -mt-8 px-6 pt-8`}>
            <Text style={tw`text-3xl font-bold text-gray-900 dark:text-white text-center mb-2`}>
              Create Account
            </Text>
            <Text style={tw`text-base text-gray-600 dark:text-gray-300 text-center mb-8`}>
              Sign up to get started
            </Text>

            {/* First Name */}
            <View style={tw`mb-4`}>
              <Controller
                control={control}
                name="first_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={tw`bg-gray-50 dark:bg-gray-800 border ${errors.first_name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-xl px-4 py-4 text-gray-900 dark:text-white text-lg`}
                    placeholder="First Name"
                    placeholderTextColor={placeholderColor}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                  />
                )}
              />
              {errors.first_name && <Text style={tw`text-red-400 text-sm mt-1 ml-1`}>{errors.first_name.message}</Text>}
            </View>

            {/* Last Name */}
            <View style={tw`mb-4`}>
              <Controller
                control={control}
                name="last_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={tw`bg-gray-50 dark:bg-gray-800 border ${errors.last_name ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-xl px-4 py-4 text-gray-900 dark:text-white text-lg`}
                    placeholder="Last Name"
                    placeholderTextColor={placeholderColor}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                  />
                )}
              />
              {errors.last_name && <Text style={tw`text-red-400 text-sm mt-1 ml-1`}>{errors.last_name.message}</Text>}
            </View>

            {/* Email */}
            <View style={tw`mb-4`}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={tw`bg-gray-50 dark:bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-xl px-4 py-4 text-gray-900 dark:text-white text-lg`}
                    placeholder="Email"
                    placeholderTextColor={placeholderColor}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              {errors.email && <Text style={tw`text-red-400 text-sm mt-1 ml-1`}>{errors.email.message}</Text>}
            </View>

            {/* Password */}
            <View style={tw`mb-4 relative`}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={tw`bg-gray-50 dark:bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-xl px-4 py-4 text-gray-900 dark:text-white text-lg pr-12`}
                    placeholder="Password"
                    placeholderTextColor={placeholderColor}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showPassword}
                  />
                )}
              />
              <TouchableOpacity
                style={tw`absolute right-4 top-4`}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={placeholderColor} />
              </TouchableOpacity>
              {errors.password && <Text style={tw`text-red-400 text-sm mt-1 ml-1`}>{errors.password.message}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={tw`mb-4 relative`}>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={tw`bg-gray-50 dark:bg-gray-800 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} rounded-xl px-4 py-4 text-gray-900 dark:text-white text-lg pr-12`}
                    placeholder="Confirm Password"
                    placeholderTextColor={placeholderColor}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showConfirmPassword}
                  />
                )}
              />
              <TouchableOpacity
                style={tw`absolute right-4 top-4`}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={placeholderColor} />
              </TouchableOpacity>
              {errors.confirmPassword && <Text style={tw`text-red-400 text-sm mt-1 ml-1`}>{errors.confirmPassword.message}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={tw`bg-blue-600 rounded-xl py-4 mt-2 mb-4`}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text style={tw`text-white text-center font-bold text-base`}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Link to Login */}
            <View style={tw`flex-row justify-center mt-4`}>
              <Text style={tw`text-gray-600 dark:text-gray-400`}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={tw`text-blue-600 font-semibold`}>Sign In</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
