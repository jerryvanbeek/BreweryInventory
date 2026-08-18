export type InventoryCategory = 'Malts' | 'Hops' | 'Yeast' | 'Misc';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  notes?: string;
  minThreshold?: number;
  lotNumber?: string;
  updatedAt: string;
  createdAt: string;
}

export interface QuickAdjustPayload {
  delta: number;
}

export interface InventoryStats {
  totalItems: number;
  totalCategories: number;
  lowStockCount: number;
  categoryCounts: Record<InventoryCategory, number>;
}
