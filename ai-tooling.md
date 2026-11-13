# AI Tooling & Engineering Process

This document summarizes the AI tools I used, the phased workflow I followed, and the bugs and edge cases I caught through human code review while building the **Café Fausse** full-stack web application.

---

## AI Tools Used

1. **Antigravity (AI-Assisted IDE)**
   - I used Antigravity for phase-scoped monorepo scaffolding (`frontend/`, `backend/`, `docs/`), SQLAlchemy model and constraint generation (`customers`, `reservations`), Flask reservation and newsletter API logic, React + JSX component development, Flexbox/CSS Grid design system styling, and automated build and API verification.
2. **Gemini (AI Tutor & Image Generation)**
   - I used Gemini to decompose the Software Requirements Specification (SRS) and grading rubric into a structured multi-phase engineering plan, reason through relational schema edge cases (such as unified customer email upserts and database-level double-booking prevention), and generate 3 supplementary fine-dining photographs (`gallery-chef-kitchen.jpg`, `gallery-grilled-salmon.jpg`, and `gallery-tiramisu.jpg`) matching the warm mahogany and chandelier-gold visual palette of the provided Café Fausse assets.

---

## Workflow Strategy

Rather than prompting for the entire application in a single pass, I used the SRS (`docs/MSEE_Web_Application_and_Interface_Design_Cafe_Fausse_SRS.pdf`) as the single source of truth and constrained each step to one architectural layer per phase:
1. **Phase 1**: Monorepo skeleton, Vite `/api` proxy, and Flask health check handshake.
2. **Phase 2**: PostgreSQL database setup, SQLAlchemy models, and `CHECK` / `UNIQUE` constraints.
3. **Phase 3**: Backend validation helpers, 30-table random assignment engine, and CLI saturation test helpers (`seed-full-slot`, `clear-test-data`).
4. **Phase 4**: Fine-dining CSS design system (`:root` variables, Flexbox, CSS Grid), centralized `cafeData.js`, and shared `Navbar`/`Footer` shell.
5. **Phase 5A & 5B**: Static editorial pages (`Home`, `Menu`, `About Us`, `Gallery` + `LightboxModal`) followed by live API-wired `NewsletterSignup` and `ReservationsPage`.
6. **Phase 6**: End-to-end SRS compliance audit, mobile viewport QA, and repository documentation.

Constraining each phase kept the codebase modular and let me verify every layer before moving forward.

---

## What Worked Well

- **Rapid Boilerplate & Proxy Wiring**: Setting up the Flask application factory pattern and Vite `/api` development proxy early eliminated CORS friction during local development.
- **Photography-Driven Design System**: Translating the restaurant interior photography into CSS custom properties (`#16100C` mahogany, `#FAF6F0` warm ivory, `#C8A25A` chandelier gold) produced a cohesive fine-dining aesthetic without external CSS frameworks.
- **Verbatim SRS Data Centralization**: Extracting all menu items, prices, hours, awards, and reviews into `frontend/src/data/cafeData.js` kept copy consistent across pages.
- **CLI Capacity Testing**: Building `flask --app run seed-full-slot` made it fast and repeatable to test 30-table saturation and `HTTP 409` conflict handling.

---

## What Didn't Work & Bugs Caught During Human Code Review

During an independent post-build code and rubric review, I caught and fixed several subtle bugs and oversights that the initial AI-generated implementation missed:

1. **macOS Port 5000 AirPlay Conflict & Local Grader `.env.example` Defaults**:
   - Port `5000` collides with macOS AirPlay Receiver on developer machines, and `backend/.env.example` initially pointed to a cloud template instead of working out of the box with a local PostgreSQL instance. I switched the default port to `5001` across Flask, Vite's `/api` proxy, and documentation, and updated `backend/.env.example` to default to `postgresql+psycopg://localhost:5432/cafe_fausse` with a commented SSL cloud example.
2. **SQLAlchemy Retry Loop Transaction Rollback Bug**:
   - In `backend/app/routes/reservations.py`, the `Customer` upsert lived inside the same database transaction as the 3-attempt `Reservation` collision-retry loop. On a retry after `IntegrityError`, `db.session.rollback()` also rolled back a newly inserted `Customer`, and reading ORM attributes afterwards risked detached-instance errors. I committed the `Customer` upsert before entering the retry loop and captured plain scalar values (`customer_id`, `saved_name`, `saved_email`, `saved_phone`).
3. **Missing Input Length Validation & Unsanitized Error Payloads (`NFR-6`)**:
   - Overly long `customer_name` (>120 chars), `email` (>255 chars), or `phone_number` (>30 chars or invalid characters) could trigger SQLAlchemy `DataError` `500` responses instead of clean `400` validation errors, and `health.py` / `reservations.py` returned raw exception strings. I added explicit length and character validation in `validators.py` and sanitized `500`/`503` responses while logging full tracebacks server-side.
4. **Frontend Async Race Condition, Accessibility, & Routing Polish**:
   - Rapidly switching dates on `ReservationsPage.jsx` could let an older availability response overwrite a newer one; I wired `AbortController` through `getAvailability` and `useEffect`.
   - I replaced `role="radiogroup"`/`role="radio"` on the time-slot buttons with standard `<button type="button">` elements using `aria-pressed` and descriptive `aria-label`s, added focus management (`useRef`) to `LightboxModal.jsx` so keyboard focus moves to the Close button and restores on close, added `.btn-outline-dark` to replace inline styles, fixed a subject-verb typo (`"flavors meets"` -> `"flavors meet"`) in `AboutPage.jsx`, and added a themed 404 fallback route in `App.jsx`.
5. **Uncompressed Generated JPEG Assets**:
   - The three generated `.jpg` photos (`gallery-chef-kitchen.jpg`, `gallery-grilled-salmon.jpg`, `gallery-tiramisu.jpg`) were initially ~2.8–3.2 MB each; I resized and compressed them (`max-width: 1600px`) down to ~350–680 KB for fast page loads.
6. **Environment & Tooling Quirks**:
   - I also had to resolve an accidental home-directory `.git` initialization, diagnose Git `reftable` extension compatibility with the IDE's commit tooling, and deliberately keep `Full` (`0 left`) time-slot pills clickable in `ReservationsPage.jsx` so a live demo can trigger the backend's `HTTP 409` rejection (`FR-9`).
