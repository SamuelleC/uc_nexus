import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface CardProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  iconSize?: number;
  customStyle?: ViewStyle;
  disabled?: boolean;
}

export default function Card({
  title,
  description,
  icon,
  onPress,
  backgroundColor,
  textColor,
  iconColor = '#0c3112',
  iconSize = 32,
  customStyle,
  disabled = false
}: CardProps) {
  const CardContainer = onPress ? TouchableOpacity : View;

  // Dynamic styles for custom colors
  const dynamicStyles = {
    ...(backgroundColor && { backgroundColor }),
    ...customStyle
  };

  const textStyles = {
    ...(textColor && { color: textColor })
  };

  const descriptionStyles = {
    ...(textColor && { color: textColor })
  };

  return (
    <CardContainer
      onPress={onPress}
      disabled={disabled}
      className="bg-white rounded-2xl px-6 shadow-lg min-h-[180px]"
      style={dynamicStyles}
    >
      <View className="items-start justify-center flex-1">
        {icon && (
          <View className="mb-3">
            <Ionicons 
              name={icon} 
              size={iconSize} 
              color={iconColor}
            />
          </View>
        )}
        
        <Text 
          className={`text-xl font-bold text-left ${description ? 'mb-2' : ''}`}
          style={textStyles}
        >
          {title}
        </Text>
        
        {description && (
          <Text 
            className="text-lg text-left leading-5 opacity-80"
            style={descriptionStyles}
          >
            {description}
          </Text>
        )}
      </View>
    </CardContainer>
  );
}