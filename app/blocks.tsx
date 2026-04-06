import Header from "@/components/header";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BlockInfo,
  BlockScheduleData,
  getBlockSchedule as fetchBlockSchedule,
  getBlocksWithSchedules,
} from "../data/api-service";
import {
  BLOCKS,
  DEPARTMENTS,
  getBlockSchedule as getLocalBlockSchedule,
  YEAR_LEVELS,
} from "../data/class-schedule-data";

export default function BlocksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { department, yearLevel } = useLocalSearchParams<{
    department: string;
    yearLevel: string;
  }>();
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [availableBlocks, setAvailableBlocks] = useState<BlockInfo[]>([]);
  const [blockSchedule, setBlockSchedule] = useState<BlockScheduleData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [apiError, setApiError] = useState(false);

  const deptInfo = DEPARTMENTS.find((d) => d.id === department);
  const deptName = deptInfo?.name || department?.toUpperCase() || "Department";
  const yearInfo = YEAR_LEVELS.find((y) => y.id === parseInt(yearLevel || "1"));
  const yearName = yearInfo?.name || `Year ${yearLevel}`;

  // Load available blocks when screen mounts
  const loadAvailableBlocks = useCallback(async () => {
    setIsLoading(true);
    setApiError(false);
    try {
      const blocks = await getBlocksWithSchedules(
        department || "citcs",
        parseInt(yearLevel || "1")
      );
      if (blocks && blocks.length > 0) {
        setAvailableBlocks(blocks);
      } else {
        // API returned empty or failed - show error state
        setApiError(true);
        setAvailableBlocks([]);
      }
    } catch (error) {
      console.error("Error loading blocks:", error);
      setApiError(true);
      setAvailableBlocks([]);
    } finally {
      setIsLoading(false);
    }
  }, [department, yearLevel]);

  // Load block schedule when a block is selected
  const loadBlockSchedule = useCallback(
    async (block: string) => {
      setIsLoadingSchedule(true);
      try {
        const schedule = await fetchBlockSchedule(
          department || "citcs",
          parseInt(yearLevel || "1"),
          block
        );
        if (schedule) {
          setBlockSchedule(schedule);
        } else {
          // Fallback to local data
          const localSchedule = getLocalBlockSchedule(
            department || "citcs",
            parseInt(yearLevel || "1"),
            block
          );
          if (localSchedule) {
            setBlockSchedule({
              block: localSchedule.block,
              yearLevel: localSchedule.yearLevel,
              department: localSchedule.department,
              classes: localSchedule.classes.map((c) => ({
                id: parseInt(c.id) || 0,
                section: c.section,
                classCode: c.courseCode,
                className: c.description,
                room: c.room,
                roomId: null,
                instructor: c.instructor || "",
                department: localSchedule.department,
                classSize: 0,
                date: null,
                days: [],
                startTime: "",
                endTime: "",
                semester: "",
                schoolYear: "",
                yearLevel: localSchedule.yearLevel,
                term: null,
                block: localSchedule.block,
                isCITCC: false,
                lecRoom: null,
                lecInstructor: null,
                lecDays: null,
                lecStartTime: null,
                lecEndTime: null,
                labRoom: null,
                labInstructor: null,
                labDays: null,
                labStartTime: null,
                labEndTime: null,
              })),
            });
          } else {
            setBlockSchedule(null);
          }
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
        setBlockSchedule(null);
      } finally {
        setIsLoadingSchedule(false);
      }
    },
    [department, yearLevel]
  );

  useEffect(() => {
    loadAvailableBlocks();
  }, [loadAvailableBlocks]);

  const handleBlockPress = (block: string) => {
    setSelectedBlock(block);
    loadBlockSchedule(block);
  };

  const handleBack = () => {
    if (selectedBlock) {
      setSelectedBlock(null);
      setBlockSchedule(null);
    } else {
      router.replace({
        pathname: "/year-level",
        params: { department },
      });
    }
  };

  // Show block selection if no block is selected
  if (!selectedBlock) {
    return (
      <View className="flex-1 bg-gray-100">
        <Header
          title={`${deptName} - ${yearName}`}
          subtitle="Select your block/section"
        />

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
            Select Block
          </Text>

          {isLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#0c3112" />
              <Text className="text-gray-500 mt-4">Loading blocks...</Text>
            </View>
          ) : apiError ? (
            <View className="bg-gray-100 rounded-lg p-6 items-center border border-gray-200">
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center font-medium">
                No records available
              </Text>
              <TouchableOpacity
                onPress={loadAvailableBlocks}
                className="mt-4 bg-gray-400 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : availableBlocks.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "flex-start",
              }}
            >
              {availableBlocks.map((blockInfo) => (
                <TouchableOpacity
                  key={blockInfo.block}
                  onPress={() => handleBlockPress(blockInfo.block)}
                  className="bg-green-950 rounded-2xl p-4 items-center justify-center"
                  style={{ width: "47%", minHeight: 60 }}
                >
                  <Text className="text-white text-lg font-bold">
                    Block {blockInfo.block}
                  </Text>
                  <Text className="text-white text-xs opacity-70 mt-1">
                    {deptName} {yearLevel}
                    {blockInfo.block}
                  </Text>
                  <Text className="text-white text-xs opacity-50 mt-1">
                    {blockInfo.scheduleCount} schedule(s)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-lg p-6 items-center">
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center">
                No blocks with schedules available for this year level.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // Show class schedule table for selected block
  return (
    <View className="flex-1 bg-gray-100">
      <Header
        title={`${deptName} ${yearLevel}${selectedBlock}`}
        subtitle="Class Schedule"
      />

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
          Class Schedule
        </Text>

        {isLoadingSchedule ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#0c3112" />
            <Text className="text-gray-500 mt-4">Loading schedule...</Text>
          </View>
        ) : blockSchedule && blockSchedule.classes.length > 0 ? (
          <View className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <View className="flex-row bg-green-950 p-3">
              <Text
                className="text-white font-bold flex-1"
                style={{ minWidth: 80 }}
              >
                Code
              </Text>
              <Text className="text-white font-bold flex-2" style={{ flex: 2 }}>
                Description
              </Text>
              <Text
                className="text-white font-bold flex-1"
                style={{ minWidth: 100 }}
              >
                Schedule
              </Text>
              <Text className="text-white font-bold" style={{ minWidth: 50 }}>
                Room
              </Text>
            </View>

            {/* Table Body */}
            {blockSchedule.classes.map((classItem, index) => {
              // Format days array to string (e.g., ["monday", "wednesday"] -> "M/W")
              const daysFormatted = classItem.days
                .map((d) => {
                  const dayMap: Record<string, string> = {
                    monday: "M",
                    tuesday: "T",
                    wednesday: "W",
                    thursday: "Th",
                    friday: "F",
                    saturday: "S",
                    sunday: "Su",
                  };
                  return dayMap[d.toLowerCase()] || d.charAt(0).toUpperCase();
                })
                .join("/");

              // Format time (e.g., "07:30" -> "7:30 AM")
              const formatTime = (time: string) => {
                const [hours, minutes] = time.split(":");
                const h = parseInt(hours);
                const ampm = h >= 12 ? "PM" : "AM";
                const h12 = h % 12 || 12;
                return `${h12}:${minutes} ${ampm}`;
              };

              const scheduleStr = `${daysFormatted} ${formatTime(classItem.startTime)}-${formatTime(classItem.endTime)}`;

              return (
                <View
                  key={classItem.id}
                  className={`flex-row p-3 border-b border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                >
                  <Text
                    className="text-gray-800 font-medium flex-1"
                    style={{ minWidth: 80 }}
                  >
                    {classItem.classCode}
                  </Text>
                  <Text
                    className="text-gray-700 flex-2"
                    style={{ flex: 2 }}
                    numberOfLines={2}
                  >
                    {classItem.className}
                  </Text>
                  <Text
                    className="text-gray-600 flex-1"
                    style={{ minWidth: 100 }}
                  >
                    {scheduleStr}
                  </Text>
                  <Text
                    className="text-gray-800 font-medium"
                    style={{ minWidth: 50 }}
                  >
                    {classItem.room}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="bg-white rounded-lg p-6 items-center">
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              No schedule available for this block.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
