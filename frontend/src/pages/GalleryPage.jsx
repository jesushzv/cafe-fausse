import React from "react";

export default function GalleryPage() {
  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="page-header__eyebrow">Atmosphere &amp; Acclaim</span>
          <h1 className="page-header__title">Gallery</h1>
          <p className="page-header__subtitle">
            Explore our dining room, signature dishes, awards, and guest reviews.
          </p>
          <hr className="gold-divider" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
            Photography lightbox, awards, and testimonials coming in Phase 5.
          </p>
        </div>
      </section>
    </div>
  );
}
