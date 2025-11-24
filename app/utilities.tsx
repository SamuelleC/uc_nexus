import Card from '@/components/card';
import Header from '@/components/header';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UtilitiesScreen() {
    const insets = useSafeAreaInsets();

  const handleUtilityPress = (utility: string) => {
    console.log(`Opening ${utility}`);
    // Add utility functionality here
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <Header 
        title="Campus Utilities" 
        subtitle="Helpful tools for students and faculty"
      />
      
      {/* Content area */}
      <ScrollView 
        style={{ flex: 1, padding: 16 }}
        contentContainerStyle={{ paddingBottom: 104 + insets.bottom }}
        >
        <Text className='mb-4 text-xl font-medium text-zinc-500'>Select a Utility</Text>
        <View style={{ gap: 16 }}>
            <Card
                title="Class Schedule"
                description="Create or view your class schedule for this term"
                icon="school"
                onPress={() => handleUtilityPress('Your Class Schedule')}
            />
        </View>
      </ScrollView>
    </View>
  );
}