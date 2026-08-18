import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { InventoryCategory, InventoryItem } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'inventory.db');
const LEGACY_JSON_FILE = path.join(DATA_DIR, 'inventory.json');

export const INITIAL_SAMPLE_ITEMS: InventoryItem[] = [
  // Malts
  {
    id: 'malt-1',
    name: 'Maris Otter Pale Malt',
    category: 'Malts',
    quantity: 125,
    unit: 'kg',
    notes: 'Base malt from Crisp Malting. Crisp, rich bready flavor. Moisture: 3.5%',
    minThreshold: 50,
    lotNumber: 'MO-2026-08',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-15T14:30:00.000Z',
  },
  {
    id: 'malt-2',
    name: 'Pilsner Malt (German)',
    category: 'Malts',
    quantity: 75,
    unit: 'kg',
    notes: 'Weyermann Premium Pilsner malt for lagers, pilsners and clean ales.',
    minThreshold: 40,
    lotNumber: 'WEY-90412',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-16T09:15:00.000Z',
  },
  {
    id: 'malt-3',
    name: 'Carafoam / Carapils',
    category: 'Malts',
    quantity: 15,
    unit: 'kg',
    notes: 'Foam stability and body enhancer without darkening the beer.',
    minThreshold: 10,
    lotNumber: 'CF-4481',
    createdAt: '2026-08-02T11:00:00.000Z',
    updatedAt: '2026-08-10T16:00:00.000Z',
  },
  {
    id: 'malt-4',
    name: 'Munich Type I',
    category: 'Malts',
    quantity: 30,
    unit: 'kg',
    notes: 'Provides malty backbone for ambers, bocks, and festbiers.',
    minThreshold: 15,
    lotNumber: 'MUN-1123',
    createdAt: '2026-08-02T11:30:00.000Z',
    updatedAt: '2026-08-12T11:20:00.000Z',
  },
  {
    id: 'malt-5',
    name: 'Flaked Oats',
    category: 'Malts',
    quantity: 8,
    unit: 'kg',
    notes: 'For Hazy NEIPAs and Stouts. Creamy mouthfeel and haze.',
    minThreshold: 15,
    lotNumber: 'OAT-772',
    createdAt: '2026-08-03T14:00:00.000Z',
    updatedAt: '2026-08-17T18:00:00.000Z',
  },

  // Hops
  {
    id: 'hop-1',
    name: 'Citra (T-90 Pellets)',
    category: 'Hops',
    quantity: 3500,
    unit: 'g',
    notes: 'AA: 13.2%, Crop Year: 2025. Intense citrus, tropical fruit, lychee.',
    minThreshold: 1000,
    lotNumber: 'CIT-25-YCH',
    createdAt: '2026-08-01T10:30:00.000Z',
    updatedAt: '2026-08-18T07:10:00.000Z',
  },
  {
    id: 'hop-2',
    name: 'Mosaic (T-90 Pellets)',
    category: 'Hops',
    quantity: 2200,
    unit: 'g',
    notes: 'AA: 12.0%, Crop Year: 2025. Blueberry, mango, pine notes.',
    minThreshold: 800,
    lotNumber: 'MOS-25-881',
    createdAt: '2026-08-01T10:35:00.000Z',
    updatedAt: '2026-08-16T15:45:00.000Z',
  },
  {
    id: 'hop-3',
    name: 'Saaz (Czech Pellets)',
    category: 'Hops',
    quantity: 900,
    unit: 'g',
    notes: 'AA: 3.8%, Classic noble hop for Bohemian Pilsners and Lagers.',
    minThreshold: 1000,
    lotNumber: 'SAAZ-CZ-41',
    createdAt: '2026-08-04T12:00:00.000Z',
    updatedAt: '2026-08-14T10:00:00.000Z',
  },
  {
    id: 'hop-4',
    name: 'Cascade (US)',
    category: 'Hops',
    quantity: 1400,
    unit: 'g',
    notes: 'AA: 6.8%, Floral, grapefruit aroma for Pale Ales.',
    minThreshold: 500,
    lotNumber: 'CAS-2025-03',
    createdAt: '2026-08-05T09:00:00.000Z',
    updatedAt: '2026-08-15T11:20:00.000Z',
  },

  // Yeast
  {
    id: 'yeast-1',
    name: 'SafAle US-05 Dry Yeast',
    category: 'Yeast',
    quantity: 18,
    unit: 'packs',
    notes: 'Fermentis 11.5g sachets. Clean American ale strain, low diacetyl.',
    minThreshold: 5,
    lotNumber: 'US05-EXP27',
    createdAt: '2026-08-01T10:45:00.000Z',
    updatedAt: '2026-08-17T12:00:00.000Z',
  },
  {
    id: 'yeast-2',
    name: 'White Labs WLP001 California Ale',
    category: 'Yeast',
    quantity: 3,
    unit: 'packs',
    notes: 'PurePitch Next Gen pouch. Keep strictly refrigerated at 2-4°C.',
    minThreshold: 4,
    lotNumber: 'WL-99201',
    createdAt: '2026-08-02T14:20:00.000Z',
    updatedAt: '2026-08-17T15:30:00.000Z',
  },
  {
    id: 'yeast-3',
    name: 'Lallemand Verdant IPA Yeast',
    category: 'Yeast',
    quantity: 12,
    unit: 'packs',
    notes: 'Prominent apricot notes with undertones of tropical fruit.',
    minThreshold: 6,
    lotNumber: 'VRD-2026',
    createdAt: '2026-08-03T16:00:00.000Z',
    updatedAt: '2026-08-16T17:10:00.000Z',
  },
  {
    id: 'yeast-4',
    name: 'Saflager W-34/70',
    category: 'Yeast',
    quantity: 2,
    unit: 'packs',
    notes: 'World-famous Weihenstephan strain for clean neutral lagers.',
    minThreshold: 4,
    lotNumber: 'W34-88',
    createdAt: '2026-08-06T10:00:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
  },

  // Misc
  {
    id: 'misc-1',
    name: 'Whirlfloc Tablets',
    category: 'Misc',
    quantity: 85,
    unit: 'items',
    notes: 'Kettle fining agent (Irish moss extract). Add 1 tablet per 25L at 10 min boil.',
    minThreshold: 20,
    lotNumber: 'WF-500',
    createdAt: '2026-08-01T11:00:00.000Z',
    updatedAt: '2026-08-12T14:00:00.000Z',
  },
  {
    id: 'misc-2',
    name: 'Gypsum (Calcium Sulfate / CaSO4)',
    category: 'Misc',
    quantity: 3200,
    unit: 'g',
    notes: 'Brewing water mineral salt to accentuate hop bitterness in IPAs.',
    minThreshold: 1000,
    lotNumber: 'GYP-101',
    createdAt: '2026-08-01T11:15:00.000Z',
    updatedAt: '2026-08-10T12:00:00.000Z',
  },
  {
    id: 'misc-3',
    name: 'Star San Sanitizer',
    category: 'Misc',
    quantity: 4.5,
    unit: 'liters',
    notes: 'No-rinse acid anionic sanitizer. Dilution: 1.5ml per liter of water.',
    minThreshold: 2,
    lotNumber: 'SS-992',
    createdAt: '2026-08-01T11:20:00.000Z',
    updatedAt: '2026-08-17T11:00:00.000Z',
  },
  {
    id: 'misc-4',
    name: 'Crown Bottle Caps (Gold 26mm)',
    category: 'Misc',
    quantity: 650,
    unit: 'items',
    notes: 'Oxygen absorbing crown caps for standard longneck bottles.',
    minThreshold: 200,
    lotNumber: 'CAP-26G',
    createdAt: '2026-08-02T13:00:00.000Z',
    updatedAt: '2026-08-14T16:20:00.000Z',
  },
  {
    id: 'misc-5',
    name: 'PBW (Powdered Brewery Wash)',
    category: 'Misc',
    quantity: 5000,
    unit: 'g',
    notes: 'Alkali cleaner safe for stainless steel, kegs, and glass fermenters.',
    minThreshold: 1500,
    lotNumber: 'PBW-2026',
    createdAt: '2026-08-04T15:00:00.000Z',
    updatedAt: '2026-08-16T10:00:00.000Z',
  },
];

