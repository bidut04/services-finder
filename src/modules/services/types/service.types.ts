import { Ionicons } from '@expo/vector-icons';

export type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export interface ServiceCategory {
  id: string;
  name: string;
  icon: IoniconsName;
  image?: any;
}

export interface PopularServiceItem {
  id: string;
  title: string;
  rating: number;
  reviews: number;
  price: string;
  imageUrl: any;
}
