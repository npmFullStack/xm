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
      image: require('../assets/images/welcome2.png'),
      title: 'Book Shipping Anywhere',
      description: 'Easily book shipping services using your phone from anywhere, anytime',
    },
    {
      id: 3,
      image: require('../assets/images/welcome3.png'),
      title: 'Get Started',
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

  const handleSkip = () => navigation.navigate('Login');

  const Slide = ({ item, isFirst }) => (
    <View>
      {/* First Slide Header */}
      {isFirst && (
        <View style={tw`h-60 -mx-6`}>
          <View style={tw`flex-1 justify-center items-center`}>
            
            {/* Text Layer / Logo */}
            <View style={tw`relative items-center justify-center`}>
              {/** White Outline */}
              {[ -2, 0, 2 ].map(y =>
                [ -2, 0, 2 ].map(x => (
                  <Text
                    key={`${x}-${y}`}
                    style={[
                      tw`absolute text-4xl font-bold text-white`,
                      { top: y, left: x }
                    ]}
                  >
                    XtraMile
                  </Text>
                ))
              )}

              {/* Main Blue Text */}
              <Text style={tw`text-4xl font-bold text-blue-600 relative z-10`}>
                XtraMile
              </Text>
            </View>

            {/* Slogan */}
            <Text
              style={[
                tw`text-base font-medium text-white mt-2 text-center`,
                {
                  textShadowColor: 'rgba(0,0,0,0.3)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2
                }
              ]}
            >
              Your Trusted Delivery Partner
            </Text>
          </View>
        </View>
      )}

      {/* Content Card */}
      <View style={tw`bg-white dark:bg-slate-900 rounded-t-3xl px-6 pt-8 pb-6 ${isFirst ? '-mt-8' : ''}`}>
        <View style={tw`items-center`}>
          <Image source={item.image} style={{ width: 280, height: 300 }} resizeMode="contain" />

          <View style={tw`items-center mt-8`}>
            <Text style={tw`text-2xl font-bold text-gray-900 dark:text-white text-center mb-4 px-4`}>
              {item.title}
            </Text>

            <Text style={tw`text-base text-gray-600 dark:text-gray-300 text-center leading-6 font-sans px-2`}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/images/background.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={tw`flex-1`}>
        <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

        {/* Skip */}
        <TouchableOpacity style={tw`self-end p-5`} onPress={handleSkip}>
          <Text
            style={[
              tw`text-white text-base`,
              {
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2
              }
            ]}
          >
            Skip
          </Text>
        </TouchableOpacity>

        {/* Slide */}
        <View style={tw`flex-1 justify-center`}>
          <Slide item={slides[currentSlide]} isFirst={currentSlide === 0} />
        </View>

        {/* Indicators + Next */}
        <View style={tw`mb-10`}>
          
          {/* Indicators */}
          <View style={tw`flex-row justify-center mb-6`}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={tw`${currentSlide === index ? 'bg-blue-600 w-6' : 'bg-white/50 w-2'} h-2 rounded-full mx-1`}
              />
            ))}
          </View>

          {/* Button */}
          <TouchableOpacity
            style={tw`bg-blue-600 mx-5 py-4 rounded-xl items-center`}
            onPress={handleNext}
          >
            <Text style={tw`text-white text-lg font-semibold`}>
              {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
