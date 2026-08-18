import { useState, useEffect, type FormEvent } from 'react';
import { X, Sparkles, Check, AlertCircle } from 'lucide-react';
import { InventoryCategory, InventoryItem } from '../types';
import { CATEGORIES, COMMON_UNITS } from '../lib/constants';
import { CategoryIcon } from './CategoryIcon';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: {
    name: string;
    category: InventoryCategory;
    quantity: number;
    unit: string;
    notes?: string;
    minThreshold?: number;
    lotNumber?: string;
  }) => Promise<void>;
  editItem?: InventoryItem | null;
  initialCategory?: InventoryCategory;
}

export function ItemModal({
  isOpen,
  onClose,
  onSave,
  editItem,
  initialCategory = 'Malts',
}: ItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>(initialCategory);
  const [quantity, setQuantity] = useState<string>('0');
  const [unit, setUnit] = useState<string>('kg');
  const [customUnit, setCustomUnit] = useState<string>('');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [notes, setNotes] = useState('');
  const [minThreshold, setMinThreshold] = useState<string>('');
  const [lotNumber, setLotNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCategory(editItem.category);
      setQuantity(editItem.quantity.toString());
      if (COMMON_UNITS.includes(editItem.unit)) {
        setUnit(editItem.unit);
        setIsCustomUnit(false);
      } else {
        setIsCustomUnit(true);
        setCustomUnit(editItem.unit);
      }
      setNotes(editItem.notes || '');
      setMinThreshold(editItem.minThreshold ? editItem.minThreshold.toString() : '');
      setLotNumber(editItem.lotNumber || '');
    } else {
      setName('');
      setCategory(initialCategory);
      const defaultUnit = CATEGORIES[initialCategory].commonUnits[0] || 'kg';
      setUnit(defaultUnit);
      setIsCustomUnit(false);
      setCustomUnit('');
      setQuantity('1');
      setNotes('');
      setMinThreshold('');
      setLotNumber('');
    }
    setError(null);
  }, [editItem, initialCategory, isOpen]);

  const handleCategoryChange = (newCat: InventoryCategory) => {
    setCategory(newCat);
    if (!editItem && !isCustomUnit) {
      setUnit(CATEGORIES[newCat].commonUnits[0] || 'kg');
    }
  };

  const handleSuggestionClick = (suggestedName: string) => {
    setName(suggestedName);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter an item name');
      return;
    }

    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty < 0) {
      setError('Please enter a valid non-negative quantity');
      return;
    }

    const finalUnit = (isCustomUnit ? customUnit : unit).trim();
    if (!finalUnit) {
      setError('Please specify a unit of measurement');
      return;
    }

    const parsedMinThreshold = minThreshold.trim() ? parseFloat(minThreshold) : undefined;
    if (parsedMinThreshold !== undefined && (isNaN(parsedMinThreshold) || parsedMinThreshold < 0)) {
      setError('Minimum threshold must be a positive number');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        category,
        quantity: numQty,
        unit: finalUnit,
        notes: notes.trim(),
        minThreshold: parsedMinThreshold,
        lotNumber: lotNumber.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories: InventoryCategory[] = ['Malts', 'Hops', 'Yeast', 'Misc'];
  const currentMeta = CATEGORIES[category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-900/60 p-3 backdrop-blur-xs">
      <div
        id="modal-item-form"
        className="relative w-full max-w-lg overflow-hidden rounded-xs border border-[#D1CFCA] bg-white shadow-2xl transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#D1CFCA] bg-[#F1EFE9] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xs border border-[#D1CFCA] ${currentMeta.badgeBg} ${currentMeta.badgeText}`}>
              <CategoryIcon category={category} className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">
                {editItem ? 'Edit Inventory Item' : 'Add New Brewery Item'}
              </h2>
              <p className="text-[11px] text-[#6B6860]">
                {editItem ? 'Update details, quantity, or notes' : 'Track raw ingredients or brewing supplies'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal"
            type="button"
            onClick={onClose}
            className="rounded-xs p-1 text-[#7A7770] hover:bg-[#E0DED7] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 bg-[#F9F8F6]">
          {error && (
            <div className="flex items-center gap-2 rounded-xs bg-red-50 p-2.5 text-xs font-bold text-red-900 border border-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[#6B6860] mb-1">
              Category *
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {categories.map((cat) => {
                const meta = CATEGORIES[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex items-center gap-1.5 rounded-xs border p-2 text-left text-xs font-bold uppercase tracking-wider transition-all ${
                      isSelected
                        ? `bg-[#1A1A1A] text-[#F9F8F6] border-[#1A1A1A] shadow-xs`
                        : 'border-[#D1CFCA] bg-[#EEECE7] text-[#4A4740] hover:bg-[#E0DED7] hover:border-[#1A1A1A]'
                    }`}
                  >
                    <CategoryIcon category={cat} className="h-3.5 w-3.5 shrink-0" />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="input-item-name" className="block text-[10px] font-black uppercase tracking-wider text-[#6B6860]">
                Item Name *
              </label>
              {!editItem && (
                <span className="text-[10px] text-[#7A7770]">
                  e.g. Maris Otter, Citra, US-05
                </span>
              )}
            </div>
            <input
              id="input-item-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${category} item name...`}
              className="w-full rounded-xs border border-[#D1CFCA] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#E67E22] focus:outline-none"
            />

            {/* Quick Suggestions for category */}
            {!editItem && currentMeta.sampleSuggestions && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] text-[#7A7770]">
                  <Sparkles className="h-3 w-3 text-[#E67E22]" />
                  Suggestions:
                </span>
                {currentMeta.sampleSuggestions.slice(0, 4).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => handleSuggestionClick(sugg)}
                    className="rounded-xs bg-[#E0DED7] px-1.5 py-0.5 text-[10px] font-bold text-[#1A1A1A] border border-[#D1CFCA] hover:bg-[#E67E22] hover:text-[#1A1A1A] transition-colors"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity & Unit in 2 columns */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Quantity */}
            <div>
              <label htmlFor="input-item-quantity" className="block text-[10px] font-black uppercase tracking-wider text-[#6B6860] mb-1">
                Quantity *
              </label>
              <input
                id="input-item-quantity"
                type="number"
                step="any"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full font-mono-dense font-bold rounded-xs border border-[#D1CFCA] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#E67E22] focus:outline-none"
              />
            </div>

            {/* Unit */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#6B6860]">
                  Unit *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomUnit(!isCustomUnit);
                    if (!isCustomUnit) setCustomUnit('');
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#E67E22] hover:underline"
                >
                  {isCustomUnit ? 'Choose standard' : '+ Custom unit'}
                </button>
              </div>

              {isCustomUnit ? (
                <input
                  id="input-custom-unit"
                  type="text"
                  placeholder="e.g. barrels, crates, gal"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="w-full rounded-xs border border-[#D1CFCA] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#E67E22] focus:outline-none"
                />
              ) : (
                <select
                  id="select-item-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-xs border border-[#D1CFCA] bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A1A] focus:border-[#E67E22] focus:outline-none"
                >
                  {currentMeta.commonUnits.map((u) => (
                    <option key={u} value={u}>
                      {u} (common for {category})
                    </option>
                  ))}
                  <option disabled>──────────</option>
                  {COMMON_UNITS.filter((u) => !currentMeta.commonUnits.includes(u)).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Min Threshold & Lot Number */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="input-min-threshold" className="block text-[10px] font-black uppercase tracking-wider text-[#6B6860] mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                id="input-min-threshold"
                type="number"
                step="any"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                placeholder="e.g. 10 (warns when ≤ 10)"
                className="w-full font-mono-dense rounded-xs border border-[#D1CFCA] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#E67E22] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="input-lot-number" className="block text-[10px] font-black uppercase tracking-wider text-[#6B6860] mb-1">
                Lot / Batch Reference
              </label>
              <input
                id="input-lot-number"
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="e.g. LOT-2026-X"
                className="w-full rounded-xs border border-[#D1CFCA] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] font-mono-dense focus:border-[#E67E22] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="textarea-notes" className="block text-[10px] font-black uppercase tracking-wider text-[#6B6860] mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="textarea-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Supplier details, Alpha Acid %, crop year, storage temp, expiry date..."
              className="w-full rounded-xs border border-[#D1CFCA] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#E67E22] focus:outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D1CFCA]">
            <button
              id="btn-cancel-item"
              type="button"
              onClick={onClose}
              className="rounded-xs border border-[#D1CFCA] bg-[#EEECE7] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#E0DED7] transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-item"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xs bg-[#E67E22] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] shadow-xs hover:bg-[#F1C40F] active:bg-[#D35400] disabled:opacity-50 transition-all"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.8]" />
              <span>{isSubmitting ? 'Saving...' : editItem ? 'Save Changes' : 'Add Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
