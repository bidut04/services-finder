import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
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

export default function ConfirmLocationScreen() {
  const router = useRouter();
  const { selectedAddress, savedAddresses, selectManualAddress } =
    useLocationStore();
  const { setLocationFlowCompleted } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

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

  const { exitAnimStyle, navigateWithExit } = useScreenTransition();

  const handleConfirmLocation = () => {
    selectManualAddress(activeAddress);
    setLocationFlowCompleted(true);
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
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
              >
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search city, area or street..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
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
              <TouchableOpacity
                key={city}
                activeOpacity={0.7}
                style={[
                  styles.cityChip,
                  activeAddress.city === city ? styles.activeChip : null,
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
              </TouchableOpacity>
            ))}
          </View>

          {savedAddresses.length > 0 && (
            <View style={styles.savedSection}>
              <Text style={styles.sectionSubtitle}>Saved Addresses</Text>
              {savedAddresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={styles.savedItem}
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
                </TouchableOpacity>
              ))}
            </View>
          )}

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
});
