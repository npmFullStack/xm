import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from '../../lib/tailwind';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Welcome({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: require('../assets/images/welcome1.png'),
      title: 'Fast & Reliable Delivery',
      description: 'Get your packages delivered quickly and safely with our trusted service',
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
  title: 'Sign In',
  description: 'Log in to access your account and continue your shipping journey with us',
},
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const skip = () => navigation.navigate('Login');

  return (
    <SafeAreaView style={tw`flex-1 bg-[#020617]`}>
      <StatusBar backgroundColor="#020617" barStyle="light-content" />

      {/* BACKGROUND GRID + GLOW */}
      <View style={[tw`absolute inset-0`, { backgroundColor: '#020617' }]}>
        {/* Vertical Lines */}
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.3,
            backgroundSize: 32,
            backgroundImage: 'linear-gradient(to right, rgba(71,85,105,0.3) 1px, transparent 1px)',
          }}
        />
        {/* Horizontal Lines */}
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
        {/* Glow */}
        <View
          style={{
            position: 'absolute',
            width: width * 2,
            height: width * 2,
            borderRadius: width,
            left: width * -0.5,
            top: height * 0.2,
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

      {/* SKIP BUTTON */}
      <TouchableOpacity style={tw`absolute top-10 right-6 z-20`} onPress={skip}>
        <Text style={tw`text-white text-base`}>Skip</Text>
      </TouchableOpacity>

      {/* MAIN CONTENT - NO SCROLLVIEW */}
      <View style={tw`flex-1`}>
        {/* HEADER WITH LOGO AND TEXT - SMALLER HEIGHT */}
        <View style={tw`h-40 justify-center items-center`}>
          <View style={tw`flex-row items-center justify-center`}>
            {/* XtraMile Text with Effects */}
            <View style={tw`relative`}>
              {[-3, -1, 0, 1, 3].map((x) =>
                [-3, -1, 0, 1, 3].map((y) => (
                  <Text
                    key={`${x}-${y}`}
                    style={[
                      tw`absolute text-5xl font-bold text-gray-800`,
                      { top: y, left: x, opacity: 0.7 },
                    ]}
                  >
                    XtraMile
                  </Text>
                ))
              )}
              <Text style={tw`text-5xl font-bold text-blue-600 z-10`}>XtraMile</Text>
            </View>
          </View>

          <Text style={tw`text-base font-medium text-white mt-2 text-center`}>
            Your Trusted Delivery Partner
          </Text>
        </View>

        {/* CARD CONTENT */}
        <View style={tw`flex-1 bg-white dark:bg-slate-900 rounded-t-3xl px-6 pt-8 pb-8`}>
          <View style={tw`flex-1 justify-between`}>
            {/* IMAGE SECTION */}
            <View style={tw`items-center mt-4`}>
              <Image 
                source={slides[currentSlide].image} 
                style={{ width: 240, height: 240 }} 
                resizeMode="contain" 
              />
            </View>

            {/* TEXT CONTENT SECTION */}
            <View style={tw`items-center`}>
              {/* Title with new design */}
              <Text style={tw`text-2xl font-bold text-gray-900 dark:text-white text-center mb-2`}>
                {slides[currentSlide].title}
              </Text>

              {/* Description with new design */}
              <View style={tw`flex-row justify-center`}>
                <Text style={tw`text-gray-600 dark:text-gray-400 font-sans text-center px-4 leading-6`}>
                  {slides[currentSlide].description}
                </Text>
              </View>

              {/* INDICATORS */}
              <View style={tw`flex-row justify-center mt-6 mb-4`}>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={tw`${currentSlide === i ? 'bg-blue-600 w-6' : 'bg-gray-400/40 w-2'} h-2 rounded-full mx-1`}
                  />
                ))}
              </View>
            </View>

            {/* BUTTON SECTION */}
            <TouchableOpacity 
              style={tw`bg-blue-600 rounded-xl py-4 shadow-lg`} 
              onPress={nextSlide}
            >
              <Text style={tw`text-white text-center font-bold text-base`}>
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}