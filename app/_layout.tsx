import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Font from 'expo-font';
import { Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import BottomNav from '@/components/bottom-nav';
import LoadingScreen from '@/components/loading-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('Starting app preparation...');
        
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          // Add any custom fonts here if needed
        });
        
        console.log('Fonts loaded, showing loading screen...');
        
        // Simulate loading time (minimum 3 seconds to show the loading screen)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('Loading complete, hiding splash screen...');
        
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    console.log('App not ready, showing loading screen');
    return <LoadingScreen />;
  }

  console.log('App ready, showing main content');

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
            lazy: true,
          }}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="schedules" />
          <Tabs.Screen name="manage" />
          <Tabs.Screen name="utilities" />
        </Tabs>
        <BottomNav />
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
