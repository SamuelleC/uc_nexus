import { SafeAreaView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function Header({ 
  title, 
  subtitle, 
  backgroundColor = '#0c3112', 
  textColor = 'white' 
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{ 
        backgroundColor,
        paddingTop: insets.top 
      }}
    >
      <SafeAreaView>
        <View style={{ 
          paddingHorizontal: 24, 
          paddingVertical: 20,
          alignItems: 'flex-start' 
        }}>
          <Text 
            style={{ 
              fontSize: 28, 
              fontWeight: 'bold', 
              color: textColor,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text 
              style={{ 
                fontSize: 16, 
                color: textColor,
                opacity: 0.9,
                marginTop: 4
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}