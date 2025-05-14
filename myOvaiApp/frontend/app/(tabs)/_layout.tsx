import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from "@expo/vector-icons";
import { Platform } from 'react-native';

// import { HapticTab } from '@/components/HapticTab';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import TabBarBackground from '@/components/ui/TabBarBackground';
// import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cycle-logger"
        options={{
          title: 'Cycle Logger',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sync-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="symptom-logger"
        options={{
          title: 'Symptom Logger',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// screenOptions={{
      //   tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      //   headerShown: false,
      //   tabBarButton: HapticTab,
      //   tabBarBackground: TabBarBackground,
      //   tabBarStyle: Platform.select({
      //     ios: {
      //       // Use a transparent background on iOS to show the blur effect
      //       position: 'absolute',
      //     },
      //     default: {},
      //   }),
      // }}>