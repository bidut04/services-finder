import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/core/theme/colors';
import { useTheme } from '../../src/core/theme/themeStore';

export default function TabLayout() {
  const { isDark, colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? '#334155' : 'transparent',
          },
        ],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.iconWrap,
                focused ? [styles.iconWrapActive, { backgroundColor: colors.primary }] : null,
              ]}
            >
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={focused ? '#FFFFFF' : isDark ? '#94A3B8' : '#6B7280'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.iconWrap,
                focused ? [styles.iconWrapActive, { backgroundColor: colors.primary }] : null,
              ]}
            >
              <Ionicons
                name={focused ? 'calendar' : 'calendar-outline'}
                size={22}
                color={focused ? '#FFFFFF' : isDark ? '#94A3B8' : '#6B7280'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.iconWrap,
                focused ? [styles.iconWrapActive, { backgroundColor: colors.primary }] : null,
              ]}
            >
              <Ionicons
                name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                size={22}
                color={focused ? '#FFFFFF' : isDark ? '#94A3B8' : '#6B7280'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.iconWrap,
                focused ? [styles.iconWrapActive, { backgroundColor: colors.primary }] : null,
              ]}
            >
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={focused ? '#FFFFFF' : isDark ? '#94A3B8' : '#6B7280'}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.primary,
  },
});

