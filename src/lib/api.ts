import { InventoryItem, InventoryCategory } from '../types';

export const API_BASE = '/api';

export async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventory`);
  if (!res.ok) {
    throw new Error(`Failed to fetch inventory (${res.status})`);
  }
  const data = await res.json();
  return data.items || [];
}

export async function createItem(itemData: {
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  notes?: string;
  minThreshold?: number;
  lotNumber?: string;
}): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create item');
  }
  return data.item;
}

export async function updateItem(
  id: string,
  itemData: {
    name: string;
    category: InventoryCategory;
    quantity: number;
    unit: string;
    notes?: string;
    minThreshold?: number;
    lotNumber?: string;
  }
): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update item');
  }
  return data.item;
}

export async function quickAdjustQuantity(id: string, delta: number): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE}/inventory/${id}/adjust`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to adjust quantity');
  }
  return data.item;
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/inventory/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete item');
  }
}

export async function resetSampleData(): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventory/reset-sample`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to reset inventory');
  }
  return data.items;
}

export async function importInventory(items: Partial<InventoryItem>[]): Promise<InventoryItem[]> {
  const res = await fetch(`${API_BASE}/inventory/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to import inventory');
  }
  return data.items;
}
