import Card from '@/components/card';
import Header from '@/components/header';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BUILDINGS } from '../data/building-data';

export default function SchedulesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const handleBuildingPress = (buildingId: string) => {
    router.push({
      pathname: '/building',
      params: { building: buildingId }
    });
  };

  const handleUtilityPress = (utility: string) => {
    console.log(`Opening ${utility}`);
    // Add utility functionality here
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Header 
        title="Schedules" 
        subtitle="View room schedules and availability"
      />
      {/* Content area */}
      <ScrollView 
        style={{ flex: 1, padding: 16 }}
        contentContainerStyle={{ paddingBottom: 104 + insets.bottom }}
      >
        {/* Campus Overview */}
        <View className="mb-6">
          <Text className="mb-4 text-xl font-medium text-zinc-500">Campus Overview</Text>
          <View className="bg-white rounded-lg p-4 shadow">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600 text-lg">Total Buildings</Text>
              <Text className="text-lg font-semibold text-gray-800">{Object.keys(BUILDINGS).length}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600 text-lg">Total Rooms</Text>
              <Text className="text-lg font-semibold text-gray-800">
                {Object.values(BUILDINGS).reduce((total, building) => total + building.totalRooms, 0)}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 text-lg">Total Floors</Text>
              <Text className="text-lg font-semibold text-gray-800">
                {Math.max(...Object.values(BUILDINGS).map(building => building.floors))}
              </Text>
            </View>
          </View>
        </View>

        <Text className="mb-4 text-xl font-medium text-zinc-500">Select a Building</Text>
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: 16,
          justifyContent: 'space-between'
        }}>
          {Object.values(BUILDINGS).map((building) => (
            <View key={building.id} style={{ width: '48%' }}>
              <Card
                title={building.name}
                description={`${building.totalRooms} Rooms`}
                icon="business"
                onPress={() => handleBuildingPress(building.id)}
              />
            </View>
          ))}
          
          <View style={{ width: '48%' }}>
            <Card
              title="Gym"
              description="For Events and Activities"
              icon="fitness"
              onPress={() => handleUtilityPress('Gym')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
