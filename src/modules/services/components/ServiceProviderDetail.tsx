import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../../core/theme/typography';
import { SlideUpTransition } from '../../../core/animations/SlideUpTransition';
import { useTheme } from '../../../core/theme/themeStore';

const cleanerHeroImg = require('../../../../assets/cleaner-hero-clean.png');

export interface ServiceProviderDetailProps {
  id?: string;
  title?: string;
  weeklyRate?: string;
  hourlyRate?: string;
  location?: string;
  rating?: number | string;
  aboutText?: string;
  imageUrl?: any;
  onBack?: () => void;
  onBookNow?: (selectedServices: string[]) => void;
  accentColor?: string;
}

export const ServiceProviderDetail: React.FC<ServiceProviderDetailProps> = ({
  weeklyRate = '$367.00',
  hourlyRate = '$32.00',
  location = '47 Dubai circuit, UAE',
  rating = '6.8',
  aboutText = "I'm dedicated to delivering exceptional plumbing services right to your doorstep. With my expertise and knowledge, I skillfully handles all your plumbing ",
  imageUrl,
  onBack,
  onBookNow,
}) => {
  const { isDark, colors } = useTheme();
  const [isReadMoreExpanded, setIsReadMoreExpanded] = useState(false);

  const handleBooking = () => {
    if (onBookNow) {
      onBookNow(['Standard Service']);
    } else {
      const msg = 'Booking requested successfully!';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Book Now', msg);
      }
    }
  };

  const imageSource = imageUrl
    ? typeof imageUrl === 'string'
      ? { uri: imageUrl }
      : imageUrl
    : cleanerHeroImg;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#FFFFFF' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* 1. Sky-Blue Top Hero Section with < Back, Price, Location, Rating & Cleaner Photo */}
        <View style={[styles.topHeroSection, { backgroundColor: isDark ? '#1E293B' : '#EDF5FF' }]}>
          {/* Header Bar: < Back */}
          <SafeAreaView edges={['top']} style={styles.topHeaderBar}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color="#0284C7" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </SafeAreaView>

          {/* Hero Row: Left Meta + Right Cleaner Image */}
          <View style={styles.heroContentRow}>
            {/* Left Column: Price + Location + Rating */}
            <View style={styles.heroLeftCol}>
              <SlideUpTransition preset="fade-slide" delayMs={60} durationMs={450}>
                {/* Price Row: $367.00 /Week */}
                <View style={styles.priceRow}>
                  <Text style={[styles.priceAmount, { color: isDark ? colors.textPrimary : '#0F172A' }]}>
                    {weeklyRate}
                  </Text>
                  <Text style={styles.priceUnit}>/Week</Text>
                </View>
              </SlideUpTransition>

              <SlideUpTransition preset="fade-slide" delayMs={120} durationMs={450}>
                {/* Location: 47 Dubai circuit, UAE */}
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#94A3B8" style={{ marginRight: 4 }} />
                  <Text style={[styles.locationText, { color: isDark ? colors.textSecondary : '#64748B' }]} numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              </SlideUpTransition>

              <SlideUpTransition preset="fade-slide" delayMs={180} durationMs={450}>
                {/* Rating Badge: Star + 6.8 */}
                <View style={[styles.ratingBadge, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: isDark ? colors.border : '#E2E8F0' }]}>
                  <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
                  <Text style={[styles.ratingText, { color: isDark ? colors.textPrimary : '#0F172A' }]}>
                    {rating}
                  </Text>
                </View>
              </SlideUpTransition>
            </View>

            {/* Right Column: Female Cleaner with mop and bucket */}
            <View style={styles.heroRightCol}>
              <SlideUpTransition preset="hero-reveal" delayMs={100} durationMs={700}>
                <Image
                  source={imageSource}
                  style={styles.cleanerPhoto}
                  resizeMode="contain"
                />
              </SlideUpTransition>
            </View>
          </View>
        </View>

        {/* 2. Main Content Body */}
        <View style={styles.bodyContent}>
          {/* Section: About me */}
          <SlideUpTransition preset="fade-slide" delayMs={220} durationMs={500} style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : '#0F172A' }]}>
              About me
            </Text>
            <Text style={[styles.aboutBody, { color: isDark ? colors.textSecondary : '#64748B' }]}>
              {aboutText}
              <Text
                onPress={() => setIsReadMoreExpanded(!isReadMoreExpanded)}
                style={styles.readMoreLink}
              >
                {isReadMoreExpanded ? ' Read less' : 'Read more....'}
              </Text>
            </Text>
            {isReadMoreExpanded && (
              <Text style={[styles.aboutBody, { color: isDark ? colors.textSecondary : '#64748B', marginTop: 8 }]}>
                With over 8 years of certified experience, high-grade eco-friendly supplies, and guaranteed satisfaction on every job.
              </Text>
            )}
          </SlideUpTransition>

          {/* Section: Review From Client */}
          <SlideUpTransition preset="fade-slide" delayMs={280} durationMs={500} style={styles.sectionBlock}>
            <View style={styles.reviewHeaderRow}>
              <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : '#0F172A' }]}>
                Review From Client
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.viewAllLink}>View all</Text>
              </TouchableOpacity>
            </View>

            {/* Review Card */}
            <View style={[styles.reviewCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: isDark ? colors.border : '#F1F5F9' }]}>
              {/* 5 Bright Blue Stars */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={15} color="#2563EB" style={{ marginRight: 3 }} />
                ))}
              </View>

              {/* Review Headline */}
              <Text style={[styles.reviewHeadline, { color: isDark ? colors.textPrimary : '#0F172A' }]}>
                This is what I was looking for!
              </Text>

              {/* Review Author & Date */}
              <Text style={styles.reviewAuthorDate}>
                David Beckham • May 09, 2023
              </Text>

              {/* Review Text */}
              <Text style={[styles.reviewComment, { color: isDark ? colors.textSecondary : '#64748B' }]}>
                This is the first time I&apos;ve used this service. The work was very clea...
              </Text>
            </View>
          </SlideUpTransition>
        </View>

        {/* Extra spacing so bottom floating bar never overlaps content */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 3. Sticky Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={[styles.bottomBarContainer, { backgroundColor: isDark ? colors.background : '#FFFFFF', borderTopColor: isDark ? colors.border : '#F1F5F9' }]}>
        <View style={styles.bottomBarContent}>
          {/* Hourly Rate Pill: $32.00/hr */}
          <View style={[styles.hourlyRatePill, { backgroundColor: isDark ? colors.surface : '#F1F5F9' }]}>
            <Text style={[styles.hourlyAmountText, { color: isDark ? colors.textPrimary : '#0F172A' }]}>
              {hourlyRate}
            </Text>
            <Text style={styles.hourlyUnitText}>/hr</Text>
          </View>

          {/* Book Now Button: Deep Navy #0F172A */}
          <TouchableOpacity
            style={styles.bookNowBtn}
            activeOpacity={0.85}
            onPress={handleBooking}
          >
            <Text style={styles.bookNowBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* Top Hero Section */
  topHeroSection: {
    backgroundColor: '#EDF5FF', // Soft sky blue matching reference
    paddingHorizontal: 20,
    paddingBottom: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  topHeaderBar: {
    paddingTop: Platform.OS === 'ios' ? 8 : 14,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 10,
  },
  backText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '700',
    color: '#0284C7', // Reference sky blue
  },

  /* Hero Content Row */
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 220,
    paddingTop: 8,
  },
  heroLeftCol: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceAmount: {
    ...Typography.hero,
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  priceUnit: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationText: {
    ...Typography.caption,
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    maxWidth: '90%',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Right Cleaner Photo */
  heroRightCol: {
    width: 175,
    height: 235,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cleanerPhoto: {
    width: '100%',
    height: '100%',
    marginBottom: -2,
  },

  /* Body Content */
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionBlock: {
    marginBottom: 26,
  },
  sectionHeading: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  aboutBody: {
    ...Typography.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: '#64748B',
  },
  readMoreLink: {
    fontWeight: '700',
    color: '#2563EB', // Blue link
  },

  /* Review Section */
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllLink: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewHeadline: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  reviewAuthorDate: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 10,
  },
  reviewComment: {
    ...Typography.bodySmall,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748B',
  },

  bottomSpacer: {
    height: 90,
  },

  /* Sticky Bottom Action Bar */
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  hourlyRatePill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 25,
    justifyContent: 'center',
  },
  hourlyAmountText: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  hourlyUnitText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 2,
  },
  bookNowBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A', // #0f172a requested by user
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  bookNowBtnText: {
    ...Typography.button,
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
