import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../../core/theme/typography';
import { SlideUpTransition } from '../../../core/animations/SlideUpTransition';

const { height } = Dimensions.get('window');

// High-resolution smiling female cleaner photo matching the user's uploaded reference
const DEFAULT_HERO_IMAGE =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80';

export interface ServiceProviderDetailProps {
  id?: string;
  title?: string;
  category?: string;
  location?: string;
  rating?: number;
  reviewsCount?: number;
  hourlyRate?: string;
  tagline?: string;
  aboutText?: string;
  servicesList?: string[];
  imageUrl?: any;
  phone?: string;
  onBack?: () => void;
  onBookNow?: (selectedServices: string[]) => void;
  accentColor?: string; // e.g. '#7C3AED' (purple from screenshot) or Colors.primary
}

export const ServiceProviderDetail: React.FC<ServiceProviderDetailProps> = ({
  title = 'Home Cleaning',
  location = 'New York',
  rating = 4.9,
  hourlyRate = '$65/Hr',
  tagline = 'Expert home cleaning for a tidy, fresh, and comfortable space.',
  aboutText = 'Professional home cleaning services providing spotless, safe, and refreshing spaces with care, reliability, and efficiency.',
  servicesList = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Balcony', 'Windows'],
  imageUrl = DEFAULT_HERO_IMAGE,
  phone = '+1 (555) 328-9421',
  onBack,
  onBookNow,
  accentColor = '#0F172A', // #0f172a requested by user
}) => {
  // Selected sub-services state (multi-select chips)
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Kitchen',
    'Living Room',
  ]);

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Linking.openURL(`tel:${phone}`).catch(() => {});
    }
  };

  const handleMessage = () => {
    if (Platform.OS !== 'web') {
      Linking.openURL(`sms:${phone}`).catch(() => {});
    }
  };

  const handleBooking = () => {
    if (onBookNow) {
      onBookNow(selectedServices);
    }
  };

  const imageSource =
    typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* 1. Full-Bleed Hero Image with Action Overlay */}
        <View style={styles.heroContainer}>
          <Image
            source={imageSource}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Dark gradient overlay on bottom of image for seamless blending */}
          <View style={styles.heroGradientBottom} pointerEvents="none" />

          {/* Top Bar: Floating Circular Back Button */}
          <SafeAreaView edges={['top']} style={styles.heroTopBar}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButtonCircle}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Floating Action Buttons: Call & Chat in Dark Circles */}
          <View style={styles.heroActionButtonsRow}>
            <TouchableOpacity
              onPress={handleCall}
              style={styles.actionCircleBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleMessage}
              style={styles.actionCircleBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Dark Rounded Bottom Sheet Container */}
        <View style={styles.sheetContainer}>
          {/* Title & Metadata Row */}
          <SlideUpTransition preset="fade-slide" delayMs={40} durationMs={500}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.metaRow}>
              {/* Location Pin */}
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="#94A3B8" />
                <Text style={styles.metaText}>{location}</Text>
              </View>

              <View style={styles.metaDividerDot} />

              {/* Star Rating */}
              <View style={styles.metaItem}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={styles.metaText}>{rating} Rating</Text>
              </View>
            </View>

            {/* Tagline / Service Motto */}
            <Text style={styles.tagline}>{tagline}</Text>
          </SlideUpTransition>

          {/* Section: Services Include */}
          <SlideUpTransition preset="fade-slide" delayMs={100} durationMs={500} style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Services Include</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {servicesList.map((svc) => {
                const isSelected = selectedServices.includes(svc);
                return (
                  <TouchableOpacity
                    key={svc}
                    activeOpacity={0.75}
                    onPress={() => toggleService(svc)}
                    style={[
                      styles.serviceChip,
                      isSelected && styles.serviceChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {svc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SlideUpTransition>

          {/* Section: About */}
          <SlideUpTransition preset="fade-slide" delayMs={160} durationMs={500} style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>About</Text>
            <Text style={styles.aboutText}>{aboutText}</Text>
          </SlideUpTransition>

          {/* Extra spacing so bottom sheet content is never obstructed */}
          <View style={styles.footerSpacing} />
        </View>
      </ScrollView>

      {/* 3. Sticky Bottom Floating Price & Booking Bar */}
      <SafeAreaView edges={['bottom']} style={styles.stickyBottomBar}>
        <View style={styles.bottomBarContent}>
          {/* Price Label & Hourly Amount */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={styles.priceAmount}>{hourlyRate}</Text>
          </View>

          {/* Pill CTA Button (Booking Now) */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleBooking}
            style={[styles.bookingButton, { backgroundColor: accentColor }]}
          >
            <Text style={styles.bookingButtonText}>Booking Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1014', // Deep dark theme matching the screenshot
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Hero Section */
  heroContainer: {
    width: '100%',
    height: Math.max(340, height * 0.44),
    position: 'relative',
    backgroundColor: '#1E2026',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: 'rgba(15, 16, 20, 0.45)',
  },
  heroTopBar: {
    position: 'absolute',
    top: 12,
    left: 18,
    right: 18,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(30, 32, 40, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  heroActionButtonsRow: {
    position: 'absolute',
    bottom: 34,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  actionCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(32, 35, 42, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },

  /* Dark Bottom Sheet Container */
  sheetContainer: {
    backgroundColor: '#0F1014',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    paddingHorizontal: 22,
    paddingTop: 24,
    zIndex: 5,
  },
  title: {
    ...Typography.hero,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  metaDividerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#64748B',
  },
  tagline: {
    ...Typography.body,
    fontSize: 13.5,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 20,
  },

  /* Section Styles */
  sectionWrap: {
    marginTop: 8,
    marginBottom: 18,
  },
  sectionHeading: {
    ...Typography.h3,
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 10,
  },
  serviceChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#1E2128',
    borderWidth: 1,
    borderColor: '#2D323E',
  },
  serviceChipSelected: {
    backgroundColor: '#2D323E',
    borderColor: '#4A5060',
  },
  chipText: {
    ...Typography.caption,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  aboutText: {
    ...Typography.body,
    fontSize: 13.5,
    color: '#94A3B8',
    lineHeight: 21,
  },
  footerSpacing: {
    height: 90,
  },

  /* Sticky Bottom Bar */
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F1014',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
    paddingHorizontal: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
  },
  priceAmount: {
    ...Typography.h2,
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bookingButton: {
    paddingHorizontal: 36,
    paddingVertical: 15,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  bookingButtonText: {
    ...Typography.button,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
