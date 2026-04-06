import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navItems = useMemo(
    () => [
      {
        name: "Home",
        icon: "home",
        activeIcon: "home",
        path: "/",
      },
      {
        name: "Schedules",
        icon: "calendar-outline",
        activeIcon: "calendar",
        path: "/departments",
      },
    ],
    [],
  );

  const handlePress = useCallback(
    (path: string) => {
      if (pathname !== path) {
        router.replace(path as any);
      }
    },
    [pathname, router],
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
          const isActive = pathname === item.path;
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
