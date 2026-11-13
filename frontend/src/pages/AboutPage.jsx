import React from "react";
import { Link } from "react-router-dom";
import { ABOUT_CONTENT } from "../data/cafeData";

export default function AboutPage() {
  return (
    <div>
      <section className="page-header">
        <div className="container">
          <span className="page-header__eyebrow">Our Heritage &bull; Est. {ABOUT_CONTENT.foundedYear}</span>
          <h1 className="page-header__title">About Café Fausse</h1>
          <p className="page-header__subtitle">
            Traditional Italian flavors meet modern culinary innovation in the heart of Washington, DC.
          </p>
          <hr className="gold-divider" />
        </div>
      </section>

      {/* History & Mission Statement (FR-10) */}
      <section className="section">
        <div className="container mission-quote">
          <span className="section-header__eyebrow">Our Story &amp; Mission</span>
          <p className="mission-quote__text">
            {ABOUT_CONTENT.story} {ABOUT_CONTENT.mission}
          </p>
          <hr className="gold-divider" />
        </div>
      </section>

      {/* Founder Spotlight (FR-11, 2-Column CSS Grid) */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header">
            <span className="section-header__eyebrow">Leadership</span>
            <h2 className="section-header__title">Meet Our Founders</h2>
            <p className="section-header__subtitle">
              The culinary vision and warm hospitality behind Café Fausse.
            </p>
            <hr className="gold-divider" />
          </div>

          <div className="grid-2">
            {ABOUT_CONTENT.founders.map((founder) => (
              <article key={founder.id} className="founder-card">
                <div className="founder-card__image">
                  <img src={founder.image} alt={founder.alt} loading="lazy" />
                </div>
                <div className="founder-card__body">
                  <span className="founder-card__role">{founder.role}</span>
                  <h3 className="founder-card__name">{founder.name}</h3>
                  <p className="founder-card__bio">{founder.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our Culinary Philosophy (FR-11, 3-Pillar CSS Grid) */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-header__eyebrow">Commitment to Excellence</span>
            <h2 className="section-header__title">Our Culinary Philosophy</h2>
            <p className="section-header__subtitle">
              Three guiding principles that shape every evening at Café Fausse.
            </p>
            <hr className="gold-divider" />
          </div>

          <div className="grid-3">
            {ABOUT_CONTENT.pillars.map((pillar) => (
              <article key={pillar.id} className="pillar-card">
                <h3 className="pillar-card__title">{pillar.title}</h3>
                <p className="pillar-card__desc">{pillar.description}</p>
              </article>
            ))}
          </div>

          <div className="flex justify-center gap-sm" style={{ marginTop: "3rem" }}>
            <Link to="/reservations" className="btn btn-gold">
              Reserve a Table
            </Link>
            <Link
              to="/menu"
              className="btn btn-outline-dark"
            >
              Explore the Menu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
