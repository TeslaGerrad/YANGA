import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // Mark navigation as ready after first render
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) {
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup && segments[0] !== 'booking' && segments[0] !== 'trip' && segments[0] !== 'rating' && segments[0] !== 'modal') {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isNavigationReady]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="booking" options={{ headerShown: false }} />
        <Stack.Screen name="trip" options={{ headerShown: false }} />
        <Stack.Screen name="rating" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            headerShown: true,
            title: 'Menu' 
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
