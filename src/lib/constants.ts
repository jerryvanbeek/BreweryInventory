import { InventoryCategory } from '../types';

export interface CategoryMeta {
  id: InventoryCategory;
  name: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  cardAccent: string;
  lightBg: string;
  iconName: string;
  commonUnits: string[];
  sampleSuggestions: string[];
}

export const CATEGORIES: Record<InventoryCategory, CategoryMeta> = {
  Malts: {
    id: 'Malts',
    name: 'Malts',
    description: 'Base grains, specialty malts, flaked adjuncts & sugars',
    badgeBg: 'bg-[#E0DED7]',
    badgeText: 'text-[#1A1A1A]',
    borderColor: 'border-[#D1CFCA]',
    cardAccent: 'from-amber-500/10 to-transparent',
    lightBg: 'bg-[#E67E22]',
    iconName: 'Wheat',
    commonUnits: ['kg', 'g', 'lbs', 'bags (25kg)'],
    sampleSuggestions: ['Maris Otter', 'Pilsner Malt', 'Carafoam', 'Munich I', 'Vienna Malt', 'Flaked Oats', 'Chocolate Malt'],
  },
  Hops: {
    id: 'Hops',
    name: 'Hops',
    description: 'Pellet, whole leaf, cryo hops & extract oils',
    badgeBg: 'bg-[#E0DED7]',
    badgeText: 'text-[#1A1A1A]',
    borderColor: 'border-[#D1CFCA]',
    cardAccent: 'from-emerald-500/10 to-transparent',
    lightBg: 'bg-[#E67E22]',
    iconName: 'Sprout',
    commonUnits: ['g', 'kg', 'oz', 'lbs', 'packs'],
    sampleSuggestions: ['Citra (T-90)', 'Mosaic', 'Saaz', 'Cascade', 'Centennial', 'Simcoe', 'Galaxy', 'Amarillo'],
  },
  Yeast: {
    id: 'Yeast',
    name: 'Yeast',
    description: 'Dry sachets, liquid pitches, slants & cultures',
    badgeBg: 'bg-[#E0DED7]',
    badgeText: 'text-[#1A1A1A]',
    borderColor: 'border-[#D1CFCA]',
    cardAccent: 'from-violet-500/10 to-transparent',
    lightBg: 'bg-[#E67E22]',
    iconName: 'FlaskConical',
    commonUnits: ['packs', 'pouches', 'vials', 'slants', 'liters'],
    sampleSuggestions: ['SafAle US-05', 'White Labs WLP001', 'Verdant IPA', 'Saflager W-34/70', 'Kveik Voss', 'Belgian Abbey'],
  },
  Misc: {
    id: 'Misc',
    name: 'Misc',
    description: 'Water salts, finings, sanitizers, caps & packaging',
    badgeBg: 'bg-[#E0DED7]',
    badgeText: 'text-[#1A1A1A]',
    borderColor: 'border-[#D1CFCA]',
    cardAccent: 'from-sky-500/10 to-transparent',
    lightBg: 'bg-[#E67E22]',
    iconName: 'Boxes',
    commonUnits: ['items', 'liters', 'ml', 'g', 'kg', 'packs', 'boxes'],
    sampleSuggestions: ['Whirlfloc Tablets', 'Gypsum (CaSO4)', 'Calcium Chloride', 'Star San', 'Crown Bottle Caps', 'PBW Cleaner', 'Canning Lids'],
  },
};

export const COMMON_UNITS = ['kg', 'g', 'lbs', 'oz', 'packs', 'liters', 'ml', 'items', 'boxes'];
