# Craft Brewery Inventory Manager 🍺

A lightweight, zero-configuration inventory management web application tailored specifically for craft breweries and microbreweries.

---

## 🌟 Features

- **Four Fixed Brewery Categories**:
  1. 🌾 **Malts**: Base grains, specialty malts, flaked adjuncts, and sugars.
  2. 🌿 **Hops**: Pellets (T-90, Cryo), whole leaf hops, and hop extracts.
  3. 🧪 **Yeast**: Dry sachets, liquid pitches, and lab cultures.
  4. 📦 **Misc**: Brewing water salts (Gypsum, CaCl2), kettle finings (Whirlfloc), sanitizers (Star San), bottle caps, and packaging supplies.
- **Quick Adjust Buttons**: Directly add (`+1`, `+5`) or subtract (`-1`, `-5`) ingredient quantities right from the dashboard or table view with instant optimistic UI updates and backend synchronization.
- **Complete CRUD Operations**: Add new items, update details/notes/lot numbers, or remove depleted items with confirmation protection.
- **Rich Ingredient Metadata**:
  - Item Name
  - Category (Malts, Hops, Yeast, Misc)
  - Quantity (supports high-precision decimal quantities)
  - Unit of Measurement (`kg`, `g`, `packs`, `liters`, `items`, etc., plus custom units)
  - Low Stock Alert Threshold (visual warning badges when stock falls below minimums)
  - Lot / Batch Reference
  - Optional Notes (supplier details, Alpha Acid %, crop year, expiry)
- **Search, Filter & Sorting**: Instant real-time search across names, notes, and lot numbers; filter by category or low-stock only; sort by name or quantity; toggle between Grid Cards and Table rows.
- **Zero-Configuration Persistent Storage**: Data is safely stored in `./data/inventory.json` on the server/host machine with automatic directory creation and seed data initialization.
- **Backup & Restore**: Built-in JSON and CSV export/import for quick inventory audits and data backups.

---

## 🚀 Running with Docker Compose (Recommended)

To launch the complete application with Docker Compose:

```bash
docker compose up --build
```

Once running, open your web browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

### Stopping the container
```bash
docker compose down
```

### Data Persistence
The `docker-compose.yml` mounts `./data:/app/data`. All changes made via the web interface are immediately persisted in the `./data/inventory.json` file on your local machine and will remain intact across container rebuilds and restarts.

---

## 💻 Running Locally (Development Mode)

If you prefer to run the application directly with Node.js:

### Prerequisites
- Node.js 18+ or 20+
- npm

### Installation & Startup
```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (hot reload)
npm run dev

# 3. Open browser at http://localhost:3000
```

### Production Build & Start Locally
```bash
npm run build
npm start
```

---

## 📡 REST API Endpoints

The backend exposes a simple, lightweight REST API on port `3000`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/inventory` | Retrieve all inventory items |
| `GET` | `/api/inventory/:id` | Retrieve single item by ID |
| `POST` | `/api/inventory` | Create a new inventory item |
| `PUT` | `/api/inventory/:id` | Update an existing item |
| `PATCH` | `/api/inventory/:id/adjust` | Quick-adjust item quantity (`{ "delta": 5 }` or `{ "delta": -1 }`) |
| `DELETE` | `/api/inventory/:id` | Delete an inventory item |
| `POST` | `/api/inventory/reset-sample` | Reset database to default craft brewery items |
| `GET` | `/api/inventory/export` | Download JSON backup file |
| `POST` | `/api/inventory/import` | Restore inventory from JSON payload |
| `GET` | `/api/health` | Health check endpoint |

---

## 📂 Project Architecture

```
├── Dockerfile                  # Production container build
├── docker-compose.yml          # Container orchestration & volume mapping
├── server.ts                   # Express REST API & Vite middleware entry point
├── server/
│   └── storage.ts              # Atomic JSON file storage manager with initial brewery seed data
├── data/
│   └── inventory.json          # Persistent inventory store (created on launch)
├── src/
│   ├── App.tsx                 # Main single-page application component
│   ├── types.ts                # TypeScript interfaces (Item, Category, Stats)
│   ├── lib/
│   │   ├── api.ts              # Client-side API fetch client
│   │   └── constants.ts        # Category styles, icons, and unit mappings
│   └── components/
│       ├── Navbar.tsx          # Brewery header with stats, add item, backup/restore
│       ├── StatsOverview.tsx   # Category summary cards & quick filter selector
│       ├── InventoryFilterBar.tsx # Search, category pills, low stock filter, view toggles
│       ├── ItemCard.tsx        # Grid item card with +1/+5/-1/-5 quick adjust buttons
│       ├── ItemTableRow.tsx    # Table view row with quick adjust buttons
│       ├── ItemModal.tsx       # Add / Edit modal with validation & suggestions
│       ├── DeleteConfirmModal.tsx # Safe deletion dialog
│       ├── ImportExportModal.tsx # JSON/CSV backup download and JSON restore
│       └── CategoryIcon.tsx    # Category icon renderer
└── package.json
```
