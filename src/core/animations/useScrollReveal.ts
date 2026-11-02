import { useState, useRef, useCallback } from 'react';
import { FlatListProps } from 'react-native';

export type OnViewableItemsChanged = NonNullable<FlatListProps<any>['onViewableItemsChanged']>;

export interface UseScrollRevealOptions {
  itemVisiblePercentThreshold?: number; // e.g. 20 means 20% visible
  minimumViewTime?: number;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const {
    itemVisiblePercentThreshold = 20,
    minimumViewTime = 50,
  } = options;

  // Set of all item IDs that have entered the viewport at least once
  const revealedKeysRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState({});

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold,
    minimumViewTime,
  }).current;

  const onViewableItemsChanged: OnViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      let hasNew = false;
      viewableItems.forEach((token) => {
        const key = String(token.key ?? token.item?.id ?? '');
        if (key && !revealedKeysRef.current.has(key)) {
          revealedKeysRef.current.add(key);
          hasNew = true;
        }
      });

      // Only re-render when a new item has entered for the first time
      if (hasNew) {
        forceUpdate({});
      }
    },
    []
  );

  const isItemRevealed = useCallback((key: string | number): boolean => {
    return revealedKeysRef.current.has(String(key));
  }, []);

  return {
    viewabilityConfig,
    onViewableItemsChanged,
    isItemRevealed,
  };
}
