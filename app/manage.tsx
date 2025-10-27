import Header from '@/components/header';
import { Text, View } from 'react-native';

export default function ManageScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header 
        title="Manage Rooms" 
        subtitle="Administrative controls and settings"
      />
      
      {/* Content area */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#6B7280' }}>Management content will go here</Text>
      </View>
    </View>
  );
}