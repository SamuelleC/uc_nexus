import Card from "@/components/card";
import Header from "@/components/header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEPARTMENTS } from "../data/class-schedule-data";

export default function DepartmentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleDepartmentPress = (departmentId: string) => {
    router.push({
      pathname: "/year-level",
      params: { department: departmentId },
    });
  };

  const handleBack = () => {
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Header title="Departments" subtitle="Select your department" />

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
          Select a Department
        </Text>

        <View style={{ gap: 16 }}>
          {DEPARTMENTS.map((dept) => (
            <Card
              key={dept.id}
              title={dept.name}
              description={dept.fullName}
              icon={dept.icon as any}
              onPress={() => handleDepartmentPress(dept.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
