import Card from "@/components/card";
import Header from "@/components/header";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEPARTMENTS, YEAR_LEVELS } from "../data/class-schedule-data";

export default function YearLevelScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { department } = useLocalSearchParams<{ department: string }>();

  const deptInfo = DEPARTMENTS.find((d) => d.id === department);
  const deptName = deptInfo?.name || department?.toUpperCase() || "Department";

  const handleYearLevelPress = (yearLevel: number) => {
    router.push({
      pathname: "/blocks",
      params: { department, yearLevel: String(yearLevel) },
    });
  };

  const handleBack = () => {
    router.replace("/departments");
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Header title={deptName} subtitle="Select your year level" />

      {/* Back Button */}
      <View className="px-4 pt-2">
        <TouchableOpacity
          onPress={handleBack}
          className="flex-row items-center mb-2"
        >
          <Ionicons name="arrow-back" size={32} color="#0c3112" />
        </TouchableOpacity>
      </View>

      {/* Content area */}
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        contentContainerStyle={{ paddingBottom: 104 + insets.bottom }}
      >
        <Text className="mb-4 text-xl font-medium text-zinc-500">
          Select Year Level
        </Text>

        <View style={{ gap: 16 }}>
          {YEAR_LEVELS.map((year) => (
            <Card
              key={year.id}
              title={year.name}
              description={`${deptName} ${year.name} students`}
              icon="school-outline"
              onPress={() => handleYearLevelPress(year.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
