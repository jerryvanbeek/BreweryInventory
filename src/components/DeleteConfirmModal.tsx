import { Trash2, AlertTriangle, X } from 'lucide-react';
import { InventoryItem } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  item,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-3 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-xs border border-[#D1CFCA] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-red-100 text-red-700 border border-red-200">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xs p-1 text-[#7A7770] hover:bg-[#E0DED7] hover:text-[#1A1A1A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A]">Delete Item?</h3>
          <p className="mt-1 text-xs text-[#4A4740]">
            Are you sure you want to remove <span className="font-bold text-[#1A1A1A]">{item.name}</span> ({item.quantity} {item.unit}) from your brewery inventory?
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#D1CFCA] pt-3">
          <button
            id="btn-cancel-delete"
            type="button"
            onClick={onClose}
            className="rounded-xs border border-[#D1CFCA] bg-[#EEECE7] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:bg-[#E0DED7]"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            disabled={isDeleting}
            onClick={() => onConfirm(item.id)}
            className="inline-flex items-center gap-1.5 rounded-xs bg-red-600 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Item'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
