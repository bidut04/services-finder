import React from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { useScrollReveal } from '../../../core/animations/useScrollReveal';
import { ScrollRevealItem } from '../../../core/animations/ScrollRevealItem';
import { PopularServiceCard } from './PopularServiceCard';
import { PopularServiceItem } from '../types/service.types';

export interface PopularServiceListProps
  extends Partial<Omit<FlatListProps<PopularServiceItem>, 'data' | 'renderItem'>> {
  services: PopularServiceItem[];
  onBookNow: (service: PopularServiceItem) => void;
}

/**
 * Example FlatList utilizing scroll-based reveal:
 * Animates list cards only when they enter the viewport, and only once.
 */
export const PopularServiceList: React.FC<PopularServiceListProps> = ({
  services,
  onBookNow,
  ...flatListProps
}) => {
  const { viewabilityConfig, onViewableItemsChanged, isItemRevealed } =
    useScrollReveal({
      itemVisiblePercentThreshold: 20,
      minimumViewTime: 50,
    });

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <ScrollRevealItem
          id={item.id}
          isRevealed={isItemRevealed(item.id)}
          staggerIndex={index % 6}
        >
          <PopularServiceCard service={item} onBookNow={onBookNow} />
        </ScrollRevealItem>
      )}
      {...flatListProps}
    />
  );
};

