import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import tw from '../../lib/tailwind';

const { width, height } = Dimensions.get('window');

export default function Welcome({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const theme = useTheme();

  const slides = [
    {
      id: 1,
      image: require('../assets/images/welcome1.png'),
      title: 'Welcome to XtraMile',
      description: 'Your trusted partner for seamless shipping solutions',
    },
    {
      id: 2,
      title: 'Book Shipping Anywhere',
      image: require('../assets/images/welcome2.png'),
      description: 'Easily book shipping services using your phone from anywhere, anytime',
    },
    {
      id: 3,
      title: 'Get Started',
      image: require('../assets/images/welcome3.png'),
      description: 'Create an account to begin your shipping journey with XtraMile',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const Slide = ({ item, isFirst }) => {
    return (
      <View>
        {/* Background Image Section with Logo */}
        {isFirst && (
          <View style={tw`h-60 -mx-6`}>
            <View style={tw`flex-1 justify-center items-center`}>
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
          </View>
        )}

        {/* White Content Card */}
        <View className={`bg-white dark:bg-slate-900 rounded-t-3xl px-6 pt-8 pb-6 ${isFirst ? '-mt-8' : ''}`}>
          <View className="items-center">
            <Image source={item.image} className="w-72 h-80" resizeMode="contain" />
            <View className="items-center mt-8">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4 font-bold px-4">
                {item.title}
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-300 text-center leading-6 font-sans px-2">
                {item.description}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Dynamic status bar style based on theme
  const statusBarStyle = theme.isDark ? 'light-content' : 'dark-content';
  const statusBarBackgroundColor = theme.isDark ? '#0f172a' : '#f8fafc';

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <StatusBar 
          backgroundColor="transparent"
          translucent
          barStyle="light-content"
        />
        
        {/* Skip Button */}
        <TouchableOpacity className="self-end p-5" onPress={handleSkip}>
          <Text style={[tw`text-white text-base font-sans`, {
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2
          }]}>Skip</Text>
        </TouchableOpacity>

        {/* Slides */}
        <View className="flex-1 justify-center">
          <Slide item={slides[currentSlide]} isFirst={currentSlide === 0} />
        </View>

        {/* Indicators and Button Container */}
        <View className="mb-10">
          {/* Indicators */}
          <View className="flex-row justify-center mb-6">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full mx-1 ${
                  currentSlide === index 
                    ? 'bg-blue-600 w-6' 
                    : 'bg-white/50 w-2'
                }`}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity 
            className="bg-blue-600 mx-5 py-4 rounded-xl items-center"
            onPress={handleNext}
          >
            <Text className="text-white text-lg font-semibold font-semibold">
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}