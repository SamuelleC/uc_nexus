import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled = false,
  expanded,
  onExpandedChange,
}: SelectFieldProps) {
  const selected = options.find((o) => o.value === value);
  const displayText = selected?.label ?? placeholder;
  const isPlaceholder = !selected;

  const toggle = () => {
    if (disabled) return;
    onExpandedChange(!expanded);
  };

  const handleSelect = (next: string) => {
    onChange(next);
    onExpandedChange(false);
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 font-medium text-gray-700">{label}</Text>
      <TouchableOpacity
        onPress={toggle}
        disabled={disabled}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3.5 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <Text
          className={`flex-1 pr-2 text-base ${
            isPlaceholder ? "text-gray-400" : "text-gray-900"
          }`}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {expanded && options.length > 0 && (
        <View className="mt-1 max-h-52 overflow-hidden rounded-lg border border-gray-200">
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === value;
              const isLast = index === options.length - 1;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleSelect(opt.value)}
                  activeOpacity={0.7}
                  className={`px-4 py-3.5 ${
                    isSelected ? "bg-green-50" : "bg-white"
                  } ${isLast ? "" : "border-b border-gray-100"}`}
                >
                  <Text
                    className={`text-base ${
                      isSelected
                        ? "font-semibold text-green-950"
                        : "text-gray-800"
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
