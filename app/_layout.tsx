import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { queryClient } from '../lib/queryClient';
import { useAppStore } from '../store/useAppStore';
import { useLoadFonts } from '../hooks/useFonts';
import { Colors } from '../lib/theme';

export default function RootLayout() {
  const loadSession = useAppStore((s) => s.loadSession);
  const sessionLoaded = useAppStore((s) => s.sessionLoaded);
  const fontsLoaded = useLoadFonts();

  useEffect(() => {
    loadSession();
  }, []);

  if (!fontsLoaded || !sessionLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(main)" />
            </Stack>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
