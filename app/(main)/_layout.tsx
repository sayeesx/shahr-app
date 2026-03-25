import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="bookings" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="plan" />
      <Stack.Screen name="results" />
      <Stack.Screen name="book-cab" />
      <Stack.Screen name="packages" />
      <Stack.Screen name="status" />
      <Stack.Screen name="services/medical" />
      <Stack.Screen name="services/tourism" />
      <Stack.Screen name="services/nri" />
    </Stack>
  );
}
