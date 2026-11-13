# AI Tooling & Engineering Process

This document summarizes the AI tools, phased development strategy, and human oversight applied while building the **Café Fausse** full-stack web application.

---

## AI Tools Used

1. **Antigravity (AI-Assisted IDE)**
   - Used for phase-scoped monorepo scaffolding (`frontend/`, `backend/`, `docs/`), SQLAlchemy model and constraint generation (`customers`, `reservations`), Flask reservation and newsletter API logic, React + JSX component development, Flexbox/CSS Grid design system styling, and automated build and API verification.
2. **Gemini (AI Tutor & Image Generation)**
   - Used to decompose the Software Requirements Specification (SRS) and grading rubric into a structured multi-phase engineering plan, reason through relational schema edge cases (such as unified customer email upserts and database-level double-booking prevention), and generate 3 supplementary fine-dining photographs (`gallery-chef-kitchen.jpg`, `gallery-grilled-salmon.jpg`, and `gallery-tiramisu.jpg`) matching the warm mahogany and chandelier-gold visual palette of the provided Café Fausse assets.

---

## Workflow Strategy

Rather than prompting for the entire application in a single pass, the SRS (`docs/MSEE_Web_Application_and_Interface_Design_Cafe_Fausse_SRS.pdf`) was used as the single source of truth and constrained to one architectural layer per phase:
1. **Phase 1**: Monorepo skeleton, Vite `/api` proxy, and Flask health check handshake.
2. **Phase 2**: PostgreSQL database setup, SQLAlchemy models, and `CHECK` / `UNIQUE` constraints.
3. **Phase 3**: Backend validation helpers, 30-table random assignment engine, and CLI saturation test helpers (`seed-full-slot`, `clear-test-data`).
4. **Phase 4**: Fine-dining CSS design system (`:root` variables, Flexbox, CSS Grid), centralized `cafeData.js`, and shared `Navbar`/`Footer` shell.
5. **Phase 5A & 5B**: Static editorial pages (`Home`, `Menu`, `About Us`, `Gallery` + `LightboxModal`) followed by live API-wired `NewsletterSignup` and `ReservationsPage`.
6. **Phase 6**: End-to-end SRS compliance audit, mobile viewport QA, and repository documentation.

Constraining each step prevented monolithic coupling and ensured every layer was verified before moving on.

---

## What Worked Well

- **Rapid Boilerplate & Proxy Wiring**: Setting up the Flask application factory pattern and Vite `/api` development proxy cleanly from the start eliminated CORS friction during development.
- **Photography-Driven Design System**: Translating the restaurant interior photography into CSS custom properties (`#16100C` mahogany, `#FAF6F0` warm ivory, `#C8A25A` chandelier gold) produced a cohesive fine-dining aesthetic without external CSS frameworks.
- **Verbatim SRS Data Centralization**: Extracting all menu items, prices, hours, awards, and reviews into `frontend/src/data/cafeData.js` ensured consistent copy across pages.
- **CLI Capacity Testing**: Building `flask --app run seed-full-slot` made it fast and repeatable to test 30-table saturation and `HTTP 409` conflict handling.

---

## What Needed Human Oversight & Refinement

- **Environment & Database Setup**: Adapting from local macOS binary restrictions (Santa policy on Homebrew binaries) to a cloud PostgreSQL instance (Neon) and tuning `backend/.env` with `postgresql+psycopg://...?sslmode=require`, as well as verifying macOS port `5000` availability against AirPlay Receiver.
- **Git & IDE Tooling Compatibility**: Identifying and resolving an accidental home-directory `.git` initialization and diagnosing Git `reftable` extension compatibility with the IDE's commit tooling.
- **Demo-Friendly Full-Slot UX**: Deliberately keeping `Full` (`0 left`) time-slot pills selectable in `ReservationsPage.jsx` rather than disabling them in the UI, so that a live demonstration can submit a booking against a 30/30 full slot and showcase the backend's `HTTP 409` rejection message (`FR-9`).
- **Mobile Viewport QA**: Inspecting the Lightbox close button, time-slot grid minimum widths, and newsletter button stacking at `375px` mobile width to prevent clipping or cramped controls.
