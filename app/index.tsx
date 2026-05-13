import {
  classScheduleToScheduleTableRow,
  ScheduleTable,
  type ScheduleTableRow,
} from "@/components/schedule-table";
import { BRAND_GREEN, SCREEN_GRAY_BG } from "@/constants/branding";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import {
  setStatusBarBackgroundColor,
  setStatusBarStyle,
} from "expo-status-bar";
import { useCallback, useState } from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ClassSchedule } from "../data/class-schedule-data";
import { userScheduleService } from "../data/user-schedule-service";

const PLACEHOLDER_SCHEDULE_ROWS: ScheduleTableRow[] = [1, 2, 3].map((i) => ({
  id: `placeholder-${i}`,
  courseName: "—",
  courseCode: "—",
  lectureRoom: "—",
  lectureInstructor: "—",
  lectureTime: "—",
}));

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [userSchedule, setUserSchedule] = useState<ClassSchedule[]>([]);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      void loadUserSchedule();

      setStatusBarStyle("light");
      if (Platform.OS === "android") {
        setStatusBarBackgroundColor(BRAND_GREEN, true);
      }

      return () => {
        setStatusBarStyle("dark");
        if (Platform.OS === "android") {
          setStatusBarBackgroundColor(SCREEN_GRAY_BG, true);
        }
      };
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
    <View className="flex-1 bg-gray-100">
      <View
        className="overflow-hidden bg-green-950"
        style={{ paddingTop: insets.top }}
      >
        <View className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-green-700/35" />
        <View className="flex-row items-center gap-3 px-4 py-3">
          <View className="rounded-xl bg-white/12 p-2">
            <Image
              source={require("@/assets/images/uclogo.png")}
              className="h-12 w-12"
              contentFit="contain"
            />
          </View>
          <View className="min-w-0 flex-1 justify-center">
            <Text className="text-3xl font-bold text-white">UC Nexus</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 120 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
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
            <ScheduleTable
              rows={
                hasSchedule
                  ? userSchedule.map(classScheduleToScheduleTableRow)
                  : PLACEHOLDER_SCHEDULE_ROWS
              }
            />
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
    </View>
  );
}
