import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClassSchedule } from "../data/class-schedule-data";
import { userScheduleService } from "../data/user-schedule-service";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [userSchedule, setUserSchedule] = useState<ClassSchedule[]>([]);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user schedule when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadUserSchedule();
    }, []),
  );

  const loadUserSchedule = async () => {
    setIsLoading(true);
    const schedule = await userScheduleService.getUserSchedule();
    setUserSchedule(schedule);
    setHasSchedule(schedule.length > 0);
    setIsLoading(false);
  };

  const handleCreateEditPress = () => {
    router.push({
      pathname: "/create-schedule",
      params: { mode: hasSchedule ? "edit" : "create" },
    });
  };

  const handleSchedulesPress = () => {
    router.push("/departments");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Main Content with SafeArea */}
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with University Logo */}
          <View className="mt-2 -mb-10">
            <View className="items-center justify-center">
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-56 h-56"
                contentFit="contain"
              />
            </View>
          </View>

          {/* My Class Schedule Table */}
          <Text className="mb-4 text-xl font-medium text-zinc-500">
            My Class Schedule
          </Text>

          <View className="relative mb-6">
            {/* Blur overlay when no schedule */}
            {!hasSchedule && !isLoading && (
              <View
                className="absolute inset-0 z-10 bg-white/1 rounded-lg flex items-center justify-center w-full h-full"
                style={{ backdropFilter: "blur(4px)" }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={32}
                  color="#9CA3AF"
                />
                <Text className="text-gray-500 mt-2 text-center font-medium">
                  Create Your Schedule First
                </Text>
              </View>
            )}

            <View
              className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
              style={!hasSchedule && !isLoading ? { opacity: 0.3 } : {}}
            >
              {/* Table Header */}
              <View className="flex-row bg-green-950 p-3">
                <Text
                  className="text-white font-bold text-xs"
                  style={{ flex: 1.2 }}
                >
                  Section
                </Text>
                <Text
                  className="text-white font-bold text-xs"
                  style={{ flex: 0.8 }}
                >
                  Code
                </Text>
                <Text
                  className="text-white font-bold text-xs"
                  style={{ flex: 1.5 }}
                >
                  Description
                </Text>
                <Text
                  className="text-white font-bold text-xs"
                  style={{ flex: 1 }}
                >
                  Time
                </Text>
                <Text
                  className="text-white font-bold text-xs"
                  style={{ flex: 0.5 }}
                >
                  Room
                </Text>
              </View>

              {/* Table Body */}
              {hasSchedule
                ? userSchedule.map((classItem, index) => {
                    // Format section as 2 lines
                    const sectionParts = classItem.section.split(" ");
                    const sectionLine1 = sectionParts.slice(0, 2).join(" ");
                    const sectionLine2 = sectionParts.slice(2).join(" ");

                    // Format time as 3 lines (e.g., "MWF 7:30-8:50am" -> "MWF\n7:30 -\n8:50am")
                    const timeParts = classItem.schedule.split(" ");
                    const days = timeParts[0] || "";
                    const timeRange = timeParts[1] || "";
                    const [startTime, endTime] = timeRange.split("-");

                    return (
                      <View
                        key={classItem.id}
                        className={`flex-row p-3 border-b border-gray-100 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                      >
                        <View style={{ flex: 1.2 }}>
                          <Text className="text-gray-700 text-xs">
                            {sectionLine1}
                          </Text>
                          <Text className="text-gray-700 text-xs">
                            {sectionLine2}
                          </Text>
                        </View>
                        <Text
                          className="text-gray-800 font-medium text-xs"
                          style={{ flex: 0.8 }}
                        >
                          {classItem.courseCode}
                        </Text>
                        <Text
                          className="text-gray-700 text-xs"
                          style={{ flex: 1.5 }}
                          numberOfLines={3}
                        >
                          {classItem.description}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text className="text-gray-600 text-xs">{days}</Text>
                          <Text className="text-gray-600 text-xs">
                            {startTime} -
                          </Text>
                          <Text className="text-gray-600 text-xs">
                            {endTime}
                          </Text>
                        </View>
                        <Text
                          className="text-gray-800 font-medium text-xs"
                          style={{ flex: 0.5 }}
                        >
                          {classItem.room}
                        </Text>
                      </View>
                    );
                  })
                : // Placeholder rows for blur effect
                  [1, 2, 3].map((i) => (
                    <View
                      key={i}
                      className={`flex-row p-3 border-b border-gray-100 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                    >
                      <Text
                        className="text-gray-400 text-xs"
                        style={{ flex: 1.2 }}
                      >
                        ---
                      </Text>
                      <Text
                        className="text-gray-400 text-xs"
                        style={{ flex: 0.8 }}
                      >
                        ---
                      </Text>
                      <Text
                        className="text-gray-400 text-xs"
                        style={{ flex: 1.5 }}
                      >
                        ---
                      </Text>
                      <Text
                        className="text-gray-400 text-xs"
                        style={{ flex: 1 }}
                      >
                        ---
                      </Text>
                      <Text
                        className="text-gray-400 text-xs"
                        style={{ flex: 0.5 }}
                      >
                        ---
                      </Text>
                    </View>
                  ))}
            </View>
          </View>

          {/* Navigation Buttons */}
          <Text className="mb-4 text-xl font-medium text-zinc-500">
            Actions
          </Text>
          <TouchableOpacity
            className="bg-green-950 rounded-2xl p-8 mb-4 shadow-lg h-24"
            onPress={handleCreateEditPress}
          >
            <View className="p-2 absolute top-2 right-2 opacity-50">
              <Ionicons
                name={hasSchedule ? "pencil-outline" : "add-circle-outline"}
                size={28}
                color="white"
              />
            </View>
            <View className="absolute bottom-4 left-4">
              <Text className="text-white text-xl font-medium">
                {hasSchedule ? "Edit My Schedule" : "Create My Schedule"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-950 rounded-2xl p-8 mb-4 shadow-lg h-24"
            onPress={handleSchedulesPress}
          >
            <View className="p-2 absolute top-2 right-2 opacity-50">
              <Ionicons name="calendar-outline" size={28} color="white" />
            </View>
            <View className="absolute bottom-4 left-4">
              <Text className="text-white text-xl font-medium">
                Schedules Overview
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