interface SQLiteItemRow {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  notes: string | null;
  min_threshold: number | null;
  lot_number: string | null;
  created_at: string;
  updated_at: string;
}

let dbInstance: DatabaseSync | null = null;

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function rowToItem(row: SQLiteItemRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category as InventoryCategory,
    quantity: row.quantity,
    unit: row.unit,
    notes: row.notes || '',
    minThreshold: row.min_threshold !== null && row.min_threshold !== undefined ? Number(row.min_threshold) : 0,
    lotNumber: row.lot_number || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  ensureDataDirectory();
  const db = new DatabaseSync(DB_FILE);

  // Performance and concurrency settings
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
  `);

  // Schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Malts', 'Hops', 'Yeast', 'Misc')),
      quantity REAL NOT NULL DEFAULT 0 CHECK(quantity >= 0),
      unit TEXT NOT NULL,
      notes TEXT DEFAULT '',
      min_threshold REAL DEFAULT 0,
      lot_number TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
    CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
  `);

  // Migration & seed verification
  const countRow = db.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number } | undefined;
  const count = countRow?.count ?? 0;

  if (count === 0) {
    let migratedFromLegacy = false;

    // Check if legacy inventory.json exists for automatic one-time migration
    if (fs.existsSync(LEGACY_JSON_FILE)) {
      try {
        const rawJson = fs.readFileSync(LEGACY_JSON_FILE, 'utf-8');
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          insertItemsTransaction(db, parsed);
          migratedFromLegacy = true;
          console.log(`[SQLite Migration] Successfully migrated ${parsed.length} items from ${LEGACY_JSON_FILE} into SQLite database ${DB_FILE}. (Preserved JSON file as backup)`);
        }
      } catch (err) {
        console.error('[SQLite Migration] Warning: Failed to parse existing inventory.json for migration:', err);
      }
    }

    // If no legacy items imported, seed with sample items
    if (!migratedFromLegacy) {
      insertItemsTransaction(db, INITIAL_SAMPLE_ITEMS);
      console.log(`[SQLite Database] Initialized and seeded ${INITIAL_SAMPLE_ITEMS.length} sample brewery items into ${DB_FILE}`);
    }
  }

  dbInstance = db;
  return dbInstance;
}

