/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { InventoryFilterBar, SortOption } from './components/InventoryFilterBar';
import { ItemCard } from './components/ItemCard';
import { ItemTableRow } from './components/ItemTableRow';
import { ItemModal } from './components/ItemModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ImportExportModal } from './components/ImportExportModal';
import { CategoryIcon } from './components/CategoryIcon';
import {
  fetchInventory,
  createItem,
  updateItem,
  deleteItem,
  quickAdjustQuantity,
  resetSampleData,
} from './lib/api';
import { InventoryItem, InventoryCategory, InventoryStats } from './types';
import { CATEGORIES } from './lib/constants';
import { Plus, PackageOpen, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | 'All'>('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Load items from API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInventory();
      setItems(data);
    } catch (err: any) {
      console.error('Failed to load inventory:', err);
      setError(err.message || 'Failed to connect to brewery inventory server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute Statistics
  const stats: InventoryStats = useMemo(() => {
    const categoryCounts: Record<InventoryCategory, number> = {
      Malts: 0,
      Hops: 0,
      Yeast: 0,
      Misc: 0,
    };

    let lowStockCount = 0;

    items.forEach((item) => {
      if (categoryCounts[item.category] !== undefined) {
        categoryCounts[item.category]++;
      }
      if (item.minThreshold !== undefined && item.minThreshold > 0 && item.quantity <= item.minThreshold) {
        lowStockCount++;
      }
    });

    return {
      totalItems: items.length,
      totalCategories: 4,
      lowStockCount,
      categoryCounts,
    };
  }, [items]);

  // Filter and Sort Items
  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }

        // Low stock filter
        if (lowStockOnly) {
          const isLow = item.minThreshold !== undefined && item.minThreshold > 0 && item.quantity <= item.minThreshold;
          if (!isLow) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = item.name.toLowerCase().includes(q);
          const matchesNotes = item.notes?.toLowerCase().includes(q) || false;
          const matchesLot = item.lotNumber?.toLowerCase().includes(q) || false;
          const matchesCategory = item.category.toLowerCase().includes(q);
          if (!matchesName && !matchesNotes && !matchesLot && !matchesCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'qty-asc':
            return a.quantity - b.quantity;
          case 'qty-desc':
            return b.quantity - a.quantity;
          case 'updated-desc':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          default:
            return 0;
        }
      });
  }, [items, selectedCategory, lowStockOnly, searchQuery, sortOption]);

  // Quick Quantity Adjust handler (Optimistic update)
  const handleQuickAdjust = async (id: string, delta: number) => {
    // Save previous state for rollback if network fails
    const prevItems = [...items];

    // Optimistically update state
    setItems((curr) =>
      curr.map((i) => {
        if (i.id === id) {
          const newQty = Math.max(0, Math.round((i.quantity + delta) * 1000) / 1000);
          return { ...i, quantity: newQty, updatedAt: new Date().toISOString() };
        }
        return i;
      })
    );

    try {
      const updated = await quickAdjustQuantity(id, delta);
      setItems((curr) => curr.map((i) => (i.id === id ? updated : i)));
    } catch (err: any) {
      console.error('Quick adjust failed:', err);
      // Rollback
      setItems(prevItems);
      alert(`Failed to update quantity: ${err.message || 'Server error'}`);
    }
  };

  // Add / Edit save handler
  const handleSaveItem = async (itemData: {
    name: string;
    category: InventoryCategory;
    quantity: number;
    unit: string;
    notes?: string;
    minThreshold?: number;
    lotNumber?: string;
  }) => {
    if (editingItem) {
      const updated = await updateItem(editingItem.id, itemData);
      setItems((curr) => curr.map((i) => (i.id === updated.id ? updated : i)));
      setEditingItem(null);
    } else {
      const created = await createItem(itemData);
      setItems((curr) => [created, ...curr]);
    }
  };

  // Delete confirm handler
  const handleConfirmDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await deleteItem(id);
      setItems((curr) => curr.filter((i) => i.id !== id));
      setDeletingItem(null);
    } catch (err: any) {
      alert(`Failed to delete item: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset sample data
  const handleResetSampleData = async () => {
    try {
      setIsResetting(true);
      const sampleItems = await resetSampleData();
      setItems(sampleItems);
    } catch (err: any) {
      alert(`Failed to reload sample items: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#E67E22]/30 selection:text-[#1A1A1A]">
      {/* Top Navigation */}
      <Navbar
        onOpenAddModal={() => {
          setEditingItem(null);
          setIsAddModalOpen(true);
        }}
        onOpenImportExportModal={() => setIsImportExportOpen(true)}
        onResetSampleData={handleResetSampleData}
        totalItems={stats.totalItems}
        lowStockCount={stats.lowStockCount}
        isResetting={isResetting}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 lg:px-8 space-y-4">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center justify-between rounded-xs bg-red-50 p-3 text-red-900 border border-red-300 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Failed to load inventory data</p>
                <p className="text-[11px] text-red-700">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 rounded-xs bg-red-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-red-900 hover:bg-red-200 border border-red-300"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 4 Fixed Categories Stats Overview Cards */}
        <StatsOverview
          stats={stats}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Search, Category, Sorting & View Filter Bar */}
        <InventoryFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          lowStockOnly={lowStockOnly}
          onToggleLowStock={() => setLowStockOnly(!lowStockOnly)}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredAndSortedItems.length}
        />

        {/* Inventory Item Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xs border border-[#D1CFCA] bg-[#F1EFE9] p-8 text-center shadow-xs">
            <RefreshCw className="h-6 w-6 animate-spin text-[#E67E22] mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Loading Brewery Inventory...</p>
            <p className="text-[11px] text-[#7A7770]">Fetching malts, hops, yeast & supplies</p>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-xs border border-dashed border-[#D1CFCA] bg-[#F1EFE9]/60 p-8 text-center shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-[#E0DED7] text-[#1A1A1A] mb-2.5 border border-[#D1CFCA]">
              <PackageOpen className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">No inventory items found</h3>
            <p className="mt-1 max-w-sm text-xs text-[#6B6860]">
              {searchQuery || lowStockOnly || selectedCategory !== 'All'
                ? 'No items match your active filters or search terms.'
                : 'Your brewery inventory is currently empty. Add items or reload initial sample items.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {(searchQuery || lowStockOnly || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setLowStockOnly(false);
                  }}
                  className="rounded-xs border border-[#D1CFCA] bg-[#F9F8F6] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#E0DED7]"
                >
                  Clear Filters
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xs bg-[#E67E22] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#F1C40F] shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.8]" />
                <span>
                  {selectedCategory !== 'All' ? `Add ${selectedCategory} Item` : 'Add New Item'}
                </span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onQuickAdjust={handleQuickAdjust}
                onEdit={(itm) => {
                  setEditingItem(itm);
                  setIsAddModalOpen(true);
                }}
                onDelete={(itm) => setDeletingItem(itm)}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-hidden rounded-xs border border-[#D1CFCA] bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#D1CFCA] text-left">
                <thead className="bg-[#EEECE7] text-[10px] font-black uppercase tracking-wider text-[#6B6860]">
                  <tr>
                    <th scope="col" className="py-2.5 pl-3 pr-2 sm:pl-4">
                      Item Name & Notes
                    </th>
                    <th scope="col" className="px-2 py-2.5">
                      Category
                    </th>
                    <th scope="col" className="px-2 py-2.5">
                      Stock Level
                    </th>
                    <th scope="col" className="px-2 py-2.5">
                      Quick Adjust
                    </th>
                    <th scope="col" className="py-2.5 pl-2 pr-3 sm:pr-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1CFCA] bg-white text-xs">
                  {filteredAndSortedItems.map((item) => (
                    <ItemTableRow
                      key={item.id}
                      item={item}
                      onQuickAdjust={handleQuickAdjust}
                      onEdit={(itm) => {
                        setEditingItem(itm);
                        setIsAddModalOpen(true);
                      }}
                      onDelete={(itm) => setDeletingItem(itm)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Category Breakdown quick summary at bottom */}
        {items.length > 0 && (
          <div className="rounded-xs border border-[#D1CFCA] bg-[#F1EFE9] p-3 text-xs text-[#6B6860] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-[#E67E22]" />
                <span className="font-bold uppercase tracking-wider text-[#1A1A1A]">Fixed Brewery Categories:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {(['Malts', 'Hops', 'Yeast', 'Misc'] as InventoryCategory[]).map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1">
                    <CategoryIcon category={cat} className="h-3 w-3 text-[#7A7770]" />
                    <span className="font-semibold uppercase tracking-wider text-[11px]">{cat}:</span>
                    <span className="font-mono-dense font-black text-[#1A1A1A]">{stats.categoryCounts[cat] || 0}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D1CFCA] bg-[#F9F8F6] py-3 text-center text-xs text-[#7A7770]">
        <div className="mx-auto max-w-7xl px-3 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p>© {new Date().getFullYear()} Craft Brewery Inventory System • Single-Page App & REST Backend</p>
          <p className="text-[11px] font-mono-dense text-[#8C8982]">Storage: ./data/inventory.json</p>
        </div>
      </footer>

      {/* Add / Edit Modal */}
      <ItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        editItem={editingItem}
        initialCategory={selectedCategory !== 'All' ? selectedCategory : 'Malts'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Backup & Restore Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        items={items}
        onImportSuccess={(newItems) => setItems(newItems)}
      />
    </div>
  );
}
