import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/core/theme/colors';
import { Typography } from '../../src/core/theme/typography';
import { useLocationStore } from '../../src/modules/location/store/locationStore';
import { useAuthStore } from '../../src/modules/auth/store/authStore';
import { useTheme } from '../../src/core/theme/themeStore';
import { ThemeSwitcher } from '../../src/core/components/ThemeSwitcher';
import { toast } from '../../src/core/components/Toast';
import { StatusBar } from 'expo-status-bar';
import { CategoryList } from '../../src/modules/services/components/CategoryList';
import { PopularServiceCard } from '../../src/modules/services/components/PopularServiceCard';
import { HomePromoSlider } from '../../src/modules/services/components/HomePromoSlider';
import {
  ServiceCategory,
  PopularServiceItem,
} from '../../src/modules/services/types/service.types';
import { ScrubberItem } from '../../src/core/animations/PageScrubberTransition';
import { userApi } from '../../src/api/user.api';
import { SearchModal } from '../../src/modules/services/components/SearchModal';
import { ServiceSearchItem } from '../../src/modules/services/search/ServiceSearchEngine';

// Asset Images from reference screen
const catCleaning = require('../../assets/cat-cleaning.png');
const catPlumbing = require('../../assets/cat-plumbing.png');
const catElectrical = require('../../assets/cat-electrical.png');
const catPainting = require('../../assets/cat-painting.png');
const serviceSofaCarpet = require('../../assets/service-sofa-carpet.png');
const serviceHomeClean = require('../../assets/service-home-clean.png');
const userAvatarImg = require('../../assets/user-avatar.png');

