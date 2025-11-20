import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Get screen width for full-width cards
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - 48; // Screen width minus padding (24px on each side)

  // Event cards data
  const eventCards = [
    { id: 1, title: 'Announcements', icon: 'megaphone-outline' as const, description: 'Latest news and announcements' },
    { id: 2, title: 'Events', icon: 'calendar-outline' as const, description: 'Upcoming university events and activities' },
  ];
  
  const handleBuildingPress = (buildingName: string) => {
    console.log(`Pressed ${buildingName}`);
    // Add navigation logic here later
  };

  const handleWhereToPress = () => {
    console.log('Where To pressed');
    // Add navigation logic here later
  };

  const handleHomePress = () => {
    // Already on home, maybe refresh or scroll to top
    console.log('Home pressed');
  };

  const handleSchedulesPress = () => {
    router.push('/schedules');
  };

  const handleManagePress = () => {
    router.push('/manage');
  };

  const handleUtilitiesPress = () => {
    router.push('/utilities');
  };  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setCurrentEventIndex(Math.min(index, eventCards.length - 1));
    
    // Reset timer when user manually scrolls
    resetTimer();
  };

  const autoScrollToNext = () => {
    const nextIndex = (currentEventIndex + 1) % eventCards.length;
    
    scrollViewRef.current?.scrollTo({
      x: nextIndex * screenWidth,
      animated: true,
    });
    
    setCurrentEventIndex(nextIndex);
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current as ReturnType<typeof setInterval>);
    }

    timerRef.current = setInterval(autoScrollToNext, 5000); // Auto-scroll every 5 seconds
  };

  // Auto-scroll effect
  useEffect(() => {
    resetTimer();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentEventIndex]);

  // Pause auto-scroll when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <View className="flex-1 bg-gray-100">
      {/* Main Content with SafeArea */}
      <SafeAreaView className="flex-1">
        <View 
          className="flex-1 px-6"
          style={{ paddingBottom: 100 + insets.bottom }}
        >
          {/* Header with University Logo */}
          <View className="mt-2 -mb-10">
            <View className="items-center justify-center">
                <Image 
                  source={require('@/assets/images/logo.png')}
                  className="w-56 h-56"
                  contentFit="contain"
                />
            </View>
          </View>

          {/* Events Section */}
          <View className="mb-4 -mx-6">
            <ScrollView 
              ref={scrollViewRef}
              horizontal 
              showsHorizontalScrollIndicator={false} 
              onScroll={handleScroll}
              scrollEventThrottle={16}
              pagingEnabled={true}
              decelerationRate="fast"
              snapToInterval={screenWidth}
              snapToAlignment="start"
            >
              {eventCards.map((card, index) => (
                <View 
                  key={card.id}
                  style={{ width: screenWidth }}
                  className="px-6"
                >
                  <TouchableOpacity 
                    className="bg-white rounded-2xl p-6 mb-2 shadow-lg"
                    style={{ height: 200 }}
                  >
                    <View className="items-center justify-center flex-1">
                      <Ionicons name={card.icon} size={50} color="#0c3112" />
                      <Text className="text-lg font-bold text-green-950 mt-3">{card.title}</Text>
                      <Text className="text-gray-600 text-center mt-1 text-sm">
                        {card.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Pagination Dots */}
          <View className="flex-row justify-center items-center mb-6">
            {eventCards.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentEventIndex ? 'bg-green-950' : 'bg-white border border-gray-300'
                }`}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <Text className='mb-4 text-xl font-medium text-zinc-500'>Quick Actions</Text>
          <TouchableOpacity 
            className="bg-green-950 rounded-2xl p-8 mb-6 shadow-lg h-24"
            onPress={handleSchedulesPress}
          >
            <View className="p-2 absolute top-2 right-2 opacity-50">
              <Ionicons name="calendar-outline" size={28} color="white" />
            </View>
            <View className='absolute bottom-4 left-4'>
              <Text className="text-white text-xl font-medium">Check Room Schedules</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-green-950 rounded-2xl p-8 mb-6 shadow-lg h-24"
            onPress={handleManagePress}
          >
            <View className="p-2 absolute top-2 right-2 opacity-50">
              <Ionicons name="build-outline" size={28} color="white" />
            </View>
            <View className='absolute bottom-4 left-4'>
              <Text className="text-white text-xl font-medium">Manage Rooms</Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row justify-between mb-4">
            <TouchableOpacity 
              className="bg-green-950 rounded-2xl p-6 flex-1 mr-2 h-36 relative"
              onPress={handleUtilitiesPress}
            >
              <View className="p-2 absolute top-2 right-2 opacity-50">
                <Ionicons name="cube-outline" size={28} color="white" />
              </View>
              <View className="absolute bottom-4 left-4">
                <Text className="text-white text-xl font-medium">Placeholder</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-green-950 rounded-2xl p-6 flex-1 ml-2 h-36 relative"
              onPress={handleUtilitiesPress}
            >
              <View className="p-2 first-letter:absolute top-2 right-2 opacity-50">
                <Ionicons name="calendar-clear-outline" size={28} color="white" />
              </View>
              <View className="absolute bottom-4 left-4">
                <Text className="text-white text-xl font-medium">Placeholder</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
