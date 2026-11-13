# Café Fausse — Full-Stack Fine Dining Web Application

A responsive, full-stack web application built for **Café Fausse**, a fine Italian dining restaurant located in Washington, DC (`1234 Culinary Ave, Suite 100, Washington, DC 20002`).

---

## Project Overview

Café Fausse serves as the digital front door for the restaurant, enabling guests to:
- Explore the restaurant's ambiance, Washington, DC location, contact details, and dining hours (`HomePage`).
- Browse categorized seasonal offerings with dietary and culinary descriptions (`MenuPage`).
- Check real-time 30-minute dinner slot availability across a **30-table** dining room and receive instant random table assignments (`ReservationsPage`).
- Learn about the 2010 founding heritage, Chef Antonio Rossi, Maria Lopez, and locally sourced culinary pillars (`AboutPage`).
- View high-resolution restaurant photography in an interactive, keyboard-accessible lightbox alongside awards and critic reviews (`GalleryPage`).
- Subscribe to seasonal menu and event updates (`NewsletterSignup`).

---

## Architecture & Design Decisions

- **Frontend (`frontend/`)**:
  - **React + JavaScript (JSX)** bundled with **Vite**.
  - Client-side navigation via **React Router DOM** (`/` Home, `/menu`, `/reservations`, `/about`, `/gallery`).
  - **Design System**: CSS Custom Properties (`:root`) inspired by mahogany/espresso, warm ivory, and chandelier gold, built with responsive **Flexbox** and **CSS Grid** layouts across desktop, tablet (`<= 900px`), and mobile (`<= 640px`).
  - Centralized SRS content data in `src/data/cafeData.js` and API client in `src/services/api.js`.

- **Backend (`backend/`)**:
  - **Flask** application factory pattern (`app/__init__.py`) with modular blueprints (`health`, `newsletter`, `reservations`) and global JSON error handlers.
  - **Validation Layer (`app/validators.py`)**: Enforces standard email normalization, guest limits (`1–12`), future 30-minute seating intervals, and operating hours (Mon–Sat `17:00–22:30`, Sun `17:00–20:30`).
  - **30-Table Reservation Engine**: Queries occupied tables for a requested `time_slot`, randomly assigns an available table (`1–30`), and handles concurrency collisions safely with `IntegrityError` retries and HTTP `409 Conflict` responses when all 30 tables are booked.

- **Database (`PostgreSQL` + `SQLAlchemy` / `psycopg 3`)**:
  - **`customers`**: `customer_id` (PK), `customer_name` (nullable for email-only newsletter signups), `email` (unique, indexed), `phone_number`, `newsletter_signup`. Email-based upsert prevents duplicate customer records across newsletter signups and reservations.
  - **`reservations`**: `reservation_id` (PK), `customer_id` (FK with `ON DELETE CASCADE`), `time_slot` (indexed), `table_number`, `num_guests`.
  - **Database-Level Integrity Constraints**:
    - `CHECK (table_number >= 1 AND table_number <= 30)`
    - `CHECK (num_guests >= 1)`
    - `UNIQUE (time_slot, table_number)` (prevents double-booking at the database level)

---

## Prerequisites

- **Node.js** (v18+ recommended) and `npm`
- **Python 3** (v3.9+)
- **PostgreSQL** (local instance or cloud PostgreSQL such as Neon)

---

## Local Setup & Run Instructions

### 1. Database Creation
Create a PostgreSQL database named `cafe_fausse`:
```bash
createdb cafe_fausse
```
*(If using a cloud PostgreSQL provider such as Neon, create the `cafe_fausse` database and copy your SSL connection URI.)*

### 2. Backend Setup (`backend/`)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` from the template:
```bash
cp .env.example .env
```
Update `backend/.env` with your PostgreSQL connection string (using the `postgresql+psycopg://` SQLAlchemy driver) and desired port:
```env
FLASK_ENV=development
PORT=5001
DATABASE_URL=postgresql+psycopg://localhost:5432/cafe_fausse
```

Initialize the `customers` and `reservations` tables:
```bash
flask --app run init-db
# Or: python init_db.py
```

Start the Flask development server:
```bash
python run.py
```
The Flask API runs at `http://127.0.0.1:5001`.

### 3. Frontend Setup (`frontend/`)
Open a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```
The Vite dev server runs at `http://localhost:5173`. Requests to `/api/*` are automatically proxied by `vite.config.js` to `http://127.0.0.1:5001`.

---

## API Endpoints Reference

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Verifies API and PostgreSQL (`SELECT 1`) connectivity | `200`, `503` |
| `POST` | `/api/newsletter` | Validates email and upserts newsletter subscription | `201`, `200`, `400` |
| `GET` | `/api/reservations/availability?date=YYYY-MM-DD` | Returns valid 30-min slots and remaining tables (`0–30`) | `200`, `400` |
| `POST` | `/api/reservations` | Validates booking, upserts customer, and assigns a random open table (`1–30`) | `201`, `400`, `409` |

---

## Testing & Demo CLI Helpers

To demonstrate full-capacity rejection (`HTTP 409`) in the UI or via `curl`:

1. **Seed all 30 tables for a valid time slot:**
   ```bash
   cd backend
   source .venv/bin/activate
   flask --app run seed-full-slot --slot "2026-12-05T20:00"
   ```
   Selecting `8:00 PM` on `2026-12-05` in the Reservations page will now display `Full` and return HTTP `409` upon submission.

2. **Clear test data:**
   ```bash
   # Clear a specific slot:
   flask --app run clear-test-data --slot "2026-12-05T20:00"

   # Or clear all test reservations and customers:
   flask --app run clear-test-data
   ```
