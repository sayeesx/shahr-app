import { Redirect } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const session = useAppStore((s) => s.session);
  const sessionLoaded = useAppStore((s) => s.sessionLoaded);

  if (!sessionLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D3B5C' }}>
        <ActivityIndicator color="#ECC94B" size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(dashboard)" />;
  }

  return <Redirect href="/(main)" />;
}
