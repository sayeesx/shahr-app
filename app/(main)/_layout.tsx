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
          position: 'absolute',
          backgroundColor: 'rgba(251, 246, 244, 0.95)',
          borderTopColor: 'rgba(237, 230, 223, 0.8)',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
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
              <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
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
              <Ionicons name={focused ? 'search' : 'search-outline'} size={26} color={color} />
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
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={26} color={color} />
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
              <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={26} color={color} />
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
              <Ionicons name={focused ? 'person' : 'person-outline'} size={26} color={color} />
            </View>
          ),
        }}
      />
      
      {/* Hidden routes so they don't appear in the dock */}
      <Tabs.Screen name="medical" options={{ href: null }} />
      <Tabs.Screen name="nri" options={{ href: null }} />
      <Tabs.Screen name="ai-planner" options={{ href: null }} />
      <Tabs.Screen name="other-services" options={{ href: null }} />
      <Tabs.Screen name="cabs" options={{ href: null }} />
      <Tabs.Screen name="hotels" options={{ href: null }} />
      <Tabs.Screen name="visa" options={{ href: null }} />
      <Tabs.Screen name="pickup" options={{ href: null }} />
      <Tabs.Screen name="hospital-consultation" options={{ href: null }} />
      <Tabs.Screen name="flight-ticket" options={{ href: null }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  iconWrap: {
    width: 48,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBg: {
    backgroundColor: '#ede6df',
  },
});
