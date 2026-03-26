import { useEffect, useState } from 'react';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';

export function useLoadFonts() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay: PlayfairDisplay_400Regular,
    'PlayfairDisplay-Medium': PlayfairDisplay_500Medium,
    'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts:', fontError);
    }
    if (fontsLoaded) {
      setIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  return isReady;
}