export default function HomeDashboardScreen() {
  const router = useRouter();
  const { selectedAddress } = useLocationStore();
  const { user } = useAuthStore();
  const { isDark, colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [popularServices, setPopularServices] = useState<PopularServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Live API Fetch: Fetch Categories and Popular Services from backend
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const [cats, pops] = await Promise.all([
          userApi.getCategories(),
          userApi.getPopularServices(),
        ]);
        if (isMounted) {
          const mappedCats: ServiceCategory[] = (cats || []).map((c) => ({
            id: c.id,
            name: c.name,
            icon: (c.icon || 'sparkles') as any,
            image: c.imageUrl ? { uri: c.imageUrl } : catCleaning,
          }));
          const mappedPops: PopularServiceItem[] = (pops || []).map((p) => ({
            id: p.id,
            title: p.title,
            rating: p.rating,
            reviews: p.reviews,
            price: p.price,
            category: p.category,
            hourlyRate: p.hourlyRate,
            location: p.location,
            imageUrl: typeof p.imageUrl === 'string' ? { uri: p.imageUrl } : serviceSofaCarpet,
          }));
          setCategories(mappedCats);
          setPopularServices(mappedPops);
          if (mappedCats.length > 0 && !selectedCategory) {
            setSelectedCategory(mappedCats[0].name);
          }
        }
      } catch (err: any) {
        console.warn('[HomeCatalog Fetch Error]:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const cityName = selectedAddress?.city || 'Daspur';
  const stateName = selectedAddress?.state || 'Paschim Medinipur';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Header Row: Greeting & Location on Left, Theme Switcher, Notification & Avatar on Right */}
        <ScrubberItem index={0} slideDistance={14}>
          <View style={styles.headerBar}>
            <View style={styles.headerLeftCol}>
              {/* Location Chip */}
              <Pressable
                onPress={() => router.push('/(location)/confirm')}
                style={({ pressed }) => [
                  styles.locationPill,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Ionicons name="location-sharp" size={12} color={colors.primary} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {cityName}, {stateName}
                </Text>
                <Ionicons name="chevron-down" size={11} color={colors.textSecondary} />
              </Pressable>

              <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>Welcome back</Text>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>Hello, {user?.name || 'Palash'}</Text>
            </View>

            {/* Right Action Icons: Theme Switcher, Notification Bell & Avatar */}
            <View style={styles.headerRightCol}>
              <ThemeSwitcher variant="icon" />

              <Pressable
                onPress={() => toast.info('Notifications', 'All services and bookings are up to date.')}
                style={({ pressed }) => [
                  styles.bellButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.93 : 1 }],
                  },
                ]}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
                <View style={styles.bellBadgeDot} />
              </Pressable>

              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] }]}
              >
                <Image source={userAvatarImg} style={styles.avatar} />
              </Pressable>
            </View>
          </View>
        </ScrubberItem>

        {/* 2. Search Bar with Filter Option Button */}
        <ScrubberItem index={1} slideDistance={18}>
          <Pressable
            onPress={() => setIsSearchModalOpen(true)}
            style={({ pressed }) => [
              styles.searchContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <Text
              style={[
                styles.searchInput,
                { color: colors.textMuted, lineHeight: 22, paddingTop: 2 },
              ]}
            >
              Search services, electricians, plumbers...
            </Text>
            <View
              style={[
                styles.filterBtn,
                {
                  backgroundColor: colors.borderLight,
                },
              ]}
            >
              <Ionicons name="options-outline" size={19} color={colors.textPrimary} />
            </View>
          </Pressable>
        </ScrubberItem>

        {/* 3. Categories Section */}
        <ScrubberItem index={2} slideDistance={22}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Categories</Text>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              hitSlop={8}
            >
              <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>View All</Text>
            </Pressable>
          </View>

          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat.name)}
            accentColor={colors.primary}
            bgColor={colors.surface}
          />
        </ScrubberItem>

        {/* 4. Promotional Slider (Smart Home Service & Vehicle Breakdown) */}
        <ScrubberItem index={3} slideDistance={24}>
          <HomePromoSlider
            cityName={cityName}
            onPressSmartHome={() =>
              router.push({
                pathname: '/provider-detail',
                params: {
                  title: 'Home Cleaning',
                  price: '$65/Hr',
                  rating: '4.9',
                  location: `${cityName}, ${stateName}`,
                },
              })
            }
            onPressVehicleBreakdown={() => router.push('/(location)/confirm')}
          />
        </ScrubberItem>

        {/* 5. Popular Services Section */}
        <ScrubberItem index={4} slideDistance={26}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Popular services</Text>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              hitSlop={8}
            >
              <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>View All</Text>
            </Pressable>
          </View>

          {popularServices.map((service) => (
            <PopularServiceCard
              key={service.id}
              service={service}
              onBookNow={() =>
                router.push({
                  pathname: '/provider-detail',
                  params: {
                    title: service.title,
                    price: service.price,
                    rating: service.rating.toString(),
                    location: `${cityName}, ${stateName}`,
                  },
                })
              }
            />
          ))}
        </ScrubberItem>

        {/* Spacing for elevated floating bottom tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 10/10 Multi-Stage Production Fuzzy Search Modal */}
      <SearchModal
        visible={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        catalogue={popularServices.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category || 'General',
          price: p.price,
          hourlyRate: p.hourlyRate || 349,
          imageUrl: p.imageUrl,
          rating: p.rating,
          reviews: p.reviews,
          location: p.location || 'Local Area',
          skills: [p.title, p.category || 'General'],
        }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  headerLeftCol: {
    flex: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    maxWidth: 160,
  },
  welcomeSub: {
    ...Typography.bodySmall,
    fontSize: 12.5,
    color: Colors.textSecondary,
  },
  userName: {
    ...Typography.h2,
    fontSize: 21,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },
  bellBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.emergency,
    position: 'absolute',
    top: 10,
    right: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 14,
    marginLeft: 8,
    color: Colors.textPrimary,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeading: {
    ...Typography.h3,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  viewAllText: {
    ...Typography.caption,
    fontSize: 12.5,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 28,
  },
});
