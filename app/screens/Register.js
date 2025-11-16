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
import { useDeviceContext } from 'twrnc';

export default function Register({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Enable device context for this component
  useDeviceContext(tw);

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
          {/* Top Section */}
          <View style={tw`h-80`}>
            <ImageBackground
              source={require('../assets/images/background.png')}
              style={tw`flex-1 justify-center items-center px-6`}
              resizeMode="cover"
            >
              {/* Logo and Text Container */}
              <View style={tw`items-center justify-center`}>
                {/* Text with smooth white outline */}
                <View style={tw`relative items-center justify-center`}>
                  {/* Smooth white outline layers */}
                  <Text style={[tw`absolute text-4xl font-bold text-white`, { top: -2, left: -2 }]}>
                    XtraMile
                  </Text>
                  <Text style={[tw`absolute text-4xl font-bold text-white`, { top: -2, left: 0 }]}>
                    XtraMile
                  </Text>
                  <Text style={[tw`absolute text-4xl font-bold text-white`, { top: -2, left: 2 }]}>
                    XtraMile
                  </Text>
                  <Text style={[tw`absolute text-4xl font-bold text-white`, { top: 0, left: -2 }]}>
                    XtraMile
                  </Text>
                  <Text style={[tw`absolute text-4xl font-bold text-white`, { top: 0, left: 2 }]}>
                    XtraMile
                  </Text>
                  <Text style={[tw`absolute text-4xl font-bold text-white`, { top: 2, left: -2 }]}>
                    XtraMile
                  </Text>
                  <Text style={[tw`absolute text-4xl font-bold text-white`, { top: 2, left: 0 }]}>
                    XtraMile
                  </Text>
                  <Text style={[tw`absolute text-4xl font-bold text-white`, { top: 2, left: 2 }]}>
                    XtraMile
                  </Text>
                  
                  {/* Main blue text */}
                  <Text style={tw`text-4xl font-bold text-blue-600 relative z-10`}>
                    XtraMile
                  </Text>
                </View>

                {/* Slogan with white color and subtle shadow */}
                <Text style={[tw`text-base font-medium text-white mt-2 text-center`, {
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2
                }]}>
                  Your Trusted Delivery Partner
                </Text>
              </View>
            </ImageBackground>
          </View>

          {/* Form Card */}
          <View style={tw`flex-1 bg-white dark:bg-slate-900 rounded-t-3xl -mt-8 px-6 pt-8`}>
            <Text style={tw`text-2xl font-bold text-gray-900 dark:text-white text-center mb-2`}>
              Create Account
            </Text>
            
            <View style={tw`flex-row justify-center mb-6`}>
              <Text style={tw`text-gray-600 dark:text-gray-400 font-sans`}>
                Already Have An Account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={tw`text-blue-600 font-semibold`}> Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* First Name */}
            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3`}>
                <Icon name="account-outline" size={20} color={placeholderColor} />
                <Controller
                  control={control}
                  name="first_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={tw`flex-1 ml-3 text-gray-900 dark:text-white font-sans`}
                      placeholder="First Name"
                      placeholderTextColor={placeholderColor}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="words"
                      selectionColor="#06b6d4"
                    />
                  )}
                />
              </View>
              {errors.first_name && (
                <Text style={tw`text-red-400 text-sm mt-1 ml-1 font-sans`}>
                  {errors.first_name.message}
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3`}>
                <Icon name="account-outline" size={20} color={placeholderColor} />
                <Controller
                  control={control}
                  name="last_name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={tw`flex-1 ml-3 text-gray-900 dark:text-white font-sans`}
                      placeholder="Last Name"
                      placeholderTextColor={placeholderColor}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="words"
                      selectionColor="#06b6d4"
                    />
                  )}
                />
              </View>
              {errors.last_name && (
                <Text style={tw`text-red-400 text-sm mt-1 ml-1 font-sans`}>
                  {errors.last_name.message}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3`}>
                <Icon name="email-outline" size={20} color={placeholderColor} />
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={tw`flex-1 ml-3 text-gray-900 dark:text-white font-sans`}
                      placeholder="Email"
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
                <Text style={tw`text-red-400 text-sm mt-1 ml-1 font-sans`}>
                  {errors.email.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3`}>
                <Icon name="lock-outline" size={20} color={placeholderColor} />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={tw`flex-1 ml-3 text-gray-900 dark:text-white font-sans`}
                      placeholder="Password"
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
                  <Icon 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20}
                    color={placeholderColor} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={tw`text-red-400 text-sm mt-1 ml-1 font-sans`}>
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={tw`mb-6`}>
              <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3`}>
                <Icon name="lock-check-outline" size={20} color={placeholderColor} />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={tw`flex-1 ml-3 text-gray-900 dark:text-white font-sans`}
                      placeholder="Confirm Password"
                      placeholderTextColor={placeholderColor}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showConfirmPassword}
                      selectionColor="#06b6d4"
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon 
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20}
                    color={placeholderColor} 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={tw`text-red-400 text-sm mt-1 ml-1 font-sans`}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={tw`bg-blue-600 rounded-xl py-4 mb-4`}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
            >
              <Text style={tw`text-white text-center font-bold text-base font-sans`}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}