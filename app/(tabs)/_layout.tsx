import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/core/theme/themeStore';

interface TabMeta {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  badge?: number;
}

const TABS_META: Record<string, TabMeta> = {
  index: {
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  bookings: {
    label: 'Bookings',
    icon: 'calendar-outline',
    activeIcon: 'calendar',
  },
  messages: {
    label: 'Messages',
    icon: 'chatbubble-ellipses-outline',
    activeIcon: 'chatbubble-ellipses',
    badge: 2,
  },
  profile: {
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
};

function WhatsAppBottomTabBar({ state, descriptors, navigation }: any) {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.navContainer,
        {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const meta = TABS_META[route.name] || {
          label: route.name,
          icon: 'apps-outline',
          activeIcon: 'apps',
        };

        const onPress = () => {
          const event = navigation?.emit
            ? navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              })
            : { defaultPrevented: false };

          if (!isFocused && !event?.defaultPrevented) {
            if (navigation?.navigate) {
              navigation.navigate(route.name, route.params);
            } else {
              const targetPath = route.name === 'index' ? '/(tabs)' : `/(tabs)/${route.name}`;
              router.push(targetPath as any);
            }
          }
        };

        const onLongPress = () => {
          navigation?.emit?.({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.name}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel || meta.label}
            onPress={onPress}
            onLongPress={onLongPress}
            android_ripple={{
              borderless: true,
              color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
              radius: 36,
            }}
            style={({ pressed }) => [
              styles.tabItem,
              {
                opacity: pressed ? 0.75 : 1,
                transform: [{ scale: pressed ? 0.92 : 1 }],
              },
            ]}
          >
            {/* WhatsApp Active Pill Indicator behind Icon */}
            <View
              style={[
                styles.iconPill,
                isFocused && [
                  styles.iconPillActive,
                  {
                    backgroundColor: isDark
                      ? 'rgba(20, 184, 166, 0.22)'
                      : '#DCFCE7', // WhatsApp's iconic soft mint green pill
                  },
                ],
              ]}
            >
              <Ionicons
                name={isFocused ? meta.activeIcon : meta.icon}
                size={22}
                color={
                  isFocused
                    ? isDark
                      ? '#2DD4BF'
                      : '#0F5132' // WhatsApp deep green
                    : isDark
                    ? '#94A3B8'
                    : '#64748B'
                }
              />

              {/* Notification Badge if present (like WhatsApp unread counter) */}
              {meta.badge && !isFocused && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{meta.badge}</Text>
                </View>
              )}
            </View>

            {/* Tab Label Text underneath icon */}
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused
                    ? isDark
                      ? '#F8FAFC'
                      : '#0F172A'
                    : isDark
                    ? '#94A3B8'
                    : '#64748B',
                  fontWeight: isFocused ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <WhatsAppBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconPill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconPillActive: {
    // Background color dynamically provided for theme adaptation
  },
  tabLabel: {
    fontSize: 12,
    letterSpacing: 0.2,
    marginTop: 4,
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981', // WhatsApp green notification badge
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    lineHeight: 12,
  },
});
