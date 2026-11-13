import React from "react";
import { Link } from "react-router-dom";
import {
  RESTAURANT_INFO,
  FEATURED_DISHES,
  ABOUT_CONTENT,
} from "../data/cafeData";

export default function HomePage() {
  return (
    <div>
      {/* 1. Full-Bleed Luxury Hero (FR-1, FR-3, FR-4) */}
      <section className="hero">
        <img
          src="/images/home-cafe-fausse.webp"
          alt="Café Fausse main dining room with warm chandelier lighting"
          className="hero__bg"
        />
        <div className="hero__overlay" aria-hidden="true" />
        <div className="container hero__content">
          <span className="hero__eyebrow">Washington, DC &bull; Est. 2010</span>
          <h1 className="hero__title">{RESTAURANT_INFO.name}</h1>
          <p className="hero__subtitle">{RESTAURANT_INFO.tagline}</p>
          <div className="hero__actions">
            <Link to="/reservations" className="btn btn-gold">
              Reserve a Table
            </Link>
            <Link to="/menu" className="btn btn-outline">
              Explore Menu
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Prominent Contact & Hours Info Strip (FR-2) */}
      <section className="info-strip" aria-label="Restaurant Contact and Hours">
        <div className="container grid-3">
          <div className="info-strip__item">
            <span className="info-strip__label">Location</span>
            <span className="info-strip__value">{RESTAURANT_INFO.address}</span>
          </div>
          <div className="info-strip__item">
            <span className="info-strip__label">Reservations &amp; Inquiries</span>
            <a
              href={`tel:${RESTAURANT_INFO.phone.replace(/[^0-9]/g, "")}`}
              className="info-strip__value"
            >
              {RESTAURANT_INFO.phone}
            </a>
          </div>
          <div className="info-strip__item">
            <span className="info-strip__label">Dining Hours</span>
            <span className="info-strip__value">{RESTAURANT_INFO.hours.monSat}</span>
            <span className="info-strip__value">{RESTAURANT_INFO.hours.sunday}</span>
          </div>
        </div>
      </section>

      {/* 3. Signature Culinary Creations (3-Column CSS Grid) */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-header__eyebrow">From Our Kitchen</span>
            <h2 className="section-header__title">Signature Culinary Creations</h2>
            <p className="section-header__subtitle">
              Crafted daily with traditional Italian technique and locally sourced seasonal ingredients.
            </p>
            <hr className="gold-divider" />
          </div>

          <div className="grid-3">
            {FEATURED_DISHES.map((dish) => (
              <article key={dish.id} className="dish-card">
                <div className="dish-card__media">
                  <img src={dish.image} alt={dish.alt} loading="lazy" />
                </div>
                <div className="dish-card__body">
                  <div className="dish-card__header">
                    <h3 className="dish-card__title">{dish.name}</h3>
                    <span className="dish-card__price">${dish.price.toFixed(2)}</span>
                  </div>
                  <p className="dish-card__desc">{dish.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-center" style={{ marginTop: "2.5rem" }}>
            <Link to="/menu" className="btn btn-gold">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Editorial Heritage & Ambiance Split Feature (2-Column CSS Grid) */}
      <section className="section section-cream">
        <div className="container grid-2 split-feature">
          <div className="split-feature__image">
            <img
              src="/images/gallery-cafe-interior.webp"
              alt="Intimate candlelit interior dining ambiance at Café Fausse"
              loading="lazy"
            />
          </div>
          <div className="split-feature__content">
            <span className="section-header__eyebrow">Est. 2010</span>
            <h2>Our Heritage &amp; Ambiance</h2>
            <p>{ABOUT_CONTENT.story}</p>
            <p>{ABOUT_CONTENT.mission}</p>
            <div className="flex flex-wrap gap-sm">
              <Link to="/about" className="btn btn-gold">
                Our Story
              </Link>
              <Link
                to="/gallery"
                className="btn btn-outline"
                style={{ color: "var(--text-dark)" }}
              >
                Explore Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Newsletter Slot Placeholder (Phase 5B Integration) */}
      <section id="newsletter-slot" className="section newsletter-slot">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 0 }}>
            <span className="section-header__eyebrow">Stay Connected</span>
            <h2 className="section-header__title">Join Our Culinary Circle</h2>
            <p className="section-header__subtitle">
              Seasonal menu previews, private wine dinners, and chef events. (Newsletter signup form coming in Phase 5B.)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
