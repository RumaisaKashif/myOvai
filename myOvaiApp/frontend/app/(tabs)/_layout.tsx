import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from "@expo/vector-icons";
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2D1B3D', 
          borderTopColor: '#6B46C1', 
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 + insets.bottom : 10 + insets.bottom,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 60 + insets.bottom : 60 + insets.bottom,
        },
        tabBarActiveTintColor: '#E879F9', 
        tabBarInactiveTintColor: '#A78BFA',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cycle-logger"
        options={{
          title: 'Cycle Logger',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "calendar" : "calendar-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="symptom-logger"
        options={{
          title: 'Symptom Logger',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "heart" : "heart-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile-page"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}