import { Search, SlidersHorizontal, LayoutGrid, List, AlertTriangle, X } from 'lucide-react';
import { InventoryCategory } from '../types';
import { CATEGORIES } from '../lib/constants';
import { CategoryIcon } from './CategoryIcon';

export type SortOption = 'name-asc' | 'name-desc' | 'qty-asc' | 'qty-desc' | 'updated-desc';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: InventoryCategory | 'All';
  onCategoryChange: (category: InventoryCategory | 'All') => void;
  lowStockOnly: boolean;
  onToggleLowStock: () => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFilteredCount: number;
}

export function InventoryFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  lowStockOnly,
  onToggleLowStock,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}: FilterBarProps) {
  const categories: (InventoryCategory | 'All')[] = ['All', 'Malts', 'Hops', 'Yeast', 'Misc'];

  return (
    <div className="space-y-2.5 rounded-xs border border-[#D1CFCA] bg-[#F1EFE9] p-3 shadow-xs">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7A7770]" />
          <input
            id="input-search-inventory"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items by name, notes, or lot number..."
            className="w-full rounded-xs border border-[#D1CFCA] bg-[#F9F8F6] py-1.5 pl-9 pr-8 text-xs text-[#1A1A1A] placeholder:text-[#949189] focus:border-[#E67E22] focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#7A7770] hover:text-[#1A1A1A]"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Controls right */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Low Stock Toggle */}
          <button
            id="btn-filter-low-stock"
            type="button"
            onClick={onToggleLowStock}
            className={`inline-flex items-center gap-1.5 rounded-xs border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none ${
              lowStockOnly
                ? 'border-[#E67E22] bg-[#E67E22] text-[#1A1A1A] shadow-xs'
                : 'border-[#D1CFCA] bg-[#F9F8F6] text-[#4A4740] hover:bg-[#E0DED7]'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Low Stock</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xs border border-[#D1CFCA] bg-[#F9F8F6] px-2 py-1.5 text-xs text-[#1A1A1A]">
            <SlidersHorizontal className="h-3 w-3 text-[#7A7770]" />
            <select
              id="select-sort-order"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sort inventory items"
              className="bg-transparent text-xs font-bold text-[#1A1A1A] focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="qty-asc">Qty (Low → High)</option>
              <option value="qty-desc">Qty (High → Low)</option>
              <option value="updated-desc">Recently Updated</option>
            </select>
          </div>

          {/* Grid vs Table View Mode */}
          <div className="flex rounded-xs border border-[#D1CFCA] bg-[#E0DED7] p-0.5">
            <button
              id="btn-view-grid"
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={`rounded-xs p-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
                  : 'text-[#6B6860] hover:text-[#1A1A1A]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              id="btn-view-table"
              type="button"
              onClick={() => onViewModeChange('table')}
              title="Table View"
              className={`rounded-xs p-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
                  : 'text-[#6B6860] hover:text-[#1A1A1A]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D1CFCA]">
        <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-[#6B6860]">
          Category:
        </span>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const meta = cat !== 'All' ? CATEGORIES[cat] : null;

          return (
            <button
              key={cat}
              id={`tab-category-${cat.toLowerCase()}`}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all border ${
                isSelected
                  ? 'bg-[#1A1A1A] text-[#F9F8F6] border-[#1A1A1A] shadow-xs'
                  : 'bg-[#E0DED7] text-[#4A4740] border-[#D1CFCA] hover:bg-[#D6D4CC] hover:text-[#1A1A1A]'
              }`}
            >
              {meta && <CategoryIcon category={cat as InventoryCategory} className="h-3 w-3" />}
              <span>{cat}</span>
            </button>
          );
        })}

        <div className="ml-auto text-xs text-[#6B6860]">
          Count: <span className="font-mono-dense font-bold text-[#1A1A1A]">{totalFilteredCount}</span> items
        </div>
      </div>
    </div>
  );
}
