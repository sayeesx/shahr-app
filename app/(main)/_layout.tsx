import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AF } from '../../lib/authTheme';


export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
          tabBarActiveTintColor: '#305c5d',
          tabBarInactiveTintColor: '#737373',
        tabBarStyle: {
            backgroundColor: '#fbf6f4',
            borderTopColor: '#ede6df',
          borderTopWidth: 1,
          height: 60, // Fallback, safe area applied automatically by React Navigation
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: AF.semibold,
        },

      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[s.iconWrap, focused && s.activeBg]}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={[s.iconWrap, focused && s.activeBg]}>
              <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="packages"
        options={{
          title: 'Packages',
          tabBarIcon: ({ color, focused }) => (
            <View style={[s.iconWrap, focused && s.activeBg]}>
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <View style={[s.iconWrap, focused && s.activeBg]}>
              <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[s.iconWrap, focused && s.activeBg]}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      
      {/* Hidden routes so they don't appear in the dock */}
      <Tabs.Screen name="medical" options={{ href: null }} />
      <Tabs.Screen name="nri" options={{ href: null }} />
      <Tabs.Screen name="ai-planner" options={{ href: null }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBg: {
    backgroundColor: '#ede6df',
  },
});
