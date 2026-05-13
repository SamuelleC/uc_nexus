import { Image } from "expo-image";
import {
  setStatusBarBackgroundColor,
  setStatusBarStyle,
} from "expo-status-bar";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BRAND_GREEN, SCREEN_GRAY_BG } from "@/constants/branding";

type LoadingScreenProps = {
  canContinue?: boolean;
  onContinue?: () => void;
};

export default function LoadingScreen({
  canContinue = false,
  onContinue,
}: LoadingScreenProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
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
  }, []);

  return (
    <Pressable
      className="flex-1 bg-green-950"
      style={{ flex: 1 }}
      onPress={() => {
        if (canContinue) onContinue?.();
      }}
      disabled={!canContinue}
      {...(canContinue
        ? {
            accessibilityRole: "button" as const,
            accessibilityLabel: "Tap to open UC Nexus",
          }
        : {})}
    >
      <View
        className="flex-1"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <View className="absolute inset-0 overflow-hidden">
          <View className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-emerald-500/20" />
          <View className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-white/10" />
          <View className="absolute right-8 top-40 h-40 w-40 rounded-full bg-green-700/30" />
          <View className="absolute bottom-36 left-12 h-24 w-24 rounded-full border border-white/15 bg-white/5" />
        </View>

        <View
          className="flex-1 items-center justify-center px-8"
          pointerEvents="box-none"
        >
          <View className="mb-10 items-center">
            <View className="rounded-3xl border border-white/25 bg-white/10 p-1.5 shadow-lg">
              <View className="items-center justify-center rounded-2xl bg-white px-6 py-5">
                <Image
                  source={require("@/assets/images/uclogo.png")}
                  style={{ width: 104, height: 104 }}
                  contentFit="contain"
                />
              </View>
            </View>
          </View>

          <Text className="text-center text-4xl font-bold text-white">
            UC Nexus
          </Text>
          <Text
            className="mt-3 max-w-sm text-center text-base leading-snug text-emerald-100"
            style={{ opacity: 0.95 }}
          >
            {canContinue
              ? "Tap anywhere on the screen to open your dashboard."
              : "Preparing your campus experience…"}
          </Text>

          {!canContinue ? (
            <View className="mt-12">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
