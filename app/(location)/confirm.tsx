import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/core/theme/colors';
import { Spacing } from '../../src/core/theme/spacing';
import { Typography } from '../../src/core/theme/typography';
import { Button } from '../../src/core/components/Button';
import { useLocationStore } from '../../src/modules/location/store/locationStore';
import { useAuthStore } from '../../src/modules/auth/store/authStore';
import { UserAddress } from '../../src/modules/location/types/location.types';
import { SimulatedMapPreview } from '../../src/modules/location/components/SimulatedMapPreview';
import { ScrubberItem } from '../../src/core/animations/PageScrubberTransition';
import {
  SmoothScreenWrapper,
  useScreenTransition,
} from '../../src/core/animations/SmoothScreenWrapper';

import { SavedAddressService } from '../../src/modules/location/services/SavedAddressService';
import { userApi } from '../../src/api/user.api';

export default function ConfirmLocationScreen() {
  const router = useRouter();
  const { selectedAddress, savedAddresses, selectManualAddress, saveAddressToBackend } =
    useLocationStore();
  const { setLocationFlowCompleted } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const activeAddress: UserAddress = selectedAddress || {
    id: 'default_daspur',
    formattedAddress: 'Daspur Bazar, Paschim Medinipur, West Bengal 721211',
    street: 'Main Road',
    city: 'Daspur',
    district: 'Paschim Medinipur',
    state: 'West Bengal',
    postalCode: '721211',
    country: 'India',
    coordinates: { latitude: 22.6047, longitude: 87.7188 },
    isCurrentLocation: true,
  };

  // Live OpenStreetMap Address Autocomplete (Free & Open Source)
  React.useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await userApi.searchAddress(
          searchQuery.trim(),
          activeAddress.coordinates.latitude,
          activeAddress.coordinates.longitude
        );
        setSuggestions(results || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, activeAddress.coordinates.latitude, activeAddress.coordinates.longitude]);

  const handleSelectSuggestion = (s: any) => {
    const updated: UserAddress = {
      id: `addr_${Date.now()}`,
      formattedAddress: s.displayName,
      street: s.displayName.split(',')[0] || '',
      city: s.city || activeAddress.city,
      district: activeAddress.district,
      state: s.state || activeAddress.state,
      postalCode: activeAddress.postalCode,
      country: s.country || 'India',
      coordinates: s.coordinates,
      label: selectedTag,
    };
    selectManualAddress(updated);
    setSearchQuery('');
    setSuggestions([]);
  };

  const { exitAnimStyle, navigateWithExit } = useScreenTransition();

  const handleConfirmLocation = () => {
    const finalAddress: UserAddress = {
      ...activeAddress,
      label: selectedTag,
    };
    selectManualAddress(finalAddress);
    setLocationFlowCompleted(true);
    saveAddressToBackend(finalAddress);
    SavedAddressService.saveAddress(finalAddress).catch((err) =>
      console.warn('[Address Save Warning]:', err.message)
    );
    navigateWithExit(() => router.replace('/(tabs)'));
  };

  const handleBack = () => {
    navigateWithExit(() => router.back(), 20);
  };

  const handleSelectQuickLocation = (cityName: string, districtName: string) => {
    const newAddr: UserAddress = {
      id: `manual_${Date.now()}`,
      formattedAddress: `${cityName} Main Hub, ${districtName}, West Bengal`,
      street: 'Market Road',
      city: cityName,
      district: districtName,
      state: 'West Bengal',
      postalCode: '721211',
      country: 'India',
      coordinates: { latitude: 22.605, longitude: 87.72 },
    };
    selectManualAddress(newAddr);
  };

  return (
    <SmoothScreenWrapper>
      <Animated.View style={[{ flex: 1 }, exitAnimStyle]}>
        <SafeAreaView style={styles.container}>
          {/* Search Header */}
          <ScrubberItem index={0} slideDistance={10}>
            <View style={styles.header}>
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] },
                ]}
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
              </Pressable>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city, area or street..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {isSearching && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 6 }} />}
          </View>
        </View>

        {/* Live Nominatim Autocomplete Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsOverlay}>
            <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
              {suggestions.map((s, idx) => (
                <Pressable
                  key={s.placeId || idx}
                  style={styles.suggestionRow}
                  onPress={() => handleSelectSuggestion(s)}
                >
                  <Ionicons name="location-outline" size={18} color={Colors.primary} />
                  <View style={styles.suggestionTextCol}>
                    <Text style={styles.suggestionMain} numberOfLines={1}>
                      {s.displayName.split(',')[0]}
                    </Text>
                    <Text style={styles.suggestionDetail} numberOfLines={1}>
                      {s.displayName}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrubberItem>

      {/* Reusable Simulated Map Preview with Pin */}
      <ScrubberItem index={1} slideDistance={16} style={{ flex: 1 }}>
        <SimulatedMapPreview
          onRecenterPress={() =>
            handleSelectQuickLocation('Daspur', 'Paschim Medinipur')
          }
        />
      </ScrubberItem>

      {/* Bottom Confirmation Sheet */}
      <ScrubberItem index={2} slideDistance={24} style={styles.sheetContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionTitle}>Selected Service Area</Text>
          <View style={styles.activeAddressBox}>
            <View style={styles.addressIconWrap}>
              <Ionicons name="business" size={22} color={Colors.primary} />
            </View>
            <View style={styles.addressDetails}>
              <Text style={styles.cityText}>
                {activeAddress.city}, {activeAddress.district}
              </Text>
              <Text style={styles.addressSubtext}>
                {activeAddress.formattedAddress}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionSubtitle}>Nearby Service Hubs</Text>
          <View style={styles.chipRow}>
            {['Daspur', 'Ghatal', 'Medinipur', 'Kharagpur'].map((city) => (
              <Pressable
                key={city}
                style={({ pressed }) => [
                  styles.cityChip,
                  activeAddress.city === city ? styles.activeChip : null,
                  {
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
                onPress={() =>
                  handleSelectQuickLocation(city, 'Paschim Medinipur')
                }
              >
                <Text
                  style={[
                    styles.cityChipText,
                    activeAddress.city === city ? styles.activeChipText : null,
                  ]}
                >
                  📍 {city}
                </Text>
              </Pressable>
            ))}
          </View>

          {savedAddresses.length > 0 && (
            <View style={styles.savedSection}>
              <Text style={styles.sectionSubtitle}>Saved Addresses</Text>
              {savedAddresses.map((addr) => (
                <Pressable
                  key={addr.id}
                  style={({ pressed }) => [
                    styles.savedItem,
                    {
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                  onPress={() => selectManualAddress(addr)}
                >
                  <Ionicons
                    name={addr.label === 'Work' ? 'briefcase' : 'home'}
                    size={18}
                    color={Colors.primary}
                  />
                  <Text style={styles.savedLabel}>{addr.label}:</Text>
                  <Text style={styles.savedAddressText} numberOfLines={1}>
                    {addr.formattedAddress}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Address Tag Selector (Home, Work, Other) */}
          <Text style={styles.sectionSubtitle}>Save Address As</Text>
          <View style={styles.tagRow}>
            {(['Home', 'Work', 'Other'] as const).map((tag) => (
              <Pressable
                key={tag}
                style={[
                  styles.tagChip,
                  selectedTag === tag ? styles.activeTagChip : null,
                ]}
                onPress={() => setSelectedTag(tag)}
              >
                <Ionicons
                  name={tag === 'Home' ? 'home' : tag === 'Work' ? 'briefcase' : 'bookmark'}
                  size={14}
                  color={selectedTag === tag ? '#FFFFFF' : Colors.textPrimary}
                />
                <Text
                  style={[
                    styles.tagChipText,
                    selectedTag === tag ? styles.activeTagChipText : null,
                  ]}
                >
                  {tag}
                </Text>
              </Pressable>
            ))}
          </View>

          <Button
            title="Confirm Location & Continue"
            onPress={handleConfirmLocation}
            style={styles.confirmButton}
            rightIcon={
              <Ionicons name="checkmark-sharp" size={20} color="#FFFFFF" />
            }
          />
        </ScrollView>
      </ScrubberItem>
    </SafeAreaView>
      </Animated.View>
    </SmoothScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    backgroundColor: Colors.borderLight,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
    height: 44,
    borderRadius: Spacing.radiusFull,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    marginLeft: Spacing.xs,
    color: Colors.textPrimary,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  activeAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryBackground,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  addressIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  addressDetails: {
    flex: 1,
  },
  cityText: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  addressSubtext: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionSubtitle: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  cityChip: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeChip: {
    backgroundColor: Colors.primary,
  },
  cityChipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  savedSection: {
    marginBottom: Spacing.md,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  savedLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  savedAddressText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  confirmButton: {
    marginTop: Spacing.sm,
  },
  suggestionsOverlay: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginHorizontal: Spacing.md,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 999,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
  },
  suggestionTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  suggestionMain: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  suggestionDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.borderLight,
  },
  activeTagChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagChipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  activeTagChipText: {
    color: '#FFFFFF',
  },
});
