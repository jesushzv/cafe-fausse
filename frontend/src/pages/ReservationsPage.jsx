import React from "react";

export default function ReservationsPage() {
  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="page-header__eyebrow">Table Bookings</span>
          <h1 className="page-header__title">Reservations</h1>
          <p className="page-header__subtitle">
            Join us for an intimate evening of fine Italian dining in Washington, DC.
          </p>
          <hr className="gold-divider" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
            Live 30-table reservation form &amp; slot availability picker coming in Phase 5.
          </p>
        </div>
      </section>
    </div>
  );
}
