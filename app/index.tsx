import { Redirect } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../lib/theme';

export default function Index() {
  const session = useAppStore((s) => s.session);
  const sessionLoaded = useAppStore((s) => s.sessionLoaded);

  if (session) {
    return <Redirect href="/(main)/profile" />;
  }

  return <Redirect href="/(auth)" />;
}
