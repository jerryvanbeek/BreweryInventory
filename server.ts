import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  loadInventory,
  saveInventory,
  resetToSampleInventory,
  getItemById,
  insertItem,
  updateItemInDb,
  quickAdjustQuantity,
  deleteItemFromDb,
} from './server/storage';
import { InventoryCategory, InventoryItem } from './src/types';

const VALID_CATEGORIES: InventoryCategory[] = ['Malts', 'Hops', 'Yeast', 'Misc'];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', engine: 'sqlite', time: new Date().toISOString() });
  });

  // Get all inventory items
  app.get('/api/inventory', (req: Request, res: Response) => {
    try {
      const items = loadInventory();
      res.json({ success: true, items });
    } catch (err: any) {
      console.error('[API Error] Failed to get inventory items:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to read inventory from SQLite' });
    }
  });

  // Get single inventory item
  app.get('/api/inventory/:id', (req: Request, res: Response) => {
    try {
      const item = getItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }
      res.json({ success: true, item });
    } catch (err: any) {
      console.error('[API Error] Failed to get item:', err);
      res.status(500).json({ success: false, error: err.message || 'Database error' });
    }
  });

  // Add new inventory item
  app.post('/api/inventory', (req: Request, res: Response) => {
    try {
      const { name, category, quantity, unit, notes, minThreshold, lotNumber } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Item Name is required' });
      }

      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        });
      }

      const numQty = parseFloat(quantity);
      if (isNaN(numQty) || numQty < 0) {
        return res.status(400).json({ success: false, error: 'Quantity must be a valid non-negative number' });
      }

      if (!unit || typeof unit !== 'string' || !unit.trim()) {
        return res.status(400).json({ success: false, error: 'Unit of Measurement is required' });
      }

      const now = new Date().toISOString();
      const newItem: InventoryItem = {
        id: `item-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        name: name.trim(),
        category: category as InventoryCategory,
        quantity: Math.round(numQty * 1000) / 1000,
        unit: unit.trim(),
        notes: typeof notes === 'string' ? notes.trim() : '',
        minThreshold: minThreshold !== undefined && !isNaN(parseFloat(minThreshold)) ? Math.max(0, parseFloat(minThreshold)) : 0,
        lotNumber: typeof lotNumber === 'string' ? lotNumber.trim() : undefined,
        createdAt: now,
        updatedAt: now,
      };

      const saved = insertItem(newItem);
      res.status(201).json({ success: true, item: saved });
    } catch (err: any) {
      console.error('[API Error] Failed to create item in SQLite:', err);
      const isConstraint = err?.message?.includes('CHECK') || err?.code?.includes('CONSTRAINT');
      res.status(isConstraint ? 400 : 500).json({
        success: false,
        error: isConstraint ? 'Invalid item parameters or constraint violation' : err.message || 'Database error',
      });
    }
  });

  // Update existing inventory item
  app.put('/api/inventory/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, category, quantity, unit, notes, minThreshold, lotNumber } = req.body;

      const existing = getItemById(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Item Name is required' });
      }

      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
        });
      }

      const numQty = parseFloat(quantity);
      if (isNaN(numQty) || numQty < 0) {
        return res.status(400).json({ success: false, error: 'Quantity must be a valid non-negative number' });
      }

      if (!unit || typeof unit !== 'string' || !unit.trim()) {
        return res.status(400).json({ success: false, error: 'Unit of Measurement is required' });
      }

      const updatedItem: InventoryItem = {
        ...existing,
        name: name.trim(),
        category: category as InventoryCategory,
        quantity: Math.round(numQty * 1000) / 1000,
        unit: unit.trim(),
        notes: typeof notes === 'string' ? notes.trim() : '',
        minThreshold: minThreshold !== undefined && !isNaN(parseFloat(minThreshold)) ? Math.max(0, parseFloat(minThreshold)) : 0,
        lotNumber: typeof lotNumber === 'string' ? lotNumber.trim() : undefined,
        updatedAt: new Date().toISOString(),
      };

      const result = updateItemInDb(updatedItem);
      res.json({ success: true, item: result });
    } catch (err: any) {
      console.error('[API Error] Failed to update item in SQLite:', err);
      const isConstraint = err?.message?.includes('CHECK') || err?.code?.includes('CONSTRAINT');
      res.status(isConstraint ? 400 : 500).json({
        success: false,
        error: isConstraint ? 'Invalid item parameters or constraint violation' : err.message || 'Database error',
      });
    }
  });

  // Quick adjust quantity (+1, +5, -1, -5, etc.)
  app.patch('/api/inventory/:id/adjust', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { delta } = req.body;

      const numDelta = parseFloat(delta);
      if (isNaN(numDelta)) {
        return res.status(400).json({ success: false, error: 'Delta must be a valid number' });
      }

      const result = quickAdjustQuantity(id, numDelta);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }

      res.json({ success: true, item: result.item, previousQuantity: result.previousQuantity });
    } catch (err: any) {
      console.error('[API Error] Failed to quick adjust quantity:', err);
      res.status(500).json({ success: false, error: err.message || 'Database error during adjustment' });
    }
  });

  // Delete inventory item
  app.delete('/api/inventory/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = deleteItemFromDb(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }

      res.json({ success: true, deletedItem: deleted });
    } catch (err: any) {
      console.error('[API Error] Failed to delete item:', err);
      res.status(500).json({ success: false, error: err.message || 'Database error during deletion' });
    }
  });

  // Reset to initial sample brewery inventory
  app.post('/api/inventory/reset-sample', (req: Request, res: Response) => {
    try {
      const sampleItems = resetToSampleInventory();
      res.json({ success: true, items: sampleItems });
    } catch (err: any) {
      console.error('[API Error] Failed to reset inventory:', err);
      res.status(500).json({ success: false, error: err.message || 'Database error during reset' });
    }
  });

  // Export JSON backup
  app.get('/api/inventory/export', (req: Request, res: Response) => {
    try {
      const items = loadInventory();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="brewery-inventory-backup.json"');
      res.send(JSON.stringify(items, null, 2));
    } catch (err: any) {
      console.error('[API Error] Failed to export inventory:', err);
      res.status(500).json({ success: false, error: err.message || 'Database export error' });
    }
  });

  // Import JSON backup
  app.post('/api/inventory/import', (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Expected array of inventory items' });
      }

      const validItems: InventoryItem[] = [];
      for (const item of items) {
        if (item && item.name && VALID_CATEGORIES.includes(item.category) && typeof item.quantity === 'number') {
          validItems.push({
            id: item.id || `item-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
            name: String(item.name).trim(),
            category: item.category,
            quantity: Math.max(0, Number(item.quantity)),
            unit: String(item.unit || 'items').trim(),
            notes: item.notes ? String(item.notes).trim() : '',
            minThreshold: item.minThreshold !== undefined ? Number(item.minThreshold) : 0,
            lotNumber: item.lotNumber ? String(item.lotNumber).trim() : undefined,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (validItems.length === 0) {
        return res.status(400).json({ success: false, error: 'No valid inventory items found in import payload' });
      }

      saveInventory(validItems);
      res.json({ success: true, items: validItems, importedCount: validItems.length });
    } catch (err: any) {
      console.error('[API Error] Failed to import inventory into SQLite:', err);
      res.status(500).json({ success: false, error: err.message || 'Database error during import' });
    }
  });

  // --- Frontend Vite Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Brewery Inventory Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
