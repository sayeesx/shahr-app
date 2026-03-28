import { useEffect, useState } from 'react';
import {
  useFonts as usePF,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  useFonts as useDS,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

export function useLoadFonts() {
  const [pfLoaded, pfError] = usePF({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Medium': PlayfairDisplay_500Medium,
    'PlayfairDisplay-SemiBold': PlayfairDisplay_600SemiBold,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
  });

  const [dsLoaded, dsError] = useDS({
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-SemiBold': DMSans_600SemiBold,
    'DMSans-Bold': DMSans_700Bold,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (pfError) console.error('Playfair Display font error:', pfError);
    if (dsError) console.error('DM Sans font error:', dsError);
    if (pfLoaded && dsLoaded) {
      setIsReady(true);
    }
  }, [pfLoaded, dsLoaded, pfError, dsError]);

  return isReady;
}
