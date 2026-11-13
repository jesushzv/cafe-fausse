import React from "react";

export default function MenuPage() {
  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="page-header__eyebrow">Culinary Offerings</span>
          <h1 className="page-header__title">Our Menu</h1>
          <p className="page-header__subtitle">
            Traditional Italian flavors elevated with modern culinary innovation.
          </p>
          <hr className="gold-divider" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
            Categorized seasonal menu sections coming in Phase 5.
          </p>
        </div>
      </section>
    </div>
  );
}
