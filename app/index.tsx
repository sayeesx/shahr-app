import { Redirect } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../lib/theme';

export default function Index() {
  const session = useAppStore((s) => s.session);
  const sessionLoaded = useAppStore((s) => s.sessionLoaded);

  if (!sessionLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(main)/new" />;
  }

  return <Redirect href="/(auth)" />;
}
