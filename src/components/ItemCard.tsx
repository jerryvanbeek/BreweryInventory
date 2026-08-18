import { useState } from 'react';
import { Edit2, Trash2, AlertTriangle, Clock, Tag } from 'lucide-react';
import { InventoryItem } from '../types';
import { CATEGORIES } from '../lib/constants';
import { CategoryIcon } from './CategoryIcon';

interface ItemCardProps {
  key?: string;
  item: InventoryItem;
  onQuickAdjust: (id: string, delta: number) => Promise<void>;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function ItemCard({ item, onQuickAdjust, onEdit, onDelete }: ItemCardProps) {
  const [isAdjusting, setIsAdjusting] = useState(false);
  const meta = CATEGORIES[item.category] || CATEGORIES.Misc;

  const isLowStock = item.minThreshold !== undefined && item.minThreshold > 0 && item.quantity <= item.minThreshold;

  const handleAdjust = async (delta: number) => {
    try {
      setIsAdjusting(true);
      await onQuickAdjust(item.id, delta);
    } finally {
      setIsAdjusting(false);
    }
  };

  const formattedDate = new Date(item.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id={`item-card-${item.id}`}
      className={`group relative flex flex-col justify-between rounded-xs border bg-white p-3.5 shadow-xs transition-all hover:border-[#1A1A1A] ${
        isLowStock ? 'border-[#E67E22] ring-1 ring-[#E67E22]/60' : 'border-[#D1CFCA]'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          {/* Category Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-xs px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-[#D1CFCA] ${meta.badgeBg} ${meta.badgeText}`}
          >
            <CategoryIcon category={item.category} className="h-3 w-3" />
            {item.category}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5">
            <button
              id={`btn-edit-${item.id}`}
              type="button"
              onClick={() => onEdit(item)}
              title="Edit item"
              className="rounded-xs p-1 text-[#7A7770] hover:bg-[#E0DED7] hover:text-[#1A1A1A] transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              id={`btn-delete-${item.id}`}
              type="button"
              onClick={() => onDelete(item)}
              title="Delete item"
              className="rounded-xs p-1 text-[#7A7770] hover:bg-red-100 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Item Title & Lot */}
        <div className="mt-2">
          <h3 className="text-sm font-bold text-[#1A1A1A] leading-tight line-clamp-2">
            {item.name}
          </h3>
          {item.lotNumber && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#6B6860] font-mono-dense">
              <Tag className="h-3 w-3 text-[#7A7770]" />
              LOT: {item.lotNumber}
            </p>
          )}
        </div>

        {/* Notes */}
        {item.notes ? (
          <p className="mt-2 text-[11px] text-[#4A4740] line-clamp-2 bg-[#F1EFE9] rounded-xs p-1.5 border border-[#D1CFCA]">
            {item.notes}
          </p>
        ) : (
          <div className="h-1.5" />
        )}
      </div>

      {/* Center / Bottom Quantity Section */}
      <div className="mt-3 pt-2.5 border-t border-[#D1CFCA]">
        {/* Quantity Display */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-mono-dense text-2xl font-black tracking-tight ${
                item.quantity === 0
                  ? 'text-red-600'
                  : isLowStock
                  ? 'text-[#E67E22]'
                  : 'text-[#1A1A1A]'
              }`}
            >
              {item.quantity.toLocaleString(undefined, { maximumFractionDigits: 3 })}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6860]">{item.unit}</span>
          </div>

          {isLowStock && (
            <span className="inline-flex items-center gap-1 rounded-xs bg-[#E67E22] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#1A1A1A]">
              <AlertTriangle className="h-2.5 w-2.5" />
              Low (≤{item.minThreshold})
            </span>
          )}
        </div>

        {/* Quick Adjust Buttons */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#7A7770]">
            <span>Quick Adjust</span>
            {isAdjusting && <span className="text-[#E67E22] font-black animate-pulse">Syncing...</span>}
          </div>

          <div className="grid grid-cols-4 gap-1">
            <button
              id={`btn-adjust-minus5-${item.id}`}
              type="button"
              disabled={isAdjusting || item.quantity <= 0}
              onClick={() => handleAdjust(-5)}
              className="rounded-xs border border-[#D1CFCA] bg-[#EEECE7] py-1 text-xs font-mono-dense font-bold text-[#1A1A1A] hover:bg-[#E0DED7] hover:border-[#1A1A1A] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
              title="Subtract 5 units"
            >
              -5
            </button>
            <button
              id={`btn-adjust-minus1-${item.id}`}
              type="button"
              disabled={isAdjusting || item.quantity <= 0}
              onClick={() => handleAdjust(-1)}
              className="rounded-xs border border-[#D1CFCA] bg-[#EEECE7] py-1 text-xs font-mono-dense font-bold text-[#1A1A1A] hover:bg-[#E0DED7] hover:border-[#1A1A1A] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
              title="Subtract 1 unit"
            >
              -1
            </button>
            <button
              id={`btn-adjust-plus1-${item.id}`}
              type="button"
              disabled={isAdjusting}
              onClick={() => handleAdjust(1)}
              className="rounded-xs border border-[#E67E22] bg-[#F1EFE9] py-1 text-xs font-mono-dense font-bold text-[#E67E22] hover:bg-[#E67E22] hover:text-[#1A1A1A] active:scale-95 disabled:opacity-40 transition-all"
              title="Add 1 unit"
            >
              +1
            </button>
            <button
              id={`btn-adjust-plus5-${item.id}`}
              type="button"
              disabled={isAdjusting}
              onClick={() => handleAdjust(5)}
              className="rounded-xs border border-[#E67E22] bg-[#F1EFE9] py-1 text-xs font-mono-dense font-bold text-[#E67E22] hover:bg-[#E67E22] hover:text-[#1A1A1A] active:scale-95 disabled:opacity-40 transition-all"
              title="Add 5 units"
            >
              +5
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#7A7770] border-t border-[#D1CFCA] pt-1.5 font-mono-dense">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {formattedDate}
          </span>
          {item.minThreshold !== undefined && item.minThreshold > 0 && (
            <span>MIN: {item.minThreshold} {item.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}
