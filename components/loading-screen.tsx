import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, SafeAreaView, Text, View } from 'react-native';

export default function LoadingScreen() {
  console.log('LoadingScreen component rendered');
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-8">
        {/* University Logo */}
        <View className="items-center mb-20">
          <Image 
            source={require('@/assets/images/logo.png')}
            className="w-20 h-20 mb-4"
            contentFit="contain"
          />
          <Text className="text-2xl font-bold text-green-800 text-center">UNIVERSITY</Text>
          <Text className="text-xl font-bold text-green-800 text-center">OF THE</Text>
          <Text className="text-2xl font-bold text-green-800 text-center">CORDILLERAS</Text>
        </View>

        {/* Loading Spinner */}
        <View className="mb-32">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>

        {/* App Name */}
        <View className="items-center">
          <Text className="text-4xl font-black text-green-800 mb-2 tracking-wider">UC</Text>
          <Text className="text-3xl font-black text-green-800 tracking-widest">MAPAAGA</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}