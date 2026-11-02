import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../core/theme/colors';
import { Typography } from '../../../core/theme/typography';
import { ServiceCategory } from '../types/service.types';

export interface CategoryListProps {
  categories: ServiceCategory[];
  selectedCategory?: string;
  onSelectCategory?: (category: ServiceCategory) => void;
  accentColor?: string;
  bgColor?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  accentColor = Colors.primary,
  bgColor = '#FFFFFF',
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollList}
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.name;
        const imageSource =
          typeof cat.image === 'string' ? { uri: cat.image } : cat.image;

        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelectCategory?.(cat)}
            style={[
              styles.card,
              isSelected
                ? [styles.activeCard, { backgroundColor: accentColor }]
                : [styles.inactiveCard, { backgroundColor: bgColor }],
            ]}
            activeOpacity={0.8}
          >
            {/* Circular Thumbnail Photo Wrapper */}
            <View
              style={[
                styles.photoCircle,
                isSelected ? styles.photoCircleActive : styles.photoCircleInactive,
              ]}
            >
              {imageSource ? (
                <Image
                  source={imageSource}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name={cat.icon}
                  size={20}
                  color={isSelected ? accentColor : '#4B5563'}
                />
              )}
            </View>

            {/* Category Name Label */}
            <Text
              style={[
                styles.categoryName,
                isSelected ? styles.categoryNameActive : styles.categoryNameInactive,
              ]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollList: {
    paddingVertical: 6,
    gap: 12,
  },
  card: {
    width: 66,
    height: 82,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  activeCard: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveCard: {
    borderWidth: 1,
    borderColor: '#F0F2F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  photoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  photoCircleActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoCircleInactive: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    alignSelf: 'center',
  },
  categoryName: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryNameInactive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
