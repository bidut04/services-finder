import Fuse, { IFuseOptions } from 'fuse.js';

export interface ServiceSearchItem {
  id: string;
  title: string;
  category: string;
  price: string;
  hourlyRate: number;
  imageUrl?: any;
  rating: number;
  reviews: number;
  location?: string;
  skills: string[];
  aliases?: string[];
  matchType?: 'EXACT' | 'PREFIX' | 'FUZZY' | 'ALIAS' | 'POPULAR';
  matchedAlias?: string;
}

export const normalize = (value: string): string => {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const DEFAULT_CLIENT_ALIASES: Record<string, string[]> = {
  pop_switchboard: [
    'electrician',
    'electrical',
    'bijli mistri',
    'বিদ্যুৎ মিস্ত্রি',
    'কারেন্ট মিস্ত্রি',
    'fan repair',
    'light fit',
    'mcb',
  ],
  pop_pipe_leak: [
    'plumber',
    'plumbing',
    'nal mistri',
    'প্লাম্বার',
    'পানির পাইপ',
    'কল মেরামত',
    'pipe leak',
    'tap fix',
    'water tank',
  ],
  pop_sofa_clean: [
    'cleaning',
    'cleaner',
    'safai',
    'ghar safai',
    'ঘর পরিষ্কার',
    'ঝাড়ু পোছা',
    'sofa clean',
    'carpet clean',
  ],
  pop_kitchen_clean: [
    'kitchen clean',
    'রান্নাঘর পরিষ্কার',
    'chimney clean',
    'gas stove',
  ],
  pop_home_painting: [
    'painter',
    'painting',
    'rang mistri',
    'রং মিস্ত্রি',
    'দেয়াল রং',
    'whitewash',
    'distemper',
  ],
};

const FUSE_OPTIONS: IFuseOptions<ServiceSearchItem> = {
  includeScore: true,
  shouldSort: true,
  threshold: 0.32,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.60 },
    { name: 'category', weight: 0.25 },
    { name: 'aliases', weight: 0.20 },
    { name: 'skills', weight: 0.10 },
  ],
};

export class ServiceSearchEngine {
  private fuse: Fuse<ServiceSearchItem>;
  private items: ServiceSearchItem[];

  constructor(items: ServiceSearchItem[]) {
    // Enrich items with multilingual aliases
    this.items = items.map((item) => ({
      ...item,
      aliases: [
        ...(item.aliases || []),
        ...(DEFAULT_CLIENT_ALIASES[item.id] || []),
      ],
    }));

    this.fuse = new Fuse(this.items, FUSE_OPTIONS);
  }

  /**
   * Fast-Path Multi-Stage Matching: Exact -> Prefix -> Alias -> Fuzzy
   * Runs in 0–5 ms in mobile RAM
   */
  public search(rawQuery: string, limit = 20): ServiceSearchItem[] {
    const query = normalize(rawQuery);
    if (!query || query.length < 2) {
      return [];
    }

    const resultMap = new Map<string, ServiceSearchItem>();

    // 1. Exact Match Check
    for (const item of this.items) {
      const normTitle = normalize(item.title);
      const normCat = normalize(item.category);
      if (normTitle === query || normCat === query) {
        resultMap.set(item.id, {
          ...item,
          matchType: 'EXACT',
        });
      }
    }

    // 2. Prefix Match Check
    for (const item of this.items) {
      if (resultMap.has(item.id)) continue;
      const normTitle = normalize(item.title);
      const normCat = normalize(item.category);
      if (normTitle.startsWith(query) || normCat.startsWith(query)) {
        resultMap.set(item.id, {
          ...item,
          matchType: 'PREFIX',
        });
      }
    }

    // 3. Multilingual Alias Check (Bengali, Hindi, Synonyms)
    for (const item of this.items) {
      if (resultMap.has(item.id)) continue;
      const aliases = item.aliases || [];
      for (const alias of aliases) {
        const normAlias = normalize(alias);
        if (normAlias === query || normAlias.startsWith(query)) {
          resultMap.set(item.id, {
            ...item,
            matchType: 'ALIAS',
            matchedAlias: alias,
          });
          break;
        }
      }
    }

    // 4. Fuse.js Fuzzy Fallback
    const fuseResults = this.fuse.search(query, { limit });
    for (const res of fuseResults) {
      if (!resultMap.has(res.item.id)) {
        resultMap.set(res.item.id, {
          ...res.item,
          matchType: 'FUZZY',
        });
      }
    }

    return Array.from(resultMap.values()).slice(0, limit);
  }
}
