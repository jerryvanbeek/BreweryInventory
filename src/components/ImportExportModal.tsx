import { useState, useRef, type ChangeEvent } from 'react';
import { Download, Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { InventoryItem } from '../types';
import { importInventory } from '../lib/api';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onImportSuccess: (items: InventoryItem[]) => void;
}

export function ImportExportModal({ isOpen, onClose, items, onImportSuccess }: ImportExportModalProps) {
  const [importJsonText, setImportJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `brewery-inventory-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = ['Category', 'Item Name', 'Quantity', 'Unit', 'Min Threshold', 'Lot Number', 'Notes', 'Last Updated'];
    const rows = items.map((i) => [
      `"${i.category}"`,
      `"${i.name.replace(/"/g, '""')}"`,
      i.quantity,
      `"${i.unit}"`,
      i.minThreshold || 0,
      `"${(i.lotNumber || '').replace(/"/g, '""')}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
      `"${i.updatedAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `brewery-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setImportJsonText(text);
      } catch (err: any) {
        setError('Failed to read selected file');
      }
    };
    reader.readAsText(file);
  };

  const handleRunImport = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!importJsonText.trim()) {
      setError('Please paste JSON data or choose a JSON backup file');
      return;
    }

    try {
      setIsProcessing(true);
      let parsed: any;
      try {
        parsed = JSON.parse(importJsonText);
      } catch {
        throw new Error('Invalid JSON format. Please check the syntax.');
      }

      const itemsArray = Array.isArray(parsed) ? parsed : parsed.items;
      if (!Array.isArray(itemsArray)) {
        throw new Error('JSON must contain an array of inventory items.');
      }

      const updated = await importInventory(itemsArray);
      setSuccessMsg(`Successfully imported ${updated.length} inventory items!`);
      onImportSuccess(updated);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-3 backdrop-blur-xs">
      <div className="w-full max-w-xl overflow-hidden rounded-xs border border-[#D1CFCA] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D1CFCA] bg-[#F1EFE9] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-[#E67E22]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">Backup & Restore Inventory</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xs p-1 text-[#7A7770] hover:bg-[#E0DED7] hover:text-[#1A1A1A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 bg-[#F9F8F6]">
          {error && (
            <div className="flex items-center gap-2 rounded-xs bg-red-50 p-2.5 text-xs font-bold text-red-900 border border-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xs bg-emerald-50 p-2.5 text-xs font-bold text-emerald-900 border border-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-[#6B6860]">
              Export / Backup Inventory
            </h3>
            <p className="text-xs text-[#4A4740]">
              Download your complete brewery inventory as a JSON backup or CSV spreadsheet.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex items-center gap-1.5 rounded-xs border border-[#D1CFCA] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#E0DED7]"
              >
                <Download className="h-3.5 w-3.5 text-[#7A7770]" />
                JSON Backup (<span className="font-mono-dense">{items.length}</span> items)
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 rounded-xs border border-[#D1CFCA] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#E0DED7]"
              >
                <FileText className="h-3.5 w-3.5 text-[#7A7770]" />
                CSV Spreadsheet
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-1.5 border-t border-[#D1CFCA] pt-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-[#6B6860]">
                Import / Restore JSON
              </h3>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#E67E22] hover:underline"
              >
                <Upload className="h-3.5 w-3.5" />
                Select .json file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste inventory JSON data here or upload a file..."
              className="w-full rounded-xs border border-[#D1CFCA] bg-white p-2.5 font-mono-dense text-xs text-[#1A1A1A] focus:border-[#E67E22] focus:outline-none"
            />

            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={isProcessing || !importJsonText.trim()}
                onClick={handleRunImport}
                className="inline-flex items-center gap-1.5 rounded-xs bg-[#1A1A1A] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#F9F8F6] hover:bg-[#2B2B2B] disabled:opacity-40"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{isProcessing ? 'Importing...' : 'Restore / Overwrite Inventory'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
