import { useState } from 'react';
import { Edit2, Trash2, AlertTriangle, Tag } from 'lucide-react';
import { InventoryItem } from '../types';
import { CATEGORIES } from '../lib/constants';
import { CategoryIcon } from './CategoryIcon';

interface ItemTableRowProps {
  key?: string;
  item: InventoryItem;
  onQuickAdjust: (id: string, delta: number) => Promise<void>;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function ItemTableRow({ item, onQuickAdjust, onEdit, onDelete }: ItemTableRowProps) {
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

  return (
    <tr
      id={`table-row-${item.id}`}
      className={`border-b border-[#D1CFCA] transition-colors hover:bg-[#F1EFE9] ${
        isLowStock ? 'bg-[#FFF7ED]/60' : ''
      }`}
    >
      {/* Name and lot */}
      <td className="py-2.5 pl-3 pr-2 sm:pl-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1A1A1A] text-xs sm:text-sm">{item.name}</span>
            {isLowStock && (
              <span className="inline-flex items-center gap-1 rounded-xs bg-[#E67E22] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#1A1A1A]">
                <AlertTriangle className="h-2.5 w-2.5" />
                Low Stock
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#6B6860]">
            {item.lotNumber && (
              <span className="inline-flex items-center gap-1 font-mono-dense text-[11px]">
                <Tag className="h-3 w-3 text-[#7A7770]" />
                LOT: {item.lotNumber}
              </span>
            )}
            {item.notes && <span className="line-clamp-1 italic text-[#4A4740]">{item.notes}</span>}
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-2 py-2.5 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1 rounded-xs px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-[#D1CFCA] ${meta.badgeBg} ${meta.badgeText}`}
        >
          <CategoryIcon category={item.category} className="h-3 w-3" />
          {item.category}
        </span>
      </td>

      {/* Quantity */}
      <td className="px-2 py-2.5 whitespace-nowrap">
        <div className="flex items-baseline gap-1">
          <span
            className={`font-mono-dense text-base font-black ${
              item.quantity === 0
                ? 'text-red-600'
                : isLowStock
                ? 'text-[#E67E22]'
                : 'text-[#1A1A1A]'
            }`}
          >
            {item.quantity.toLocaleString(undefined, { maximumFractionDigits: 3 })}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6860]">{item.unit}</span>
        </div>
        {item.minThreshold !== undefined && item.minThreshold > 0 && (
          <p className="text-[10px] text-[#7A7770] font-mono-dense">MIN: {item.minThreshold}</p>
        )}
      </td>

      {/* Quick Adjust */}
      <td className="px-2 py-2.5 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <button
            id={`btn-tbl-minus5-${item.id}`}
            type="button"
            disabled={isAdjusting || item.quantity <= 0}
            onClick={() => handleAdjust(-5)}
            className="rounded-xs border border-[#D1CFCA] bg-[#EEECE7] px-2 py-1 text-xs font-mono-dense font-bold text-[#1A1A1A] hover:bg-[#E0DED7] disabled:opacity-40"
            title="Subtract 5"
          >
            -5
          </button>
          <button
            id={`btn-tbl-minus1-${item.id}`}
            type="button"
            disabled={isAdjusting || item.quantity <= 0}
            onClick={() => handleAdjust(-1)}
            className="rounded-xs border border-[#D1CFCA] bg-[#EEECE7] px-2 py-1 text-xs font-mono-dense font-bold text-[#1A1A1A] hover:bg-[#E0DED7] disabled:opacity-40"
            title="Subtract 1"
          >
            -1
          </button>
          <button
            id={`btn-tbl-plus1-${item.id}`}
            type="button"
            disabled={isAdjusting}
            onClick={() => handleAdjust(1)}
            className="rounded-xs border border-[#E67E22] bg-[#F1EFE9] px-2 py-1 text-xs font-mono-dense font-bold text-[#E67E22] hover:bg-[#E67E22] hover:text-[#1A1A1A] disabled:opacity-40"
            title="Add 1"
          >
            +1
          </button>
          <button
            id={`btn-tbl-plus5-${item.id}`}
            type="button"
            disabled={isAdjusting}
            onClick={() => handleAdjust(5)}
            className="rounded-xs border border-[#E67E22] bg-[#F1EFE9] px-2 py-1 text-xs font-mono-dense font-bold text-[#E67E22] hover:bg-[#E67E22] hover:text-[#1A1A1A] disabled:opacity-40"
            title="Add 5"
          >
            +5
          </button>
        </div>
      </td>

      {/* Actions */}
      <td className="py-2.5 pl-2 pr-3 sm:pr-4 whitespace-nowrap text-right text-xs">
        <div className="flex items-center justify-end gap-1">
          <button
            id={`btn-tbl-edit-${item.id}`}
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-xs p-1 text-[#7A7770] hover:bg-[#E0DED7] hover:text-[#1A1A1A] transition-colors"
            title="Edit item"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            id={`btn-tbl-delete-${item.id}`}
            type="button"
            onClick={() => onDelete(item)}
            className="rounded-xs p-1 text-[#7A7770] hover:bg-red-100 hover:text-red-700 transition-colors"
            title="Delete item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
