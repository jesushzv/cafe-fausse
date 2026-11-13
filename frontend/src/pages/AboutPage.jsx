import React from "react";

export default function AboutPage() {
  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="page-header__eyebrow">Our Heritage</span>
          <h1 className="page-header__title">About Us</h1>
          <p className="page-header__subtitle">
            Founded in 2010 by Chef Antonio Rossi and restaurateur Maria Lopez.
          </p>
          <hr className="gold-divider" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
            Founders story, biographies, and culinary philosophy coming in Phase 5.
          </p>
        </div>
      </section>
    </div>
  );
}
