import { InventoryCategory, InventoryStats } from '../types';
import { CATEGORIES } from '../lib/constants';
import { CategoryIcon } from './CategoryIcon';

interface StatsOverviewProps {
  stats: InventoryStats;
  selectedCategory: InventoryCategory | 'All';
  onSelectCategory: (category: InventoryCategory | 'All') => void;
}

export function StatsOverview({ stats, selectedCategory, onSelectCategory }: StatsOverviewProps) {
  const categoryKeys: InventoryCategory[] = ['Malts', 'Hops', 'Yeast', 'Misc'];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {categoryKeys.map((catKey) => {
        const meta = CATEGORIES[catKey];
        const count = stats.categoryCounts[catKey] || 0;
        const isSelected = selectedCategory === catKey;

        return (
          <button
            key={catKey}
            id={`stat-card-${catKey.toLowerCase()}`}
            type="button"
            onClick={() => onSelectCategory(isSelected ? 'All' : catKey)}
            className={`group relative overflow-hidden rounded-xs border p-3 text-left transition-all focus:outline-none ${
              isSelected
                ? 'border-[#E67E22] bg-[#F1EFE9] shadow-xs ring-1 ring-[#E67E22]'
                : 'border-[#D1CFCA] bg-[#EEECE7] hover:border-[#1A1A1A] hover:bg-[#F1EFE9]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#6B6860]">
                  {meta.name}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono-dense text-2xl font-black tracking-tight text-[#1A1A1A]">
                    {count}
                  </span>
                  <span className="text-[11px] font-semibold text-[#6B6860]">
                    {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xs border border-[#D1CFCA] ${
                  isSelected ? 'bg-[#E67E22] text-[#1A1A1A]' : 'bg-[#E0DED7] text-[#1A1A1A]'
                } transition-transform group-hover:scale-105`}
              >
                <CategoryIcon category={catKey} className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-2 truncate text-[10px] font-medium text-[#7A7770]">
              {meta.description.split(',')[0]}
            </p>

            {isSelected && (
              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E67E22]">
                <span>Active Filter</span>
                <span>• Click to reset</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
