import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../core/theme/themeStore';
import { Typography, FontFamily } from '../../../core/theme/typography';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { ServiceSearchItem } from '../search/ServiceSearchEngine';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  catalogue: ServiceSearchItem[];
}

const POPULAR_SUGGESTION_CHIPS = [
  'Electrician',
  'Plumber',
  'Sofa Clean',
  'বিদ্যুৎ মিস্ত্রি',
  'Nal Mistri',
  'Painting',
];

export function SearchModal({ visible, onClose, catalogue }: SearchModalProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const {
    query,
    setQuery,
    results,
    isSearching,
    latencyMs,
    clearSearch,
  } = useDebouncedSearch(catalogue, 250);

  const filteredResults = results.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.category?.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handleSelectService = (service: ServiceSearchItem) => {
    onClose();
    router.push({
      pathname: '/provider-detail',
      params: {
        id: service.id,
        serviceId: service.id,
        title: service.title,
        category: service.category,
        price: service.price,
        hourlyRate: String(service.hourlyRate || 349),
      },
    });
  };

  const renderBadge = (item: ServiceSearchItem) => {
    switch (item.matchType) {
      case 'EXACT':
        return (
          <View style={[styles.badge, { backgroundColor: '#10B98115', borderColor: '#10B98140' }]}>
            <Ionicons name="checkmark-circle" size={11} color="#10B981" />
            <Text style={[styles.badgeText, { color: '#059669' }]}>Exact Match</Text>
          </View>
        );
      case 'PREFIX':
        return (
          <View style={[styles.badge, { backgroundColor: '#3B82F615', borderColor: '#3B82F640' }]}>
            <Ionicons name="flash" size={11} color="#3B82F6" />
            <Text style={[styles.badgeText, { color: '#2563EB' }]}>Prefix Match</Text>
          </View>
        );
      case 'FUZZY':
        return (
          <View style={[styles.badge, { backgroundColor: '#8B5CF615', borderColor: '#8B5CF640' }]}>
            <Ionicons name="sparkles" size={11} color="#8B5CF6" />
            <Text style={[styles.badgeText, { color: '#7C3AED' }]}>Typo Auto-Correct</Text>
          </View>
        );
      case 'ALIAS':
        return (
          <View style={[styles.badge, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B40' }]}>
            <Ionicons name="language" size={11} color="#F59E0B" />
            <Text style={[styles.badgeText, { color: '#D97706' }]}>
              {item.matchedAlias ? `Matched "${item.matchedAlias}"` : 'Multilingual Alias'}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Top Bar: Back Button, Search Input, and Clear Icon */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>

            <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search services, electricians, plumbers..."
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
                autoFocus
                returnKeyType="search"
                autoCapitalize="none"
              />
              {isSearching ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : query.length > 0 ? (
                <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Quick Category Filter Chips */}
          <View style={styles.filterBar}>
            {['All', 'Cleaning', 'Plumbing', 'Electrical', 'Painting'].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedFilter(cat)}
                style={[
                  styles.filterChip,
                  selectedFilter === cat
                    ? { backgroundColor: colors.primary, borderColor: colors.primary }
                    : { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: selectedFilter === cat ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: selectedFilter === cat ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Performance & Latency Bar (when searching) */}
          {latencyMs !== null && query.length >= 2 && (
            <View style={styles.latencyBar}>
              <Text style={[styles.latencyText, { color: colors.textMuted }]}>
                ⚡ {filteredResults.length} results found in {latencyMs} ms (P95 target &lt; 50ms)
              </Text>
            </View>
          )}

          {/* Search Results List */}
          <FlatList
            data={filteredResults}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  {query.trim().length >= 2
                    ? `No services found for "${query}"`
                    : 'Search for any home service'}
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Try English, Bengali (বিদ্যুৎ মিস্ত্রি), or Hindi (bijli mistri)
                </Text>

                {/* Popular Suggestion Chips */}
                <View style={styles.suggestionGrid}>
                  {POPULAR_SUGGESTION_CHIPS.map((chip) => (
                    <TouchableOpacity
                      key={chip}
                      onPress={() => setQuery(chip)}
                      style={[styles.suggestionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <Ionicons name="trending-up" size={13} color={colors.primary} />
                      <Text style={[styles.suggestionText, { color: colors.textPrimary }]}>{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectService(item)}
                style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.7}
              >
                {/* Service Image / Icon */}
                <View style={styles.imageWrapper}>
                  {item.imageUrl ? (
                    <Image
                      source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl}
                      style={styles.serviceImage}
                    />
                  ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: colors.borderLight }]}>
                      <Ionicons name="construct" size={24} color={colors.primary} />
                    </View>
                  )}
                </View>

                {/* Service Information */}
                <View style={styles.serviceInfo}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.serviceTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {renderBadge(item)}
                  </View>

                  <Text style={[styles.categoryName, { color: colors.textSecondary }]}>
                    {item.category} • {item.location || 'Instant Booking'}
                  </Text>

                  <View style={styles.priceRatingRow}>
                    <Text style={[styles.priceTag, { color: colors.primary }]}>{item.price}</Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingText}>
                        {item.rating || 4.8} ({item.reviews || 95})
                      </Text>
                    </View>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 6,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FontFamily.regular,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
  },
  latencyBar: {
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  latencyText: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  serviceTitle: {
    fontSize: 15,
    fontFamily: FontFamily.semiBold,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  categoryName: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
  },
  priceRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  priceTag: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginBottom: 16,
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
  },
});
