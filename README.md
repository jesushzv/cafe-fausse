# Café Fausse

Full-stack web application for the fine-dining restaurant "Café Fausse".

## Project Overview
Café Fausse is a modern web application designed for a luxury fine-dining culinary destination, offering guests seasonal menus, table reservation bookings, culinary philosophy, and an atmospheric gallery.

## Tech Stack
- **Frontend**: React (JavaScript + JSX), Vite, React Router DOM
- **Backend**: Python 3, Flask, Flask-CORS, Flask-SQLAlchemy, psycopg (v3)
- **Database**: PostgreSQL

## Architecture Summary
- **`backend/`**: Modular Flask application factory pattern serving a REST API under `/api`.
- **`frontend/`**: Single Page Application (SPA) bundled with Vite, client-side routing via React Router, and development proxy forwarding `/api` requests to Flask on port 5000.

## Local Setup & Run Instructions

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```
Flask API runs at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Vite app runs at `http://localhost:5173`.
