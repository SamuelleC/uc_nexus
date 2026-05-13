import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter, useSegments } from "expo-router";
import { useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Tab targets for the schedule flow; must match `Tabs.Screen` names in `app/_layout.tsx`. */
const SCHEDULE_FLOW_ROUTES = [
  "departments",
  "year-level",
  "blocks",
  "create-schedule",
  "building",
] as const;

function normalizePathname(path: string) {
  if (!path || path === "/index") return "/";
  return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const normalizedPath = normalizePathname(pathname);

  const isSchedulesFlowActive = useMemo(() => {
    const schedulePaths = new Set([
      "/departments",
      "/year-level",
      "/blocks",
      "/create-schedule",
      "/building",
    ]);
    if (schedulePaths.has(normalizedPath)) return true;

    const leaf = normalizedPath.split("/").filter(Boolean).pop();
    if (
      leaf &&
      SCHEDULE_FLOW_ROUTES.includes(leaf as (typeof SCHEDULE_FLOW_ROUTES)[number])
    ) {
      return true;
    }

    return segments.some((seg) =>
      SCHEDULE_FLOW_ROUTES.includes(seg as (typeof SCHEDULE_FLOW_ROUTES)[number]),
    );
  }, [normalizedPath, segments]);

  const isHomeActive = useMemo(() => {
    if (isSchedulesFlowActive) return false;
    if (normalizedPath === "/" || normalizedPath === "/index") return true;
    const leaf = normalizedPath.split("/").filter(Boolean).pop();
    return leaf === "index";
  }, [isSchedulesFlowActive, normalizedPath]);

  const navItems = useMemo(
    () => [
      {
        name: "Home",
        icon: "home",
        activeIcon: "home",
        path: "/",
        isActive: isHomeActive,
      },
      {
        name: "Schedules",
        icon: "calendar-outline",
        activeIcon: "calendar",
        path: "/departments",
        isActive: isSchedulesFlowActive,
      },
    ],
    [isHomeActive, isSchedulesFlowActive],
  );

  const handlePress = useCallback(
    (path: string) => {
      if (normalizedPath !== normalizePathname(path)) {
        router.replace(path as any);
      }
    },
    [normalizedPath, router],
  );

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0c3112",
        borderTopWidth: 1,
        borderTopColor: "#0c3112",
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingVertical: 24,
        }}
      >
        {navItems.map((item) => {
          const isActive = item.isActive;
          return (
            <TouchableOpacity
              key={item.name}
              style={{ alignItems: "center" }}
              onPress={() => handlePress(item.path)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? (item.activeIcon as any) : (item.icon as any)}
                size={24}
                color={isActive ? "#FFFFFF" : "#9CA3AF"}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
