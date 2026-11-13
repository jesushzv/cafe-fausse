import React, { useState, useCallback } from "react";
import { GALLERY_IMAGES, AWARDS, REVIEWS } from "../data/cafeData";
import LightboxModal from "../components/LightboxModal";

const GALLERY_CATEGORIES = [
  "All",
  "Interior Ambiance",
  "Menu Dishes",
  "Events & Behind the Scenes",
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredImages =
    selectedCategory === "All"
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === selectedCategory);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null
        ? null
        : (prev - 1 + filteredImages.length) % filteredImages.length
    );
  }, [filteredImages.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % filteredImages.length
    );
  }, [filteredImages.length]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setLightboxIndex(null);
  };

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="page-header__eyebrow">Atmosphere &amp; Acclaim</span>
          <h1 className="page-header__title">Gallery &amp; Accolades</h1>
          <p className="page-header__subtitle">
            Explore our dining room, signature dishes, behind-the-scenes craft, and critical recognition.
          </p>
          <hr className="gold-divider" />
        </div>
      </section>

      {/* Photo Gallery Section (FR-12, FR-13) */}
      <section className="section">
        <div className="container">
          <div className="filter-tabs" role="tablist" aria-label="Gallery Categories">
            {GALLERY_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={selectedCategory === category}
                className={`filter-tab ${
                  selectedCategory === category ? "filter-tab--active" : ""
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid-3">
            {filteredImages.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className="gallery-card"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`View larger image: ${item.title}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  className="gallery-card__img"
                />
                <div className="gallery-card__overlay">
                  <span className="gallery-card__cat">{item.category}</span>
                  <div className="gallery-card__title">{item.title}</div>
                  <span className="gallery-card__hint">Click to enlarge</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Critical Acclaim Section (FR-14) */}
      <section className="section section-dark">
        <div className="container">
          <div className="section-header">
            <span className="section-header__eyebrow">Recognition</span>
            <h2 className="section-header__title">Awards &amp; Critical Acclaim</h2>
            <p className="section-header__subtitle">
              Honored by culinary critics and diners across Washington, DC.
            </p>
            <hr className="gold-divider" />
          </div>

          <div className="grid-3" style={{ marginBottom: "3rem" }}>
            {AWARDS.map((award) => (
              <article key={award.id} className="award-card">
                <span className="award-card__year">{award.year}</span>
                <h3 className="award-card__title">{award.title}</h3>
              </article>
            ))}
          </div>

          <div className="grid-2">
            {REVIEWS.map((review) => (
              <blockquote key={review.id} className="review-card" style={{ margin: 0 }}>
                <p className="review-card__quote">&ldquo;{review.quote}&rdquo;</p>
                <footer className="review-card__source">&mdash; {review.source}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <LightboxModal
        images={filteredImages}
        currentIndex={lightboxIndex}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
