import Card from '@/components/card';
import Header from '@/components/header';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SchedulesScreen() {
  const insets = useSafeAreaInsets();
  
  const handleUtilityPress = (utility: string) => {
    console.log(`Opening ${utility}`);
    // Add utility functionality here
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'gray-100' }}>
      <Header 
        title="Schedules" 
        subtitle="View room schedules and availability"
      />
      {/* Content area */}
      <ScrollView 
        style={{ flex: 1, padding: 16 }}
        contentContainerStyle={{ paddingBottom: 104 + insets.bottom }}
      >
        <Text className='mb-4 text-xl font-medium text-zinc-500'>Select a Building</Text>
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          gap: 16,
          justifyContent: 'space-between'
        }}>
          <View style={{ width: '48%' }}>
            <Card
              title="U Building"
              description="50 Rooms"
              icon="business"
              onPress={() => handleUtilityPress('Room')}
            />
          </View>
          
          <View style={{ width: '48%' }}>
            <Card
              title="M Building"
              description="50 Rooms"
              icon="business"
              onPress={() => handleUtilityPress('Room')}
            />
          </View>
          
          <View style={{ width: '48%' }}>
            <Card
              title="S Building"
              description="50 Rooms"
              icon="business"
              onPress={() => handleUtilityPress('Room')}
            />
          </View>
          
          <View style={{ width: '48%' }}>
            <Card
              title="N Building"
              description="50 Rooms"
              icon="business"
              onPress={() => handleUtilityPress('Room')}
            />
          </View>
          
          <View style={{ width: '48%' }}>
            <Card
              title="F Building"
              description="50 Rooms"
              icon="business"
              onPress={() => handleUtilityPress('Room')}
            />
          </View>
          
          <View style={{ width: '48%' }}>
            <Card
              title="Gym"
              description="For Events and Activities"
              icon="business"
              onPress={() => handleUtilityPress('Room')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
