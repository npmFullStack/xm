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
import { registerSchema } from '../schema/authSchema';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../hooks/useAuth';
import tw from '../../lib/tailwind';
import { useDeviceContext } from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Register({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <SafeAreaView style={tw`flex-1 bg-[#020617]`}>
      <StatusBar backgroundColor="#020617" barStyle="light-content" />

      {/* Main Wrapper */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <ScrollView contentContainerStyle={tw`flex-grow`} showsVerticalScrollIndicator={false}>

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
                  backgroundImage:
                    'linear-gradient(to bottom, rgba(15,23,42,0.3) 1px, transparent 1px)',
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
                  colors={['rgba(37,99,235,0.5)', 'transparent']}
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
                <View style={tw`relative items-center justify-center`}>
                  {[ -3, -2, 0, 2, 3 ].map((x) =>
                    [ -3, -2, 0, 2, 3 ].map((y) => (
                      <Text
                        key={`${x}-${y}`}
                        style={[
                          tw`absolute text-5xl font-bold text-gray-800`,
                          { top: y, left: x, opacity: 0.8 },
                        ]}
                      >
                        XtraMile
                      </Text>
                    ))
                  )}

                  <Text style={tw`text-5xl font-bold text-blue-600 relative z-10`}>
                    XtraMile
                  </Text>
                </View>

                <Text style={[tw`text-base font-medium text-white mt-2 text-center`, {
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  Your Trusted Delivery Partner
                </Text>
              </View>

              {/* FORM */}
              <View style={tw`flex-1 bg-white dark:bg-slate-900 rounded-t-3xl px-6 pt-8 pb-8`}>
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

                {/* ---------- FORM INPUTS ---------- */}

                {/* First Name */}
                <InputField
                  control={control}
                  name="first_name"
                  icon="account-outline"
                  placeholder="First Name"
                  placeholderColor={placeholderColor}
                  error={errors.first_name}
                />

                {/* Last Name */}
                <InputField
                  control={control}
                  name="last_name"
                  icon="account-outline"
                  placeholder="Last Name"
                  placeholderColor={placeholderColor}
                  error={errors.last_name}
                />

                {/* Email */}
                <InputField
                  control={control}
                  name="email"
                  icon="email-outline"
                  placeholder="Email"
                  placeholderColor={placeholderColor}
                  error={errors.email}
                />

                {/* Password */}
                <PasswordField
                  control={control}
                  name="password"
                  show={showPassword}
                  setShow={setShowPassword}
                  placeholder="Password"
                  placeholderColor={placeholderColor}
                  error={errors.password}
                />

                {/* Confirm Password */}
                <PasswordField
                  control={control}
                  name="confirmPassword"
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                  placeholder="Confirm Password"
                  placeholderColor={placeholderColor}
                  error={errors.confirmPassword}
                />

                {/* Submit */}
                <TouchableOpacity
                  style={tw`bg-blue-600 rounded-xl py-4 shadow-lg mt-4`}
                  onPress={handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  <Text style={tw`text-white text-center font-bold text-base font-sans`}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* --- Reusable Components --- */

function InputField({ control, name, icon, placeholder, placeholderColor, error }) {
  return (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3`}>
        <Icon name={icon} size={20} color={placeholderColor} />

        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={tw`flex-1 ml-3 text-gray-900 dark:text-white font-sans`}
              placeholder={placeholder}
              placeholderTextColor={placeholderColor}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              selectionColor="#06b6d4"
            />
          )}
        />
      </View>

      {error && <Text style={tw`text-red-400 text-sm mt-1 ml-1`}>{error.message}</Text>}
    </View>
  );
}

function PasswordField({ control, name, placeholder, show, setShow, placeholderColor, error }) {
  return (
    <View style={tw`mb-4`}>
      <View style={tw`flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3`}>
        <Icon name="lock-outline" size={20} color={placeholderColor} />

        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={tw`flex-1 ml-3 text-gray-900 dark:text-white font-sans`}
              placeholder={placeholder}
              placeholderTextColor={placeholderColor}
              secureTextEntry={!show}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              selectionColor="#06b6d4"
            />
          )}
        />

        <TouchableOpacity onPress={() => setShow(!show)} style={tw`p-1`}>
          <Icon name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={placeholderColor} />
        </TouchableOpacity>
      </View>

      {error && <Text style={tw`text-red-400 text-sm mt-1 ml-1`}>{error.message}</Text>}
    </View>
  );
}
