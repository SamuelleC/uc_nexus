import Header from "@/components/header";
import { ScheduleTable } from "@/components/schedule-table";
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
  scheduleClassToScheduleTableRow,
} from "../data/api-service";
import {
  DEPARTMENTS,
  getBlockSchedule as getLocalBlockSchedule,
  YEAR_LEVELS,
} from "../data/class-schedule-data";

/**
 * API block values may include a leading "BLOCK" (e.g. "BLOCK 1-A").
 * Badge shows only the section id (e.g. "1-A"); title is always "Block {id}".
 */
function getBlockDisplaySegment(raw: string): string {
  const t = raw.trim();
  const stripped = t.replace(/^block\s*/i, "").trim();
  return stripped.length > 0 ? stripped : t;
}

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
    null,
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
        parseInt(yearLevel || "1"),
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
          block,
        );
        if (schedule) {
          setBlockSchedule(schedule);
        } else {
          // Fallback to local data
          const localSchedule = getLocalBlockSchedule(
            department || "citcs",
            parseInt(yearLevel || "1"),
            block,
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
                yearLevel: String(localSchedule.yearLevel),
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
                legacySchedule: c.schedule,
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
    [department, yearLevel],
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
            <View className="gap-3">
              {availableBlocks.map((blockInfo) => {
                const segment = getBlockDisplaySegment(blockInfo.block);
                return (
                <TouchableOpacity
                  key={blockInfo.block}
                  onPress={() => handleBlockPress(blockInfo.block)}
                  activeOpacity={0.7}
                  className="flex-row items-center overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
                >
                  <View className="mr-4 h-[56px] w-[56px] items-center justify-center bg-green-950"
                    style={{ borderRadius: 10 }}
                  >
                    <Text
                      className="text-center font-bold text-white"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.55}
                      style={{ fontSize: 17, maxWidth: 52 }}
                    >
                      {segment}
                    </Text>
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      Block {segment}
                    </Text>
                    <Text className="mt-0.5 text-sm text-gray-500">
                      {deptName} · {yearName} · {blockInfo.scheduleCount}{" "}
                      {blockInfo.scheduleCount === 1
                        ? "schedule"
                        : "schedules"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              );
              })}
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
        title={`${deptName} · ${yearName} · Block ${getBlockDisplaySegment(selectedBlock)}`}
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
          <ScheduleTable
            rows={blockSchedule.classes.map(scheduleClassToScheduleTableRow)}
          />
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
