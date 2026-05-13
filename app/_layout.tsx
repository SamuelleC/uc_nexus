import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Font from "expo-font";
import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

/**
 * Root: loading gate → tab stack (headers off) + custom BottomNav.
 * Add every route here and mirror it in `components/bottom-nav.tsx`.
 */
import BottomNav from "@/components/bottom-nav";
import LoadingScreen from "@/components/loading-screen";
import { useColorScheme } from "@/hooks/use-color-scheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [prepareDone, setPrepareDone] = useState(false);
  const [enteredApp, setEnteredApp] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({});
      } catch (e) {
        console.warn("Error during app preparation:", e);
      } finally {
        setPrepareDone(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!enteredApp) {
    return (
      <SafeAreaProvider>
        <LoadingScreen
          canContinue={prepareDone}
          onContinue={() => setEnteredApp(true)}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: "none" },
              lazy: true,
            }}
          >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="departments" />
            <Tabs.Screen name="year-level" />
            <Tabs.Screen name="blocks" />
            <Tabs.Screen name="create-schedule" />
            <Tabs.Screen name="building" />
          </Tabs>
          <BottomNav />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
