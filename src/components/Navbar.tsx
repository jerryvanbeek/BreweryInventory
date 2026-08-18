import { Beer, Plus, Download, Upload, RotateCcw, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenImportExportModal: () => void;
  onResetSampleData: () => void;
  totalItems: number;
  lowStockCount: number;
  isResetting: boolean;
}

export function Navbar({
  onOpenAddModal,
  onOpenImportExportModal,
  onResetSampleData,
  totalItems,
  lowStockCount,
  isResetting,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#D1CFCA] bg-[#1A1A1A] text-[#F9F8F6] shadow-xs">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#E67E22] text-[#1A1A1A] font-black shadow-xs">
              <Beer className="h-5 w-5 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-[#F9F8F6] sm:text-base uppercase tracking-wider">
                  Hop & Kettle Inventory
                </h1>
                <span className="hidden rounded-xs bg-[#2B2B2B] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F1C40F] sm:inline-block border border-[#3D3D3D]">
                  Craft Brewery
                </span>
              </div>
              <p className="text-[11px] text-[#A6A49F]">
                <span className="font-mono-dense font-bold text-[#F9F8F6]">{totalItems}</span> total items recorded {lowStockCount > 0 && `• `}
                {lowStockCount > 0 && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#E67E22]">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-mono-dense">{lowStockCount}</span> low stock
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-import-export"
              type="button"
              onClick={onOpenImportExportModal}
              title="Backup & Restore Inventory Data"
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#3D3D3D] bg-[#2B2B2B] px-2.5 py-1.5 text-xs font-semibold text-[#E0DED7] hover:bg-[#383838] hover:text-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Backup / Restore</span>
            </button>

            <button
              id="btn-reset-sample"
              type="button"
              disabled={isResetting}
              onClick={() => {
                if (window.confirm('Reset all inventory back to standard craft brewery sample items?')) {
                  onResetSampleData();
                }
              }}
              title="Reload initial craft brewery sample data"
              className="inline-flex items-center gap-1.5 rounded-sm border border-[#3D3D3D] bg-[#2B2B2B] px-2.5 py-1.5 text-xs font-semibold text-[#A6A49F] hover:bg-[#383838] hover:text-white transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Reset Samples</span>
            </button>

            <button
              id="btn-add-item"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-sm bg-[#E67E22] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#F1C40F] active:bg-[#D35400] transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.8]" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
