import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
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
import { StatusBar } from 'expo-status-bar';
import { CategoryList } from '../../src/modules/services/components/CategoryList';
import { PopularServiceCard } from '../../src/modules/services/components/PopularServiceCard';
import { HomePromoSlider } from '../../src/modules/services/components/HomePromoSlider';
import {
  ServiceCategory,
  PopularServiceItem,
} from '../../src/modules/services/types/service.types';
import { ScrubberItem } from '../../src/core/animations/PageScrubberTransition';

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
  const [selectedCategory, setSelectedCategory] = useState('Cleaning');

  // Categories matching reference design with photos
  const homeCategories: ServiceCategory[] = [
    {
      id: '1',
      name: 'Cleaning',
      icon: 'sparkles',
      image: catCleaning,
    },
    {
      id: '2',
      name: 'Plumbing',
      icon: 'water',
      image: catPlumbing,
    },
    {
      id: '3',
      name: 'Electrical',
      icon: 'flash',
      image: catElectrical,
    },
    {
      id: '4',
      name: 'Painting',
      icon: 'color-palette',
      image: catPainting,
    },
    {
      id: '5',
      name: 'Carpentry',
      icon: 'hammer',
      image:
        'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=150&q=80',
    },
  ];

  // Popular Services with matching photos & pricing
  const popularServices: PopularServiceItem[] = [
    {
      id: 'p1',
      title: 'Sofa Carpet clean',
      rating: 4.9,
      reviews: 142,
      price: '$29/hr',
      imageUrl: serviceSofaCarpet,
    },
    {
      id: 'p2',
      title: 'Kitchen Service',
      rating: 4.8,
      reviews: 98,
      price: '$35/hr',
      imageUrl: serviceHomeClean,
    },
    {
      id: 'p3',
      title: 'AC Gas Refill & Service',
      rating: 4.7,
      reviews: 210,
      price: '$25/hr',
      imageUrl:
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80',
    },
  ];

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
              <TouchableOpacity
                onPress={() => router.push('/(location)/confirm')}
                style={[styles.locationPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                <Ionicons name="location-sharp" size={12} color={colors.primary} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {cityName}, {stateName}
                </Text>
                <Ionicons name="chevron-down" size={11} color={colors.textSecondary} />
              </TouchableOpacity>

              <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>Welcome back</Text>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>Hello, {user?.name || 'Palash'}</Text>
            </View>

            {/* Right Action Icons: Theme Switcher, Notification Bell & Avatar */}
            <View style={styles.headerRightCol}>
              <ThemeSwitcher variant="icon" />

              <TouchableOpacity
                style={[styles.bellButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.75}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
                <View style={styles.bellBadgeDot} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.8}
              >
                <Image source={userAvatarImg} style={styles.avatar} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrubberItem>

        {/* 2. Search Bar with Filter Option Button */}
        <ScrubberItem index={1} slideDistance={18}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search For service..."
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: colors.borderLight }]}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={19} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </ScrubberItem>

        {/* 3. Categories Section */}
        <ScrubberItem index={2} slideDistance={22}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Categories</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <CategoryList
            categories={homeCategories}
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
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={[styles.viewAllText, { color: colors.textSecondary }]}>View All</Text>
            </TouchableOpacity>
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
    height: Platform.OS === 'ios' ? 100 : 90,
  },
});