function insertItemsTransaction(db: DatabaseSync, items: InventoryItem[]): void {
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO items (
      id, name, category, quantity, unit, notes, min_threshold, lot_number, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  try {
    for (const item of items) {
      insertStmt.run(
        item.id,
        item.name,
        item.category,
        item.quantity,
        item.unit,
        item.notes || '',
        item.minThreshold ?? 0,
        item.lotNumber || null,
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString()
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/**
 * Loads all inventory items from SQLite database.
 */
export function loadInventory(): InventoryItem[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM items ORDER BY created_at DESC');
  const rows = stmt.all() as unknown as SQLiteItemRow[];
  return rows.map(rowToItem);
}

/**
 * Saves/replaces all inventory items in SQLite database in an atomic transaction.
 */
export function saveInventory(items: InventoryItem[]): void {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    db.exec('DELETE FROM items');
    const insertStmt = db.prepare(`
      INSERT INTO items (
        id, name, category, quantity, unit, notes, min_threshold, lot_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      insertStmt.run(
        item.id,
        item.name,
        item.category,
        item.quantity,
        item.unit,
        item.notes || '',
        item.minThreshold ?? 0,
        item.lotNumber || null,
        item.createdAt,
        item.updatedAt
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/**
 * Resets SQLite database to the initial sample brewery items.
 */
export function resetToSampleInventory(): InventoryItem[] {
  saveInventory(INITIAL_SAMPLE_ITEMS);
  return INITIAL_SAMPLE_ITEMS;
}

/**
 * Gets a single item by its ID.
 */
export function getItemById(id: string): InventoryItem | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
  const row = stmt.get(id) as unknown as SQLiteItemRow | undefined;
  return row ? rowToItem(row) : null;
}

/**
 * Inserts a single item into SQLite.
 */
export function insertItem(item: InventoryItem): InventoryItem {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO items (
      id, name, category, quantity, unit, notes, min_threshold, lot_number, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    item.id,
    item.name,
    item.category,
    item.quantity,
    item.unit,
    item.notes || '',
    item.minThreshold ?? 0,
    item.lotNumber || null,
    item.createdAt,
    item.updatedAt
  );

  return item;
}

/**
 * Updates an existing item in SQLite.
 */
export function updateItemInDb(item: InventoryItem): InventoryItem {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE items SET
      name = ?,
      category = ?,
      quantity = ?,
      unit = ?,
      notes = ?,
      min_threshold = ?,
      lot_number = ?,
      updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    item.name,
    item.category,
    item.quantity,
    item.unit,
    item.notes || '',
    item.minThreshold ?? 0,
    item.lotNumber || null,
    item.updatedAt,
    item.id
  );

  return item;
}

/**
 * Atomically adjusts quantity of an item by delta.
 */
export function quickAdjustQuantity(id: string, delta: number): { item: InventoryItem; previousQuantity: number } | null {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const getStmt = db.prepare('SELECT * FROM items WHERE id = ?');
    const row = getStmt.get(id) as unknown as SQLiteItemRow | undefined;
    if (!row) {
      db.exec('ROLLBACK');
      return null;
    }

    const previousQuantity = row.quantity;
    const newQuantity = Math.max(0, Math.round((previousQuantity + delta) * 1000) / 1000);
    const now = new Date().toISOString();

    const updateStmt = db.prepare('UPDATE items SET quantity = ?, updated_at = ? WHERE id = ?');
    updateStmt.run(newQuantity, now, id);

    db.exec('COMMIT');

    const updatedRow = getStmt.get(id) as unknown as SQLiteItemRow;
    return {
      item: rowToItem(updatedRow),
      previousQuantity,
    };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/**
 * Deletes an item by ID from SQLite.
 */
export function deleteItemFromDb(id: string): InventoryItem | null {
  const db = getDatabase();
  const getStmt = db.prepare('SELECT * FROM items WHERE id = ?');
  const row = getStmt.get(id) as unknown as SQLiteItemRow | undefined;
  if (!row) {
    return null;
  }

  const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
  deleteStmt.run(id);

  return rowToItem(row);
}
